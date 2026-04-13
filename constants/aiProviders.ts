import { AIProvider } from '../types';

export interface ProviderInfo {
  baseUrl: string;
  modelName: string;
  placeholder: string;
  description: string;
  freeModels: string[];
  paidModels: string[];
  guide: {
    steps: string[];
    url: string;
    urlLabel: string;
    notes?: string;
  };
}

export const PROVIDER_CONFIG: Record<AIProvider, ProviderInfo> = {
  [AIProvider.GEMINI]: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    modelName: 'gemini-2.5-flash',
    placeholder: 'AIza...',
    description: 'Google AI with generous free tier. Excellent for resume analysis with vision support.',
    freeModels: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-2.5-flash-lite'],
    paidModels: ['gemini-2.5-pro', 'gemini-3-pro-preview'],
    guide: {
      steps: [
        'Go to Google AI Studio',
        'Sign in with your Google account',
        'Click "Get API key" in the top menu',
        'Click "Create API key"',
        'Select a Google Cloud project (or create one)',
        'Copy the generated key'
      ],
      url: 'https://aistudio.google.com/app/apikey',
      urlLabel: 'Get Gemini API Key',
      notes: 'Free tier includes 60 requests/minute. No credit card required.'
    }
  },
  [AIProvider.OPENROUTER]: {
    baseUrl: 'https://openrouter.ai/api/v1',
    modelName: 'qwen/qwen-2.5-7b-instruct:free',
    placeholder: 'sk-or-...',
    description: 'Access 100+ models through one API. Many free options available.',
    freeModels: ['qwen/qwen-2.5-7b-instruct:free', 'google/gemma-2-9b-it:free', 'meta-llama/llama-3.2-3b-instruct:free', 'microsoft/phi-3-mini-128k-instruct:free'],
    paidModels: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o', 'google/gemini-flash-1.5'],
    guide: {
      steps: [
        'Go to OpenRouter website',
        'Click "Sign Up" or "Log In"',
        'Navigate to "Keys" in the sidebar',
        'Click "Create Key"',
        'Name your key and copy it'
      ],
      url: 'https://openrouter.ai/keys',
      urlLabel: 'Get OpenRouter API Key',
      notes: 'Free models have ":free" suffix. Add credits for premium models.'
    }
  },
  [AIProvider.GROQ]: {
    baseUrl: 'https://api.groq.com/openai/v1',
    modelName: 'llama-3.1-8b-instant',
    placeholder: 'gsk_...',
    description: 'Ultra-fast inference on open-source models. Great free tier.',
    freeModels: ['llama-3.1-8b-instant', 'gemma2-9b-it', 'mixtral-8x7b-32768'],
    paidModels: ['llama-3.1-70b-versatile'],
    guide: {
      steps: [
        'Go to Groq Console',
        'Create an account or sign in',
        'Navigate to "API Keys"',
        'Click "Create API Key"',
        'Copy the generated key'
      ],
      url: 'https://console.groq.com/keys',
      urlLabel: 'Get Groq API Key',
      notes: 'Free tier: 30 requests/minute, 14,400 requests/day.'
    }
  },
  [AIProvider.OPENAI]: {
    baseUrl: 'https://api.openai.com/v1',
    modelName: 'gpt-4o-mini',
    placeholder: 'sk-...',
    description: 'Industry-leading GPT models. Requires payment.',
    freeModels: [],
    paidModels: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
    guide: {
      steps: [
        'Go to OpenAI Platform',
        'Create an account or sign in',
        'Navigate to "API keys" in settings',
        'Click "Create new secret key"',
        'Add a payment method in Billing',
        'Copy your API key'
      ],
      url: 'https://platform.openai.com/api-keys',
      urlLabel: 'Get OpenAI API Key',
      notes: 'Requires adding credits. GPT-4o-mini is most cost-effective.'
    }
  },
  [AIProvider.OLLAMA]: {
    baseUrl: 'http://localhost:11434/v1',
    modelName: 'qwen2.5:3b',
    placeholder: '(not required)',
    description: 'Run models locally on your machine. Free, private, no API needed.',
    freeModels: ['qwen2.5:3b', 'qwen2.5:7b', 'llama3.2:3b', 'phi3.5'],
    paidModels: [],
    guide: {
      steps: [
        'Download Ollama from ollama.com',
        'Install and run Ollama',
        'Open terminal and run: ollama pull qwen2.5:3b',
        'Keep Ollama running in background',
        'No API key needed'
      ],
      url: 'https://ollama.com/download',
      urlLabel: 'Download Ollama',
      notes: 'Requires 8GB+ RAM. GPU recommended for speed.'
    }
  },
  [AIProvider.CUSTOM]: {
    baseUrl: '',
    modelName: '',
    placeholder: 'Enter your API key',
    description: 'Connect to any OpenAI-compatible API endpoint.',
    freeModels: [],
    paidModels: [],
    guide: {
      steps: [
        'Get the API endpoint URL',
        'Obtain your API key',
        'Enter both in the fields below'
      ],
      url: '',
      urlLabel: '',
      notes: 'Must be OpenAI-compatible (chat/completions endpoint).'
    }
  }
};

export const PROVIDER_ORDER: AIProvider[] = [
  AIProvider.GEMINI,
  AIProvider.OPENROUTER,
  AIProvider.GROQ,
  AIProvider.OPENAI,
  AIProvider.OLLAMA,
  AIProvider.CUSTOM
];

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  [AIProvider.GEMINI]: 'Gemini',
  [AIProvider.OPENROUTER]: 'OpenRouter',
  [AIProvider.GROQ]: 'Groq',
  [AIProvider.OPENAI]: 'OpenAI',
  [AIProvider.OLLAMA]: 'Local',
  [AIProvider.CUSTOM]: 'Custom'
};