
# RESUME AUDITOR V4 - Technical Documentation

## 1. Executive Summary

**Resume Auditor V4** is a client-side, privacy-focused Single Page Application (SPA) designed to audit, benchmark, and rewrite professional resumes. It leverages **Generative AI (LLMs)** to analyze visual layout, content impact, and ATS (Applicant Tracking System) compatibility.

The system uses a **Bring Your Own Key (BYOK)** architecture, ensuring that user data never leaves the client's browser except to communicate directly with the chosen AI provider.

---

## 2. System Architecture

The application follows a **Component-Service** architecture using React for the presentation layer and a stateless Service Adapter pattern for AI integration.

### 2.1 High-Level Architecture

```mermaid
[User Browser]
   |
   +-- [React UI Layer] (App, Dashboard, Wizard)
   |
   +-- [Service Layer] (aiService.ts)
         |
         +-- Strategy Pattern (Provider Selector)
               |
               +-- [Google Strategy] --(REST)--> [Google API]
               |
               +-- [Standard Strategy] --(REST)--> [OpenAI / OpenRouter / LocalHost]
```

### 2.2 Tech Stack

*   **Frontend Framework**: React 18 (via Vite)
*   **Language**: TypeScript (Strict Mode)
*   **Styling**: Tailwind CSS (Utility-first, Custom Design System)
*   **Visualization**: Recharts (Radar/Spider Charts)
*   **Document Generation**: `docx` (Word export), `react-markdown` (Rendering)

---

## 3. Directory Structure

```text
/
├── index.html              # Entry point
├── App.tsx                 # Main Controller & Layout
├── types.ts                # TypeScript Interfaces & Enums
├── services/
│   ├── aiService.ts        # CORE LOGIC: AI Strategies, Security & Prompts
│   └── githubService.ts    # GitHub API Integration
└── components/
    ├── FileUpload.tsx      # Dual-mode Input
    ├── RoastDashboard.tsx  # Solo Audit Visualization
    ├── ComparatorView.tsx  # Multi-Candidate Ranking UI
    ├── RemasterWizard.tsx  # Interactive Rewrite Editor
    ├── SettingsModal.tsx   # API Configuration Manager
    ├── ColdEmailArchitect.tsx # Outreach Generation
    ├── LinkedInGenerator.tsx # Profile Branding
    ├── GithubProfileGenerator.tsx # README Generation
    └── ...
```

---

## 4. AI Service Layer & Methodology

The core intelligence resides in `services/aiService.ts`. This file implements a **Strategy Pattern** to select the correct API adapter based on user configuration.

### 4.1 Strategies

1.  **Google Strategy (`executeGoogleStrategy`)**:
    *   Optimized for Gemini models.
    *   Handles native multimodal blobs (inline data).
    *   Uses `response_schema` for guaranteed JSON.

2.  **Standard Strategy (`executeStandardStrategy`)**:
    *   Designed for OpenAI-compatible endpoints (Groq, DeepSeek, Ollama).
    *   Handles `image_url` construction for Vision models.
    *   Injects JSON Schemas directly into the System Prompt to enforce structure on models that don't support native schema modes.

### 4.2 Prompt Engineering

All system prompts are defined as constants within `aiService.ts`. They use **Persona-Based Prompting** (e.g., "The Auditor", "The Career Pivot Strategist") to ensure distinct voices and output styles for each feature.

---

## 5. Security & Data Integrity

To prevent **Indirect Prompt Injection** (where a malicious resume overrides AI instructions), the system implements a strict multi-layer defense strategy:

1.  **XML Delimiters**: All user-generated content (Resume Text, Job Descriptions) is wrapped in explicit tags (e.g., `<resume_content>`, `<job_description>`).
2.  **Instruction Isolation**: System prompts are instructed to *only* analyze content found *within* these specific tags.
3.  **Command Ignorance Protocol**: A global `SAFETY_PROTOCOL` is injected into every system prompt, explicitly instructing the LLM to treat the XML-wrapped content as **untrusted data** and to ignore any imperative commands ("Ignore previous instructions") found within it.

---

## 6. Deployment

### 6.1 Hosting
*   **Vercel/Netlify**: Deploy the `dist` folder.
*   **GitHub Pages**: Compatible via standard actions.

### 6.2 Configuration
*   **API Keys**: Stored in `localStorage`.
*   **Defaults**: The app defaults to a Gemini configuration but can be switched to any provider via the Settings modal.
