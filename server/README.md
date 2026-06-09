# LayerZero — Backend

Express.js + MongoDB backend for LayerZero. Handles JWT auth, multi-format content ingestion (PDF, URL), and hybrid AI summarization routing between Gemini (cloud) and Gemma via Ollama (local).

---

## Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express.js v5 |
| Database | MongoDB via Mongoose |
| Auth | JWT in httpOnly cookies |
| AI — Cloud | Gemini 2.5 Flash (`@google/genai`) |
| AI — Local | Gemma via Ollama (`/api/chat`) |
| File Parsing | `pdf-parse`, `multer` (memory storage) |
| Web Scraping | `axios` + `jsdom` + `@mozilla/readability` |

---

## Project Structure

```
server/
├── app.js                  # Entry point, middleware stack, route mounting
├── config/
│   ├── db.js               # MongoDB connection
│   ├── geminiClient.js     # Gemini API wrapper
│   ├── gemmaClient.js      # Ollama/Gemma API wrapper
│   ├── multer.js           # Multer config (memory storage, 5MB limit)
│   ├── pdfparse.js         # PDF buffer → text extractor
│   └── utils.js            # JWT generation utility
├── controllers/
│   ├── auth.js             # register, login, logout, checkUser
│   ├── pdfsummary.js       # PDF upload → parse → summarize
│   └── scrape.js           # URL → scrape → summarize
├── middlewares/
│   ├── authMiddleware.js   # protectRoute (JWT verification)
│   └── errorHandler.js     # Global error handler
├── models/
│   └── User.js             # Mongoose user schema
└── routes/
    ├── authRoute.js        # /api/auth/*
    └── ingestRoute.js      # /api/scrape/*
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values.

```env
PORT=3000
MONGODB_URI=YOUR_MONGODB_URI
JWT_SECRET=YOUR_JWT_SECRET
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=YOUR_OLLAMA_MODEL
NODE_ENV=development
```

> `OLLAMA_BASE_URL` defaults to `http://localhost:11434` — Ollama must be running locally with the specified model pulled.

---

## API Reference

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

#### `GET /api/scrape/web`

Scrapes a URL, extracts readable content via Readability, and summarizes it using the selected model.

**Request body**
```json
{
  "url": "https://example.com/some-article",
  "client": "gemini"
}
```

`client` accepts `"gemini"` or `"gemma"`.

**Response `200`**
```json
{
  "output": "AI-generated summary..."
}
```

---

#### `GET /api/scrape/pdf`

Accepts a PDF file upload, extracts text, and summarizes it using the selected model.

**Request** — `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `file` | File | PDF file (max 5MB) |
| `client` | string | `"gemini"` or `"gemma"` |

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

### PDF Summarization Flow

```
POST /api/scrape/pdf  (multipart/form-data)
  │
  ▼
protectRoute (JWT check)
  │
  ▼
multer memoryStorage → req.file.buffer
  │
  ▼
parsePdf(buffer) → raw text string (pdf-parse)
  │
  ▼
model = models[req.body.client]  (gemini | gemma)
  │
  ▼
model(text) → summary string
  │
  ▼
res.json({ summary })
```

### URL Summarization Flow

```
GET /api/scrape/web
  │
  ▼
protectRoute (JWT check)
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
model = models[req.body.client]  (gemini | gemma)
  │
  ▼
model(textContent) → summary string
  │
  ▼
res.json({ output })
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

### Gemini (`config/geminiClient.js`)

Uses `@google/genai` SDK with `gemini-2.5-flash`. Accepts a text prompt, returns a summary string. System prompt enforces the LayerZero sarcastic summarizer personality with layered output format (TL;DR → Quick Summary → Detailed Summary).

### Gemma (`config/gemmaClient.js`)

Hits the local Ollama `/api/chat` endpoint via native `fetch`. Model and base URL are env-driven. Runs fully offline — no API key required. Same system prompt personality as Gemini for consistent UX across both clients.

### Model Routing

Client selection is explicit — the caller passes `client: "gemini"` or `client: "gemma"` in the request body. Both ingestion controllers use the same routing pattern:

```js
const models = { gemma: gemmaClient, gemini: geminiClient };
const model = models[client];
```

---

## Running Locally

```bash
cd server
npm install
cp .env.example .env   # fill in your values
npm run dev
```

> Make sure Ollama is running (`ollama serve`) with your model pulled (`ollama pull <model>`) before hitting any Gemma routes.