import React, { useState } from 'react';
import { ComparisonResult } from '../types';
import { Trophy, Crown, Target, List, Grid3X3, Users, Star, ShieldAlert, FileText } from 'lucide-react';
import { SourceViewerModal } from './SourceViewerModal';

interface ComparatorViewProps {
  result: ComparisonResult;
  onReset: () => void;
}

export const ComparatorView: React.FC<ComparatorViewProps> = ({ result, onReset }) => {
  const [viewMode, setViewMode] = useState<'LIST' | 'MATRIX'>('LIST');
  const [showSource, setShowSource] = useState(false);
  const winner = result.leaderboard?.[0];

  return (
    <div className="w-full max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      <SourceViewerModal 
          isOpen={showSource} 
          onClose={() => setShowSource(false)} 
          jobDescription={result.jobDescription} 
          candidates={result.candidateData}
      />
      
      {/* Header */}
      <div className="text-center mb-12 relative border-b-4 border-white pb-8">
        <div className="absolute top-0 right-0 flex gap-4">
            <button onClick={() => setShowSource(true)} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono uppercase tracking-widest"><FileText size={14} /> Context</button>
            <div className="flex border border-zinc-700 bg-black rounded-sm overflow-hidden p-0">
                <button onClick={() => setViewMode('LIST')} className={`p-2 transition-all ${viewMode === 'LIST' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}><List size={16} /></button>
                <button onClick={() => setViewMode('MATRIX')} className={`p-2 transition-all ${viewMode === 'MATRIX' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}><Grid3X3 size={16} /></button>
            </div>
            <button onClick={onReset} className="text-zinc-500 hover:text-white border border-transparent hover:border-zinc-700 px-3 py-1 text-xs font-mono uppercase">Reset</button>
        </div>
        <h2 className="text-5xl font-serif font-bold text-white mb-4">Talent Benchmark</h2>
        <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest">Top Pick: <span className="text-white font-bold border-b border-white">{winner?.candidateName || 'Unknown'}</span></p>
      </div>

      <div className="bg-black border border-zinc-700 p-8 mb-12"><p className="text-xl font-serif text-zinc-300 italic border-l-2 border-white pl-6">"{result.summary}"</p></div>

      {viewMode === 'LIST' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
             <div className="lg:col-span-6 space-y-6">
                 <h3 className="font-serif font-bold text-2xl text-white border-b border-zinc-800 pb-4">Leaderboard</h3>
                 <div className="space-y-4">
                     {(result.leaderboard || []).map((candidate, idx) => (
                        <div key={idx} className={`border transition-all ${idx === 0 ? 'border-white bg-zinc-900' : 'border-zinc-800 bg-black'}`}>
                            <div className="p-4 flex items-start gap-4">
                                <div className={`text-2xl font-bold font-serif ${idx === 0 ? 'text-white' : 'text-zinc-600'}`}>#{candidate.rank}</div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="font-bold uppercase font-mono text-sm text-white">{candidate.candidateName}</h4>
                                        <span className="text-xs font-mono font-bold px-2 py-0.5 bg-black border border-zinc-700 text-white">{candidate.score}</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 leading-snug">{candidate.reason}</p>
                                </div>
                                {idx === 0 && <Crown size={18} className="text-white shrink-0" />}
                            </div>
                        </div>
                     ))}
                 </div>
             </div>
             <div className="lg:col-span-6 space-y-8">
                <h3 className="font-serif font-bold text-2xl text-white border-b border-zinc-800 pb-4">Category Matrix</h3>
                 <div className="grid gap-6">
                     {(result.categoryBreakdown || []).map((cat, idx) => (
                         <div key={idx} className="border border-zinc-800 bg-zinc-900/10 p-5">
                             <h4 className="text-sm font-mono font-bold text-zinc-400 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">{cat.category}</h4>
                             <div className="space-y-4">
                                 {(cat.rankings || []).map((rank, rIdx) => (
                                     <div key={rIdx} className="flex items-center gap-3 text-sm">
                                         <span className={`font-mono text-xs w-6 ${rIdx === 0 ? 'text-white' : 'text-zinc-600'}`}>#{rank.rank}</span>
                                         <span className="font-bold text-zinc-300 w-1/3 truncate">{rank.candidateName}</span>
                                         <div className="flex-grow h-1 bg-zinc-800"><div className={`h-full ${rIdx === 0 ? 'bg-white' : 'bg-zinc-600'}`} style={{ width: `${rank.score}%` }}></div></div>
                                         <span className="font-mono text-xs text-zinc-500 w-8 text-right">{rank.score}</span>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
          </div>
      ) : (
          <div className="overflow-x-auto pb-8">
              <table className="w-full border-collapse">
                  <thead>
                      <tr>
                          <th className="p-4 text-left border border-zinc-800 bg-zinc-900/50 w-64"><span className="text-xs font-mono uppercase text-zinc-500">Candidate</span></th>
                          <th className="p-4 text-center border border-zinc-800 bg-black w-32"><span className="text-xs font-mono uppercase text-white font-bold">Total</span></th>
                          {(result.categoryBreakdown || []).map((cat, idx) => (<th key={idx} className="p-4 text-center border border-zinc-800 bg-zinc-900/50"><span className="text-xs font-mono uppercase text-zinc-400">{cat.category}</span></th>))}
                      </tr>
                  </thead>
                  <tbody>
                      {(result.leaderboard || []).map((candidate, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-zinc-900/30 transition-colors">
                              <td className="p-4 border border-zinc-800 bg-zinc-950 font-bold font-mono text-sm text-white">{candidate.candidateName}</td>
                              <td className="p-4 border border-zinc-800 text-center bg-zinc-950 text-white font-bold font-serif text-xl">{candidate.score}</td>
                              {(result.categoryBreakdown || []).map((cat, colIdx) => {
                                  const rankData = cat.rankings.find(r => r.candidateName === candidate.candidateName);
                                  return (
                                      <td key={colIdx} className="p-2 border border-zinc-800 text-center">
                                          <div className="text-lg font-bold font-serif text-zinc-300">{rankData?.score || 0}</div>
                                      </td>
                                  );
                              })}
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      )}

      {/* INTEGRATED DREAM TEAM SECTION */}
      {result.dreamTeamAnalysis && (
        <div className="mt-16 pt-12 border-t-4 border-white">
            <div className="flex items-center gap-4 mb-8">
                <Users size={32} className="text-white" />
                <div>
                    <h3 className="text-3xl font-serif font-bold text-white">Dream Team Synergy</h3>
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Squad Name: {result.dreamTeamAnalysis.squadName}</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 border border-zinc-800 bg-zinc-900/20 p-8">
                    <h4 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-6">Selected Operatives</h4>
                    <div className="space-y-4">
                        {result.dreamTeamAnalysis.roles.map((role, idx) => (
                            <div key={idx} className="flex gap-4 p-4 border border-zinc-800 bg-black">
                                <div className="w-8 h-8 flex items-center justify-center border border-zinc-700 text-white font-serif font-bold">{idx + 1}</div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-white">{role.name}</span>
                                        <span className="text-[10px] font-mono border border-zinc-700 px-1 text-zinc-400">{role.role}</span>
                                    </div>
                                    <p className="text-sm text-zinc-400">{role.contribution}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-5 space-y-6">
                    <div className="border border-zinc-800 p-6 bg-black">
                         <h4 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Star size={14} /> Rationale</h4>
                         <p className="text-zinc-300 italic font-serif leading-relaxed">"{result.dreamTeamAnalysis.rationale}"</p>
                    </div>
                    <div className="border border-zinc-800 p-6 bg-black">
                         <h4 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2"><ShieldAlert size={14} /> Collective Risks</h4>
                         <ul className="space-y-2">
                             {result.dreamTeamAnalysis.collectiveWeaknesses.map((w, i) => (
                                 <li key={i} className="text-sm text-zinc-400 border-l border-zinc-800 pl-3">{w}</li>
                             ))}
                         </ul>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};