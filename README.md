# Layerzero

An AI-powered content summarization platform for PDFs, DOCX documents, and web links—built around hybrid LLM routing (cloud & local), deterministic content deduplication, sliding-window rate limiting, and real-time response streaming.

---

<table align="center">
  <tr>
    <td align="center">
      <strong>Homepage</strong><br>
      <img src="https://raw.githubusercontent.com/rishhbh/layerzero/dev/assets/homepage.png" width="400">
    </td>
    <td align="center">
      <strong>About</strong><br>
      <img src="https://raw.githubusercontent.com/rishhbh/layerzero/dev/assets/about.png" width="400">
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>Login</strong><br>
      <img src="https://raw.githubusercontent.com/rishhbh/layerzero/dev/assets/login.png" width="400">
    </td>
    <td align="center">
      <strong>Register</strong><br>
      <img src="https://raw.githubusercontent.com/rishhbh/layerzero/dev/assets/register.png" width="400">
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>Doc Summarizer</strong><br>
      <img src="https://raw.githubusercontent.com/rishhbh/layerzero/dev/assets/doc.png" width="400">
    </td>
    <td align="center">
      <strong>Response</strong><br>
      <img src="https://raw.githubusercontent.com/rishhbh/layerzero/dev/assets/response.png" width="400">
    </td>
  </tr>
</table>

---

## Technical Design Rationale (Why & How)

### Why Upstash Redis Caching?
* **Why:** LLM API inference is expensive (~$0.01–$0.05 per long prompt) and slow (5–10 seconds per request). Re-summarizing identical documents or URLs wastes API quota and degrades user experience.
* **Solution:** Layerzero implements an in-memory Upstash Redis cache layer (`@upstash/redis`). Before dispatching any prompt to an LLM provider, the backend checks Redis for a pre-existing summary.
* **Impact:** Reduces response latency for previously summarized content from **~8.5s down to ~150ms (~98% speedup)** while consuming **0 LLM tokens**.

### Why SHA-256 Content Fingerprinting?
* **Why:** Matching cache entries by raw filename or URL is flawed—users rename files, re-upload duplicate documents, or submit identical text under different parameter strings.
* **Solution:** Content is extracted first (via `pdfjs-dist`, `mammoth`, or `Mozilla Readability`), normalized, and hashed using SHA-256 (`crypto.createHash('sha256')`). The hex digest forms the Redis cache key (`summary:<SHA256_HASH>`).
* **Impact:** Cache hits are tied to the *actual text content*, guaranteeing instant deduplicated lookup regardless of original filename, upload timestamp, or client metadata.

### Why Rate Limiting & Sliding Window Algorithm?
* **Why Rate Limiting:** Unprotected LLM routes expose the application to runaway API billing, while auth routes invite credential-stuffing attacks and email spamming.
* **Why Sliding Window:** Fixed-window limiters reset counters at hard minute boundaries, allowing double-burst traffic spikes (e.g., 30 requests at 12:00:59 + 30 requests at 12:01:01 = 60 requests in 2 seconds). The sliding window algorithm (`@upstash/ratelimit`) computes a moving weighted average across window segments to enforce continuous traffic smoothing.
* **Configured Enforcements:**
  * `authLimiter`: 20 requests / 10 minutes (`/api/auth/*`)
  * `resendLimiter`: 3 requests / 24 hours (`/api/auth/user/resend`)
  * `aiLimiter`: 30 requests / 15 minutes (`/api/scrape/*`)

### Why Docker & Docker Compose?
* **Why:** Running client, backend server, and Redis across host operating systems introduces Node runtime version drift, missing dependencies, and local networking friction. Connecting containerized backend apps to host-running local LLMs (Ollama) requires special network bridging.
* **Solution:** Docker Compose orchestrates the React client, Express server, and Redis instances in containerized isolation. Server containers route local LLM requests to host Ollama using `host.docker.internal:11434`.

### Why Hybrid Multi-LLM Architecture?
* **Why:** Cloud models offer large context scale but incur API costs and privacy concerns. Local models guarantee privacy and zero API fees but depend on client hardware. Indic language contexts require tailored prompt tokenization.
* **Solution:** Users can dynamically select the model backend per request:
  * **Gemini 3.5 Flash:** Cloud inference for large, complex documents.
  * **GPT OSS 120B via Groq:** Ultra-low latency cloud inference.
  * **Gemma 4 via Ollama:** Offline, privacy-first execution with zero API cost.
  * **Sarvam 30B:** Tailored prompt and client for Hinglish and Indian multilingual context parsing.

