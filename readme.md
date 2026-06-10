# LayerZero

AI-powered content summarization platform built with React, Express.js, MongoDB, and a hybrid LLM architecture.

LayerZero allows users to summarize PDFs, DOCX files, and web content using either cloud-based or locally hosted language models. The platform focuses on simplicity, speed, and flexibility while providing a secure authentication layer and a clean content-processing pipeline.

---

## Overview

Most content summarization tools force users into a single AI provider.

LayerZero takes a different approach.

Users can choose between:

* **Gemini** for powerful cloud-based inference
* **Gemma 4** for local inference and privacy-focused workflows

Whether you're summarizing a research paper, technical documentation, blog post, or an article you definitely intended to read later, LayerZero extracts the content and generates concise summaries within seconds.

---

## Screenshots

<table>
  <tr>
    <td align="center">
      <strong>Homepage</strong><br>
      <img src="./screenshots/homepage.png" width="400">
    </td>
    <td align="center">
      <strong>About</strong><br>
      <img src="./screenshots/about.png" width="400">
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>Login</strong><br>
      <img src="./screenshots/login.png" width="400">
    </td>
    <td align="center">
      <strong>Register</strong><br>
      <img src="./screenshots/register.png" width="400">
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>URL Summarizer</strong><br>
      <img src="./screenshots/url.png" width="400">
    </td>
    <td align="center">
      <strong>Response</strong><br>
      <img src="./screenshots/response.png" width="400">
    </td>
  </tr>
</table>

---

## Features

### Content Ingestion

* PDF document uploads
* DOCX document uploads
* Website URL summarization
* Automatic text extraction
* Article content parsing using Mozilla Readability
* Unified document processing pipeline with mimetype-based routing

### AI-Powered Summarization

* Gemini integration
* Gemma 4 integration via Ollama
* User-selectable AI models
* Hybrid cloud/local architecture
* Flexible inference workflows

### Authentication & Security

* JWT Authentication via httpOnly cookies
* Protected API routes
* Secure password hashing with bcrypt
* Middleware-based authorization
* Rate limiting on auth and LLM routes via express-rate-limit

### Infrastructure

* Docker Compose setup for client, server, and Redis
* Separate Dockerfiles for frontend and backend
* Redis-ready architecture for caching
* Local Ollama support via `host.docker.internal`

---

## Architecture

```text
┌─────────────────┐
│   React Client  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Express Server │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Content Parsing │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Model Selection │
└────────┬────────┘
         │
   ┌─────┴─────┐
   ▼           ▼
 Gemini      Gemma 4
 Cloud       Local
   │           │
   └─────┬─────┘
         ▼
    Summary
```

---

## Website Summarization Flow

```text
URL
 │
 ▼
Axios
 │
 ▼
JSDOM
 │
 ▼
Mozilla Readability
 │
 ▼
Article Extraction
 │
 ▼
Selected Model
 │
 ▼
Summary
```

### Technologies Used

* Axios
* JSDOM
* Mozilla Readability
* Gemini API
* Gemma 4

---

## Document Summarization Flow

```text
PDF / DOCX Upload
       │
       ▼
    Multer
       │
       ▼
  extractText()
  (mimetype routing)
       │
   ┌───┴───┐
   ▼       ▼
pdf-parse mammoth
   │       │
   └───┬───┘
       ▼
 Text Extraction
       │
       ▼
 Selected Model
       │
       ▼
   Summary
```

### Technologies Used

* Multer
* pdf-parse
* mammoth
* Gemini API
* Gemma 4

---

## Tech Stack

### Frontend

* React
* TypeScript
* Tailwind CSS
* shadcn/ui

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Authentication

* JWT
* bcrypt

### Content Processing

* Axios
* JSDOM
* Mozilla Readability
* Multer
* pdf-parse
* mammoth

### Infrastructure

* Docker
* Docker Compose
* Redis
* express-rate-limit

### AI Models

* Gemini 2.5 Flash
* Gemma 4 (via Ollama)

---

## API Endpoints

### Authentication

#### Register

```http
POST /api/auth/user/register
```

#### Login

```http
POST /api/auth/user/login
```

#### Logout

```http
POST /api/auth/user/logout
```

#### Check Authentication

```http
GET /api/auth/user/check
```

---

### Protected Routes

Authentication required.

#### Website Summarization

```http
POST /api/scrape/web
```

Request Body

```json
{
  "url": "https://example.com/article",
  "client": "gemini"
}
```

---

#### Document Summarization (PDF / DOCX)

```http
POST /api/scrape/doc
```

Content-Type

```text
multipart/form-data
```

Fields

```text
document: file.pdf or file.docx
client: gemini or gemma
```

---

## Project Structure

```bash
LayerZero/
│
├── docker-compose.yml
│
├── client/
│   ├── Dockerfile
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       ├── layouts/
│       └── lib/
│
├── server/
│   ├── Dockerfile
│   ├── app.js
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── models/
│   ├── services/
│   └── config/
│
└── README.md
```

---

## Running with Docker

```bash
docker-compose up --build
```

This starts the client, server, and Redis containers together.

> To use Gemma locally inside Docker, ensure Ollama is running on your host machine and set `OLLAMA_BASE_URL=http://host.docker.internal:11434` in your server `.env`.

---

## Running Locally (without Docker)

### Clone Repository

```bash
git clone https://github.com/render-TheVoid/layerzero.git
cd layerzero
```

### Install Backend Dependencies

```bash
cd server
npm install
```

### Install Frontend Dependencies

```bash
cd client
npm install
```

### Configure Environment Variables

```env
PORT=3000
MONGODB_URI=
JWT_SECRET=
GEMINI_API_KEY=
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=
NODE_ENV=development
```

### Run Development Servers

Backend

```bash
npm run dev
```

Frontend

```bash
npm run dev
```

---

## Why LayerZero?

Most summarization platforms rely entirely on cloud-hosted AI.

LayerZero combines cloud and local inference, giving users more control over privacy, performance, and operational costs.

Benefits include:

* Reduced API dependency
* Local AI execution
* Flexible model selection
* Improved privacy
* Hybrid inference workflows

Because sometimes you want the power of a cloud model, and sometimes you want your laptop to suffer instead.

---

## Current Limitations

* No document history
* No persistent summary storage
* Single-document processing

---

## Coming Soon

* Redis caching for repeated requests
* Streaming responses
* Summary history and persistence
* Multi-document summarization

---

## License

MIT License

---

Built with React, Express, MongoDB, and a stubborn refusal to choose between cloud AI and local AI.