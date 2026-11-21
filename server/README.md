# Layerzero — Backend Service

The backend API for Layerzero, built with Express 5 on Bun and Node.js. It handles user authentication, in-memory document parsing, web scraping, multi-model AI routing, Redis caching, and MongoDB persistence.

---

## Project Structure

```text
server/
├── src/
│   ├── config/             # Database, Redis, logger, system prompts
│   │   ├── llm/            # Model client wrappers (Gemini, Groq, Sarvam, Gemma)
│   │   ├── db.js           # Mongoose MongoDB connection
│   │   ├── logger.js       # Pino logger instance
│   │   ├── redis.js        # Upstash Redis client
│   │   └── systemPrompt.js # Base summarization prompt
│   ├── controllers/        # Request handlers (auth, scrape, docSummary, summary)
│   ├── middlewares/        # Auth verification, rate limiters, error handling
│   ├── models/             # Mongoose schemas (User, Summary)
│   ├── services/           # Document extraction logic (PDF, DOCX)
│   ├── utils/              # Content hashing helper
│   ├── validators/         # Zod schemas for request validation
│   ├── app.js              # Express app configuration and middleware setup
│   └── server.js           # Entry point (HTTP / HTTPS listener)
├── tests/                  # Integration tests (bun test, supertest)
├── .env.example            # Environment variable template
└── package.json
```

---

## Supported AI Models

Model selection is passed in the request body as `client`:

| Value | Model | Client File | Notes |
|---|---|---|---|
| `gemini` | `GEMINI_MODEL_NAME` (default: `gemini-3.5-flash-lite`) | `config/llm/geminiClient.js` | Uses `@google/genai` SDK |
| `groq` | `GROQ_MODEL_NAME` (default: `openai/gpt-oss-20b`) | `config/llm/groqClient.js` | Uses `groq-sdk` with JSON mode |
| `sarvam` | `sarvam-30b` | `config/llm/sarvamClient.js` | Uses `sarvamai` SDK (Hindi/Hinglish) |
| `gemma` | `OLLAMA_MODEL` (default: `gemma:4b`) | `config/llm/gemmaClient.js` | Calls local Ollama `/api/chat` endpoint |

---

## Request Processing Flow

