# Security Guide

## Security Posture
- No hardcoded API secrets are stored in source files.
- API proxy (`api/analyze.ts`) enforces model validation, payload size checks, and daily rate limits.
- CORS is origin-aware (use `ALLOWED_ORIGINS` for production).
- Frontend Gemini requests now send API keys in `x-goog-api-key` headers (not query strings).

## Secure Local Run
1. Copy `env.example` to `.env.local`.
2. Set `GEMINI_API_KEY` and (optionally) `ALLOWED_ORIGINS`.
3. Keep `.env*` files out of git (already ignored).
4. Use least-privilege API keys and rotate them regularly.
5. Run:
   - `npm run typecheck`
   - `npm run build`
   - `npm run audit:prod`

## Deployment Recommendations
- Set `ALLOWED_ORIGINS` to your exact frontend domains.
- Set `ALLOWED_GEMINI_MODELS` to approved models only.
- Configure Vercel KV for durable rate limiting.
- Keep `DAILY_LIMIT` conservative to control abuse and spend.
- Monitor 429 and 5xx rates in deployment logs.

## Secret Leak Check Commands
Use these before pushing:

```bash
rg -n --hidden -S "(AIza[0-9A-Za-z_-]{35}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|-----BEGIN (RSA|EC|OPENSSH|DSA|PRIVATE) KEY-----)"
git rev-list --all | ForEach-Object { git grep -n -I -E "AIza[0-9A-Za-z_-]{35}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|-----BEGIN (RSA|EC|OPENSSH|DSA|PRIVATE) KEY-----" $_ }
```
