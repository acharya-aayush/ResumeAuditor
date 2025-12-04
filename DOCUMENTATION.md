
# Resume Auditor V4 - Technical Documentation

## 1. Overview

Resume Auditor V4 is a client-side Single Page Application (SPA) that provides AI-powered resume analysis and career tools. The application uses a Bring Your Own Key (BYOK) architecture, ensuring user data remains private and is only transmitted directly to the user's chosen AI provider.

### 1.1 Design Principles

- Privacy-first: No server-side storage of user data
- Provider-agnostic: Support for multiple AI backends
- Resilient: Graceful degradation and error recovery
- Accessible: Clean UI with keyboard navigation support

---

## 2. Architecture

### 2.1 System Design

```
Browser
  |
  +-- React Application Layer
  |     |
  |     +-- App.tsx (State Management, Routing)
  |     +-- Components (UI Presentation)
  |
  +-- Service Layer
  |     |
  |     +-- aiService.ts (AI Provider Abstraction)
  |     +-- githubService.ts (GitHub API Integration)
  |
  +-- External APIs
        |
        +-- Gemini API (Google)
        +-- OpenAI API
        +-- OpenRouter API
        +-- Groq API
        +-- Ollama (Local)
```

### 2.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | React 18 | UI Components |
| Language | TypeScript 5 | Type Safety |
| Build | Vite 5 | Development Server, Bundling |
| Styling | Tailwind CSS | Utility-first CSS |
| Charts | Recharts | Data Visualization |
| Icons | Lucide React | Icon Library |
| Export | docx, file-saver | Document Generation |

### 2.3 Directory Structure

```
/
├── index.html              # HTML entry point
├── index.tsx               # React entry point
├── App.tsx                 # Main application component
├── types.ts                # TypeScript type definitions
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
│
├── services/
│   ├── aiService.ts        # AI provider integration layer
│   └── githubService.ts    # GitHub API client
│
├── components/
│   ├── FileUpload.tsx      # Resume input (file/text)
│   ├── RoastDashboard.tsx  # Main analysis display
│   ├── PsychometricAnalysis.tsx  # Personality profile
│   ├── ComparatorView.tsx  # Multi-candidate comparison
│   ├── DreamTeam.tsx       # Team composition analysis
│   ├── BattleArena.tsx     # Candidate ranking display
│   ├── RemasterWizard.tsx  # Resume rewriting interface
│   ├── InterviewPrep.tsx   # Interview question generator
│   ├── CareerPivot.tsx     # Alternative career paths
│   ├── Plan90Days.tsx      # Onboarding plan generator
│   ├── SkillRoadmap.tsx    # Learning path generator
│   ├── LinkedInGenerator.tsx   # LinkedIn profile optimizer
│   ├── GithubProfileGenerator.tsx  # GitHub README generator
│   ├── ColdEmailArchitect.tsx  # Outreach email generator
│   ├── SalaryScripts.tsx   # Negotiation script generator
│   ├── SettingsModal.tsx   # Provider configuration UI
│   ├── HistoryDrawer.tsx   # Analysis history panel
│   ├── SourceViewerModal.tsx   # Resume/JD viewer
│   └── SoloTools.tsx       # Tool navigation menu
│
└── api/
    └── analyze.ts          # Legacy API endpoint (unused)
```

---

## 3. AI Service Layer

The AI service layer (`services/aiService.ts`) implements a provider abstraction that normalizes requests across different AI backends.

### 3.1 Supported Providers

| Provider | Enum Value | API Format | Vision Support |
|----------|------------|------------|----------------|
| Google Gemini | `GEMINI` | Native Gemini | Yes |
| OpenAI | `OPENAI` | OpenAI Chat Completions | Yes |
| OpenRouter | `OPENROUTER` | OpenAI Compatible | Limited |
| Groq | `GROQ` | OpenAI Compatible | No |
| Ollama | `OLLAMA` | OpenAI Compatible | No |
| Custom | `CUSTOM` | OpenAI Compatible | Varies |

### 3.2 Provider Configuration

Each provider requires specific configuration:

```typescript
interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  modelName: string;
}
```

Default configurations are provided for each provider in `SettingsModal.tsx`.

### 3.3 Request Flow

