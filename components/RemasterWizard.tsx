import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { RemasterInput, RemasterResult, GitHubRepo } from '../types';
import { ArrowRight, Scissors, PenTool, Check, Copy, Download, Printer, Loader2, FileText, Edit3, Eye, X, Github, RefreshCw, CheckCircle, Square, AlertCircle } from 'lucide-react';
import * as docx from 'docx';
import saveAs from 'file-saver';
import { listGitHubRepos, processSelectedRepos } from '../services/githubService';

interface RemasterWizardProps {
  onRemaster: (input: RemasterInput) => Promise<RemasterResult | null>;
  result: RemasterResult | null;
  onClose: () => void;
}

export const RemasterWizard: React.FC<RemasterWizardProps> = ({ onRemaster, result, onClose }) => {
  const [isForging, setIsForging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState<RemasterInput>({
    extraProjects: '',
    achievements: '',
    links: ''
  });

  // GitHub State
  const [githubUsername, setGithubUsername] = useState('');
  const [isFetchingList, setIsFetchingList] = useState(false);
  const [isProcessingRepos, setIsProcessingRepos] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [repoList, setRepoList] = useState<GitHubRepo[]>([]);
  const [showRepoSelector, setShowRepoSelector] = useState(false);

  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');

  // Sync result to editable content when result changes
  useEffect(() => {
    if (result && result.markdownContent) {
      setEditableContent(result.markdownContent);
    } else {
        setEditableContent('');
    }
  }, [result]);

  const handleSubmit = async () => {
    setIsForging(true);
    setError(null);
    try {
        await onRemaster(input);
    } catch (e: any) {
        console.error("Remaster failed", e);
        setError(e.message || "An unexpected error occurred during remastering.");
    } finally {
        setIsForging(false);
    }
  };

  const handleFetchRepos = async () => {
      if (!githubUsername) return;
      setIsFetchingList(true);
      setGithubError(null);
      setRepoList([]);
      
      try {
          const repos = await listGitHubRepos(githubUsername);
          setRepoList(repos);
          setShowRepoSelector(true);
      } catch (err: any) {
          setGithubError(err.message);
      } finally {
          setIsFetchingList(false);
      }
  };

  const toggleRepoSelection = (id: number) => {
      setRepoList(prev => prev.map(r => 
          r.id === id ? { ...r, selected: !r.selected } : r
      ));
  };

  const handleImportSelected = async () => {
      const selected = repoList.filter(r => r.selected);
      if (selected.length === 0) return;

      setIsProcessingRepos(true);
      try {
          const projectText = await processSelectedRepos(githubUsername, selected);
          setInput(prev => ({
              ...prev,
              extraProjects: (prev.extraProjects ? prev.extraProjects + "\n\n" : "") + `[IMPORTED FROM GITHUB]:\n${projectText}`
          }));
          setShowRepoSelector(false); // Close selector on success
      } catch (err: any) {
          setGithubError(err.message);
      } finally {
          setIsProcessingRepos(false);
      }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableContent);
  };

  const handleDownloadMD = () => {
    const blob = new Blob([editableContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'remastered_resume.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    setIsEditing(false); // Force view mode
    // Small delay to ensure React renders the view mode before printing
    setTimeout(() => window.print(), 100);
  };

  const handleDownloadDOCX = async () => {
    if (!editableContent) return;
    
    // Simple Markdown to Docx parser
    const lines = (editableContent || '').split('\n');
    const docChildren = [];

    for (let line of lines) {
        line = line.trim();
        if (!line) {
            docChildren.push(new docx.Paragraph({ text: "" }));
            continue;
        }

        if (line.startsWith('# ')) {
            docChildren.push(new docx.Paragraph({
                text: line.replace('# ', ''),
                heading: docx.HeadingLevel.HEADING_1,
                spacing: { before: 200, after: 100 }
            }));
        } else if (line.startsWith('## ')) {
            docChildren.push(new docx.Paragraph({
                text: line.replace('## ', ''),
                heading: docx.HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
                border: { bottom: { color: "000000", space: 1, style: docx.BorderStyle.SINGLE, size: 6 } }
            }));
        } else if (line.startsWith('### ')) {
            docChildren.push(new docx.Paragraph({
                text: line.replace('### ', ''),
                heading: docx.HeadingLevel.HEADING_3,
                spacing: { before: 100, after: 50 }
            }));
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
            const content = line.replace(/^[-*] /, '');
            const parts = content.split(/(\*\*.*?\*\*)/g);
            
            const textRuns = parts.map(part => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return new docx.TextRun({ text: part.slice(2, -2), bold: true });
                }
                return new docx.TextRun({ text: part });
            });

            docChildren.push(new docx.Paragraph({
                children: textRuns,
                bullet: { level: 0 }
            }));
        } else {
            const parts = line.split(/(\*\*.*?\*\*)/g);
            const textRuns = parts.map(part => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return new docx.TextRun({ text: part.slice(2, -2), bold: true });
                }
                return new docx.TextRun({ text: part });
            });

            docChildren.push(new docx.Paragraph({ children: textRuns }));
        }
    }

    const doc = new docx.Document({
        sections: [{
            properties: {},
            children: docChildren,
        }],
        styles: {
            paragraphStyles: [
                {
                    id: "Normal",
                    name: "Normal",
                    run: {
                        font: "Calibri",
                        size: 22,
                    },
                    paragraph: {
                        spacing: { line: 240 },
                    },
                },
            ],
        },
    });

    const blob = await docx.Packer.toBlob(doc);
    saveAs(blob, "remastered_resume.docx");
  };

  // INPUT VIEW
  if (!result) {
    return (
      <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 mt-12 pt-12 border-t border-zinc-800">
        <div className="border border-white/20 bg-background">
          <div className="p-8 border-b border-white/20 flex justify-between items-start">
            <div>
                <h2 className="text-3xl font-serif font-bold text-white mb-2">Supplemental Evidence</h2>
                <p className="text-zinc-500 font-mono text-sm leading-relaxed">
                The AI will reconstruct your resume. Provide any missing data, Github links, or recent wins.
                </p>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono uppercase">
                Dismiss <X size={14} />
            </button>
          </div>

          <div className="p-8 space-y-8">
            
            {/* GITHUB SYNC WIDGET */}
            <div className="bg-zinc-900/50 border border-zinc-700 p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Github size={16} className="text-white" />
                        <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">GitHub Import V4</span>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Username (e.g., acharya-aayush)"
                        value={githubUsername}
                        onChange={(e) => setGithubUsername(e.target.value)}
                        className="bg-black border border-zinc-700 px-3 py-2 text-sm text-white focus:border-white outline-none font-mono flex-grow"
                        onKeyDown={(e) => e.key === 'Enter' && handleFetchRepos()}
                    />
                    <button 
                        onClick={handleFetchRepos}
                        disabled={isFetchingList || !githubUsername}
                        className="bg-white text-black px-4 py-2 text-xs font-mono font-bold uppercase hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isFetchingList ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14} />}
                        Fetch
                    </button>
                </div>
                {githubError && <p className="text-red-500 text-[10px] font-mono mt-2">{githubError}</p>}

                {/* REPO SELECTOR GRID */}
                {showRepoSelector && repoList.length > 0 && (
                    <div className="mt-4 border-t border-zinc-800 pt-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-mono uppercase text-zinc-500">Select repos to import (Max 5 recommended)</span>
                            <button 
                                onClick={handleImportSelected} 
                                disabled={isProcessingRepos || !repoList.some(r => r.selected)}
                                className="text-xs font-bold font-mono uppercase bg-green-600 text-white px-3 py-1 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isProcessingRepos ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                Import Selected
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {repoList.map((repo) => (
                                <div 
                                    key={repo.id}
                                    onClick={() => toggleRepoSelection(repo.id)}
                                    className={`p-3 border cursor-pointer transition-all group flex items-start gap-3
                                        ${repo.selected 
                                            ? 'border-white bg-zinc-800' 
                                            : 'border-zinc-800 bg-black hover:border-zinc-600'
                                        }`}
                                >
                                    <div className={`mt-1 ${repo.selected ? 'text-green-500' : 'text-zinc-600'}`}>
                                        {repo.selected ? <CheckCircle size={16} /> : <Square size={16} />}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="text-sm font-bold text-white truncate">{repo.name}</h4>
                                        <p className="text-[10px] text-zinc-500 font-mono mt-1 truncate">{repo.language} • {repo.stars} Stars</p>
                                        <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">{repo.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <PenTool size={14} />
                New Projects / Side Hustles
              </label>
              <textarea
                value={input.extraProjects}
                onChange={(e) => setInput({ ...input, extraProjects: e.target.value })}
                className="w-full h-32 bg-black border border-zinc-700 p-4 text-sm text-zinc-300 focus:border-white focus:ring-0 outline-none transition-all resize-none font-mono placeholder:text-zinc-800"
                placeholder="// Manual entry or auto-filled from GitHub..."
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono font-bold text-white uppercase tracking-widest">Notable Achievements / Awards</label>
              <textarea
                value={input.achievements}
                onChange={(e) => setInput({ ...input, achievements: e.target.value })}
                className="w-full h-24 bg-black border border-zinc-700 p-4 text-sm text-zinc-300 focus:border-white focus:ring-0 outline-none transition-all resize-none font-mono placeholder:text-zinc-800"
                placeholder="// Won a hackathon? Employee of the month? Increased efficiency by 200%?"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono font-bold text-white uppercase tracking-widest">Important Links</label>
              <input
                type="text"
                value={input.links}
                onChange={(e) => setInput({ ...input, links: e.target.value })}
                className="w-full bg-black border border-zinc-700 p-4 text-sm text-zinc-300 focus:border-white focus:ring-0 outline-none transition-all font-mono placeholder:text-zinc-800"
                placeholder="github.com/you, linkedin.com/in/you, portfolio.com"
              />
            </div>
          </div>

          <div className="p-8 border-t border-white/20 flex flex-col items-end gap-4 bg-zinc-900/30">
            {error && (
                <div className="w-full p-4 border border-red-900 bg-red-950/20 text-red-400 text-xs font-mono flex items-center gap-2">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}
            
            <div className="flex gap-4">
                <button 
                onClick={onClose}
                disabled={isForging}
                className="px-6 py-3 text-xs font-mono font-bold uppercase text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
                >
                Cancel
                </button>
                <button
                onClick={handleSubmit}
                disabled={isForging}
                className="px-8 py-3 bg-white text-black text-xs font-mono font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed"
                >
                {isForging ? (
                    <>
                        <Loader2 className="animate-spin" size={14} />
                        Forging...
                    </>
                ) : (
                    <>
                        Forge New Resume
                        <ArrowRight size={14} />
                    </>
                )}
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RESULT VIEW
  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-700 pb-20 mt-12 pt-12 border-t border-zinc-800">
       <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-white pb-6 gap-4 no-print">
          <div>
            <h2 className="text-4xl font-serif font-bold text-white">The Typeset Proof</h2>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-2">ATS Optimized • Fact-Checked • Streamlined</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
            {/* View Toggle */}
            <div className="flex border border-zinc-700 bg-black">
                <button
                    onClick={() => setIsEditing(false)}
                    className={`px-4 py-2 text-xs font-mono font-bold uppercase flex items-center gap-2 transition-colors ${!isEditing ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                    <Eye size={14} /> Preview
                </button>
                <button
                    onClick={() => setIsEditing(true)}
                    className={`px-4 py-2 text-xs font-mono font-bold uppercase flex items-center gap-2 transition-colors ${isEditing ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                    <Edit3 size={14} /> Edit
                </button>
            </div>

            <div className="h-6 w-px bg-zinc-800 hidden md:block"></div>

            <div className="flex flex-wrap gap-3">
                <button 
                onClick={onClose}
                className="px-4 py-2 border border-zinc-700 text-zinc-400 text-xs font-mono font-bold uppercase hover:border-white hover:text-white transition-all"
                >
                Dismiss
                </button>
                
                <button 
                onClick={handlePrintPDF}
                className="px-4 py-2 border border-zinc-700 text-white text-xs font-mono font-bold uppercase hover:border-white hover:bg-white/5 transition-all flex items-center gap-2"
                >
                <Printer size={14} />
                Save PDF
                </button>

                <button 
                onClick={handleDownloadMD}
                className="px-4 py-2 border border-zinc-700 text-white text-xs font-mono font-bold uppercase hover:border-white hover:bg-white/5 transition-all flex items-center gap-2"
                >
                <Download size={14} />
                .MD
                </button>

                <button 
                onClick={handleDownloadDOCX}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-mono font-bold uppercase flex items-center gap-2 hover:bg-blue-700 transition-colors border border-blue-500"
                >
                <FileText size={14} />
                Export DOCX
                </button>
                
                <button 
                onClick={handleCopy}
                className="px-4 py-2 bg-white text-black text-xs font-mono font-bold uppercase flex items-center gap-2 hover:bg-zinc-200 transition-colors"
                >
                <Copy size={14} />
                Copy
                </button>
            </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Resume Content - ADDED .print-force CLASS */}
          <div className="print-force lg:col-span-8 bg-zinc-900/50 border border-zinc-800 p-8 md:p-12 min-h-[800px]">
            {isEditing ? (
                <textarea 
                    value={editableContent}
                    onChange={(e) => setEditableContent(e.target.value)}
                    className="w-full h-[700px] bg-transparent text-zinc-200 font-mono text-sm leading-relaxed outline-none border-none resize-none selection:bg-white/20"
                    spellCheck={false}
                />
            ) : (
                <div className="prose prose-invert prose-headings:font-serif prose-p:font-sans prose-li:font-sans max-w-none markdown-body">
                <ReactMarkdown>{editableContent}</ReactMarkdown>
                </div>
            )}
          </div>

          {/* Sidebar - The Cuts */}
          <div className="lg:col-span-4 space-y-8 no-print">
            <div className="border border-zinc-700 bg-background p-6">
              <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                <Check size={18} className="text-white" />
                <h3 className="font-serif font-bold text-white text-lg">Enhancements</h3>
              </div>
              <ul className="space-y-4">
                {(result.improvementsMade || []).map((item, i) => (
                  <li key={i} className="text-sm text-zinc-400 leading-relaxed pl-4 border-l border-zinc-800">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-zinc-700 bg-background p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Scissors size={100} className="text-white" />
              </div>
              
              <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4 relative z-10">
                <Scissors size={18} className="text-white" />
                <h3 className="font-serif font-bold text-white text-lg">Cutting Room Floor</h3>
              </div>
              
              <div className="space-y-6 relative z-10">
                {(result.cutReport || []).map((cut, i) => (
                  <div key={i} className="group">
                    <p className="text-xs font-mono text-zinc-600 uppercase tracking-wide mb-1">Removed</p>
                    <p className="text-zinc-500 line-through italic text-sm mb-2 decoration-zinc-700">"{cut.text}"</p>
                    <p className="text-xs text-white border-l-2 border-white pl-3 py-1">
                      {cut.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
       </div>
    </div>
  );
};