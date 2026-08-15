# Layerzero — Backend

Express.js + MongoDB backend for Layerzero. Handles JWT auth, multi-format content ingestion (PDF, DOCX, URL), and hybrid AI summarization routing between Gemini, Cerebras, Sarvam AI, and Gemma via Ollama. Features real-time SSE response streaming, custom Upstash Redis rate limiting, intelligent cache deduplication, and an automated Jest testing suite.

---

## Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js (ESM, v22-alpine in Docker) |
| Framework | Express.js v5 |
| Server & Logging | `server.js` (HTTPS/HTTP), `morgan` ('dev') |
| Database | MongoDB via Mongoose |
| Caching & Rate Limit | Upstash Redis (`@upstash/redis` & `@upstash/ratelimit`) |
| Auth & Email | JWT in httpOnly cookies (`jsonwebtoken`, `bcrypt`), Nodemailer (`nodemailer`) |
| Validation | Zod (`auth.validator.js`, `summary.validator.js`) |
| AI — Cloud | Gemini (`@google/genai`), Cerebras (`@cerebras/cerebras_cloud_sdk`), Sarvam (`sarvamai`) |
| AI — Local | Gemma via Ollama (`/api/chat`) |
| Streaming | Server-Sent Events (`text/event-stream`) |
| File Parsing | `pdfjs-dist` (for PDF), `mammoth` (for DOCX), `multer` (memory storage) |
| Web Scraping | `axios` + `jsdom` + `@mozilla/readability` |
| Testing | Jest, Supertest, `mongodb-memory-server` |

---

## Project Structure

```
server/
├── Dockerfile              # Docker container instructions
├── jest.config.js          # Jest configuration for ESM
├── package.json            # NPM scripts & dependencies
├── tests/
│   ├── setup.js            # In-memory MongoDB lifecycle hooks
│   ├── auth.test.js        # Auth endpoint unit/integration tests
│   └── health.test.js      # Health check endpoint test
└── src/
    ├── app.js              # Express application setup & middleware stack
    ├── server.js           # Server startup, HTTPS SSL option, & DB connection
    ├── config/
    │   ├── db.js           # MongoDB connection handler
    │   ├── docxparse.js    # DOCX buffer → text extractor (mammoth)
    │   ├── generateJWT.js  # JWT cookie generator utility
    │   ├── pdfparse.js     # PDF buffer → text extractor (pdfjs-dist)
    │   ├── redis.js        # Upstash Redis client configuration
    │   ├── sarvamSystemPrompt.js # Sarvam AI Hinglish system prompt
    │   ├── systemPrompt.js # Layerzero default system prompt
    │   └── llm/            # AI Client wrappers (standard & streaming)
    │       ├── cerebrasClient.js
    │       ├── geminiClient.js
    │       ├── gemmaClient.js
    │       ├── sarvamClient.js
    │       └── streamingClients.js
    ├── controllers/
    │   ├── auth.js         # registerUser, loginUser, logout, verifyEmail, resendVerification, checkUser
    │   ├── docSummary.js   # Document upload → parse → summarize/stream
    │   └── scrape.js       # URL scrape → readability → summarize/stream
    ├── emails/
    │   └── verificationEmail.js # HTML template generator for email verification
    ├── middlewares/
    │   ├── authMiddleware.js # protectRoute (JWT cookie verification)
    │   ├── errorHandler.js   # Global error handling middleware
    │   ├── rateLimiter.js    # Rate limiter middleware wrapper
    │   └── redisRateLimit.js # Upstash sliding window instances (auth & AI)
    ├── models/
    │   ├── Chunk.js        # Document chunking schema
    │   ├── Summary.js      # Summarization job schema
    │   └── User.js         # Mongoose User schema & password hashing
    ├── routes/
    │   ├── authRoute.js    # /api/auth/* endpoints
    │   └── ingestRoute.js  # /api/scrape/* endpoints
    ├── services/
    │   ├── document.js     # Mimetype document extraction router
    │   ├── multer.js       # Multer memory storage config (5MB max)
    │   └── nodemailer.js   # Gmail email sending service
    ├── utils/
    │   ├── hashContent.js  # Content SHA-256 hash generator for cache keys
    │   └── streamResponse.js # SSE streaming & caching pipeline
    └── validators/
        ├── auth.validator.js # Zod schemas for registration & login
        └── summary.validator.js # Zod schema for web summarization
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values.

```env
PORT=
HTTPS_PORT=
SSL_KEY_PATH=
SSL_CERT_PATH=
MONGODB_URI=
OLLAMA_MODEL=
OLLAMA_BASE_URL=
GEMINI_API_KEY=
CEREBRAS_API_KEY=
SARVAM_API_KEY=
JWT_SECRET=
NODE_ENV=
CLIENT_URL=
API_URL=
EMAIL_USER=
EMAIL_APP_PASSWORD=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

