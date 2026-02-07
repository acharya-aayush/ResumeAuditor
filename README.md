# Resume Auditor

AI-powered resume analysis and career tooling built with React + TypeScript.

## Features
- Resume analysis with scorecards, strengths, risks, and rewrite suggestions
- Resume remastering flow with markdown editing + export helpers
- Interview prep, career pivoting, roadmap generation, and outreach helpers
- Candidate comparison mode for side-by-side ranking
- Multi-provider AI configuration (Gemini, OpenAI, OpenRouter, Groq, Ollama, custom)

## Quick Start
```bash
npm install
npm run dev
```

## Quality Checks
```bash
npm run typecheck
npm run build
npm run audit:prod
```

## Environment Setup
1. Copy `env.example` to `.env.local`.
2. Set `GEMINI_API_KEY` (required for server proxy mode).
3. Set `ALLOWED_ORIGINS` for production deployments.
4. Optionally set `ALLOWED_GEMINI_MODELS`, `DAILY_LIMIT`, and Vercel KV vars.

## Project Structure
```text
App.tsx
types.ts
api/
  analyze.ts
components/
  FileUpload.tsx
  RoastDashboard.tsx
  SettingsModal.tsx
  RemasterWizard.tsx
  ...
services/
  aiService.ts
  githubService.ts
constants/
  appConfig.ts
```

## Security
Security hardening and operational guidance are documented in [SECURITY.md](./SECURITY.md).

## License
GPL-3.0. See [LICENSE](./LICENSE).
