<div align="center">

<img src="public/juaravibecoding-banner.jpg" alt="#JuaraVibeCoding Banner" width="400"/>

# UMKM Legal Mate

**AI-powered legal contract analysis for Indonesian SMEs**

[![Next.js](https://img.shields.io/badge/Next.js-14/15-black?logo=next.js)](https://nextjs.org)
[![Google Gemini](https://img.shields.io/badge/Gemini-1.5_Flash-blue?logo=google)](https://ai.google.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)](https://typescriptlang.org)
[![Docker](https://img.shields.io/badge/Deploy-Cloud_Run-4285F4?logo=google-cloud)](https://cloud.google.com/run)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Cloud_Run-34A853?logo=google-cloud)](https://sada-888877825528.asia-southeast1.run.app)

> Built for **#JuaraVibeCoding 2026** — Google for Developers Vibe Coding Study Jam
> _"Code Less, Build More"_

</div>

---

## Why I Built This

Indonesian SMEs (UMKM) often sign contracts without fully understanding the legal implications — not because they're careless, but because legal language is dense, expensive to review, and inaccessible. A single bad contract clause can cost a small business everything.

This project was born from that gap. **UMKM Legal Mate** uses Google Gemini AI to analyze contracts uploaded as text, image, or PDF — surfacing plain-language summaries, red flags, and actionable recommendations in seconds.

The #JuaraVibeCoding Study Jam gave me the push to actually ship it. The principle: *you don't need to write every line from scratch — you need a clear vision and the right tools.* AI handles the boilerplate; I focus on the problem worth solving.

---

## Features

- **Multi-format input** — paste text, upload images, or drop a PDF
- **AI risk analysis** — Gemini 1.5 Flash identifies risky clauses and explains them simply
- **Red flag detection** — highlights problematic terms with severity levels
- **Actionable recommendations** — tells you what to negotiate or reject
- **UMKM-focused language** — outputs in plain Indonesian, not legalese

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14/15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| AI Engine | Google Gemini 1.5 Flash (`@google/generative-ai`) |
| Deployment | Docker → Google Cloud Run |

---

## Live Demo

**[https://sada-888877825528.asia-southeast1.run.app](https://sada-888877825528.asia-southeast1.run.app)**

Deployed on Google Cloud Run (asia-southeast1). Built and generated via Google AI Studio.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Gemini API key ([get one here](https://ai.google.dev))

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Docker

```bash
# Build image
docker build -t gcr.io/PROJECT_ID/legal-mate .

# Deploy to Cloud Run
gcloud run deploy legal-mate \
  --image gcr.io/PROJECT_ID/legal-mate \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated
```

---

## Project Structure

```
src/
├── app/
│   ├── api/analyze/route.ts   # Gemini API endpoint
│   └── page.tsx               # Main UI
├── components/
│   ├── ui/                    # shadcn/ui base components
│   └── custom-ui/             # App-specific components
└── lib/
    ├── gemini.ts              # Gemini SDK config
    └── types.ts               # Shared TypeScript types
```

---

## Competition Context

This project is my submission for **[#JuaraVibeCoding 2026](https://goo.gle/juaravibecoding)** — a Vibe Coding Study Jam by Google for Developers Indonesia.

The program teaches AI-assisted development with **Gemini** and **Vertex AI**, encouraging developers to build real solutions faster using the "Code Less, Build More" philosophy.

**Submission deadline:** 31 May 2026

---

## License

MIT

---

<div align="center">

Built with Gemini AI · #JuaraVibeCoding · #GoogleForDevelopers · #BangkitBersamaAI ·#BantuUmkm

</div>