> `OLLAMA_BASE_URL` defaults to `http://localhost:11434` — Ollama must be running locally with the specified model pulled.

---

## Rate Limiting

Layerzero implements custom sliding window rate limiting powered by `@upstash/ratelimit` and Upstash Redis.

- **Auth Limiter (`authLimiter`)**: 20 requests per 10-minute window (applied to auth endpoints such as `/register`, `/login`, `/check`, and `/verify/:token`).
- **Resend Limiter (`resendLimiter`)**: 3 requests per 24-hour window (applied to `/api/auth/user/resend`).
- **AI Limiter (`aiLimiter`)**: 30 requests per 15-minute window (applied to `/api/scrape/*`).
- Identifies requests by `req.user.id` (if authenticated) or `req.ip`.
- Bypassed automatically when `NODE_ENV === 'test'`.

---

## API Reference

### Health Check

---

#### `GET /api/health`

Returns the current health status of the API.

**Response `200 OK`**
```json
{
  "status": "OK",
  "message": "API is working properly",
  "uptime": 123
}
```

---

### Auth — `/api/auth`

All auth routes are public (no token required, except `GET /check` which requires JWT cookie) and are protected by rate limiting (`authLimiter` / `resendLimiter`).

---

#### `POST /api/auth/user/register`

Registers a new user, hashes password, creates a 15-minute verification token, and sends an email verification link via Nodemailer.

**Request Body (`application/json`)**
| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | The user's name (min 3, max 45 chars) |
| `email` | string | Yes | A valid email address |
| `password` | string | Yes | The user's password (min 8 chars) |

**Response `201 Created`**
```json
{
  "success": true,
  "message": "You're registered, now verify email"
}
```

**Error Responses**
- `400 Bad Request`: If validation fails (e.g., invalid email format, weak password).
  ```json
  {
    "errors": {
      "email": ["Enter a valid email address"]
    }
  }
  ```
- `400 Bad Request`: If the email is already registered.
  ```json
  {
    "message": "This user is already registerd with us!"
  }
  ```

---

#### `GET /api/auth/user/verify/:token`

Verifies a user's email using the hex verification token sent via email. Sets `isVerified = true` and removes the verification token.

**URL Parameters**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `token` | string | Yes | The hex verification token sent in the email link |

**Response `302 Found` (Redirect)**
Redirects the user to `${process.env.CLIENT_URL}/email-verified` upon successful email verification.

**Error Responses**
- `400 Bad Request`: If the verification token is invalid or expired (exceeds 15 mins).
  ```json
  {
    "success": false,
    "message": "Invalid or expired verification token"
  }
  ```

---

#### `POST /api/auth/user/resend`

Resends the email verification token if the user is registered but not yet verified. Rate limited to 3 requests per 24 hours (`resendLimiter`).

**Request Body (`application/json`)**
| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | Registered email address to receive new verification link |

**Response `200 OK`**
```json
{
  "success": true,
  "message": "Verification sent to your email successfully"
}
```

**Error Responses**
- `404 Not Found`: If no user exists with the provided email.
  ```json
  {
    "success": false,
    "message": "User not found"
  }
  ```
- `400 Bad Request`: If the user is already verified.
  ```json
  {
    "success": false,
    "message": "User is already verified"
  }
  ```

---

#### `POST /api/auth/user/login`

