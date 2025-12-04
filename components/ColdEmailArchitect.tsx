
import React, { useState } from 'react';
import { ColdEmailResult } from '../types';
import { Mail, Send, Copy, Check, X, ArrowRight } from 'lucide-react';

interface ColdEmailArchitectProps {
  onGenerate: (company: string, manager: string) => void;
  result: ColdEmailResult | null;
  isLoading: boolean;
  onClose: () => void;
}

export const ColdEmailArchitect: React.FC<ColdEmailArchitectProps> = ({ onGenerate, result, isLoading, onClose }) => {
  const [company, setCompany] = useState('');
  const [manager, setManager] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20 border-t border-zinc-800 mt-12 pt-12">
      
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-700 p-8 mb-8 relative overflow-hidden">
         <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono uppercase">
            Dismiss <X size={14} />
         </button>
         <div className="relative z-10">
            <h2 className="text-3xl font-serif font-bold text-white mb-2 flex items-center gap-3">
               <Mail size={28} className="text-orange-500" />
               The Cold Email Architect
            </h2>
            <p className="text-zinc-400 font-mono text-sm leading-relaxed max-w-2xl">
               Bypass the portal. Generate high-conversion outreach directly to decision makers.
            </p>
         </div>
      </div>

      {/* Input Section */}
      {!result && (
          <div className="border border-zinc-700 bg-black p-8 max-w-2xl mx-auto">
              <div className="space-y-4">
                  <div>
                      <label className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-2">Target Company</label>
                      <input 
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. Netflix, Stripe, Local Agency"
                        className="w-full bg-zinc-900 border border-zinc-700 p-4 text-white focus:border-white outline-none font-mono text-sm"
                      />
                  </div>
                  <div>
                      <label className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-2">Hiring Manager (Optional)</label>
                      <input 
                        value={manager}
                        onChange={(e) => setManager(e.target.value)}
                        placeholder="e.g. John Doe, CTO"
                        className="w-full bg-zinc-900 border border-zinc-700 p-4 text-white focus:border-white outline-none font-mono text-sm"
                      />
                  </div>
                  <button 
                    onClick={() => onGenerate(company, manager)}
                    disabled={!company || isLoading}
                    className="w-full py-4 bg-white text-black font-mono font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? "Generating..." : <>Generate Drafts <ArrowRight size={16} /></>}
                  </button>
              </div>
          </div>
      )}

      {/* Results Section */}
      {result && (
          <div className="grid md:grid-cols-3 gap-6">
              {(result.emails || []).map((email, idx) => (
                  <div key={idx} className="border border-zinc-800 bg-zinc-900/20 flex flex-col">
                      <div className="p-4 border-b border-zinc-800 bg-black flex justify-between items-center">
                          <span className={`text-[10px] font-mono font-bold uppercase px-2 py-1 border ${
                              email.type === 'DIRECT' ? 'border-red-900 text-red-500' :
                              email.type === 'SOFT' ? 'border-blue-900 text-blue-500' :
                              'border-green-900 text-green-500'
                          }`}>
                              {email.type} PITCH
                          </span>
                          <button onClick={() => handleCopy(`${email.subject}\n\n${email.body}`, idx)} className="text-zinc-500 hover:text-white">
                              {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                      </div>
                      
                      <div className="p-6 flex-grow space-y-4">
                          <div>
                              <span className="text-[10px] text-zinc-600 uppercase font-mono block mb-1">Subject</span>
                              <p className="text-white font-bold text-sm">{email.subject}</p>
                          </div>
                          <div>
                              <span className="text-[10px] text-zinc-600 uppercase font-mono block mb-1">Body</span>
                              <p className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">{email.body}</p>
                          </div>
                      </div>

                      <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 text-[10px] font-mono text-zinc-500 leading-tight">
                          <span className="text-zinc-400 font-bold uppercase mr-1">Why this works:</span>
                          {email.explanation}
                      </div>
                  </div>
              ))}
          </div>
      )}

    </div>
  );
};
