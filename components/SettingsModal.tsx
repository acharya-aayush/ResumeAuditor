import React, { useState, useEffect } from 'react';
import { X, Save, Key, Cpu, Zap, ShieldCheck, Lock, AlertOctagon, Server, Globe, Sparkles } from 'lucide-react';
import { AIConfig, AIProvider } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AIConfig;
  onSave: (config: AIConfig) => void;
}

const PROVIDER_PRESETS: Record<AIProvider, { baseUrl: string; modelName: string; placeholder: string; description: string }> = {
  [AIProvider.OPENAI]: {
    baseUrl: 'https://api.openai.com/v1',
    modelName: 'gpt-4o-mini',
    placeholder: 'sk-...',
    description: 'OpenAI GPT models. Get key at platform.openai.com'
  },
  [AIProvider.OPENROUTER]: {
    baseUrl: 'https://openrouter.ai/api/v1',
    modelName: 'qwen/qwen-2.5-7b-instruct:free',
    placeholder: 'sk-or-...',
    description: 'Access 100+ models (free tiers available). Get key at openrouter.ai'
  },
  [AIProvider.GROQ]: {
    baseUrl: 'https://api.groq.com/openai/v1',
    modelName: 'llama-3.1-8b-instant',
    placeholder: 'gsk_...',
    description: 'Ultra-fast inference. Free tier at groq.com'
  },
  [AIProvider.OLLAMA]: {
    baseUrl: 'http://localhost:11434/v1',
    modelName: 'qwen2.5:3b',
    placeholder: '(not required for local)',
    description: 'Run local LLMs. Ollama installed with qwen2.5:3b & phi3.5'
  },
  [AIProvider.CUSTOM]: {
    baseUrl: '',
    modelName: '',
    placeholder: 'Enter API Key',
    description: 'Any OpenAI-compatible endpoint'
  }
};

