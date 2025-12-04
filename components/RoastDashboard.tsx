import React, { useState } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';
import { AnalysisResult } from '../types';
import { XCircle, CheckCircle, ArrowRight, RotateCcw, ScanLine, AlertTriangle, Check, Printer, Target, Brain, Activity, FileText } from 'lucide-react';
import { SourceViewerModal } from './SourceViewerModal';

interface RoastDashboardProps {
  data: AnalysisResult;
  onReset: () => void;
  context?: { role: string, level: string };
}

export const RoastDashboard: React.FC<RoastDashboardProps> = ({ data, onReset, context }) => {
  const [showSource, setShowSource] = useState(false);

  const chartData = [
    { subject: 'IMPACT', A: data.metrics?.impact || 0, fullMark: 100 },
    { subject: 'BREVITY', A: data.metrics?.brevity || 0, fullMark: 100 },
    { subject: 'TECH', A: data.metrics?.technicalDepth || 0, fullMark: 100 },
    { subject: 'FORMAT', A: data.metrics?.formatting || 0, fullMark: 100 },
  ];

  const handlePrint = () => window.print();

  return (
    <div className="w-full max-w-6xl mx-auto pb-8 animate-in fade-in duration-700">
      <SourceViewerModal 
          isOpen={showSource} 
          onClose={() => setShowSource(false)} 
          jobDescription={data.jobDescription} 
          resumeContent={data.resumeContent} 
      />

      {/* Newspaper Header */}
      <div className="border-b-4 border-white pb-8 mb-12 text-center relative">
        <div className="absolute top-0 right-0 flex gap-4 no-print">
            <button onClick={() => setShowSource(true)} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono uppercase tracking-widest"><FileText size={14} /> Context</button>
            <button onClick={handlePrint} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono uppercase tracking-widest"><Printer size={14} /> Report</button>
            <button onClick={onReset} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono uppercase tracking-widest"><RotateCcw size={14} /> Reset</button>
        </div>

        <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px bg-zinc-700 w-full"></div>
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500 shrink-0">Vol. 01 — Final Verdict</span>
            <div className="h-px bg-zinc-700 w-full"></div>
        </div>
        <h2 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-white mb-6 leading-tight">{data.roastHeadline}</h2>
        
        {context && (
            <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 bg-white border border-white px-4 py-1.5 rounded-sm">
                    <Target size={12} className="text-black" />
                    <span className="text-[10px] font-mono text-black uppercase tracking-widest font-bold">Audited As: {context.level} {context.role}</span>
                </div>
            </div>
        )}

        <p className="text-xl md:text-2xl font-serif text-zinc-400 italic max-w-4xl mx-auto leading-relaxed border-l-2 border-zinc-700 pl-6">"{data.brutalTruth}"</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-zinc-700">
        
        {/* Score Column */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-zinc-700 p-8 flex flex-col justify-between bg-black">
           <div>
              <span className="text-xs font-mono uppercase text-white bg-black border border-white px-2 py-1 inline-block mb-6">Overall Score</span>
              <div className="flex flex-col items-center py-10">
                <span className="text-9xl font-serif font-bold text-white tracking-tighter">{data.overallScore}</span>
                <span className="text-sm font-mono text-zinc-500 uppercase tracking-widest mt-4">Hireability Index</span>
              </div>
           </div>

           <div className="h-[250px] w-full border-t border-zinc-700 pt-6">
             <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                <PolarGrid stroke="#3f3f46" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Candidate" dataKey="A" stroke="#ffffff" strokeWidth={2} fill="#ffffff" fillOpacity={0.1} dot={{ r: 0 }} />
              </RadarChart>
            </ResponsiveContainer>
           </div>
        </div>

        {/* Critique Columns - STRICT MONOCHROME */}
        <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                {/* Liabilities */}
                <div className="p-8 border-b md:border-b-0 md:border-r border-zinc-700 bg-zinc-900/10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 border border-zinc-500 rounded-sm"><XCircle size={20} className="text-zinc-300" /></div>
                    <h3 className="font-serif text-2xl font-bold text-zinc-300">Liabilities</h3>
                  </div>
                  <ul className="space-y-6">
                    {(data.redFlags || []).map((flag, i) => (
                      <li key={i} className="flex gap-4 group">
                        <span className="font-mono text-xs text-zinc-600 mt-1">0{i+1}</span>
                        <p className="font-serif text-zinc-400 leading-relaxed group-hover:text-zinc-200 transition-colors text-sm border-b border-zinc-800 pb-2">{flag}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Assets */}
                <div className="p-8 bg-transparent">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 border border-white bg-white text-black rounded-sm"><CheckCircle size={20} className="text-black" /></div>
                    <h3 className="font-serif text-2xl font-bold text-white">Assets</h3>
                  </div>
                  <ul className="space-y-6">
                    {(data.greenFlags || []).map((flag, i) => (
                      <li key={i} className="flex gap-4 group">
                        <span className="font-mono text-white mt-1">0{i+1}</span>
                        <p className="font-serif text-zinc-200 leading-relaxed group-hover:text-white transition-colors text-sm border-b border-zinc-700 pb-2">{flag}</p>
                      </li>
                    ))}
                  </ul>
                </div>
            </div>
        </div>
      </div>

      {/* PSYCHOMETRIC INTEGRATION (New Section) */}
      {data.psychometricProfile && (
          <div className="mt-12 border-t border-b border-zinc-700 py-12">
              <div className="flex items-center gap-4 mb-8">
                  <Brain size={24} className="text-white" />
                  <h3 className="text-3xl font-serif font-bold text-white">Psychometric Profile</h3>
                  <div className="h-px bg-zinc-800 flex-grow"></div>
              </div>
              
              <div className="grid md:grid-cols-12 gap-8">
                  <div className="md:col-span-4 border-r border-zinc-800 pr-8">
                      <span className="text-xs font-mono uppercase text-zinc-500 tracking-widest block mb-2">Detected Archetype</span>
                      <h4 className="text-2xl font-serif font-bold text-white mb-2">{data.psychometricProfile.archetype}</h4>
                      <p className="text-sm text-zinc-400 italic">"{data.psychometricProfile.summary}"</p>
                  </div>
                  <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-6">
                      {data.psychometricProfile.traits.map((t, idx) => (
                          <div key={idx} className="bg-zinc-900/20 p-4 border border-zinc-800">
                              <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs font-bold text-white uppercase">{t.trait}</span>
                                  <span className="text-xs font-mono text-zinc-500">{t.score}</span>
                              </div>
                              <div className="w-full bg-zinc-800 h-1 mb-2">
                                  <div className="bg-white h-full" style={{ width: `${t.score}%` }}></div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* ATS FILTER */}
      {data.atsAnalysis && (
        <div className="mt-12 border border-zinc-700 bg-black p-8 relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-8 relative z-10">
                <h3 className="text-3xl font-serif font-bold text-white">ATS Filter</h3>
                <div className="h-px bg-zinc-700 flex-grow"></div>
                <div className="flex items-center gap-2 bg-black border border-white px-3 py-1">
                    <span className="text-xs font-mono text-zinc-400 uppercase">Match Rate</span>
                    <span className="text-xl font-bold font-mono text-white">{data.atsAnalysis.matchScore}%</span>
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8 relative z-10">
                <div>
                    <h4 className="font-mono text-xs uppercase text-zinc-500 tracking-widest mb-4 flex items-center gap-2"><Check size={14} className="text-white" /> Detected</h4>
                    <div className="flex flex-wrap gap-2">{(data.atsAnalysis.matchingKeywords || []).map((kw, i) => (<span key={i} className="px-2 py-1 bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-mono uppercase">{kw}</span>))}</div>
                </div>
                <div>
                    <h4 className="font-mono text-xs uppercase text-zinc-500 tracking-widest mb-4 flex items-center gap-2"><AlertTriangle size={14} className="text-zinc-500" /> Missing</h4>
                    <div className="flex flex-wrap gap-2">{(data.atsAnalysis.missingKeywords || []).map((kw, i) => (<span key={i} className="px-2 py-1 bg-transparent border border-zinc-700 text-zinc-500 text-xs font-mono uppercase line-through decoration-zinc-700">{kw}</span>))}</div>
                </div>
            </div>
        </div>
      )}

      {/* FIXES */}
      <div className="mt-12 break-before-page">
        <div className="flex items-center gap-4 mb-8"><h3 className="text-3xl font-serif font-bold text-white">Corrections</h3><div className="h-px bg-zinc-800 flex-grow"></div></div>
        <div className="grid gap-6">
          {(data.fixes || []).map((fix, idx) => (
            <div key={idx} className="border border-zinc-800 bg-black group hover:border-zinc-600 transition-colors">
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
                <div className="p-6"><span className="text-[10px] font-mono text-zinc-500 uppercase mb-3 block tracking-widest">Original (Weak)</span><p className="text-zinc-400 font-serif italic text-lg decoration-zinc-700 line-through decoration-1">"{fix.original}"</p></div>
                <div className="p-6 bg-white/5"><span className="text-[10px] font-mono text-white uppercase mb-3 block tracking-widest">Rewrite (Optimized)</span><p className="text-white font-medium text-lg">"{fix.improved}"</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};