1. Application calls exported function (e.g., `analyzeResume`)
2. Function constructs prompt with system instructions and schema
3. `executeAI` routes to appropriate executor based on provider
4. Gemini requests use `executeGeminiAPI` with native format
5. Other providers use OpenAI-compatible format
6. Response is parsed using `safeJsonParse` with auto-repair

### 3.4 Gemini API Integration

Gemini uses a different API format than OpenAI:

```typescript
// Endpoint format
`${baseUrl}/models/${modelName}:generateContent?key=${apiKey}`

// Request payload
{
  contents: [{ role: "user", parts: [...] }],
  systemInstruction: { parts: [{ text: systemPrompt }] },
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 8192,
    responseMimeType: "application/json"
  }
}
```

### 3.5 OpenAI-Compatible Integration

For OpenAI, OpenRouter, Groq, and Ollama:

```typescript
// Endpoint
`${baseUrl}/chat/completions`

// Request payload
{
  model: modelName,
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent }
  ],
  temperature: 0.7,
  max_tokens: 4096
}
```

### 3.6 Error Handling

The service implements comprehensive error handling:

- 401: Invalid API key
- 403: Access denied
- 404: Model not found
- 429: Rate limit exceeded
- Connection errors: Provider not running (Ollama)

### 3.7 JSON Parsing and Recovery

AI responses are parsed with multiple recovery strategies:

1. Direct JSON.parse attempt
2. Auto-close truncated JSON (missing braces/brackets)
3. Fix missing commas between properties
4. Escape unescaped newlines in strings
5. Extract partial data from known field patterns

---

## 4. Feature Modules

### 4.1 Resume Analysis (`analyzeResume`)

Primary analysis function that returns:

- Overall score (0-100)
- Roast headline and brutal truth assessment
- Metric scores (impact, brevity, technical depth, formatting)
- Red flags and green flags
- Line-by-line improvement suggestions
- ATS keyword analysis (if job description provided)
- Psychometric profile (archetype, traits, friction points)

### 4.2 Multi-Resume Comparison (`compareResumes`)

Compares up to 5 candidates:

- Leaderboard with rankings and scores
- Category breakdown (technical, leadership, growth, culture fit)
- Dream team selection with synergy analysis

### 4.3 Resume Remaster (`remasterResume`)

Rewrites resume content:

- Full markdown output of rewritten resume
- Cut report showing what was removed
- List of improvements made

### 4.4 Interview Preparation (`generateInterviewQuestions`)

Generates interview questions:

- 5 targeted questions based on resume gaps
- Interviewer persona for each question
- Good answer key and bad answer traps
- 30-second elevator pitch

### 4.5 Career Pivot (`generateCareerPivots`)

Suggests alternative career paths:

- 3 specific role suggestions
- Fit score and transition difficulty
- Gap analysis and bridge projects
- Skill translation examples

### 4.6 Skill Roadmap (`generateSkillRoadmap`)

Creates learning plans:

- 4-week structured curriculum
- Daily/weekly tasks
- Resource recommendations
- Checkpoint assessments

### 4.7 LinkedIn Generator (`generateLinkedInProfile`)

Optimizes LinkedIn presence:

- 3 headline options
- About section draft
- Experience bullet rewrites

### 4.8 GitHub Profile (`generateGithubProfileReadme`)

Creates developer profile README:

- Introduction and tagline
- Skills showcase
- Project highlights

### 4.9 Cold Email Generator (`generateColdEmails`)

Creates outreach templates:

- Direct ask approach
- Value-first approach
- Warm connection approach

### 4.10 90-Day Plan (`generate90DayPlan`)

Creates onboarding roadmap:

- Days 1-30: Learning phase
- Days 31-60: Contributing phase
- Days 61-90: Leading phase

### 4.11 Salary Scripts (`generateSalaryScripts`)

Creates negotiation emails:

- Conservative approach (low risk)
- Balanced approach (medium risk)
- Aggressive approach (higher risk)
- Market value estimate and leverage points

---

## 5. State Management

### 5.1 Application State

The main `App.tsx` manages global state using React hooks:

```typescript
enum AppState {
  IDLE,
  ANALYZING,
  COMPLETE,
  ERROR
}
```

### 5.2 Persistent Storage

