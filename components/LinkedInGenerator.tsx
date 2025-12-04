
import React, { useState } from 'react';
import { LinkedInProfile } from '../types';
import { Copy, Linkedin, Check, X, Briefcase, User } from 'lucide-react';

interface LinkedInGeneratorProps {
  result: LinkedInProfile;
  onClose: () => void;
}

export const LinkedInGenerator: React.FC<LinkedInGeneratorProps> = ({ result, onClose }) => {
  const [activeTab, setActiveTab] = useState<'HEADLINE' | 'ABOUT' | 'EXP'>('HEADLINE');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20 border-t border-zinc-800 mt-12 pt-12">
      
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-700 p-8 mb-0 relative overflow-hidden">
         <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono uppercase">
            Dismiss <X size={14} />
         </button>
         <div className="relative z-10">
            <h2 className="text-3xl font-serif font-bold text-white mb-2 flex items-center gap-3">
               <Linkedin size={28} className="text-blue-500" />
               LinkedIn Ghostwriter
            </h2>
            <p className="text-zinc-400 font-mono text-sm leading-relaxed max-w-2xl">
               Personal Branding Pack. Optimized for algorithm reach and recruiter engagement.
            </p>
         </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-zinc-700 bg-black">
        <button 
            onClick={() => setActiveTab('HEADLINE')}
            className={`px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2 border-r border-zinc-800 hover:bg-zinc-900 transition-colors ${activeTab === 'HEADLINE' ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}
        >
            Headlines
        </button>
        <button 
            onClick={() => setActiveTab('ABOUT')}
            className={`px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2 border-r border-zinc-800 hover:bg-zinc-900 transition-colors ${activeTab === 'ABOUT' ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}
        >
            About Section
        </button>
        <button 
            onClick={() => setActiveTab('EXP')}
            className={`px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2 border-r border-zinc-800 hover:bg-zinc-900 transition-colors ${activeTab === 'EXP' ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}
        >
            Experience Rewrite
        </button>
      </div>

      {/* Content Area */}
      <div className="border-x border-b border-zinc-700 bg-zinc-900/30 p-8 min-h-[300px]">
        
        {activeTab === 'HEADLINE' && (
            <div className="space-y-4">
                <p className="text-xs text-zinc-500 font-mono uppercase mb-4">Choose your hook</p>
                {(result.headlines || []).map((head, idx) => (
                    <div key={idx} className="bg-black border border-zinc-700 p-4 flex justify-between items-center group hover:border-white transition-colors">
                        <p className="text-white font-medium text-sm md:text-base pr-4">{head}</p>
                        <button 
                            onClick={() => handleCopy(head, `head-${idx}`)}
                            className="p-2 border border-zinc-700 text-zinc-400 hover:text-white hover:border-white transition-all rounded-sm shrink-0"
                        >
                            {copiedSection === `head-${idx}` ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'ABOUT' && (
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-zinc-500 font-mono uppercase">The Narrative</p>
                    <button 
                        onClick={() => handleCopy(result.aboutSection, 'about')}
                        className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-zinc-400 hover:text-white transition-colors"
                    >
                        {copiedSection === 'about' ? <Check size={14} /> : <Copy size={14} />}
                        Copy Bio
                    </button>
                </div>
                <div className="bg-black border border-zinc-700 p-6">
                    <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed text-sm font-sans">{result.aboutSection}</p>
                </div>
            </div>
        )}

        {activeTab === 'EXP' && (
            <div className="space-y-8">
                {(result.experienceRewrite || []).map((job, idx) => (
                    <div key={idx}>
                        <div className="flex items-center gap-3 mb-3 border-b border-zinc-800 pb-2">
                            <Briefcase size={16} className="text-blue-500" />
                            <h3 className="text-white font-bold">{job.company}</h3>
                            <span className="text-zinc-500 text-sm">|</span>
                            <p className="text-zinc-400 text-sm">{job.role}</p>
                        </div>
                        <div className="bg-black border border-zinc-700 p-4 relative group">
                            <button 
                                onClick={() => handleCopy(job.optimizedBullets.join('\n'), `job-${idx}`)}
                                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                {copiedSection === `job-${idx}` ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                            <ul className="space-y-2">
                                {job.optimizedBullets.map((bullet, bIdx) => (
                                    <li key={bIdx} className="text-sm text-zinc-300 leading-relaxed pl-4 border-l border-zinc-800">
                                        {bullet}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        )}

      </div>
    </div>
  );
};