### Why Server-Sent Events (SSE) for Streaming?
* **Why:** Waiting 8+ seconds for full LLM text generation creates poor perceived latency. WebSockets introduce unnecessary bidirectional state overhead for simple server-to-client token delivery.
* **Solution:** Uses standard HTTP Server-Sent Events (`text/event-stream`). Tokens stream chunk-by-chunk directly to the UI, providing real-time feedback with native browser reconnection handling.

### Why httpOnly JWT Cookies?
* **Why:** Storing access tokens in browser `localStorage` exposes them to XSS (Cross-Site Scripting) token theft.
* **Solution:** JWTs are issued inside `httpOnly` cookies with `SameSite=Lax` (`Secure` in production). JavaScript cannot read `httpOnly` cookies, shielding authentication tokens from malicious injected scripts.

### Why Mozilla Readability + JSDOM for Scraping?
* **Why:** Web pages contain heavy markup noise—navbars, footers, cookie banners, scripts, ads, and sidebars—which inflates LLM input token costs and dilutes summary quality.
* **Solution:** `axios` fetches raw HTML, `JSDOM` constructs a Virtual DOM, and `@mozilla/readability` strips non-article elements to extract pure content text.

### Why In-Memory Document Parsing (`pdfjs-dist` & `mammoth`)?
* **Why:** Relying on OS CLI tools (like `pdftotext` or `libreoffice`) inflates Docker image size, slows container builds, and introduces system vulnerability vectors.
* **Solution:** Parses PDFs (`pdfjs-dist`) and DOCX (`mammoth`) directly from `multer` memory buffers (`req.file.buffer`) in pure JavaScript memory.

---

## Detailed Technology Stack & Rationale

| Layer / Domain | Technology | Operational Function | Why Used (Engineering Rationale) |
|---|---|---|---|
| **Frontend Framework** | React 18 | Declarative UI rendering & state management | Component reactivity, rich library ecosystem, and seamless SSE stream handling |
| **Build Tool** | Vite | Client bundling & HMR server | Instant cold start and hot module reloading compared to legacy bundlers |
| **Frontend Language** | TypeScript | Static type safety | Prevents runtime bugs in API payload shapes, state hooks, and stream chunks |
| **Styling System** | Tailwind CSS + shadcn/ui | Utility-first CSS & accessible components | Rapid, consistent UI design without CSS bundle bloat or runtime style overhead |
| **Document Export** | `jsPDF` | Client-side PDF file generation | Converts Markdown summaries to PDF directly in browser without backend rendering burden |
| **Markdown Rendering** | `remark-gfm` + `rehype-raw` | Markdown parser & HTML sanitizer | Safely renders structured LLM markdown output (tables, lists, code blocks) in UI |
| **Backend Runtime** | Node.js / Bun | Server-side JavaScript execution | Asynchronous event loop optimized for high-concurrency I/O and streaming |
| **Web Framework** | Express.js v5 | HTTP routing & middleware pipeline | Native promise-rejection error handling and lightweight route middleware stack |
| **Database** | MongoDB via Mongoose | NoSQL persistent storage & ODM | Flexible JSON document schemas for user profiles, auth status, and summary metadata |
| **Caching Engine** | Upstash Redis (`@upstash/redis`) | Serverless HTTP Redis client | Eliminates TCP connection pool overhead in serverless and containerized environments |
| **Rate Limiter** | Upstash Ratelimit (`@upstash/ratelimit`) | Traffic control middleware | Implements sliding-window algorithm to smooth request bursts and protect API quotas |
| **Authentication** | `jsonwebtoken` + `bcrypt` | Signed JWTs & salted password hashing | Stateless session verification with secure password hash storage (`bcrypt` 10 rounds) |
| **Input Validation** | Zod | Runtime schema validation | Enforces strict payload types before requests touch controllers or database drivers |
| **Email Transport** | Nodemailer | Gmail SMTP client | Dispatches HTML email verification links with hex expiration tokens |
| **Web Scraping** | Axios + JSDOM + `@mozilla/readability` | Web content fetcher & DOM parser | Isolates primary article text while discarding ads, navigation, and boilerplate HTML |
| **Document Parsers** | `pdfjs-dist` + `mammoth` | In-memory text extraction | Extracts clean raw text from PDF & DOCX binary buffers without OS binary dependencies |
| **Streaming Protocol** | Server-Sent Events (`text/event-stream`) | Unidirectional HTTP streaming | Low-overhead real-time token streaming from server to client |
| **Containerization** | Docker & Docker Compose | Container orchestration | Ensures 1:1 local and production environment parity across client, server, and Redis |
| **Testing Suite** | Jest / Bun Test + Supertest + `mongodb-memory-server` | Integration & unit testing | Runs fast, isolated test suites against in-memory MongoDB without database side-effects |

