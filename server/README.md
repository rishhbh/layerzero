# LayerZero — Backend

Express.js + MongoDB backend for LayerZero. Handles JWT auth, multi-format content ingestion (PDF, DOCX, URL), and hybrid AI summarization routing between Gemini, Cerebras, Sarvam AI, and Gemma via Ollama. Redis caching and rate limiting are implemented using Upstash.

---

## Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express.js v5 |
| Database | MongoDB via Mongoose |
| Caching & Rate Limit | Redis via Upstash (`@upstash/redis`) |
| Auth | JWT in httpOnly cookies |
| Validation | Zod |
| AI — Cloud | Gemini (`@google/genai`), Cerebras (`@cerebras/cerebras_cloud_sdk`), Sarvam (`sarvamai`) |
| AI — Local | Gemma via Ollama (`/api/chat`) |
| File Parsing | `pdf-parse`, `mammoth` (for DOCX), `multer` (memory storage) |
| Web Scraping | `axios` + `jsdom` + `@mozilla/readability` |

---

## Project Structure

```
server/
├── app.js                  # Entry point, middleware stack, route mounting
├── config/
│   ├── db.js               # MongoDB connection
│   ├── docxparse.js        # DOCX buffer → text extractor
│   ├── llm/                # AI Client wrappers (Cerebras, Gemini, Gemma, Sarvam)
│   ├── pdfparse.js         # PDF buffer → text extractor
│   ├── sarvamSystemPrompt.js # Specialized system prompt for Sarvam AI
│   ├── systemPrompt.js     # Default system prompt for other models
│   └── utils.js            # JWT generation utility
├── controllers/
│   ├── auth.js             # register, login, logout, checkUser
│   ├── docSummary.js       # Document upload (PDF/DOCX) → parse → summarize (with Redis caching)
│   └── scrape.js           # URL → scrape → summarize (with Redis caching)
├── middlewares/
│   ├── authMiddleware.js   # protectRoute (JWT verification)
│   ├── errorHandler.js     # Global error handler
│   ├── rateLimiter.js      # Rate limit middleware wrapper
│   └── redisRateLimit.js   # Upstash Redis instances for auth & ai limiters
├── models/
│   └── User.js             # Mongoose user schema
├── routes/
│   ├── authRoute.js        # /api/auth/*
│   └── ingestRoute.js      # /api/scrape/*
├── services/
│   ├── document.js         # Document handling services
│   ├── multer.js           # Multer config (memory storage, 5MB limit)
│   └── redis.js            # Upstash Redis client configuration
└── utils/
    └── hashContent.js      # Utility for generating cache keys via crypto hash
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values.

```env
PORT=
MONGODB_URI=
OLLAMA_MODEL=
OLLAMA_BASE_URL=
GEMINI_API_KEY=
CEREBRAS_API_KEY=
SARVAM_API_KEY=
JWT_SECRET=
NODE_ENV=
CLIENT_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

> `OLLAMA_BASE_URL` defaults to `http://localhost:11434` — Ollama must be running locally with the specified model pulled.

---

## API Reference

### Health Check

---

#### `GET /api/health`

Returns the current health status of the API.

**Response `201 Created`**
```json
{
  "status": "OK",
  "message": "API is working properly",
  "uptime": 123
}
```

---

### Auth — `/api/auth`

All auth routes are public (no token required) and are protected by rate limiting.

---

#### `POST /api/auth/user/register`

Registers a new user and sets a JWT cookie.

**Request Body (`application/json`)**
| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | The user's name (min 3, max 45 chars) |
| `email` | string | Yes | A valid email address |
| `password` | string | Yes | The user's password (min 8 chars) |

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

#### `POST /api/auth/user/login`

