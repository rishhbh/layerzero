# LayerZero

AI-powered content summarization platform built with React, Express.js, MongoDB, and a hybrid LLM architecture.

LayerZero allows users to summarize PDFs and web content using either cloud-based or locally hosted language models. The platform focuses on simplicity, speed, and flexibility while providing a secure authentication layer and a clean content-processing pipeline.

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
* Website URL summarization
* Automatic text extraction
* Article content parsing using Mozilla Readability
* Clean preprocessing pipeline

### AI-Powered Summarization

* Gemini integration
* Gemma 4 integration
* User-selectable AI models
* Hybrid cloud/local architecture
* Flexible inference workflows

### Authentication & Security

* JWT Authentication
* Protected API routes
* Secure password hashing
* Middleware-based authorization
* User session validation

### Performance

* Lightweight architecture
* Fast content extraction
* Efficient parsing pipeline
* Local AI support
* Minimal infrastructure requirements

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

## PDF Summarization Flow

```text
PDF Upload
    │
    ▼
Multer
    │
    ▼
pdf-parse
    │
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
* Gemini API
* Gemma 4

---

## Tech Stack

### Frontend

* React
* TypeScript
* Tailwind CSS

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

### AI Models

* Gemini
* Gemma 4

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

#### PDF Summarization

```http
POST /api/scrape/pdf
```

Content-Type

```text
multipart/form-data
```

Fields

```text
document: file.pdf
client: gemma
```

---

## Project Structure

```bash
LayerZero/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── services/
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── models/
│   ├── config/
│   └── utils/
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/layerzero.git

cd layerzero
```

### Install Frontend Dependencies

```bash
cd client
npm install
```

### Install Backend Dependencies

```bash
cd server
npm install
```

### Configure Environment Variables

```env
PORT=5000

MONGO_URI=

JWT_SECRET=

GEMINI_API_KEY=

GEMMA_API_URL=
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

* PDF support only
* No document history
* No persistent summary storage
* Single-document processing

This is intentional.

The platform focuses on processing content and returning results rather than collecting enough data to start its own census bureau.

---

## Coming Soon

### UI Improvements

* ShadCN UI integration
* Improved dashboard experience
* Enhanced accessibility

### Infrastructure

* Docker containerization
* Redis caching
* API rate limiting

### AI Enhancements

* DOCX support
* Multi-document summarization
* Streaming responses
* Advanced model routing
* Better local inference management

---

## Future Vision

```text
User Input
     │
     ▼
Content Processing
     │
     ▼
Model Selection
     │
     ▼
AI Summary
     │
     ▼
Export / Share / Save
```

The goal is to evolve LayerZero into a flexible AI content-processing platform capable of handling documents, articles, reports, and research material through a unified interface.

---

## License

MIT License

---

Built with React, Express, MongoDB, and a stubborn refusal to choose between cloud AI and local AI.
