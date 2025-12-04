

import React, { useState } from 'react';
import { SalaryNegotiationResult, CoverLetterResult, Plan90DaysResult, NetworkingResult } from '../types';
import { X, DollarSign, FileText, Calendar, Share2, Copy, Check, Briefcase } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface SoloToolsProps {
    salaryData: SalaryNegotiationResult | null;
    coverLetterData: CoverLetterResult | null;
    plan90Data: Plan90DaysResult | null;
    networkingData: NetworkingResult | null;
    onClose: () => void;
}

export const SoloTools: React.FC<SoloToolsProps> = ({ salaryData, coverLetterData, plan90Data, networkingData, onClose }) => {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    // --- SALARY MODAL ---
    if (salaryData) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-zinc-950 border border-zinc-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg">
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <DollarSign className="text-green-500" />
                            <h2 className="text-xl font-serif font-bold text-white">Salary Negotiation Scripts</h2>
                        </div>
                        <button onClick={onClose}><X className="text-zinc-500 hover:text-white" /></button>
                    </div>
                    <div className="p-8 grid gap-8">
                        {salaryData.scripts.map((script, idx) => (
                            <div key={idx} className="border border-zinc-800 bg-zinc-900/30 p-6 rounded-md">
                                <div className="flex justify-between items-center mb-4">
                                    <span className={`text-xs font-mono font-bold uppercase px-3 py-1 rounded-full border ${
                                        script.scenario === 'Conservative' ? 'border-blue-500 text-blue-400 bg-blue-950/30' :
                                        script.scenario === 'Aggressive' ? 'border-red-500 text-red-400 bg-red-950/30' :
                                        'border-yellow-500 text-yellow-400 bg-yellow-950/30'
                                    }`}>
                                        {script.scenario}
                                    </span>
                                    <button 
                                        onClick={() => handleCopy(`Subject: ${script.subjectLine}\n\n${script.emailBody}`, `sal-${idx}`)}
                                        className="text-zinc-400 hover:text-white flex items-center gap-2 text-xs font-mono uppercase"
                                    >
                                        {copied === `sal-${idx}` ? <Check size={14} /> : <Copy size={14} />} Copy
                                    </button>
                                </div>
                                <div className="bg-black p-4 border border-zinc-800 rounded mb-4">
                                    <div className="mb-3 pb-3 border-b border-zinc-800">
                                        <span className="text-xs text-zinc-500 uppercase font-mono mr-2">Subject:</span>
                                        <span className="text-zinc-200 font-bold">{script.subjectLine}</span>
                                    </div>
                                    <p className="text-zinc-300 font-sans whitespace-pre-wrap">{script.emailBody}</p>
                                </div>
                                <p className="text-xs text-zinc-500 italic border-l-2 border-zinc-700 pl-3">Strategy: {script.whyUseIt}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- COVER LETTER MODAL ---
    if (coverLetterData) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-zinc-950 border border-zinc-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg">
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <FileText className="text-blue-500" />
                            <h2 className="text-xl font-serif font-bold text-white">Executive Cover Letter</h2>
                        </div>
                        <div className="flex gap-4">
                             <button 
                                onClick={() => handleCopy(coverLetterData.markdownContent, 'cl')}
                                className="text-zinc-400 hover:text-white flex items-center gap-2 text-xs font-mono uppercase"
                            >
                                {copied === 'cl' ? <Check size={14} /> : <Copy size={14} />} Copy
                            </button>
                            <button onClick={onClose}><X className="text-zinc-500 hover:text-white" /></button>
                        </div>
                    </div>
                    <div className="p-8">
                         <div className="bg-zinc-100 text-zinc-900 p-8 md:p-12 font-serif leading-relaxed shadow-xl">
                             <ReactMarkdown>{coverLetterData.markdownContent}</ReactMarkdown>
                         </div>
                         <div className="mt-8 p-4 bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm font-mono">
                             <span className="text-white font-bold block mb-2">Match Analysis:</span>
                             {coverLetterData.matchAnalysis}
                         </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- 90 DAY PLAN MODAL ---
    if (plan90Data) {
        const phases = [
            { title: "Days 0-30", data: plan90Data.days30 },
            { title: "Days 31-60", data: plan90Data.days60 },
            { title: "Days 61-90", data: plan90Data.days90 }
        ];

        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-zinc-950 border border-zinc-700 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg">
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <Calendar className="text-purple-500" />
                            <h2 className="text-xl font-serif font-bold text-white">First 90 Days Strategy</h2>
                        </div>
                        <button onClick={onClose}><X className="text-zinc-500 hover:text-white" /></button>
                    </div>
                    <div className="p-8 grid md:grid-cols-3 gap-6">
                        {phases.map((phase, idx) => (
                            <div key={idx} className="border border-zinc-800 bg-zinc-900/20 p-6 flex flex-col">
                                <h3 className="text-lg font-serif font-bold text-white mb-2">{phase.title}</h3>
                                <p className="text-xs font-mono text-purple-400 uppercase tracking-widest mb-4">{phase.data.focus}</p>
                                <ul className="space-y-3 flex-grow">
                                    {phase.data.goals.map((item, i) => (
                                        <li key={i} className="text-sm text-zinc-300 flex gap-2">
                                            <span className="text-zinc-600">•</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- NETWORKING MESSAGES MODAL ---
    if (networkingData) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-zinc-950 border border-zinc-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg">
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <Share2 className="text-pink-500" />
                            <h2 className="text-xl font-serif font-bold text-white">Networking Intros</h2>
                        </div>
                        <button onClick={onClose}><X className="text-zinc-500 hover:text-white" /></button>
                    </div>
                    <div className="p-8 space-y-6">
                         {networkingData.messages.map((msg, idx) => (
                             <div key={idx} className="border border-zinc-800 bg-zinc-900 p-6 rounded-md">
                                 <div className="flex justify-between items-center mb-4">
                                     <span className="text-xs font-mono font-bold uppercase text-zinc-500 flex items-center gap-2">
                                         <Briefcase size={12} /> Target: {msg.target}
                                     </span>
                                     <button 
                                        onClick={() => handleCopy(msg.body, `net-${idx}`)}
                                        className="text-zinc-400 hover:text-white flex items-center gap-2 text-xs font-mono uppercase"
                                    >
                                        {copied === `net-${idx}` ? <Check size={14} /> : <Copy size={14} />} Copy
                                    </button>
                                 </div>
                                 <div className="space-y-2">
                                     <p className="text-xs text-zinc-400 font-mono">Subject: <span className="text-white">{msg.subject}</span></p>
                                     <div className="p-4 bg-black border border-zinc-800 text-sm text-zinc-300 whitespace-pre-wrap">
                                         {msg.body}
                                     </div>
                                 </div>
                             </div>
                         ))}
                    </div>
                </div>
            </div>
        );
    }

    return null;
};