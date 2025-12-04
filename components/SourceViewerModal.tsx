import React, { useState } from 'react';
import { X, FileText, Briefcase, Database } from 'lucide-react';

interface SourceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobDescription?: string;
  resumeContent?: string; // For Solo
  candidates?: { name: string, text?: string, type: string }[]; // For Group
}

export const SourceViewerModal: React.FC<SourceViewerModalProps> = ({ isOpen, onClose, jobDescription, resumeContent, candidates }) => {
  const [activeTab, setActiveTab] = useState<'JD' | 'RESUME'>('JD');
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(0);

  const hasCandidates = candidates && candidates.length > 0;
  const hasResume = !!resumeContent;
  
  // useEffect MUST be called before any conditional returns
  React.useEffect(() => {
      if (!jobDescription && (hasResume || hasCandidates)) {
          setActiveTab('RESUME');
      }
  }, [jobDescription, hasResume, hasCandidates]);

  // Conditional return AFTER all hooks
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-black">
           <div className="flex items-center gap-3">
               <Database size={20} className="text-zinc-400" />
               <h2 className="text-lg font-serif font-bold text-white">Source Context</h2>
           </div>
           <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/50">
            {jobDescription && (
                <button 
                    onClick={() => setActiveTab('JD')}
                    className={`px-6 py-3 text-xs font-mono font-bold uppercase border-r border-zinc-800 transition-colors flex items-center gap-2 ${activeTab === 'JD' ? 'bg-black text-white border-t-2 border-t-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Briefcase size={14} /> Job Description
                </button>
            )}
            {(hasResume || hasCandidates) && (
                <button 
                    onClick={() => setActiveTab('RESUME')}
                    className={`px-6 py-3 text-xs font-mono font-bold uppercase border-r border-zinc-800 transition-colors flex items-center gap-2 ${activeTab === 'RESUME' ? 'bg-black text-white border-t-2 border-t-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <FileText size={14} /> {hasCandidates ? 'Candidates' : 'Resume Content'}
                </button>
            )}
        </div>

        {/* Content */}
        <div className="flex-grow overflow-hidden flex">
            {activeTab === 'JD' && (
                <textarea 
                    readOnly 
                    className="w-full h-full bg-black p-8 text-sm font-mono text-zinc-300 resize-none outline-none leading-relaxed"
                    value={jobDescription || "No Job Description provided."}
                />
            )}

            {activeTab === 'RESUME' && (
                <div className="w-full h-full flex flex-col md:flex-row">
                    {hasCandidates && (
                        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-900/30 overflow-y-auto">
                            {candidates?.map((c, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedCandidateIndex(i)}
                                    className={`w-full text-left p-4 border-b border-zinc-800 text-xs font-mono uppercase truncate transition-colors ${selectedCandidateIndex === i ? 'bg-white text-black font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    )}
                    
                    <div className="flex-grow h-full bg-black overflow-hidden relative">
                        <textarea 
                            readOnly 
                            className="w-full h-full bg-transparent p-8 text-sm font-mono text-zinc-300 resize-none outline-none leading-relaxed"
                            value={
                                hasCandidates 
                                ? (candidates![selectedCandidateIndex]?.text || `[File Uploaded: ${candidates![selectedCandidateIndex]?.type === 'FILE' ? 'Binary File' : 'Text'}]`) 
                                : (resumeContent || "No text content available (File upload).")
                            }
                        />
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
