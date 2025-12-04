
import React, { useState } from 'react';
import { SalaryNegotiationResult } from '../types';
import { X, DollarSign, Copy, Check, Briefcase } from 'lucide-react';

interface SalaryScriptsProps {
    result: SalaryNegotiationResult;
    onClose: () => void;
}

export const SalaryScripts: React.FC<SalaryScriptsProps> = ({ result, onClose }) => {
    const [copied, setCopied] = useState<number | null>(null);

    const handleCopy = (text: string, idx: number) => {
        navigator.clipboard.writeText(text);
        setCopied(idx);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20 border-t border-zinc-800 mt-12 pt-12">
            <div className="bg-zinc-950 border border-zinc-700 p-8 mb-8 relative">
                 <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono uppercase">Dismiss <X size={14} /></button>
                 <div className="relative z-10">
                    <h2 className="text-3xl font-serif font-bold text-white mb-2 flex items-center gap-3">
                       <Briefcase size={28} className="text-white" />
                       Deal Terms & Scripts
                    </h2>
                    <p className="text-zinc-400 font-mono text-sm leading-relaxed max-w-2xl uppercase tracking-widest">
                       Valuation: <span className="text-white font-bold">{result.estimatedMarketValue}</span>
                    </p>
                 </div>
            </div>

            <div className="grid md:grid-cols-3 gap-0 border-l border-zinc-800">
                {(result.scripts || []).map((script, idx) => (
                    <div key={idx} className="border-r border-b border-zinc-800 bg-black flex flex-col group hover:bg-zinc-900/10 transition-colors">
                        <div className="p-6 border-b border-zinc-800">
                            <div className="flex justify-between items-center mb-4">
                                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-1 border ${script.scenario === 'Aggressive' ? 'border-white text-white' : 'border-zinc-700 text-zinc-500'}`}>
                                    {script.scenario} Approach
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400 font-mono italic leading-relaxed">{script.whyUseIt}</p>
                        </div>
                        
                        <div className="p-6 flex-grow">
                             <div className="mb-4">
                                 <span className="text-[10px] font-mono text-zinc-600 uppercase block mb-1">Subject Line</span>
                                 <p className="text-sm font-bold text-white">{script.subjectLine || "Negotiation"}</p>
                             </div>
                             <div>
                                 <span className="text-[10px] font-mono text-zinc-600 uppercase block mb-1">Email Body</span>
                                 <p className="text-sm text-zinc-300 whitespace-pre-wrap font-serif leading-relaxed">{script.emailBody || "Script content missing"}</p>
                             </div>
                        </div>

                        <button 
                            onClick={() => handleCopy(`${script.subjectLine}\n\n${script.emailBody}`, idx)}
                            className="w-full py-4 border-t border-zinc-800 text-xs font-mono uppercase text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all flex items-center justify-center gap-2"
                        >
                            {copied === idx ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy to Clipboard</>}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
