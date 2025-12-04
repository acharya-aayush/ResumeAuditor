
import React from 'react';
import { Plan90DaysResult } from '../types';
import { X, Calendar, Flag, CheckSquare } from 'lucide-react';

interface Plan90DaysProps {
    result: Plan90DaysResult;
    onClose: () => void;
}

export const Plan90Days: React.FC<Plan90DaysProps> = ({ result, onClose }) => {
    // Provide safe defaults if data is missing
    const safeData = (data: any) => ({
        focus: data?.focus || 'Not specified',
        goals: Array.isArray(data?.goals) ? data.goals : []
    });

    const phases = [
        { title: "Days 0-30", data: safeData(result?.days30), color: "text-zinc-500", border: "border-zinc-700" },
        { title: "Days 31-60", data: safeData(result?.days60), color: "text-zinc-300", border: "border-zinc-500" },
        { title: "Days 61-90", data: safeData(result?.days90), color: "text-white", border: "border-white" },
    ];

    return (
        <div className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20 border-t border-zinc-800 mt-12 pt-12">
            <div className="bg-zinc-950 border border-zinc-700 p-8 mb-8 relative">
                 <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono uppercase">
                    Dismiss <X size={14} />
                 </button>
                 <div className="relative z-10">
                    <h2 className="text-3xl font-serif font-bold text-white mb-2 flex items-center gap-3">
                       <Calendar size={28} className="text-white" />
                       First 90 Days Strategy
                    </h2>
                    <p className="text-zinc-400 font-mono text-sm leading-relaxed max-w-2xl">
                       Deployment Schedule for <span className="text-white font-bold">{result.roleContext}</span>.
                    </p>
                 </div>
            </div>

            <div className="grid md:grid-cols-3 gap-0 border border-zinc-800">
                {phases.map((phase, idx) => (
                    <div key={idx} className={`p-8 border-b md:border-b-0 md:border-r border-zinc-800 last:border-r-0 bg-black group hover:bg-zinc-900/10 transition-colors`}>
                        <span className={`text-4xl font-serif font-bold block mb-4 ${phase.color}`}>{phase.title}</span>
                        <div className={`inline-block px-3 py-1 mb-6 border ${phase.border} text-[10px] font-mono uppercase tracking-widest ${phase.color}`}>
                            Focus: {phase.data.focus}
                        </div>
                        
                        <ul className="space-y-6">
                            {phase.data.goals.length === 0 ? (
                                <li className="text-sm text-zinc-600 italic">No goals specified</li>
                            ) : phase.data.goals.map((goal, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <CheckSquare size={14} className={phase.color} />
                                    </div>
                                    <p className="text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-200 transition-colors">
                                        {goal}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};