---

## Detailed API Endpoints (Under the Hood)

### Health Check

#### `GET /api/health`
* **Access:** Public
* **Rate Limit:** Unrestricted
* **Under the Hood Execution:**
  1. Computes runtime process uptime via `process.uptime()`.
  2. Verifies backend HTTP service availability.
  3. Returns `200 OK` with payload:
     ```json
     {
       "status": "OK",
       "message": "API is working properly",
       "uptime": 184
     }
     ```

---

### Authentication Routes (`/api/auth/user`)

#### `POST /api/auth/user/register`
* **Access:** Public
* **Rate Limit:** `authLimiter` (20 requests / 10 minutes per IP)
* **Request Body:** `{ "name": "...", "email": "...", "password": "..." }`
* **Under the Hood Execution:**
  1. **Validation:** Passes request body to Zod schema (`auth.validator.js`). Validates name (3–45 chars), valid email format, and password length (min 8 chars).
  2. **Duplicate Check:** Queries MongoDB `User` model for existing account matching `email`. Returns `400 Bad Request` if user exists.
  3. **Password Hashing:** Hashes plain password using `bcrypt` with 10 salt rounds.
  4. **Verification Token Generation:** Generates a 32-byte hex token via `crypto.randomBytes(32)` and sets `verificationTokenExpires` to `Date.now() + 15 minutes`.
  5. **User Creation:** Saves new user to MongoDB with `isVerified: false`.
  6. **Email Dispatch:** Renders HTML verification email via `verificationEmail.js` containing link `${API_URL}/api/auth/user/verify/${token}` and sends via Nodemailer (Gmail SMTP).
  7. **Response:** Returns `201 Created` with message `"You're registered, now verify email"`.

#### `GET /api/auth/user/verify/:token`
* **Access:** Public
* **Rate Limit:** `authLimiter` (20 requests / 10 minutes per IP)
* **URL Parameter:** `token` (32-byte hex string)
* **Under the Hood Execution:**
  1. **Token Lookup:** Queries MongoDB for user matching `verificationToken: token` where `verificationTokenExpires > Date.now()`.
  2. **Expiration Check:** If no matching user or token expired, returns `400 Bad Request` (`"Invalid or expired verification token"`).
  3. **Account Activation:** Updates `isVerified: true`, removes `verificationToken` and `verificationTokenExpires` fields, and saves updated document.
  4. **Redirect:** Returns `302 Found` redirecting user's browser to `${CLIENT_URL}/email-verified`.

#### `POST /api/auth/user/resend`
* **Access:** Public
* **Rate Limit:** `resendLimiter` (3 requests / 24 hours per email/IP)
* **Request Body:** `{ "email": "..." }`
* **Under the Hood Execution:**
  1. **Validation:** Validates email format via Zod.
  2. **User Lookup:** Queries MongoDB for `User` by email. Returns `404 Not Found` if missing.
  3. **Verification Check:** If user is already verified (`isVerified === true`), returns `400 Bad Request` (`"User is already verified"`).
  4. **Token Refresh:** Generates new hex verification token and 15-minute expiration timestamp. Saves user.
  5. **Email Dispatch:** Sends updated verification link email via Nodemailer.
  6. **Response:** Returns `200 OK` (`"Verification sent to your email successfully"`).

