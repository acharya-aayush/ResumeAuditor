# Resume Auditor

## Overview
Resume Auditor is a client-side application that runs resume workflows through configurable LLM providers.
It accepts resume input as file or text, builds task-specific prompts, and returns structured JSON outputs consumed by UI modules.
The default runtime is browser-side BYOK, with an optional server proxy for controlled Gemini usage.

## Core Functionality
- Analyze a single resume and return score breakdowns, red/green flags, rewrite suggestions, ATS fields, and psychometric profile.
- Compare multiple candidates and return ranked leaderboard, category breakdown, and team composition output.
- Remaster resume content into markdown with cut-report and change summary fields.
- Generate interview questions, career pivots, skill roadmap, LinkedIn draft content, GitHub profile draft, cold emails, 90-day plan, and salary negotiation scripts.
- Persist provider configuration and recent history in browser localStorage.

## System Flow
```text
1. User provides resume (file or text) and optional context (job description, role).
2. Service layer selects a task prompt and appends a JSON schema contract.
3. Request is routed to configured provider (Gemini, OpenAI-compatible, or local Ollama).
4. Response content is cleaned and parsed into JSON.
5. Parsed data is mapped to typed result objects and rendered by feature components.
6. Selected outputs and config are stored in localStorage.
```

## Tech Stack
- React 18
- TypeScript 5
- Vite 5
- Vitest
- Fetch API (provider calls)
- Optional Vercel serverless function (`@vercel/node`) and Vercel KV (`@vercel/kv`)
- `docx` and `file-saver` for export helpers

## Setup Instructions

Install:
```bash
npm install
```

Run:
```bash
npm run dev
```

Environment setup:
1. Copy `env.example` to `.env.local`.
2. Set `GEMINI_API_KEY` if using the proxy route.
3. Set `ALLOWED_ORIGINS` for production CORS restrictions.
4. Optionally set `ALLOWED_GEMINI_MODELS`, `DAILY_LIMIT`, `KV_REST_API_URL`, and `KV_REST_API_TOKEN`.

## Key Technical Points
- Provider abstraction is centralized in `services/aiService.ts` (`executeAI` + provider-specific execution).
- Task outputs are constrained by schema text appended to prompts before inference.
- Response normalization uses `cleanJsonOutput` and `safeJsonParse` in `services/ai/jsonUtils.ts`.
- Gemini uses native request format; other providers use OpenAI-compatible chat/completions payloads.
- Ollama path is handled separately, including text-only fallback behavior for unsupported file/vision scenarios.

## Limitations
- Output quality and consistency depend on the selected model and provider behavior.
- Schema enforcement is prompt-level guidance, not hard API-level validation across all providers.
- The optional proxy endpoint is not the default runtime path for all client requests.
- No built-in authentication, multi-user access control, or server-side resume database.
- Fine-tuning assets in `finetuning/` are separate from the default app inference path.

## Documentation
See [documentation.md](./documentation.md) for system-level technical details.