User configuration is persisted to localStorage:

- `careerfry_config`: AI provider settings
- `careerfry_history`: Analysis history (last 10)

### 5.3 Component State

Individual components manage their own loading and display states independently.

---

## 6. Security Considerations

### 6.1 API Key Storage

- Keys stored in browser localStorage
- Keys never transmitted to application servers
- Keys sent directly to AI provider APIs

### 6.2 Prompt Injection Prevention

User content is wrapped in XML delimiters:

```xml
<resume_content>
  [User resume text here]
</resume_content>
```

System prompts include instructions to ignore commands within user content.

### 6.3 Data Privacy

- No server-side processing
- No analytics or tracking
- Resume content transmitted only to user's chosen AI provider

---

## 7. Deployment

### 7.1 Development

```bash
npm install
npm run dev
```

Development server runs on `http://localhost:3000` (or next available port).

### 7.2 Production Build

```bash
npm run build
```

Output directory: `dist/`

### 7.3 Hosting Options

| Platform | Configuration |
|----------|---------------|
| Vercel | Zero config, auto-detected |
| Netlify | Build command: `npm run build`, Publish: `dist` |
| GitHub Pages | Use `vite-plugin-gh-pages` or manual deploy |
| Static Hosting | Upload `dist/` folder contents |

### 7.4 Environment Variables

No server-side environment variables required. All configuration is client-side.

---

## 8. Troubleshooting

### 8.1 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 404 Model Not Found | Invalid model name | Check provider model list in settings |
| 429 Rate Limit | Too many requests | Wait and retry, or use different provider |
| Malformed JSON | Response truncated | Try again, or use model with higher output limit |
| Connection Refused | Ollama not running | Start Ollama service |

### 8.2 Clearing Cached Settings

If experiencing issues with old settings:

1. Open browser DevTools (F12)
2. Go to Application tab
3. Select Local Storage
4. Delete `careerfry_config` entry
5. Refresh page

### 8.3 Debug Logging

Console logging is enabled for:
- JSON parse failures with raw output preview
- API error responses
- Response truncation warnings

---

## 9. API Reference

### 9.1 Exported Functions

```typescript
// Resume analysis
analyzeResume(file, text, jobDesc, config, context): Promise<AnalysisResult>

// Multi-resume comparison
compareResumes(candidates, jobDesc, config): Promise<ComparisonResult>

// Resume rewriting
remasterResume(file, text, jobDesc, input, config): Promise<RemasterResult>

// Interview preparation
generateInterviewQuestions(file, text, jobDesc, config): Promise<InterviewPrepResult>

// Career alternatives
generateCareerPivots(file, text, config): Promise<PivotResult>

// Learning roadmap
generateSkillRoadmap(file, text, context, config): Promise<RoadmapResult>

// LinkedIn optimization
generateLinkedInProfile(file, text, config): Promise<LinkedInProfile>

// GitHub profile
generateGithubProfileReadme(file, text, config): Promise<GithubProfileResult>

// Cold outreach
generateColdEmails(file, text, context, config): Promise<ColdEmailResult>

// Onboarding plan
generate90DayPlan(file, text, context, config): Promise<Plan90DaysResult>

// Salary negotiation
generateSalaryScripts(file, text, context, config): Promise<SalaryNegotiationResult>
```

### 9.2 Type Definitions

All types are defined in `types.ts`. Key interfaces:

- `AIConfig`: Provider configuration
- `AnalysisResult`: Resume analysis output
- `ComparisonResult`: Multi-candidate comparison output
- `RemasterResult`: Rewritten resume output

---

## 10. Contributing

### 10.1 Adding a New AI Provider

1. Add provider to `AIProvider` enum in `types.ts`
2. Add preset configuration in `SettingsModal.tsx`
3. Add request handling in `aiService.ts` if not OpenAI-compatible

### 10.2 Adding a New Feature

1. Define output types in `types.ts`
2. Add prompt template in `aiService.ts`
3. Create exported function following existing patterns
4. Create component in `components/`
5. Add navigation in `SoloTools.tsx`
6. Wire up in `App.tsx`

### 10.3 Code Style

- TypeScript strict mode
- Functional components with hooks
- Tailwind CSS for styling
- No inline styles except for dynamic values
