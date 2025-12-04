

import React from 'react';
import { DreamTeamAnalysis } from '../types';
import { X, Users, Zap, ShieldAlert, Star } from 'lucide-react';

interface DreamTeamProps {
    result: DreamTeamAnalysis;
    onClose: () => void;
}

export const DreamTeam: React.FC<DreamTeamProps> = ({ result, onClose }) => {
    return (
        <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20 border-t border-zinc-800 mt-12 pt-12">
            <div className="bg-zinc-950 border border-zinc-700 p-8 mb-8 relative">
                 <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono uppercase">
                    Dismiss <X size={14} />
                 </button>
                 <div className="relative z-10">
                    <h2 className="text-3xl font-serif font-bold text-white mb-2 flex items-center gap-3">
                       <Users size={28} className="text-purple-500" />
                       Squad Protocol: {result.squadName}
                    </h2>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="px-3 py-1 bg-purple-950/30 border border-purple-900/50 text-purple-400 text-xs font-mono uppercase font-bold">
                            Synergy Score: {result.synergyScore}/100
                        </div>
                        <p className="text-zinc-500 font-mono text-xs uppercase">{result.selectedMembers.length} Operatives Selected</p>
                    </div>
                 </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Roster */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="border border-zinc-800 bg-black p-6">
                        <h3 className="font-serif font-bold text-xl text-white mb-6 border-b border-zinc-800 pb-4">Operational Roles</h3>
                        <div className="space-y-4">
                            {result.roles.map((role, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 border border-zinc-800 bg-zinc-900/20 hover:border-purple-900/50 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                        {role.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-white">{role.name}</span>
                                            <span className="text-xs font-mono text-purple-400 uppercase">[{role.role}]</span>
                                        </div>
                                        <p className="text-sm text-zinc-400 leading-relaxed">{role.contribution}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="border border-zinc-800 bg-zinc-900/10 p-6">
                        <h4 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Star size={14} /> Strategic Rationale
                        </h4>
                        <p className="text-zinc-300 italic font-serif leading-relaxed">"{result.rationale}"</p>
                    </div>
                </div>

                {/* Risks */}
                <div className="lg:col-span-5">
                    <div className="border border-zinc-800 bg-black p-6 h-full">
                        <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                             <ShieldAlert size={20} className="text-red-500" />
                             <h3 className="font-serif font-bold text-xl text-white">Collective Vulnerabilities</h3>
                        </div>
                        <ul className="space-y-4">
                            {result.collectiveWeaknesses.map((weakness, idx) => (
                                <li key={idx} className="flex gap-3">
                                    <span className="font-mono text-xs text-red-900 font-bold">0{idx+1}</span>
                                    <p className="text-sm text-zinc-400 border-b border-zinc-900 pb-2 w-full">{weakness}</p>
                                </li>
                            ))}
                        </ul>
                        
                        <div className="mt-8 p-4 bg-zinc-900 border border-zinc-800">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">Dream Team Logic</span>
                            <p className="text-xs text-zinc-400">
                                This algorithm selects candidates whose skills complement rather than duplicate. High synergy scores indicate non-overlapping strengths covering Tech, Soft Skills, and Leadership.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};