Authenticates an existing verified user and sets a JWT cookie.

**Request Body (`application/json`)**
| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | A valid email address |
| `password` | string | Yes | The user's password |

**Response `200 OK`**
```json
{
  "_id": "user_id",
  "name": "Rishabh",
  "email": "rishabh@example.com"
}
```
*Note: Sets `jwt` httpOnly cookie (7d expiry).*

**Error Responses**
- `400 Bad Request`: If validation fails or invalid credentials are provided.
  ```json
  {
    "message": "Invalid username or password"
  }
  ```
- `403 Forbidden`: If user email has not been verified yet.
  ```json
  {
    "success": true,
    "message": "Verify your email first"
  }
  ```

---

#### `POST /api/auth/user/logout`

Clears the JWT cookie to log the user out.

**Response `200 OK`**
```json
{
  "message": "The user has been logged out successfully"
}
```

---

#### `GET /api/auth/user/check`

Returns the currently authenticated user. Requires a valid JWT cookie.

**Response `200 OK`**
```json
{
  "_id": "user_id",
  "name": "Rishabh",
  "email": "rishabh@example.com"
}
```

**Error Responses**
- `401 Unauthorized`: If the token is missing or invalid.
- `404 Not Found`: If the user could not be found.

---

### Ingestion — `/api/scrape`

All ingestion routes require a valid `jwt` cookie and are protected by the `aiLimiter` rate limiter.

---

#### `POST /api/scrape/web`

Scrapes a URL, extracts readable content via Readability, and summarizes it using the selected model. Results are cached in Redis. Supports Server-Sent Events (SSE) streaming.

**Request Body (`application/json`)**
| Field | Type | Required | Description |
|---|---|---|---|
| `url` | string | Yes | A valid URL to scrape |
| `client` | string | Yes | The AI model to use (`"gemini"`, `"gemma"`, `"cerebras"`, or `"sarvam"`) |
| `stream` | boolean | No | Set to `true` to enable SSE streaming response |

**Query Parameters**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `stream` | boolean | No | Set to `true` to enable SSE streaming response (`?stream=true`) |

**Response `200 OK` (Standard JSON)**
```json
{
  "output": "AI-generated summary..."
}
```

**Response `200 OK` (Streaming — `text/event-stream`)**
When `stream: true`, responses stream via Server-Sent Events (SSE):

```text
event: chunk
data: {"delta":"Summary "}

event: chunk
data: {"delta":"token..."}

event: done
data: {"output":"Full summary text..."}
```

**Error Responses**
- `400 Bad Request`: If validation fails (e.g., invalid URL, invalid model).
- `400 Bad Request`: If the article content could not be extracted from the provided URL.
  ```json
  {
    "message": "Could not extract article content"
  }
  ```

---

#### `POST /api/scrape/doc`

Accepts a Document file upload (PDF/DOCX), extracts text, and summarizes it using the selected model. Results are cached in Redis using a content hash. Supports SSE streaming.

**Request (`multipart/form-data`)**
| Field | Type | Required | Description |
|---|---|---|---|
| `document` | File | Yes | PDF or DOCX file (max 5MB) |
| `client` | string | Yes | The AI model to use (`"gemini"`, `"gemma"`, `"cerebras"`, or `"sarvam"`) |
| `stream` | boolean/string | No | Set to `true` or `"true"` to enable SSE streaming |

**Response `200 OK` (Standard JSON)**
```json
{
  "summary": "AI-generated summary..."
}
```

**Response `200 OK` (Streaming — `text/event-stream`)**
When `stream` is `true`, responses stream via Server-Sent Events (SSE):

```text
event: chunk
data: {"delta":"Summary "}

event: done
data: {"summary":"Full summary text..."}
```

**Error Responses**
- `400 Bad Request`: If no file was uploaded.
  ```json
  {
    "message": "No file uploaded!"
  }
  ```
- `400 Bad Request`: If an invalid model was specified.

---

## Automated Testing

The backend includes a unit and integration test suite using Jest, Supertest, and `mongodb-memory-server`.

```bash
cd server
npm test
```

