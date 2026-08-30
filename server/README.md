# Layerzero — Backend Service

The core Express.js / Bun backend service for Layerzero. Manages user authentication, content parsing (PDF, DOCX, Web URLs), SHA-256 Redis caching, sliding-window rate limiting, and hybrid multi-LLM orchestration across Gemini, Groq, Ollama (Gemma), and Sarvam AI.

---

## Architectural Rationale (Why & How)

### Why Upstash Redis Caching?
* **Why:** Calling LLM APIs repeatedly for identical articles or documents wastes API tokens and introduces 5–10s of network latency per request.
* **Solution:** Intercepts requests in `scrape.js` and `docSummary.js` using `@upstash/redis`. Hashes extracted text using SHA-256 and queries Redis before calling any LLM SDK.
* **Impact:** Cuts repeat summary generation latency from **~8.5s to ~150ms (~98% reduction)** with zero LLM API cost.

### Why SHA-256 Content Fingerprinting (`hashContent.js`)?
* **Why:** Filenames and URLs are easily modified. Two uploaded PDFs with different filenames might contain the exact same content, while the same filename could contain updated text.
* **Solution:** `hashContent.js` extracts raw text from PDF/DOCX buffers or scraped web pages, normalizing whitespace and computing a SHA-256 hex digest (`crypto.createHash('sha256')`).
* **Impact:** Guarantees deterministic cache key generation based on *actual document contents*, eliminating duplicate LLM runs regardless of original filename or upload timestamp.

### Why Custom Sliding Window Rate Limiting (`redisRateLimit.js`)?
* **Why Rate Limiting:** Auth endpoints require protection against credential brute-forcing and email resend spamming, while LLM routes require protection against quota exhaustion.
* **Why Sliding Window:** Fixed-window limiters reset counters at hard minute boundaries, creating vulnerability to double-burst spikes (e.g. 30 requests right before minute-end + 30 requests right after = 60 requests in 2 seconds). Sliding window computes a moving weighted average across window segments.
* **Limiter Enforcements:**
  * `authLimiter`: 20 requests / 10 min window (applied to `/api/auth/*`)
  * `resendLimiter`: 3 requests / 24 hour window (applied to `/api/auth/user/resend`)
  * `aiLimiter`: 30 requests / 15 min window (applied to `/api/scrape/*`)

### Why Server-Sent Events (SSE) for Response Streaming (`streamResponse.js`)?
* **Why:** Users waiting for an entire LLM completion experience high perceived latency. WebSockets introduce unnecessary bidirectional state overhead for simple server-to-client token streams.
* **Solution:** `streamResponse.js` uses native HTTP SSE (`text/event-stream`). As LLM providers stream tokens, the server immediately flushes chunks (`event: chunk`) to the response stream while accumulating the full response to cache in Redis when finished (`event: done`).
* **Impact:** Provides immediate visual feedback in the UI with low memory and CPU overhead.

### Why In-Memory Document Parsing (`pdfjs-dist` & `mammoth`)?
* **Why:** Shelling out to host CLI tools like `pdftotext` or `libreoffice` bloats Docker images, increases container build times, and risks shell injection or OS vulnerability vector exposure.
* **Solution:** Receives uploaded files in memory using `multer.memoryStorage()`, routing buffers directly to `pdfjs-dist` (PDF) or `mammoth` (DOCX).
* **Impact:** Pure JavaScript memory-buffer processing with zero OS-level binary dependencies.

### Why JSDOM + Mozilla Readability for Web Scraping?
* **Why:** Web pages are cluttered with navbars, sidebars, tracking scripts, advertisements, and footers. Passing raw HTML to an LLM inflates token costs and confuses model summaries.
* **Solution:** Fetches HTML with `axios`, constructs a DOM with `jsdom`, and isolates article text using `@mozilla/readability`.
* **Impact:** Sends only clean, relevant article text to the LLM, reducing token consumption and improving summary precision.

### Why httpOnly JWT Cookies + Email Verification Flow?
* **Why:** Storing JWT tokens in browser `localStorage` exposes them to XSS attacks. Allowing unverified emails enables account creation spam.
* **Solution:** Issues JWTs signed with `jsonwebtoken` into `httpOnly` cookies with `SameSite=Lax`. Enforces email verification via `nodemailer` with hex tokens that expire after 15 minutes.
* **Impact:** Eliminates JavaScript token theft vectors while verifying email authenticity before granting LLM route access.

### Why Bun as Runtime / Test Runner?
* **Why:** Node.js development cycles slow down during cold starts and require external runners (like `ts-node` or heavy Jest setups) for TypeScript/ESM testing.
* **Solution:** Uses Bun (`oven/bun:1-alpine` in Docker) for high-performance execution and native `bun test` runner integrated with `supertest` and `mongodb-memory-server`.

---

## Detailed Tech Stack & Selection Rationale