#### `POST /api/auth/user/login`
* **Access:** Public
* **Rate Limit:** `authLimiter` (20 requests / 10 minutes per IP)
* **Request Body:** `{ "email": "...", "password": "..." }`
* **Under the Hood Execution:**
  1. **Validation:** Validates credentials format via Zod.
  2. **User Retrieval:** Queries MongoDB `User` model by email. Returns `400 Bad Request` if user not found.
  3. **Password Comparison:** Compares plain password with stored bcrypt hash using `bcrypt.compare()`. Returns `400 Bad Request` if invalid.
  4. **Verification Verification:** Checks `user.isVerified`. If `false`, returns `403 Forbidden` (`"Verify your email first"`).
  5. **JWT Issuance:** Calls `generateJWT(res, user._id)`. Generates JWT signed with `JWT_SECRET` (7-day expiry) and attaches token as `jwt` cookie (`httpOnly: true`, `sameSite: 'lax'`, `maxAge: 7 days`).
  6. **Response:** Returns `200 OK` with user JSON (`_id`, `name`, `email`).

#### `POST /api/auth/user/logout`
* **Access:** Public
* **Rate Limit:** Unrestricted
* **Under the Hood Execution:**
  1. Clears `jwt` cookie by setting `res.cookie('jwt', '', { maxAge: 0 })`.
  2. Returns `200 OK` (`"The user has been logged out successfully"`).

#### `GET /api/auth/user/check`
* **Access:** Protected (JWT Cookie Required)
* **Rate Limit:** `authLimiter` (20 requests / 10 minutes per IP)
* **Under the Hood Execution:**
  1. **Middleware Check (`protectRoute`):** Reads `req.cookies.jwt`. Returns `401 Unauthorized` if cookie is missing.
  2. **Token Verification:** Verifies JWT signature using `jwt.verify(token, JWT_SECRET)`. Returns `401 Unauthorized` if expired or invalid.
  3. **User Population:** Queries MongoDB `User.findById(decoded.userId).select('-password')`. Returns `404 Not Found` if user record was deleted.
  4. **Context Attachment:** Attaches user object to `req.user`.
  5. **Response:** Returns `200 OK` with active user profile.

---

### Content Ingestion & Summarization Routes (`/api/scrape`)

All ingestion routes require a valid `jwt` httpOnly cookie and are enforced by `aiLimiter` (30 requests / 15 minutes).

#### `POST /api/scrape/web`
* **Access:** Protected (`protectRoute`)
* **Rate Limit:** `aiLimiter` (30 requests / 15 minutes per user/IP)
* **Request Body:** `{ "url": "https://...", "client": "gemini", "stream": true }`
  * `client` options: `"gemini"`, `"groq"`, `"gemma"`, `"sarvam"`
  * `stream`: `boolean` (optional, defaults to `false`)
* **Under the Hood Execution:**
  1. **Schema Validation:** Validates URL syntax and supported AI client string via Zod (`summary.validator.js`).
  2. **Web Scraping:** Uses `axios.get(url)` with custom browser `User-Agent` headers to fetch raw HTML.
  3. **DOM Parsing & Extraction:** Initializes `JSDOM` with fetched HTML and passes DOM to `@mozilla/readability`. Extracts `article.textContent` (clean article text). If extraction fails, returns `400 Bad Request` (`"Could not extract article content"`).
  4. **SHA-256 Hashing:** Computes hex digest `hashContent(articleText)`. Derives cache key `summary:<HASH>`.
  5. **Redis Cache Lookup:** Queries Upstash Redis.
     * **Cache Hit:** Immediately returns stored summary JSON (`{ "output": "..." }`) or streams cached summary via SSE (~150ms latency, 0 LLM tokens).
     * **Cache Miss:** Continues to Model Routing.
  6. **Model Routing:** Dispatches cleaned text to selected AI provider:
     * `gemini`: Calls `@google/genai` SDK with model `gemini-3.5-flash`.
     * `groq`: Calls `groq-sdk` with model `openai/gpt-oss-120b`.
     * `gemma`: Calls local Ollama endpoint `POST http://localhost:11434/api/chat` via `fetch`.
     * `sarvam`: Calls `sarvamai` SDK with Hinglish system prompt (`sarvamSystemPrompt.js`).
  7. **Response Delivery:**
     * **Standard (`stream: false`):** Awaits complete model completion, caches summary string in Redis (24h TTL), and returns `200 OK` `{ "output": "..." }`.
     * **Streaming (`stream: true`):** Sets headers `Content-Type: text/event-stream`, `Cache-Control: no-cache`. Streams tokens as SSE chunks (`event: chunk`, `data: {"delta":"..."}`). Accumulates tokens and caches final text in Redis upon completion (`event: done`).

