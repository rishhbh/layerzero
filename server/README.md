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
│   ├── authRateLimit.js    # Rate limiting for auth routes (Upstash Redis)
│   ├── errorHandler.js     # Global error handler
│   └── llmRateLimit.js     # Rate limiting for LLM/Ingestion routes
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
PORT=3000 # Assign whatever port you like
MONGODB_URI=YOUR_MONGODB_URI
OLLAMA_MODEL=YOUR_OLLAMA_MODEL
OLLAMA_BASE_URL=http://localhost:11434 # Ollama runs locally at port 11434
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
CEREBRAS_API_KEY=YOUR_CEREBRAS_API_KEY
SARVAM_API_KEY=YOUR_SARVAM_API_KEY
JWT_SECRET=YOUR_JWT_SECRET
NODE_ENV=development # Depends upon the environment you're working on, either development or production
CLIENT_URL=https://layerzero.rishhbh.workers.dev
UPSTASH_REDIS_REST_URL=YOUR_UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN=YOUR_UPSTASH_REDIS_REST_TOKEN
```

> `OLLAMA_BASE_URL` defaults to `http://localhost:11434` — Ollama must be running locally with the specified model pulled.

---

## API Reference

### Health Check

---

#### `GET /api/health`

Returns the current health status of the API.

**Response `201`**
```json
{
  "status": "OK",
  "message": "API is working properly",
  "uptime": 123
}
```

---

### Auth — `/api/auth`

All auth routes are public (no token required).

---

#### `POST /api/auth/user/register`

Registers a new user and sets a JWT cookie.

**Request body**
```json
{
  "name": "Rishabh",
  "email": "rishabh@example.com",
  "password": "yourpassword"
}
```

**Response `200`**
```json
{
  "_id": "user_id",
  "name": "Rishabh",
  "email": "rishabh@example.com"
}
```

Sets `jwt` httpOnly cookie (7d expiry).

---

#### `POST /api/auth/user/login`

Authenticates an existing user and sets a JWT cookie.

**Request body**
```json
{
  "email": "rishabh@example.com",
  "password": "yourpassword"
}
```

**Response `200`**
```json
{
  "_id": "user_id",
  "name": "Rishabh",
  "email": "rishabh@example.com"
}
```

---

#### `POST /api/auth/user/logout`

Clears the JWT cookie.

**Response `200`**
```json
{
  "message": "The user has been logged out successfully!"
}
```

---

#### `GET /api/auth/user/check`

Returns the currently authenticated user. Requires a valid JWT cookie.

**Response `200`**
```json
{
  "_id": "user_id",
  "name": "Rishabh",
  "email": "rishabh@example.com"
}
```

---

### Ingestion — `/api/scrape`

All ingestion routes are protected — requires a valid `jwt` cookie.

---

#### `POST /api/scrape/web`

Scrapes a URL, extracts readable content via Readability, and summarizes it using the selected model. Results are cached in Redis.

**Request body**
```json
{
  "url": "https://example.com/some-article",
  "client": "gemini"
}
```

`client` accepts `"gemini"`, `"gemma"`, `"cerebras"`, or `"sarvam"`.

**Response `200`**
```json
{
  "output": "AI-generated summary..."
}
```

---

#### `POST /api/scrape/doc`

Accepts a Document file upload (PDF/DOCX), extracts text, and summarizes it using the selected model. Results are cached in Redis using a content hash.

**Request** — `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `document` | File | PDF or DOCX file (max 5MB) |
| `client` | string | `"gemini"`, `"gemma"`, `"cerebras"`, or `"sarvam"` |

**Response `200`**
```json
{
  "summary": "AI-generated summary..."
}
```

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