### Document Summarization (`POST /api/scrape/doc`)
1. Accepts `multipart/form-data` with a `document` file (PDF or DOCX, max 5MB) and `client`.
2. Extracts raw text in memory using `pdfjs-dist` (for PDFs) or `mammoth` (for DOCX).
3. Computes a SHA-256 hash of the extracted text (`hashContent.js`).
4. Checks MongoDB for a summary matching `userId`, `sourceHash`, and `client`.
5. Checks Upstash Redis for key `${client}:${sourceHash}`.
6. If not cached, calls the selected model client.
7. Strips any markdown fences (` ```json `) from the model output and parses it as JSON `{ title, summary }`.
8. Saves the response to Redis (24-hour expiration) and to MongoDB in the `Summary` collection.
9. Returns `{ output: summary, title: title, cached: boolean }`.

### Web Article Summarization (`POST /api/scrape/web`)
1. Accepts JSON `{ "url": "...", "client": "..." }`.
2. Fetches the page HTML via Axios with a standard browser User-Agent.
3. Parses HTML with JSDOM and extracts readable article text using `@mozilla/readability`.
4. Computes a SHA-256 hash of the URL and checks MongoDB and Redis (`${client}:${url}`).
5. If not cached, calls the selected model client, cleans the response, caches it in Redis, and stores it in MongoDB.
6. Returns `{ output: summary, title: title, cached: boolean }`.

---

## Rate Limiting

Rate limiting is enforced with `@upstash/ratelimit` using sliding windows:

| Limiter | Limit | Target Routes |
|---|---|---|
| `authLimiter` | 20 requests per 10 minutes | `/api/auth/user/*` |
| `resendLimiter` | 3 requests per 24 hours | `/api/auth/user/resend` |
| `aiLimiter` | 30 requests per 15 minutes | `/api/scrape/*` |
| `summaryLimiter` | 50 requests per 60 minutes | `/api/summaries` |

---

## API Reference

### Auth Endpoints (`/api/auth/user`)

#### `POST /register`
- **Body:** `{ "name": "...", "email": "...", "password": "..." }`
- **Action:** Creates an unverified user record, generates a 15-minute token, and sends a verification email.

#### `GET /verify/:token`
- **Action:** Validates the token, sets `isVerified: true`, and redirects to `${CLIENT_URL}/email-verified`.

#### `POST /resend`
- **Body:** `{ "email": "..." }`
- **Action:** Generates a new verification token and resends the email.

#### `POST /login`
- **Body:** `{ "email": "...", "password": "..." }`
- **Action:** Verifies credentials and sets an `httpOnly` JWT cookie (`SameSite=Lax`, 7-day expiration).

#### `POST /logout`
- **Action:** Clears the `jwt` cookie.

#### `GET /check`
- **Header:** Cookie with valid JWT.
- **Returns:** Current user object without password hash.

#### `PUT /update`
- **Header:** Cookie with valid JWT.
- **Body:** Fields to update (`name`, `email`, `currentPassword`, `newPassword`).

#### `DELETE /delete`
- **Header:** Cookie with valid JWT.
- **Action:** Deletes user record and clears JWT cookie.

---

### Summarization Endpoints (`/api/scrape`)

#### `POST /doc`
- **Header:** Cookie with valid JWT, `Content-Type: multipart/form-data`
- **Form Data:**
  - `document`: File (PDF or DOCX)
  - `client`: `gemini` | `groq` | `sarvam` | `gemma`
- **Returns:**
  ```json
  {
    "output": "Markdown formatted summary...",
    "title": "Document Title",
    "cached": false
  }
  ```

#### `POST /web`
- **Header:** Cookie with valid JWT, `Content-Type: application/json`
- **Body:**
  ```json
  {
    "url": "https://example.com/article",
    "client": "gemini"
  }
  ```
- **Returns:** Same shape as `/doc`.

---

### History Endpoints (`/api/summaries`)

#### `GET /`
- **Header:** Cookie with valid JWT.
- **Returns:**
  ```json
  {
    "success": true,
    "count": 5,
    "summaries": [
      {
        "_id": "...",
        "title": "...",
        "finalSummary": "...",
        "sourceType": "pdf",
        "client": "gemini",
        "createdAt": "..."
      }
    ]
  }
  ```

---

## Environment Variables

| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | HTTP server port | `5000` |
| `HTTPS_PORT` | HTTPS server port (production) | `5001` |
| `NODE_ENV` | Environment mode | `development` |
| `LOG_LEVEL` | Pino log level | `debug` |
| `CLIENT_URL` | Frontend URL for CORS and redirects | `http://localhost:5173` |
| `API_URL` | Base backend URL | `http://localhost:5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/layerzero` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint | `https://...upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | `...` |
| `JWT_SECRET` | Secret key for JWT signing | `...` |
| `EMAIL_USER` | Gmail address for Nodemailer | `example@gmail.com` |
| `EMAIL_APP_PASSWORD` | Gmail App Password | `...` |
| `GEMINI_API_KEY` | Google Gemini API key | `...` |
| `GEMINI_MODEL_NAME` | Gemini model name | `gemini-3.5-flash-lite` |
| `GROQ_API_KEY` | Groq API key | `...` |
| `GROQ_MODEL_NAME` | Groq model name | `openai/gpt-oss-20b` |
| `SARVAM_API_KEY` | Sarvam AI API key | `...` |
| `OLLAMA_BASE_URL` | Local Ollama host URL | `http://localhost:11434` |
| `OLLAMA_MODEL` | Local Ollama model tag | `gemma:4b` |

---

## Local Development

```bash
# Install dependencies
bun install   # or: npm install

# Copy environment template
cp .env.example .env

# Run in development mode with auto-reload
bun dev       # or: npm run dev

# Run integration tests
bun test
```