- **Environment**: Configured via `.env.test`.
- **In-Memory Database**: Tests run isolated in memory without polluting your development MongoDB instance.
- **Coverage**: Includes authentication (`POST /register`, `POST /login`, `POST /logout`) and health checks (`GET /api/health`).

---

## Core Flows

### Auth Flow

```
Client
  │
  ├─ POST /user/register
  │       │
  │       ▼
  │   Validate (Zod) → Hash password → Generate token (15m expiry) → Send email → 201 Created
  │
  ├─ GET /user/verify/:token
  │       │
  │       ▼
  │   Verify token & expiry → Set isVerified = true → Clear token → 200 OK
  │
  ├─ POST /user/resend
  │       │
  │       ▼
  │   Generate new token → Send email → 200 OK (rate limited to 3 req / 24h)
  │
  ├─ POST /user/login
  │       │
  │       ▼
  │   Validate (Zod) → Compare password → Check isVerified (403 if false) → generateToken() → Set JWT cookie → 200 OK
  │
  ├─ POST /user/logout → Clear JWT cookie (maxAge: 0) → 200 OK
  │
  └─ GET /user/check → protectRoute → returns req.user (200 OK)
```

### protectRoute Middleware Flow

```
Incoming request to protected route
  │
  ▼
Read req.cookies.jwt
  │
  ├─ No token → 401 Unauthorized
  │
  ▼
jwt.verify(token, JWT_SECRET)
  │
  ├─ Invalid → 401 Unauthorized
  │
  ▼
User.findById(jwtCheck.userId).select('-password')
  │
  ├─ Not found → 404
  │
  ▼
req.user = user → next()
```

### Document Summarization Flow

```
POST /api/scrape/doc  (multipart/form-data)
  │
  ▼
aiLimiter + protectRoute (JWT check)
  │
  ▼
multer memoryStorage → req.file.buffer
  │
  ▼
Hash content → Check Redis cache → Return if exists (JSON or stream)
  │
  ▼
Document Service → raw text string (pdfjs-dist / mammoth)
  │
  ▼
model = models[req.body.client]  (gemini | gemma | cerebras | sarvam)
  │
  ├─ Standard → model(text) → summary string → Cache in Redis → res.json({ summary })
  └─ Streaming → streamAndCache() → SSE chunks → Cache in Redis → event: done
```

### URL Summarization Flow

```
POST /api/scrape/web
  │
  ▼
aiLimiter + protectRoute (JWT check)
  │
  ▼
Check Redis cache for URL → Return if exists (JSON or stream)
  │
  ▼
axios.get(url) with browser User-Agent
  │
  ▼
JSDOM + Readability → article.textContent
  │
  ├─ Unreadable page → 400
  │
  ▼
model = models[req.body.client]  (gemini | gemma | cerebras | sarvam)
  │
  ├─ Standard → model(textContent) → summary string → Cache in Redis → res.json({ output })
  └─ Streaming → streamAndCache() → SSE chunks → Cache in Redis → event: done
```

### Error Handling Flow

```
Any controller → next(err)
  │
  ▼
handleError middleware
  │
  ├─ NODE_ENV=development → { message, error, stack }
  └─ NODE_ENV=production  → { error: "Internal server error occured" }
```

---

## AI Clients

### Gemini
Uses `@google/genai` SDK with `gemini-3.5-flash`. Supports streaming (`streamGemini`).

### Cerebras
Uses `@cerebras/cerebras_cloud_sdk` with `gpt-oss-120b` for fast cloud inference. Supports streaming (`streamCerebras`).

### Sarvam AI
Uses `sarvamai` SDK tailored for Hinglish & Indic language contexts with specialized prompt. Supports streaming (`streamSarvam`).

### Gemma
Hits the local Ollama `/api/chat` endpoint via native `fetch`. Runs fully offline. Supports streaming (`streamGemma`).

---

## Running Locally

```bash
cd server
npm install
cp .env.example .env   # fill in your values
npm run dev
```

> Make sure Ollama is running (`ollama serve`) with your model pulled (`ollama pull <model>`) before hitting any Gemma routes.