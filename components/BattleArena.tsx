
import React from 'react';
import { BattleResult } from '../types';
import { Trophy, Swords, AlertCircle, CheckCircle, Crown, Scale } from 'lucide-react';

interface BattleArenaProps {
  result: BattleResult;
  onReset: () => void;
}

export const BattleArena: React.FC<BattleArenaProps> = ({ result, onReset }) => {
  return (
    <div className="w-full max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="text-center mb-12 relative border-b-4 border-white pb-8">
        <button 
            onClick={onReset}
            className="absolute top-0 right-0 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono uppercase tracking-widest"
        >
             Reset Arena
        </button>

        <div className="inline-flex items-center justify-center p-4 bg-zinc-900 border border-zinc-700 rounded-full mb-6">
            <Swords size={32} className="text-white animate-pulse" />
        </div>
        <h2 className="text-5xl font-serif font-bold text-white mb-4">The Arena Verdict</h2>
        <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest">
           {result.resume1Name} <span className="text-red-500 px-2">VS</span> {result.resume2Name}
        </p>
      </div>

      {/* Main Verdict Card */}
      <div className="bg-gradient-to-b from-zinc-900 to-black border border-zinc-700 p-8 md:p-12 mb-12 text-center relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
         
         <div className="relative z-10">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 block">The Undisputed Winner</span>
            <div className="flex items-center justify-center gap-4 mb-6">
                <Crown size={40} className="text-yellow-500" />
                <h3 className="text-4xl md:text-5xl font-serif font-bold text-white">
                    {result.overallWinner === 'resume1' ? result.resume1Name : result.overallWinner === 'resume2' ? result.resume2Name : "It's a Tie"}
                </h3>
                <Crown size={40} className="text-yellow-500" />
            </div>
            <p className="text-xl font-serif text-zinc-300 italic max-w-3xl mx-auto leading-relaxed border-t border-zinc-800 pt-6 mt-6">
                "{result.verdict}"
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         {/* Head to Head Stats */}
         <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-2">
                <Scale size={20} className="text-white" />
                <h4 className="font-serif font-bold text-2xl text-white">Tale of the Tape</h4>
            </div>

            {(result.headToHead || []).map((cat, idx) => (
                <div key={idx} className="bg-zinc-900/30 border border-zinc-800 p-6 relative">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{cat.category}</span>
                        <div className="flex items-center gap-2">
                            {cat.winner === 'resume1' && <Trophy size={14} className="text-yellow-500" />}
                            <span className={`text-sm font-bold ${cat.winner === 'resume1' ? 'text-white' : 'text-zinc-600'}`}>
                                {cat.resume1Score}
                            </span>
                            <span className="text-zinc-700">|</span>
                            <span className={`text-sm font-bold ${cat.winner === 'resume2' ? 'text-white' : 'text-zinc-600'}`}>
                                {cat.resume2Score}
                            </span>
                            {cat.winner === 'resume2' && <Trophy size={14} className="text-yellow-500" />}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-zinc-800 w-full flex mb-3">
                        <div 
                            className="h-full bg-white transition-all duration-1000" 
                            style={{ width: `${cat.resume1Score}%`, opacity: cat.winner === 'resume1' ? 1 : 0.3 }}
                        ></div>
                        <div className="w-1 bg-black"></div>
                        <div 
                            className="h-full bg-white transition-all duration-1000 ml-auto" 
                            style={{ width: `${cat.resume2Score}%`, opacity: cat.winner === 'resume2' ? 1 : 0.3 }}
                        ></div>
                    </div>

                    <p className="text-xs text-zinc-400 italic border-l-2 border-zinc-700 pl-3">
                        {cat.reason}
                    </p>
                </div>
            ))}
         </div>

         {/* Strengths & Weaknesses */}
         <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
                {/* Resume 1 Column */}
                <div className="border border-zinc-800 bg-zinc-900/10 p-4">
                    <h5 className="font-mono text-xs text-white uppercase font-bold border-b border-zinc-800 pb-2 mb-4 text-center">
                        {result.resume1Name}
                    </h5>
                    
                    <div className="mb-6">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-2">Unique Strengths</span>
                        <ul className="space-y-2">
                            {(result.resume1UniqueStrengths || []).map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-green-400">
                                    <CheckCircle size={10} className="mt-0.5 shrink-0" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-2">Weaknesses</span>
                        <ul className="space-y-2">
                            {(result.resume1Weaknesses || []).map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-red-400">
                                    <AlertCircle size={10} className="mt-0.5 shrink-0" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Resume 2 Column */}
                <div className="border border-zinc-800 bg-zinc-900/10 p-4">
                    <h5 className="font-mono text-xs text-white uppercase font-bold border-b border-zinc-800 pb-2 mb-4 text-center">
                        {result.resume2Name}
                    </h5>
                    
                    <div className="mb-6">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-2">Unique Strengths</span>
                        <ul className="space-y-2">
                            {(result.resume2UniqueStrengths || []).map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-green-400">
                                    <CheckCircle size={10} className="mt-0.5 shrink-0" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-2">Weaknesses</span>
                        <ul className="space-y-2">
                            {(result.resume2Weaknesses || []).map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-red-400">
                                    <AlertCircle size={10} className="mt-0.5 shrink-0" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Common Ground */}
            <div className="border border-zinc-700 bg-zinc-900 p-6">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 block text-center">Common Ground</span>
                <div className="flex flex-wrap justify-center gap-2">
                    {(result.commonStrengths || []).map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-mono border border-zinc-700 rounded-full">
                            {s}
                        </span>
                    ))}
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};
