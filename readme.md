# LayerZero

An AI-powered full-stack content summarization platform built with React, Express.js, and MongoDB.

LayerZero allows users to upload documents or submit website URLs and generate intelligent summaries using a hybrid multi-model AI architecture powered by both cloud and local language models.

---

# Features

- Multi-format content ingestion
  - PDF uploads
  - DOCX uploads
  - Website URL processing

- AI-powered summarization
  - Cloud inference using Gemini
  - Local offline inference using Gemma 4

- Intelligent model routing
  - Automatically selects the appropriate model based on task, availability, and performance

- Secure JWT authentication
- Persistent summary history
- Session management
- Real-time summary streaming
- Responsive modern UI
- Offline-capable local AI workflows

Because apparently users now expect their apps to function both online *and* offline while summarizing entire documents in seconds. Tiny little standards inflation event there.

---

# Tech Stack

## Frontend
- React
- TypeScript (TSX)
- Tailwind CSS

## Backend
- Node.js
- Express.js

## Database
- MongoDB

## Authentication
- JWT (JSON Web Tokens)

## AI Models
- Gemini (cloud-based model)
- Gemma 4 (locally hosted model)

## Tools & Infrastructure
- REST APIs
- File Parsing Pipelines
- Streaming Responses
- Local AI Inference
- Model Routing Logic

---

# AI Architecture

LayerZero uses a hybrid AI system combining:

## Gemini
Used for:
- High-quality cloud inference
- Complex reasoning tasks
- Faster scalable summarization

## Gemma 4
Used for:
- Local/offline inference
- Privacy-focused processing
- Reduced API dependency
- Low-latency on-device execution

This architecture enables:
- Cost optimization
- Better reliability
- Offline support
- Improved privacy
- Flexible AI workflows

---

# Authentication Flow

LayerZero uses JWT-based authentication for secure user sessions.

## Features
- Access tokens
- Refresh token support
- Protected API routes
- Persistent login sessions
- Secure middleware validation

---

# Project Structure

```bash
LayerZero/
│
├── client/          # React frontend
├── server/          # Express backend
├── models/          # MongoDB schemas
├── routes/          # API routes
├── middleware/      # Auth & validation middleware
├── services/        # AI & processing services
├── uploads/         # File upload handling
└── utils/           # Helper utilities