| Category | Technology | Operational Function | Why Used (Engineering Rationale) |
|---|---|---|---|
| **Runtime** | Bun / Node.js | Event-driven JavaScript execution engine | High throughput I/O, fast startup time, native ESM support |
| **Framework** | Express.js v5 | Server routing & middleware handling | Native promise rejection catching in async route handlers |
| **Database** | MongoDB via Mongoose | NoSQL persistent document database & ODM | Flexible JSON schemas for user documents, auth tokens, and job logs |
| **Caching** | Upstash Redis (`@upstash/redis`) | Serverless HTTP Redis client | Fast key-value lookups over HTTP without persistent TCP pool management |
| **Rate Limiter** | Upstash Ratelimit (`@upstash/ratelimit`) | Sliding-window traffic enforcement | Prevents burst spikes and protects upstream LLM provider quotas |
| **Authentication** | `jsonwebtoken` + `bcrypt` | JWT signing & salted password hashing | Stateless session authentication with 10-round bcrypt password hashing |
| **Validation** | Zod | Runtime request payload validation | Enforces payload typing before entering controllers or DB layer |
| **Email Service** | Nodemailer | Gmail SMTP transport client | Sends transactional verification email links containing hex tokens |
| **Document Parsers**| `pdfjs-dist` + `mammoth` | In-memory text extraction | Extracts clean raw text from PDF & DOCX binary buffers directly in memory |
| **Web Scraping** | Axios + JSDOM + Readability | HTTP fetching & article extraction | Strips DOM noise and isolates primary article content |
| **LLM Clients** | `@google/genai`, `groq-sdk`, Ollama API, `sarvamai` | AI client wrappers & SSE stream drivers | Unified client abstraction for cloud and local language models |
| **Testing** | Bun Test + Supertest + `mongodb-memory-server` | Integration test suite | Executes endpoint integration tests against in-memory MongoDB |

---

## Detailed Endpoint Breakdown (Under the Hood Execution)

### Health Check

#### `GET /api/health`
* **Access:** Public
* **Rate Limit:** Unrestricted
* **Under the Hood Execution:**
  1. Computes runtime process uptime via `process.uptime()`.
  2. Returns `200 OK` JSON: `{ "status": "OK", "message": "API is working properly", "uptime": 184 }`.

---

### Auth Routes (`/api/auth/user`)

#### `POST /api/auth/user/register`
* **Access:** Public
* **Rate Limit:** `authLimiter` (20 requests / 10 min)
* **Under the Hood Execution:**
  1. Passes `req.body` to Zod (`auth.validator.js`). Validates `name` (3-45 chars), valid `email`, `password` (min 8 chars).
  2. Queries MongoDB `User.findOne({ email })`. Returns `400 Bad Request` if duplicate.
  3. Hashes password using `bcrypt.hash(password, 10)`.
  4. Generates 32-byte hex verification token `crypto.randomBytes(32).toString('hex')` and sets `verificationTokenExpires = Date.now() + 15 mins`.
  5. Saves `User` document with `isVerified: false`.
  6. Renders HTML email via `verificationEmail.js` and dispatches email link `${API_URL}/api/auth/user/verify/${token}` via Nodemailer.
  7. Returns `201 Created` (`"You're registered, now verify email"`).

#### `GET /api/auth/user/verify/:token`
* **Access:** Public
* **Rate Limit:** `authLimiter` (20 requests / 10 min)
* **Under the Hood Execution:**
  1. Reads `:token` URL parameter.
  2. Queries MongoDB `User.findOne({ verificationToken: token, verificationTokenExpires: { $gt: Date.now() } })`.
  3. If invalid/expired, returns `400 Bad Request` (`"Invalid or expired verification token"`).
  4. Sets `isVerified = true`, deletes `verificationToken` and `verificationTokenExpires`, and saves user.
  5. Returns `302 Found` redirecting browser to `${CLIENT_URL}/email-verified`.

#### `POST /api/auth/user/resend`
* **Access:** Public
* **Rate Limit:** `resendLimiter` (3 requests / 24 hours)
* **Under the Hood Execution:**
  1. Validates email via Zod.
  2. Finds user by email in MongoDB. Returns `404 Not Found` if missing.
  3. If `user.isVerified === true`, returns `400 Bad Request` (`"User is already verified"`).
  4. Generates fresh verification token and 15-minute expiration timestamp. Saves user.
  5. Dispatches email via Nodemailer. Returns `200 OK` (`"Verification sent to your email successfully"`).

#### `POST /api/auth/user/login`
* **Access:** Public
* **Rate Limit:** `authLimiter` (20 requests / 10 min)
* **Under the Hood Execution:**
  1. Validates `email` and `password` via Zod.
  2. Queries MongoDB `User.findOne({ email })`. Returns `400 Bad Request` if missing.
  3. Compares password hash via `bcrypt.compare()`. Returns `400 Bad Request` if invalid.
  4. Checks `user.isVerified`. If `false`, returns `403 Forbidden` (`"Verify your email first"`).
  5. Calls `generateJWT(res, user._id)`. Signs JWT with `JWT_SECRET` (7-day expiry) and sets `jwt` cookie (`httpOnly: true`, `sameSite: 'lax'`, `maxAge: 7 days`).
  6. Returns `200 OK` `{ _id, name, email }`.