#### `POST /api/scrape/doc`
* **Access:** Protected (`protectRoute`)
* **Rate Limit:** `aiLimiter` (30 requests / 15 minutes per user/IP)
* **Request Format:** `multipart/form-data`
  * `document`: File upload (PDF or DOCX, max 5MB)
  * `client`: String (`"gemini"`, `"groq"`, `"gemma"`, `"sarvam"`)
  * `stream`: String/Boolean (`"true"` or `true` optional)
* **Under the Hood Execution:**
  1. **File Interception:** `multer.single('document')` intercepts request and loads file buffer into `req.file.buffer` (memory storage). Returns `400 Bad Request` if missing file or >5MB limit.
  2. **Mimetype Document Parsing (`document.js` service):**
     * `application/pdf`: Passes buffer to `pdfparse.js` (`pdfjs-dist`). Extracts text content page by page.
     * `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX): Passes buffer to `docxparse.js` (`mammoth`). Extracts raw text string.
  3. **SHA-256 Hashing:** Normalizes text and generates hex hash `hashContent(extractedText)`. Formats Redis key `summary:<HASH>`.
  4. **Redis Cache Lookup:** Checks Upstash Redis for existing key. Returns cached summary instantly on hit.
  5. **Model Routing & Execution:** Dispatches text to selected model wrapper (`gemini`, `groq`, `gemma`, or `sarvam`).
  6. **Response & Caching:** Streams tokens via SSE (`stream: true`) or returns JSON summary (`{ "summary": "..." }`), saving the result to Redis with 24-hour TTL.

---

## End-to-End System Architecture

```text
┌─────────────────┐
│  React Client   │
└────────┬────────┘
         │ HTTP / SSE (with httpOnly JWT cookie)
         ▼
┌─────────────────┐
│  Express Server │
└────────┬────────┘
         │
         ├──► authLimiter / aiLimiter (Upstash Sliding Window Rate Limit)
         ├──► protectRoute Middleware (JWT Cookie Validation)
         │
         ▼
┌─────────────────┐
│ Content Parsing │ (Web: Axios + JSDOM + Readability | Doc: pdfjs-dist / mammoth)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ SHA-256 Hashing │ (crypto.createHash('sha256') on extracted raw text)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Redis Cache   │
└────┬─────────┬──┘
     │Hit      │Miss
     ▼         ▼
   Summary   Model Routing
                   │
           ┌───────┼───────┬───────┐
           ▼       ▼       ▼       ▼
        Gemini   Groq    Gemma   Sarvam
           │       │       │       │
           └───────┴───┬───┴───────┘
                       ▼
                    Summary
                       │
                       ▼
                 Store in Redis (24h TTL)
```



## Quick Startup (Docker)

Launch client, server, and Redis in containerized environment:

```bash
./start.sh
```

Or manually using Docker Compose:

```bash
docker compose up --build -d
```

> **Note for Gemma (Local LLM):** Ensure Ollama is running on your host machine (`ollama serve`). The server container connects to Ollama via `OLLAMA_BASE_URL=http://host.docker.internal:11434`.

---

## Running Backend Tests

```bash
cd server
bun test
```

Runs integration tests for auth, health check, and rate limiters against an isolated in-memory MongoDB database (`mongodb-memory-server`).

---

## Local Development (Without Docker)

1. **Clone repository:**
   ```bash
   git clone https://github.com/render-TheVoid/layerzero.git
   cd layerzero
   ```

2. **Backend setup:**
   ```bash
   cd server
   bun install
   cp .env.example .env
   bun dev
   ```

3. **Frontend setup:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

---

## Environment Variables

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

---

## Current Limitations & Roadmap

* **Single Document Focus:** Currently processes one document or URL per request. Multi-document batch processing planned.
* **Persistent History:** Summaries currently persist in Redis cache (24h TTL) but are not yet saved to user accounts permanently.
* **Background Queues:** Future updates will integrate worker queues (e.g. BullMQ) for asynchronous long-document parsing.

---

## License

MIT License