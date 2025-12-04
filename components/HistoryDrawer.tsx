import React from 'react';
import { X, Clock, ChevronRight, Trash2, Users, User } from 'lucide-react';
import { AnalysisResult, ComparisonResult } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: (AnalysisResult | ComparisonResult)[];
  onSelect: (result: AnalysisResult | ComparisonResult) => void;
  onClear: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ isOpen, onClose, history, onSelect, onClear }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
           <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
             <Clock size={20} />
             Session History
           </h2>
           <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
             <X size={24} />
           </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-4">
           {history.length === 0 ? (
             <div className="text-center py-20 text-zinc-600 font-mono text-sm">
               No past audits found.
             </div>
           ) : (
             history.map((item, idx) => {
               const isSolo = 'overallScore' in item;
               
               return (
                <button
                    key={item.timestamp || idx}
                    onClick={() => { onSelect(item); onClose(); }}
                    className="w-full text-left border border-zinc-800 bg-black hover:border-white hover:bg-zinc-900 p-4 transition-all group relative overflow-hidden"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 overflow-hidden pr-2">
                            {isSolo ? <User size={14} className="text-zinc-500 shrink-0" /> : <Users size={14} className="text-zinc-500 shrink-0" />}
                            <span className="font-serif font-bold text-white text-lg truncate">
                                {isSolo ? (item as AnalysisResult).roastHeadline : "Group Comparison"}
                            </span>
                        </div>
                        {isSolo ? (
                             <span className={`text-xs font-mono font-bold px-2 py-0.5 border shrink-0 ${(item as AnalysisResult).overallScore > 70 ? 'border-green-800 text-green-500' : 'border-red-800 text-red-500'}`}>
                                {(item as AnalysisResult).overallScore}
                            </span>
                        ) : (
                            <span className="text-xs font-mono font-bold px-2 py-0.5 border border-purple-800 text-purple-500 shrink-0">
                                TEAM
                            </span>
                        )}
                    </div>
                    
                    {!isSolo && (
                         <p className="text-xs text-zinc-400 italic mb-3 truncate">
                            "{(item as ComparisonResult).summary}"
                         </p>
                    )}

                    <p className="text-xs text-zinc-500 font-mono mb-3">
                        {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                    <div className="flex items-center text-xs font-mono text-zinc-400 group-hover:text-white uppercase tracking-widest gap-2">
                        Review Analysis <ChevronRight size={12} />
                    </div>
                </button>
               );
             })
           )}
        </div>

        {history.length > 0 && (
          <div className="p-6 border-t border-zinc-800 bg-zinc-900/30">
            <button 
              onClick={onClear}
              className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-400 text-xs font-mono uppercase tracking-widest py-3 border border-red-900/30 hover:border-red-900 hover:bg-red-950/20 transition-all"
            >
              <Trash2 size={14} />
              Clear History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};