
import React, { useState } from 'react';
import { InterviewPrepResult } from '../types';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Mic, X, Clock } from 'lucide-react';

interface InterviewPrepProps {
  result: InterviewPrepResult;
  onClose: () => void;
}

export const InterviewPrep: React.FC<InterviewPrepProps> = ({ result, onClose }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20 border-t border-zinc-800 mt-12 pt-12">
      
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-700 p-8 mb-8 relative overflow-hidden">
         <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono uppercase">
            Dismiss <X size={14} />
         </button>
         <div className="relative z-10">
            <h2 className="text-3xl font-serif font-bold text-white mb-2 flex items-center gap-3">
               <Mic size={28} className="text-red-500" />
               The Interrogation Room
            </h2>
            <p className="text-zinc-400 font-mono text-sm leading-relaxed max-w-2xl">
               The AI has analyzed your red flags and generated 5 high-pressure questions a hiring manager will ask to expose you. Prepare your defense.
            </p>
         </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
          
          {/* Questions Column */}
          <div className="md:col-span-8 space-y-4">
            {(result.questions || []).map((q, idx) => {
                const isOpen = openIndex === idx;
                return (
                    <div key={idx} className={`border transition-all duration-300 ${isOpen ? 'border-white bg-zinc-900/50' : 'border-zinc-800 bg-black hover:border-zinc-600'}`}>
                        <button 
                            onClick={() => setOpenIndex(isOpen ? null : idx)}
                            className="w-full text-left p-6 flex justify-between items-start gap-4"
                        >
                            <div className="flex gap-4">
                                <span className="font-mono text-zinc-500 font-bold text-lg mt-1">0{idx+1}</span>
                                <div>
                                    <h3 className={`font-serif text-xl font-bold leading-tight ${isOpen ? 'text-white' : 'text-zinc-300'}`}>
                                        "{q.question}"
                                    </h3>
                                    <p className="text-xs text-zinc-500 font-mono mt-2 uppercase tracking-wide flex items-center gap-2">
                                        <AlertTriangle size={12} className="text-yellow-600" />
                                        Reason: {q.context}
                                    </p>
                                </div>
                            </div>
                            {isOpen ? <ChevronUp className="text-white shrink-0" /> : <ChevronDown className="text-zinc-500 shrink-0" />}
                        </button>

                        {isOpen && (
                            <div className="px-6 pb-6 pt-0 animate-in fade-in duration-300">
                                <div className="h-px bg-zinc-800 w-full mb-6"></div>
                                
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* The Trap */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                                            <X size={14} /> The Trap (Do Not Say)
                                        </h4>
                                        <div className="p-4 bg-red-950/10 border border-red-900/30 text-zinc-300 text-sm leading-relaxed">
                                            {q.badAnswerTrap}
                                        </div>
                                    </div>

                                    {/* The Key */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-mono font-bold text-green-500 uppercase tracking-widest flex items-center gap-2">
                                            <CheckCircle size={14} /> Model Answer Strategy
                                        </h4>
                                        <div className="p-4 bg-green-950/10 border border-green-900/30 text-white text-sm leading-relaxed">
                                            {q.goodAnswerKey}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
          </div>

          {/* Elevator Pitch Sidebar */}
          <div className="md:col-span-4">
              <div className="sticky top-24 border border-zinc-700 bg-zinc-900/30 p-6">
                  <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
                      <Clock size={18} className="text-blue-500" />
                      <h3 className="font-serif font-bold text-white text-lg">The 60s Pitch</h3>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">
                      "Tell me about yourself"
                  </p>
                  <div className="prose prose-invert prose-sm">
                      <p className="text-zinc-300 leading-relaxed italic">
                          "{result.elevatorPitch || "Pitch generation failed."}"
                      </p>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};