#### `POST /api/auth/user/logout`
* **Access:** Public
* **Rate Limit:** Unrestricted
* **Under the Hood Execution:**
  1. Clears `jwt` cookie via `res.cookie('jwt', '', { maxAge: 0 })`.
  2. Returns `200 OK` (`"The user has been logged out successfully"`).

#### `GET /api/auth/user/check`
* **Access:** Protected (`protectRoute`)
* **Rate Limit:** `authLimiter` (20 requests / 10 min)
* **Under the Hood Execution:**
  1. `protectRoute` middleware reads `req.cookies.jwt`. Returns `401 Unauthorized` if missing.
  2. Verifies token via `jwt.verify(token, JWT_SECRET)`. Returns `401 Unauthorized` if invalid.
  3. Queries MongoDB `User.findById(decoded.userId).select('-password')`. Returns `404 Not Found` if user missing.
  4. Attaches user object to `req.user`.
  5. Returns `200 OK` user profile JSON.

---

### Ingestion Routes (`/api/scrape`)

All ingestion routes require a valid `jwt` httpOnly cookie and are enforced by `aiLimiter` (30 requests / 15 minutes).

#### `POST /api/scrape/web`
* **Access:** Protected (`protectRoute`)
* **Rate Limit:** `aiLimiter` (30 requests / 15 min)
* **Request Body:** `{ "url": "https://...", "client": "gemini", "stream": true }`
* **Under the Hood Execution:**
  1. Validates body via Zod (`summary.validator.js`).
  2. Fetches web HTML using `axios.get(url)` with custom browser User-Agent headers.
  3. Loads HTML into `JSDOM` virtual DOM and passes document to `@mozilla/readability`. Extracts clean `article.textContent`. Returns `400 Bad Request` if extraction fails.
  4. Computes SHA-256 content hash `hashContent(articleText)` and generates key `summary:<HASH>`.
  5. Checks Upstash Redis cache. If hit, immediately returns stored summary (~150ms).
  6. If cache miss, routes text to selected AI provider client wrapper (`gemini`, `groq`, `gemma`, `sarvam`).
  7. **Stream handling (`stream: true`):** Writes headers `Content-Type: text/event-stream`. Streams chunks (`event: chunk`) as generated, flushing buffer. On completion, caches final summary in Redis (24h TTL) and sends `event: done`.
  8. **Standard handling (`stream: false`):** Awaits full text completion, caches in Redis, and returns `200 OK` `{ "output": "..." }`.

#### `POST /api/scrape/doc`
* **Access:** Protected (`protectRoute`)
* **Rate Limit:** `aiLimiter` (30 requests / 15 min)
* **Request Format:** `multipart/form-data` (`document` file, `client`, `stream`)
* **Under the Hood Execution:**
  1. `multer` memory storage intercepts file and loads buffer into `req.file.buffer` (max 5MB limit).
  2. Mimetype router (`document.js` service) inspects mimetype:
     * `application/pdf`: Calls `pdfparse.js` (`pdfjs-dist`) to extract text page by page.
     * `application/vnd.openxmlformats-officedocument.wordprocessingml.document`: Calls `docxparse.js` (`mammoth`) to extract text string.
  3. Hashes extracted raw text string using SHA-256 (`hashContent`) and builds Redis key `summary:<HASH>`.
  4. Queries Redis cache key. Returns cached summary instantly on hit.
  5. On miss, dispatches text to selected model wrapper (`gemini`, `groq`, `gemma`, `sarvam`).
  6. Streams tokens via SSE (`stream: true`) or returns JSON summary (`{ "summary": "..." }`), saving result to Redis with 24-hour TTL.

---

## Rate Limiting Specifications

| Endpoint | Limiter Instance | Rate Limit | Identifier |
|---|---|---|---|
| `/api/auth/user/register` | `authLimiter` | 20 req / 10 min | IP / User ID |
| `/api/auth/user/login` | `authLimiter` | 20 req / 10 min | IP / User ID |
| `/api/auth/user/resend` | `resendLimiter` | 3 req / 24 hours | IP / Email |
| `/api/auth/user/check` | `authLimiter` | 20 req / 10 min | IP / User ID |
| `/api/scrape/web` | `aiLimiter` | 30 req / 15 min | User ID / IP |
| `/api/scrape/doc` | `aiLimiter` | 30 req / 15 min | User ID / IP |

> **Note:** Rate limiters are automatically bypassed when `NODE_ENV === 'test'`.

---

## Running Backend Tests

```bash
cd server
npm test
# or with Bun
bun test
```

Executes integration tests for `/api/health` and `/api/auth/*` against an isolated `mongodb-memory-server` database instance.

---

## Environment Variable Schema

```env
PORT=5000
HTTPS_PORT=5001
SSL_KEY_PATH=
SSL_CERT_PATH=
MONGODB_URI=mongodb://localhost:27017/layerzero
OLLAMA_MODEL=gemma:4b
OLLAMA_BASE_URL=http://localhost:11434
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
SARVAM_API_KEY=your_sarvam_api_key
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CLIENT_URL=http://localhost:5173
API_URL=http://localhost:5000
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```