import React, { useState, useEffect } from 'react';
import { X, Save, Key, Cpu, Lock, Globe, Sparkles, ExternalLink, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { AIConfig, AIProvider } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AIConfig;
  onSave: (config: AIConfig) => void;
}

interface ProviderInfo {
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

const PROVIDER_CONFIG: Record<AIProvider, ProviderInfo> = {
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

const PROVIDER_ORDER: AIProvider[] = [
  AIProvider.GEMINI,
  AIProvider.OPENROUTER,
  AIProvider.GROQ,
  AIProvider.OPENAI,
  AIProvider.OLLAMA,
  AIProvider.CUSTOM
];

const PROVIDER_LABELS: Record<AIProvider, string> = {
  [AIProvider.GEMINI]: 'Gemini',
  [AIProvider.OPENROUTER]: 'OpenRouter',
  [AIProvider.GROQ]: 'Groq',
  [AIProvider.OPENAI]: 'OpenAI',
  [AIProvider.OLLAMA]: 'Local',
  [AIProvider.CUSTOM]: 'Custom'
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<AIConfig>(config);
  const [showGuide, setShowGuide] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
      setShowGuide(false);
      setTestStatus('idle');
      setTestMessage('');
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleProviderChange = (provider: AIProvider) => {
    const preset = PROVIDER_CONFIG[provider];
    setLocalConfig({
      ...localConfig,
      provider,
      baseUrl: preset.baseUrl,
      modelName: preset.modelName
    });
    setShowGuide(false);
    setTestStatus('idle');
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Testing connection...');
    
    try {
      if (localConfig.provider === AIProvider.OLLAMA) {
        const res = await fetch(`${localConfig.baseUrl || 'http://localhost:11434/v1'}/models`);
        if (res.ok) {
          setTestStatus('success');
          setTestMessage('Connected to Ollama');
        } else {
          throw new Error('Ollama not responding');
        }
      } else if (localConfig.provider === AIProvider.GEMINI) {
        const res = await fetch(
          `${localConfig.baseUrl || 'https://generativelanguage.googleapis.com/v1beta'}/models?key=${localConfig.apiKey}`
        );
        if (res.ok) {
          setTestStatus('success');
          setTestMessage('API key valid');
        } else {
          throw new Error('Invalid API key');
        }
      } else {
        const res = await fetch(`${localConfig.baseUrl || 'https://api.openai.com/v1'}/models`, {
          headers: { 'Authorization': `Bearer ${localConfig.apiKey}` }
        });
        if (res.ok) {
          setTestStatus('success');
          setTestMessage('API key valid');
        } else {
          throw new Error('Invalid API key or endpoint');
        }
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage(e.message || 'Connection failed');
    }
  };

  const currentProvider = PROVIDER_CONFIG[localConfig.provider];
  const isConfigured = localConfig.provider === AIProvider.OLLAMA || !!localConfig.apiKey;
  const allModels = [...currentProvider.freeModels, ...currentProvider.paidModels];

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] rounded-lg">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Cpu size={18} className="text-zinc-400" />
              AI Configuration
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Configure your AI provider and model settings
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto">
          
          {/* Status Banner */}
          <div className={`p-4 border rounded-lg flex items-start gap-3 ${
            isConfigured 
              ? 'bg-emerald-950/30 border-emerald-800/50' 
              : 'bg-amber-950/30 border-amber-800/50'
          }`}>
            {isConfigured ? (
              <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
            )}
            <div>
              <p className={`text-sm font-medium ${isConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isConfigured ? 'Ready to use' : 'Configuration required'}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {localConfig.provider === AIProvider.OLLAMA 
                  ? 'Local inference mode. Make sure Ollama is running.'
                  : isConfigured 
                    ? `Using ${PROVIDER_LABELS[localConfig.provider]} with ${localConfig.modelName}`
                    : 'Add an API key to enable AI features'
                }
              </p>
            </div>
          </div>

          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 block">Provider</label>
            <div className="grid grid-cols-6 border border-zinc-800 rounded-lg overflow-hidden">
              {PROVIDER_ORDER.map((provider) => (
                <button
                  key={provider}
                  onClick={() => handleProviderChange(provider)}
                  className={`px-2 py-2.5 text-xs font-medium transition-colors border-r border-zinc-800 last:border-r-0
                    ${localConfig.provider === provider 
                      ? 'bg-zinc-800 text-white' 
                      : 'bg-zinc-900/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
                >
                  {PROVIDER_LABELS[provider]}
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-600">{currentProvider.description}</p>
          </div>

          {/* Setup Guide Toggle */}
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-400 hover:text-zinc-300 hover:border-zinc-700 transition-colors"
          >
            <span className="flex items-center gap-2">
              <HelpCircle size={14} />
              How to get {PROVIDER_LABELS[localConfig.provider]} API key
            </span>
            {showGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {/* Setup Guide Content */}
          {showGuide && (
            <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-lg space-y-3">
              <ol className="space-y-2">
                {currentProvider.guide.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center text-xs shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              {currentProvider.guide.notes && (
                <p className="text-xs text-zinc-500 border-t border-zinc-800 pt-3 mt-3">
                  Note: {currentProvider.guide.notes}
                </p>
              )}
              {currentProvider.guide.url && (
                <a
                  href={currentProvider.guide.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 mt-2"
                >
                  {currentProvider.guide.urlLabel}
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          )}

          {/* API Key Input */}
          {localConfig.provider !== AIProvider.OLLAMA && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key size={12} />
                  API Key
                </span>
                {!localConfig.apiKey && (
                  <span className="text-amber-500 text-xs">Required</span>
                )}
              </label>
              <input
                type="password"
                value={localConfig.apiKey}
                onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                placeholder={currentProvider.placeholder}
                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm font-mono text-white focus:border-zinc-600 outline-none transition-colors placeholder:text-zinc-700"
              />
            </div>
          )}

          {/* Endpoint & Model */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                <Globe size={12} />
                API Endpoint
              </label>
              <input
                type="text"
                value={localConfig.baseUrl || ''}
                onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                placeholder={currentProvider.baseUrl || 'https://api.example.com/v1'}
                className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-sm font-mono text-zinc-400 focus:border-zinc-600 outline-none transition-colors placeholder:text-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                <Sparkles size={12} />
                Model
              </label>
              <input
                type="text"
                value={localConfig.modelName}
                onChange={(e) => setLocalConfig({ ...localConfig, modelName: e.target.value })}
                placeholder={currentProvider.modelName || 'model-name'}
                className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-sm font-mono text-zinc-400 focus:border-zinc-600 outline-none transition-colors placeholder:text-zinc-700"
              />
            </div>
          </div>

          {/* Model Suggestions */}
          {allModels.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs text-zinc-500">Available models</label>
              <div className="flex flex-wrap gap-1.5">
                {currentProvider.freeModels.map((model) => (
                  <button
                    key={model}
                    onClick={() => setLocalConfig({ ...localConfig, modelName: model })}
                    className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                      localConfig.modelName === model
                        ? 'bg-emerald-900/50 border-emerald-700 text-emerald-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400'
                    }`}
                  >
                    <span className="text-emerald-500 mr-1">Free</span>
                    {model.split('/').pop()?.replace(':free', '')}
                  </button>
                ))}
                {currentProvider.paidModels.map((model) => (
                  <button
                    key={model}
                    onClick={() => setLocalConfig({ ...localConfig, modelName: model })}
                    className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                      localConfig.modelName === model
                        ? 'bg-zinc-800 border-zinc-600 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400'
                    }`}
                  >
                    {model.split('/').pop()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ollama Instructions */}
          {localConfig.provider === AIProvider.OLLAMA && (
            <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-xs text-zinc-500 space-y-1">
              <p>To download a model, run in terminal:</p>
              <code className="block bg-black px-2 py-1 rounded text-zinc-400 font-mono">
                ollama pull {localConfig.modelName || 'qwen2.5:3b'}
              </code>
            </div>
          )}

          {/* Test Connection */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing' || (!localConfig.apiKey && localConfig.provider !== AIProvider.OLLAMA)}
              className="px-4 py-2 text-xs font-medium border border-zinc-700 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
            {testStatus !== 'idle' && testStatus !== 'testing' && (
              <span className={`text-xs flex items-center gap-1 ${
                testStatus === 'success' ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {testStatus === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                {testMessage}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-zinc-600">
            <Lock size={12} />
            <span className="text-xs">Credentials stored locally only</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-white text-black px-5 py-2 text-xs font-semibold rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
            >
              <Save size={12} />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};