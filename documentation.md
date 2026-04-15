# Technical Documentation

## 1. System Overview

This project is a client-side AI orchestration application for resume workflows.
It accepts resume input, builds task-specific prompts, routes requests to a configured LLM provider, and renders typed JSON outputs in UI modules.
The default runtime path is browser-side BYOK. A separate optional Vercel API route exists for controlled Gemini proxy usage.

## 2. Architecture

Primary components and responsibilities:

- `App.tsx`
  - Owns top-level state, mode transitions, and feature trigger handlers.
  - Persists config/history via localStorage keys from `constants/appConfig.ts`.

- `services/aiService.ts`
  - Contains provider routing and request execution.
  - Defines prompt templates and output schema contracts for each task.
  - Exposes feature functions used by UI handlers.

- `services/ai/jsonUtils.ts`
  - Cleans model output text and performs resilient JSON parsing.

- `types.ts`
  - Declares request/result contracts used throughout the UI and service layer.

- `components/*`
  - Render individual outputs (analysis, comparison, remaster, generators).
  - Capture user input and dispatch actions through `App.tsx` callbacks.

- `api/analyze.ts` (optional deployment path)
  - Serverless proxy for Gemini with CORS checks, model allow-list checks, size limits, and daily usage limits.

## 3. Data Flow

```text
1) Input capture
   - Resume file or pasted text
   - Optional job description / role context

2) Task dispatch
   - UI handler in App.tsx calls a feature function in aiService.ts

3) Prompt + schema assembly
   - SAFETY_PROTOCOL + task prompt
   - JSON schema text appended to system prompt

4) Provider execution
   - Gemini: native generateContent payload
   - Others: OpenAI-compatible chat/completions payload
   - Ollama: text-first mode, no image path

5) Response normalization
   - Raw response extraction
   - cleanJsonOutput + safeJsonParse

6) State update and render
   - Parsed typed object set into React state
   - Result-specific component renders output

7) Optional persistence
   - Config and limited history stored in localStorage
```

## 4. Input and Output Contracts

Representative input configuration (`AIConfig`):

```json
{
  "provider": "OPENAI",
  "apiKey": "sk-...",
  "modelName": "gpt-4o-mini",
  "baseUrl": "https://api.openai.com/v1"
}
```

Representative single-analysis output (`AnalysisResult`, simplified):

```json
{
  "candidateName": "Jane Doe",
  "overallScore": 78,
  "roastHeadline": "Bullets lack measurable impact",
  "brutalTruth": "Experience is relevant, but evidence of outcomes is weak.",
  "metrics": {
    "impact": 62,
    "brevity": 80,
    "technicalDepth": 74,
    "formatting": 85
  },
  "redFlags": ["Generic action verbs", "Missing outcome metrics"],
  "greenFlags": ["Clear role progression"],
  "fixes": [
    {
      "original": "Worked on backend APIs",
      "improved": "Implemented 6 backend APIs that reduced response latency by 28%",
      "reason": "Adds scope and measurable result"
    }
  ],
  "atsAnalysis": {
    "matchScore": 71,
    "missingKeywords": ["kubernetes", "observability"],
    "matchingKeywords": ["typescript", "react"]
  },
  "psychometricProfile": {
    "archetype": "Builder",
    "summary": "Execution-oriented profile based on delivery-focused language.",
    "traits": [
      {
        "trait": "Ownership",
        "score": 82,
        "explanation": "Frequent first-person delivery statements"
      }
    ],
    "cultureFit": "Works well in delivery-driven teams",
    "frictionPoints": ["May under-document decision tradeoffs"]
  }
}
```

Representative comparison input (`CandidateInput[]`, simplified):

```json
[
  { "type": "TEXT", "name": "Candidate A", "text": "...", "id": "a1" },
  { "type": "TEXT", "name": "Candidate B", "text": "...", "id": "b1" }
]
```

Representative comparison output (`ComparisonResult`, simplified):

