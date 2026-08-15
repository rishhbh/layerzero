# Contributing to Layerzero

Thanks for checking out Layerzero! This is an actively maintained personal project, and contributions, bug reports, and suggestions are welcome.

## Tech Stack

Before diving in, make sure you're familiar with:
- **Backend:** Node.js / Express (JavaScript ESM)
- **Caching:** Redis (via Upstash)
- **Deployment:** Docker + GitHub Actions CI/CD, AWS EC2
- **Frontend:** Cloudflare Workers
- **AI Models:** Gemini, Cerebras GPT-OSS-120B, Gemma, Sarvam 30B (routed via a shared model interface)

## Getting Started

1. Fork the repo and clone your fork:
   ```bash
   git clone https://github.com/<your-username>/layerzero.git
   cd layerzero
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example env file and fill in your own API keys:
   ```bash
   cp .env.example .env
   ```
4. Run locally:
   ```bash
   npm run dev
   ```

If you're using Docker instead:
```bash
docker compose up --build
```

## Making Changes

1. Create a new branch off `main`:
   ```bash
   git checkout -b fix/short-description
   ```
2. Keep changes focused — one fix or feature per PR makes review much faster.
3. Match the existing code style (TypeScript strict mode, existing naming conventions).
4. Test your changes locally before opening a PR. If you're touching model routing, caching, or the ingestion pipeline, please note what you tested manually in the PR description (automated test coverage is still a work in progress).

## Submitting a Pull Request

1. Push your branch and open a PR against `main`.
2. In the PR description, include:
   - What the change does and why
   - Any relevant screenshots/logs if it's a bug fix
   - Whether it touches deployment config (Dockerfile, GitHub Actions workflows) — these get extra scrutiny since they affect the live EC2 deployment
3. Be responsive to review comments — this is a small project maintained solo, so turnaround might take a few days.

## Reporting Bugs / Suggesting Features

Open an issue with:
- **Bugs:** steps to reproduce, expected vs actual behavior, relevant logs
- **Features:** what problem it solves, and if possible, a rough idea of implementation

## Code of Conduct

Be respectful, be constructive. This is a learning project as much as anything else — good-faith questions and beginner contributions are just as welcome as advanced ones.

## Questions?

Open an issue or start a discussion — happy to help you get oriented in the codebase.