// Popular model suggestions for each provider
const MODEL_SUGGESTIONS: Record<AIProvider, string[]> = {
  [AIProvider.OPENAI]: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
  [AIProvider.OPENROUTER]: [
    'qwen/qwen-2.5-7b-instruct:free',
    'google/gemma-2-9b-it:free', 
    'meta-llama/llama-3.2-3b-instruct:free',
    'microsoft/phi-3-mini-128k-instruct:free',
    'anthropic/claude-3-haiku',
    'google/gemini-flash-1.5'
  ],
  [AIProvider.GROQ]: ['llama-3.1-8b-instant', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
  [AIProvider.OLLAMA]: ['qwen2.5:3b', 'phi3.5', 'llama3.2:3b', 'mistral:7b-q4_0'],
  [AIProvider.CUSTOM]: []
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<AIConfig>(config);
  
  useEffect(() => {
    if (isOpen) setLocalConfig(config);
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleProviderChange = (provider: AIProvider) => {
    const preset = PROVIDER_PRESETS[provider];
    setLocalConfig({
      ...localConfig,
      provider,
      baseUrl: preset.baseUrl,
      modelName: preset.modelName
    });
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  const isFreeTier = !localConfig.apiKey && localConfig.provider !== AIProvider.OLLAMA;
  const currentPreset = PROVIDER_PRESETS[localConfig.provider];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-black">
          <div>
            <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
              <Cpu size={20} className="text-zinc-400" />
              System Configuration
            </h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
                Configure Inference Engine
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* Status Panel */}
          <div className={`p-6 border flex items-start gap-4 ${isFreeTier ? 'bg-zinc-900/50 border-zinc-700' : 'bg-white/5 border-white/20'}`}>
              <div className={`p-3 rounded-full ${isFreeTier ? 'bg-zinc-800' : 'bg-white text-black'}`}>
                  {localConfig.provider === AIProvider.OLLAMA 
                    ? <Server size={20} className={isFreeTier ? "text-zinc-400" : ""} />
                    : isFreeTier ? <ShieldCheck size={20} className="text-zinc-400" /> : <Zap size={20} />}
              </div>
              <div>
                  <h4 className={`text-sm font-bold uppercase font-mono mb-1 ${isFreeTier ? 'text-zinc-300' : 'text-white'}`}>
                      {localConfig.provider === AIProvider.OLLAMA ? 'Local LLM Mode' : isFreeTier ? 'API Key Required' : 'Pro License Active'}
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                      {localConfig.provider === AIProvider.OLLAMA 
                        ? "Running inference locally. No API key needed. Make sure Ollama is running." 
                        : isFreeTier 
                          ? "Enter an API key to enable AI features." 
                          : "You are running on dedicated API credentials."}
                  </p>
              </div>
          </div>

          {/* Configuration Form */}
          <div className="space-y-6">
            
            {/* Provider Selection */}
            <div className="space-y-3">
               <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">AI Provider</label>
               <div className="grid grid-cols-5 gap-0 border border-zinc-800 bg-black">
                  {Object.values(AIProvider).map((provider) => (
                    <button
                      key={provider}
                      onClick={() => handleProviderChange(provider)}
                      className={`px-2 py-3 text-[10px] font-mono font-bold uppercase transition-colors
                        ${localConfig.provider === provider 
                          ? 'bg-zinc-800 text-white' 
                          : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                      {provider === AIProvider.OLLAMA ? '🖥️ Local' : provider}
                    </button>
                  ))}
               </div>
               <p className="text-[10px] text-zinc-600 font-mono">{currentPreset.description}</p>
            </div>

            {/* API Key Input - Hide for Ollama */}
            {localConfig.provider !== AIProvider.OLLAMA && (
              <div className="space-y-3">
                <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                   <span>API Key</span>
                   {isFreeTier && <span className="text-amber-600 flex items-center gap-1"><AlertOctagon size={10} /> Required</span>}
                </label>
                
                <div className="relative">
                    <input
                      type="password"
                      value={localConfig.apiKey}
                      onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                      placeholder={currentPreset.placeholder}
                      className="w-full bg-black border border-zinc-700 p-4 pl-10 text-sm font-mono text-white focus:border-white outline-none transition-all placeholder:text-zinc-800"
                    />
                    <Key size={14} className="absolute left-3 top-4 text-zinc-600" />
                </div>
              </div>
            )}

            {/* Endpoint & Model Configuration */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Globe size={10} /> Endpoint URL
                    </label>
                    <input
                        type="text"
                        value={localConfig.baseUrl || ''}
                        onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                        placeholder={currentPreset.baseUrl || "https://api.example.com/v1"}
                        className="w-full bg-black border border-zinc-700 p-3 text-sm font-mono text-zinc-300 focus:border-white outline-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={10} /> Model Name
                    </label>
                    <input
                        type="text"
                        value={localConfig.modelName}
                        onChange={(e) => setLocalConfig({ ...localConfig, modelName: e.target.value })}
                        placeholder={currentPreset.modelName || "model-name"}
                        className="w-full bg-black border border-zinc-700 p-3 text-sm font-mono text-zinc-300 focus:border-white outline-none"
                    />
                    {/* Model suggestions as clickable buttons */}
                    {MODEL_SUGGESTIONS[localConfig.provider]?.length > 0 && (
                      <div className="mt-2 space-y-2">
                        <p className="text-[10px] text-zinc-500 font-mono">Quick select:</p>
                        <div className="flex flex-wrap gap-1">
                          {MODEL_SUGGESTIONS[localConfig.provider].map((model) => (
                            <button
                              key={model}
                              onClick={() => setLocalConfig({ ...localConfig, modelName: model })}
                              className={`px-2 py-1 text-[9px] font-mono border transition-colors
                                ${localConfig.modelName === model 
                                  ? 'bg-white text-black border-white' 
                                  : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-300'}`}
                            >
                              {model.includes(':free') ? '🆓 ' : ''}{model.split('/').pop()}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {localConfig.provider === AIProvider.OLLAMA && (
                      <p className="text-[10px] text-zinc-600 font-mono mt-2">
                        💡 Run <code className="bg-zinc-800 px-1">ollama pull qwen2.5:7b</code> to download
                      </p>
                    )}
                </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 bg-black flex justify-between items-center">
          <div className="flex items-center gap-2 text-zinc-600">
             <Lock size={12} />
             <span className="text-[10px] font-mono uppercase">Stored Locally Only</span>
          </div>
          <button
            onClick={handleSave}
            className="bg-white text-black px-8 py-3 text-xs font-bold font-mono uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2"
          >
            <Save size={14} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};