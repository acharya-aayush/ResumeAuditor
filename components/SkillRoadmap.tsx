import React from 'react';
import { RoadmapResult } from '../types';
import { X, Map, Calendar, BookOpen, CheckSquare, ArrowRight } from 'lucide-react';

interface SkillRoadmapProps {
  result: RoadmapResult;
  onClose: () => void;
}

export const SkillRoadmap: React.FC<SkillRoadmapProps> = ({ result, onClose }) => {
  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20 border-t border-zinc-800 mt-12 pt-12">
      
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-700 p-8 mb-8 relative overflow-hidden">
         <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono uppercase">
            Dismiss <X size={14} />
         </button>
         <div className="relative z-10">
            <h2 className="text-3xl font-serif font-bold text-white mb-2 flex items-center gap-3">
               <Map size={28} className="text-green-500" />
               Tactical Skill Roadmap
            </h2>
            <p className="text-zinc-400 font-mono text-sm leading-relaxed max-w-2xl">
               Goal: <span className="text-white font-bold">{result.targetGoal}</span>. A 4-week sprint to close your skills gap.
            </p>
         </div>
      </div>

      <div className="relative border-l border-zinc-800 ml-4 md:ml-8 space-y-12">
        {(result.schedule || []).map((week, idx) => (
            <div key={idx} className="relative pl-8 md:pl-12">
                {/* Timeline Dot */}
                <div className="absolute -left-3 md:-left-[11px] top-0 w-6 h-6 bg-black border-2 border-zinc-600 rounded-full flex items-center justify-center z-10">
                    <span className="text-[10px] font-bold text-white">{week.week}</span>
                </div>

                <div className="border border-zinc-800 bg-black p-6 md:p-8 hover:border-zinc-600 transition-colors">
                    <h3 className="text-xl font-serif font-bold text-white mb-1">
                        Week {week.week}: {week.theme}
                    </h3>
                    <div className="h-px bg-zinc-800 w-full my-4"></div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <CheckSquare size={14} /> Critical Tasks
                            </h4>
                            {(week.tasks || []).length > 0 ? (
                                <ul className="space-y-3">
                                    {week.tasks.map((task, tIdx) => (
                                        <li key={tIdx} className="flex items-start gap-3 text-sm text-zinc-300">
                                            <ArrowRight size={14} className="mt-1 text-green-500 shrink-0" />
                                            {task}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-zinc-600 italic">No specific tasks generated.</p>
                            )}
                        </div>

                        <div>
                            <h4 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <BookOpen size={14} /> Resources
                            </h4>
                            {(week.resources || []).length > 0 ? (
                                <ul className="space-y-3">
                                    {week.resources.map((res, rIdx) => (
                                        <li key={rIdx} className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-4 cursor-pointer">
                                            {res}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-zinc-600 italic">No resources found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

    </div>
  );
};