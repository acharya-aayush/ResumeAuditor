

import React from 'react';
import { PsychometricProfile } from '../types';
import { Brain, Fingerprint, Zap, X } from 'lucide-react';

interface PsychometricAnalysisProps {
    result: PsychometricProfile;
    onClose: () => void;
}

export const PsychometricAnalysis: React.FC<PsychometricAnalysisProps> = ({ result, onClose }) => {
    return (
        <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20 border-t border-zinc-800 mt-12 pt-12">
            <div className="bg-zinc-950 border border-zinc-700 p-8 mb-8 relative overflow-hidden">
                 <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono uppercase">
                    Dismiss <X size={14} />
                 </button>
                 <div className="relative z-10">
                    <h2 className="text-3xl font-serif font-bold text-white mb-2 flex items-center gap-3">
                       <Brain size={28} className="text-indigo-400" />
                       Psychometric Profile
                    </h2>
                    <p className="text-zinc-400 font-mono text-sm leading-relaxed max-w-2xl">
                       Behavioral Archetype Analysis.
                    </p>
                 </div>
            </div>

            <div className="grid md:grid-cols-12 gap-8">
                {/* Left: Archetype */}
                <div className="md:col-span-4 border border-zinc-800 bg-black p-6 flex flex-col items-center justify-center text-center">
                    <div className="p-4 rounded-full border-2 border-zinc-800 mb-4 bg-zinc-900">
                        <Fingerprint size={48} className="text-white" />
                    </div>
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Detected Archetype</span>
                    <h3 className="text-3xl font-serif font-bold text-white mb-4">{result.archetype}</h3>
                    <p className="text-sm text-zinc-400 italic">"{result.summary}"</p>
                    
                    <div className="mt-8 w-full border-t border-zinc-800 pt-6 text-left">
                        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block mb-2">Culture Fit</span>
                        <p className="text-sm text-zinc-300">{result.cultureFit}</p>
                    </div>
                </div>

                {/* Right: Traits & Friction */}
                <div className="md:col-span-8 space-y-6">
                    <div className="border border-zinc-800 bg-zinc-900/10 p-6">
                        <h4 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest mb-6">Big 5 Corporate Traits</h4>
                        <div className="space-y-4">
                            {(result.traits || []).map((trait, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-sm font-bold text-white">{trait.trait}</span>
                                        <span className="text-xs font-mono text-zinc-500">{trait.score}/100</span>
                                    </div>
                                    <div className="w-full h-2 bg-zinc-800">
                                        <div className="h-full bg-white transition-all duration-1000" style={{ width: `${trait.score}%` }}></div>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 mt-1">{trait.explanation}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border border-zinc-800 bg-red-950/10 p-6">
                        <h4 className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Zap size={14} /> Potential Friction Points
                        </h4>
                        <ul className="space-y-2">
                            {result.frictionPoints.map((point, idx) => (
                                <li key={idx} className="text-sm text-zinc-400 border-l border-red-900/50 pl-3">
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};