Authenticates an existing user and sets a JWT cookie.

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
- `400 Bad Request`: If validation fails.
- `400 Bad Request`: If invalid credentials are provided.
  ```json
  {
    "message": "Invalid username or password"
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

All ingestion routes are protected — requires a valid `jwt` cookie and are protected by rate limiting.

---

#### `POST /api/scrape/web`

Scrapes a URL, extracts readable content via Readability, and summarizes it using the selected model. Results are cached in Redis. Supports streaming for real-time text generation.

**Request Body (`application/json`)**
| Field | Type | Required | Description |
|---|---|---|---|
| `url` | string | Yes | A valid URL to scrape |
| `client` | string | Yes | The AI model to use (`"gemini"`, `"gemma"`, `"cerebras"`, or `"sarvam"`) |
| `stream` | boolean | No | Set to `true` to enable streaming response |

**Query Parameters**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `stream` | boolean | No | Set to `true` to enable streaming response (`?stream=true`) |

**Response `200 OK` (Standard)**
```json
{
  "output": "AI-generated summary..."
}
```

**Response `200 OK` (Streaming)**
If `stream` is `true`, the API streams plain text directly, returning the summary tokens progressively.

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

Accepts a Document file upload (PDF/DOCX), extracts text, and summarizes it using the selected model. Results are cached in Redis using a content hash. Supports streaming for real-time text generation.

**Request (`multipart/form-data`)**
| Field | Type | Required | Description |
|---|---|---|---|
| `document` | File | Yes | PDF or DOCX file (max 5MB) |
| `client` | string | Yes | The AI model to use (`"gemini"`, `"gemma"`, `"cerebras"`, or `"sarvam"`) |
| `stream` | boolean/string | No | Set to `true` or `"true"` to enable streaming response |

**Response `200 OK` (Standard)**
```json
{
  "summary": "AI-generated summary..."
}
```

**Response `200 OK` (Streaming)**
If `stream` is `true`, the API streams plain text directly, returning the summary tokens progressively.

**Error Responses**
- `400 Bad Request`: If no file was uploaded.
  ```json
  {
    "message": "No file uploaded!"
  }
  ```
- `400 Bad Request`: If an invalid model was specified.

---

## Core Flows

### Auth Flow

```
Client
  │
  ├─ POST /register or /login
  │       │
  │       ▼
  │   Validate fields
  │       │
  │       ▼
  │   Hash password (bcrypt, salt 10)   ← register only
  │       │
  │       ▼
  │   Create / find user in MongoDB
  │       │
  │       ▼
  │   generateToken() → JWT (7d)
  │       │
  │       ▼
  │   Set httpOnly cookie + return user object
  │
  └─ GET /check → reads req.user (set by protectRoute)
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
llmRateLimit + protectRoute (JWT check)
  │
  ▼
multer memoryStorage → req.file.buffer
  │
  ▼
Hash content → Check Redis cache → Return if exists
  │
  ▼
Document Service → raw text string (pdf-parse / mammoth)
  │
  ▼
model = models[req.body.client]  (gemini | gemma | cerebras | sarvam)
  │
  ▼
model(text) → summary string
  │
  ▼
Cache in Redis → res.json({ summary })
```

### URL Summarization Flow

```
POST /api/scrape/web
  │
  ▼
llmRateLimit + protectRoute (JWT check)
  │
  ▼
Check Redis cache for URL → Return if exists
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
  ▼
model(textContent) → summary string
  │
  ▼
Cache in Redis → res.json({ output })
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
Uses `@google/genai` SDK with `gemini-2.5-flash`.

### Cerebras
Uses `@cerebras/cerebras_cloud_sdk` for fast, cloud-based inference.

### Sarvam AI
Uses `sarvamai` SDK tailored for Indic language contexts or specialized tasks using a dedicated system prompt.

### Gemma
Hits the local Ollama `/api/chat` endpoint via native `fetch`. Runs fully offline.

### Model Routing

Client selection is explicit — the caller passes `client: "gemini"`, `"gemma"`, `"cerebras"`, or `"sarvam"` in the request body. Both ingestion controllers use the same routing pattern to fetch the respective API wrapper from `config/llm/`.

---

## Running Locally

```bash
cd server
npm install
cp .env.example .env   # fill in your values
npm run dev
```

> Make sure Ollama is running (`ollama serve`) with your model pulled (`ollama pull <model>`) before hitting any Gemma routes.