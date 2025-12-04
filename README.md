
# RESUME_AUDITOR_V4 📰

A brutal, minimalist, AI-powered resume analyzer with a "Newspaper Dark Mode" aesthetic.

## Overview

Resume Auditor V4 audits resumes using multimodal AI intelligence. It ingests PDFs or Images, "sees" the layout, and returns a structured JSON critique formatted like a harsh editorial column.

**Features:**
- **Solo Audit**: Individual deep-dive analysis with ATS keyword gap detection.
- **Group Audit**: Multi-candidate comparison and ranking (Max 5).
- **Remaster**: AI-powered resume rewriting and formatting.
- **Provider Agnostic**: Built to run on Google, OpenAI, OpenRouter, or Local LLMs.
- **BYOK (Bring Your Own Key)**: Privacy-focused client-side key management.

## Setup

1. Clone repo.
2. `npm install`
3. `npm start`
4. Click the "Gear" icon in the top right to configure your AI Provider.

## Supported Providers

| Provider | Description | Capabilities |
|----------|-------------|--------------|
| **Gemini** | Native Multimodal | Vision + Text |
| **OpenAI** | Industry Standard | Vision + Text |
| **OpenRouter** | Access to Open Source (Llama, DeepSeek) | Text Only (mostly) |
| **Ollama** | Local LLM | Text Only |

## Architecture

Built with React, Tailwind CSS (Zinc/Monochrome), and a custom Strategy Pattern service layer to handle multiple AI providers.
