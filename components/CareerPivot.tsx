import React from 'react';
import { PivotResult } from '../types';
import { X, Compass, TrendingUp, AlertCircle, DollarSign, Activity, Loader2, ArrowRight, BarChart, Hammer, ArrowDownRight, Target } from 'lucide-react';

interface CareerPivotProps {
  result: PivotResult;
  onClose: () => void;
  onGetRoadmap: (role: string) => void;
  loadingRole: string | null;
}

export const CareerPivot: React.FC<CareerPivotProps> = ({ result, onClose, onGetRoadmap, loadingRole }) => {
  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20 border-t border-zinc-800 mt-12 pt-12">
      
      {/* Newspaper Header */}
      <div className="bg-black border-y-4 border-white p-8 mb-12 relative">
         <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
         </button>
         <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-2 flex items-center gap-4 tracking-tighter">
                   THE PIVOT
                </h2>
                <p className="text-zinc-400 font-mono text-sm leading-relaxed max-w-2xl uppercase tracking-widest border-t border-zinc-800 pt-2 mt-2">
                   Strategic Role Realignment & Skill Gap Analysis
                </p>
            </div>
            <div className="text-right hidden md:block">
                 <div className="text-xs font-mono text-zinc-500 uppercase">Vol. 4</div>
                 <div className="text-white font-serif italic">"Adapt or Perish"</div>
            </div>
         </div>
      </div>

      <div className="grid md:grid-cols-3 gap-0 border-l border-zinc-800">
        {(result.options || []).map((option, idx) => (
            <div key={idx} className="border-r border-b border-zinc-800 bg-black flex flex-col h-full hover:bg-zinc-900/10 transition-colors group relative">
                
                {/* Stamp Badge */}
                <div className="absolute top-0 right-0 p-4">
                     <span className={`text-[10px] font-mono font-bold px-2 py-1 uppercase border border-white ${
                        option.marketOutlook === 'HIGH_GROWTH' ? 'bg-white text-black' :
                        option.marketOutlook === 'SATURATED' ? 'bg-black text-white decoration-line-through' :
                        'bg-zinc-800 text-zinc-300'
                    }`}>
                        {option.marketOutlook?.replace('_', ' ')}
                    </span>
                </div>

                {/* Card Header */}
                <div className="p-8 pb-4">
                    <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-4">Option 0{idx+1}</span>
                    
                    <h3 className="text-3xl font-serif font-bold text-white mb-2 leading-none group-hover:underline decoration-1 underline-offset-4">
                        {option.role}
                    </h3>
                    <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs mt-3 border-b border-zinc-800 pb-4">
                        <DollarSign size={12} />
                        {option.salaryRange}
                    </div>
                </div>

                <div className="p-8 pt-4 flex-grow space-y-8">
                    
                    {/* The Logic - Why it Fits */}
                    <div className="space-y-3">
                         <div className="flex items-center gap-2 mb-2">
                            <Target size={12} className="text-white" />
                            <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">
                                The Logic (Why This Role?)
                            </span>
                         </div>
                         <p className="text-sm text-zinc-400 italic leading-relaxed border-l-2 border-zinc-700 pl-4">
                            "{option.whyItFits}"
                         </p>
                    </div>

                    {/* The Translation Layer - HIGH VALUE FEATURE */}
                    <div className="space-y-3">
                         <div className="flex items-center gap-2 mb-2">
                            <Activity size={12} className="text-white" />
                            <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">
                                Resume Translation
                            </span>
                         </div>
                         
                         <div className="bg-zinc-900/30 border border-zinc-800 p-0">
                            {/* Original */}
                            <div className="p-4 border-b border-zinc-800 bg-black/50">
                                <span className="text-[9px] font-mono text-zinc-600 uppercase block mb-1">Current (Weak)</span>
                                <p className="text-zinc-500 font-serif italic text-sm line-through decoration-zinc-700">
                                    "{option.translationLayer?.original || "Standard experience..."}"
                                </p>
                            </div>
                            
                            {/* Translated */}
                            <div className="p-4 bg-white/5 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-white"></div>
                                <span className="text-[9px] font-mono text-white uppercase block mb-1">Pivot (Strong)</span>
                                <p className="text-white font-bold text-sm leading-relaxed">
                                    "{option.translationLayer?.adapted || "Strategic experience..."}"
                                </p>
                            </div>
                         </div>
                    </div>

                    {/* Bridge Project */}
                    <div className="space-y-3">
                         <div className="flex items-center gap-2 mb-2">
                            <Hammer size={12} className="text-white" />
                            <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">
                                Bridge Project
                            </span>
                         </div>
                         <div className="p-4 border border-dashed border-zinc-700 bg-transparent relative">
                             <p className="text-zinc-300 text-sm leading-relaxed font-mono text-xs">
                                {option.bridgeProject || option.gapAnalysis}
                             </p>
                         </div>
                    </div>

                    {/* Difficulty Meter */}
                    <div className="pt-4 border-t border-zinc-800">
                         <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">
                             <span>Pivot Difficulty</span>
                             <span>{option.fitScore}% Match</span>
                         </div>
                         <div className="h-1 w-full bg-zinc-800">
                             <div 
                                className="h-full bg-white" 
                                style={{ width: `${option.fitScore}%` }}
                             ></div>
                         </div>
                    </div>
                </div>
                
                <button 
                    onClick={() => onGetRoadmap(option.role)}
                    disabled={loadingRole !== null}
                    className="w-full py-4 border-t border-zinc-800 hover:bg-white hover:text-black transition-all text-xs font-mono font-bold uppercase flex items-center justify-center gap-2 group/btn"
                >
                    {loadingRole === option.role ? (
                            <><Loader2 size={14} className="animate-spin" /> Initializing...</>
                    ) : (
                            <>
                            Generate Roadmap 
                            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                            </>
                    )}
                </button>
            </div>
        ))}
      </div>
    </div>
  );
};