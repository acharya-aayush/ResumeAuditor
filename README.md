
# Resume Auditor V4

A comprehensive AI-powered career toolkit that analyzes, rewrites, and optimizes professional resumes. Built with a minimalist dark aesthetic and multi-provider AI support.

## Features

### Core Analysis
- **Resume Audit** - Deep analysis with scoring, red/green flags, and line-by-line improvement suggestions
- **Psychometric Profile** - Personality archetype detection based on writing style and word choice
- **ATS Compatibility** - Keyword gap analysis against job descriptions

### Career Tools
- **Resume Remaster** - AI-powered rewriting with before/after comparisons
- **Interview Prep** - Generated questions based on resume weak spots with answer guides
- **Career Pivot** - Alternative career path suggestions with skill translation
- **90-Day Plan** - Structured onboarding plan for new roles
- **Skill Roadmap** - 4-week learning plans for target skills

### Outreach & Branding
- **LinkedIn Generator** - Optimized headlines and About sections
- **GitHub Profile** - README.md generator for developer profiles
- **Cold Email Architect** - Three email templates (direct, value-first, warm)
- **Salary Scripts** - Negotiation email templates at different risk levels

### Comparison Mode
- **Multi-Resume Battle** - Compare up to 5 candidates with ranking
- **Dream Team** - AI-selected team composition with synergy analysis

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Configuration

Click the settings icon to configure your AI provider:

| Provider | Free Tier | Vision Support | Speed |
|----------|-----------|----------------|-------|
| Gemini | Yes (60 req/min) | Yes | Fast |
| OpenRouter | Yes (select models) | Limited | Varies |
| Groq | Yes (30 req/min) | No | Very Fast |
| OpenAI | No | Yes | Fast |
| Ollama | Yes (local) | No | Depends on hardware |

### Recommended Setup
1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Open Settings in the app
3. Select "Gemini" provider
4. Paste your API key
5. Use `gemini-2.5-flash` model (default)

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Document Export**: docx, file-saver

## Project Structure

```
├── App.tsx                 # Main application controller
├── types.ts                # TypeScript definitions
├── services/
│   ├── aiService.ts        # AI provider integration
│   └── githubService.ts    # GitHub API client
└── components/
    ├── RoastDashboard.tsx  # Main analysis display
    ├── SettingsModal.tsx   # Provider configuration
    ├── RemasterWizard.tsx  # Resume rewriting
    └── ...                 # Feature components
```

## Privacy

- All processing happens client-side
- API keys stored in browser localStorage only
- No server-side data collection
- Resume content sent directly to your chosen AI provider

## License

MIT

## Author

Aayush Acharya
