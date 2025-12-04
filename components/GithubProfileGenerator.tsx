
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { GithubProfileResult } from '../types';
import { Copy, Github, X, Check, Code, Eye, FileText } from 'lucide-react';

interface GithubProfileGeneratorProps {
  result: GithubProfileResult;
  onClose: () => void;
}

export const GithubProfileGenerator: React.FC<GithubProfileGeneratorProps> = ({ result, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'PREVIEW' | 'RAW'>('PREVIEW');

  const handleCopy = () => {
    navigator.clipboard.writeText(result.markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20 border-t border-zinc-800 mt-12 pt-12">
      
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-700 p-8 mb-8 relative overflow-hidden">
         <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono uppercase">
            Dismiss <X size={14} />
         </button>
         <div className="relative z-10">
            <h2 className="text-3xl font-serif font-bold text-white mb-2 flex items-center gap-3">
               <Github size={28} className="text-white" />
               GitHub Profile Generator
            </h2>
            <p className="text-zinc-400 font-mono text-sm leading-relaxed max-w-2xl">
               A developer's first impression. Copy this markdown into your special <code>username/username</code> repository.
            </p>
         </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-4">
          <div className="flex border border-zinc-700 bg-black rounded-md overflow-hidden p-1">
              <button 
                onClick={() => setViewMode('PREVIEW')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase transition-all rounded-sm ${viewMode === 'PREVIEW' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                <Eye size={14} /> Preview
              </button>
              <button 
                onClick={() => setViewMode('RAW')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase transition-all rounded-sm ${viewMode === 'RAW' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                <Code size={14} /> Raw Markdown
              </button>
          </div>

          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-black text-xs font-mono font-bold uppercase hover:bg-zinc-200 transition-colors rounded-sm"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy Code"}
          </button>
      </div>

      {/* Content Area - Simulated Browser/Editor Window */}
      <div className="border border-zinc-700 bg-zinc-950 rounded-lg overflow-hidden shadow-2xl">
        
        {/* Fake Window Header */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                <FileText size={12} />
                README.md
            </div>
            <div className="w-10"></div>
        </div>

        {viewMode === 'PREVIEW' ? (
            <div className="p-8 md:p-12 overflow-x-auto bg-[#0d1117]"> {/* GitHub Dark Dimmed Background */}
                <div className="markdown-body prose prose-invert max-w-none text-zinc-300">
                    {/* 
                       Note: We deliberately customize markdown-body here to reset some of the global
                       newspaper styles that interfere with standard GitHub markdown rendering 
                    */}
                    <style>{`
                        .markdown-body h1, .markdown-body h2 { border-bottom: none !important; font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif !important; }
                        .markdown-body table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                        .markdown-body th, .markdown-body td { border: 1px solid #30363d; padding: 8px; }
                        .markdown-body img { max-width: 100%; }
                        /* Ensure horizontally aligned badges work */
                        .markdown-body p[align="center"] { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; }
                    `}</style>
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>{result.markdownContent}</ReactMarkdown>
                </div>
            </div>
        ) : (
            <div className="bg-black p-0 h-full w-full overflow-hidden relative">
                <div className="absolute top-0 left-0 bottom-0 w-12 bg-zinc-900/50 border-r border-zinc-800 flex flex-col items-center pt-4 text-zinc-600 font-mono text-[10px] select-none">
                    {Array.from({length: 20}).map((_, i) => <div key={i} className="mb-1">{i+1}</div>)}
                </div>
                <textarea 
                    readOnly
                    value={result.markdownContent}
                    className="w-full h-[600px] bg-transparent text-zinc-300 font-mono text-sm p-4 pl-16 outline-none resize-none custom-scrollbar leading-relaxed"
                    spellCheck={false}
                />
            </div>
        )}
      </div>
    </div>
  );
};