```json
{
  "summary": "Candidate A has stronger technical signal; Candidate B has stronger leadership evidence.",
  "leaderboard": [
    { "rank": 1, "candidateName": "Candidate A", "score": 81, "reason": "Higher technical depth" },
    { "rank": 2, "candidateName": "Candidate B", "score": 76, "reason": "Less evidence of measurable outcomes" }
  ],
  "categoryBreakdown": [],
  "dreamTeamAnalysis": {
    "squadName": "Delivery + Strategy",
    "selectedMembers": ["Candidate A", "Candidate B"],
    "synergyScore": 79,
    "rationale": "Complementary strengths",
    "roles": [],
    "collectiveWeaknesses": ["Limited domain depth in fintech"]
  }
}
```

## 5. Core Modules

- `services/aiService.ts`
  - Central integration surface for all AI-backed features.
  - Contains both Gemini-native and OpenAI-compatible execution paths.

- `services/ai/jsonUtils.ts`
  - Handles cleanup of model output and safe parse attempts.

- `types.ts`
  - Source of result interfaces used across components and service responses.

- `components/FileUpload.tsx`
  - Collects file/text resume input and forwards it to app handlers.

- `components/RoastDashboard.tsx`
  - Displays the primary analysis output sections.

- `components/ComparatorView.tsx`
  - Displays multi-candidate ranking output.

- `api/analyze.ts`
  - Optional server route for Gemini proxy with rate limiting and allow-lists.

- `finetuning/train.py`
  - Separate training workflow for QLoRA-based local model experimentation.

## 6. AI Integration

### Prompt structure (high-level)
- `SAFETY_PROTOCOL` defines output constraints (JSON-only requirements).
- Task prompt defines domain logic (analysis, comparison, remaster, etc.).
- Schema text is appended to system prompt as an explicit output contract.

### Schema enforcement
- Enforcement is prompt-guided.
- For some OpenAI-compatible providers, JSON mode is requested via `response_format`.
- Final structure reliability is handled post-response by parser cleanup/recovery.

### Provider handling
- Gemini uses `generateContent` with `systemInstruction` and `contents` parts.
- OpenAI-compatible providers use `/chat/completions` with `messages`.
- OpenRouter adds provider-specific headers.
- Ollama path omits auth header and uses local endpoint defaults.

## 7. Error Handling and Edge Cases

Invalid input handling:
- Analyze path exits early when resume input is missing.
- Comparator requires at least two candidates.
- Remaster path throws explicit errors when resume content is unavailable.

LLM/API failure handling:
- HTTP errors are converted into readable messages (401/404/429/quota/connection cases).
- Gemini path has request timeout handling via `AbortController`.

Parsing issues:
- Raw model output is cleaned before parse.
- Parser attempts structural recovery for common malformed JSON patterns.
- If recovery fails, the request fails with an explicit parse error.

Provider-specific edge case:
- Local models (Ollama) do not follow the same image/vision input path; text fallback is used.

## 8. Data Handling and Storage

Local storage:
- `resume_auditor_config` stores provider configuration.
- `resume_auditor_history` stores recent results.

Runtime handling:
- Resume file content can be converted to base64 for provider requests.
- Resume text can be attached to history entries depending on workflow.

Server proxy handling (`api/analyze.ts`):
- Optional rate counter in memory or Vercel KV.
- No persistent server-side resume database is implemented in this route.

Privacy implications:
- In BYOK mode, resume content is sent directly from browser to the selected provider.
- If proxy mode is used, request content transits through the deployed serverless route.

## 9. Limitations

- No deterministic scoring guarantees; outputs are model-dependent.
- No built-in user authentication or role-based access control.
- No server-side audit trail for all client-side requests.
- Prompt/schema constraints reduce, but do not eliminate, malformed outputs.
- Fine-tuning assets are not integrated into default inference flow.
- Some type contracts (for example `timestamp` on analysis objects) are stricter than current runtime population behavior.

## 10. Local Development and Validation

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Validation commands:

```bash
npm run test
npm run typecheck
npm run build
npm run audit:prod
```

Environment configuration:

- Copy `env.example` to `.env.local`.
- Set `GEMINI_API_KEY` for proxy route usage.
- Configure `ALLOWED_ORIGINS` and optional rate-limit variables when deploying `api/analyze.ts`.
