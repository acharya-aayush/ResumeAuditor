import React, { useState, useEffect, useRef } from 'react';
import { FileUpload } from './components/FileUpload';
import { RoastDashboard } from './components/RoastDashboard';
import { SettingsModal } from './components/SettingsModal';
import { RemasterWizard } from './components/RemasterWizard';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ComparatorView } from './components/ComparatorView';
import { InterviewPrep } from './components/InterviewPrep';
import { CareerPivot } from './components/CareerPivot';
import { SkillRoadmap } from './components/SkillRoadmap';
import { LinkedInGenerator } from './components/LinkedInGenerator';
import { GithubProfileGenerator } from './components/GithubProfileGenerator';
import { ColdEmailArchitect } from './components/ColdEmailArchitect';
import { Plan90Days } from './components/Plan90Days';
import { SalaryScripts } from './components/SalaryScripts';

import { 
    analyzeResume, remasterResume, compareResumes, generateInterviewQuestions, 
    generateCareerPivots, generateSkillRoadmap, generateLinkedInProfile, 
    generateGithubProfileReadme, generateColdEmails, generate90DayPlan, generateSalaryScripts
} from './services/aiService';

import { 
    AppState, AnalysisResult, AIConfig, AIProvider, RemasterInput, RemasterResult, 
    ComparisonResult, CandidateInput, InterviewPrepResult, PivotResult, RoadmapResult, 
    LinkedInProfile, GithubProfileResult, ColdEmailResult,
    Plan90DaysResult, SalaryNegotiationResult
} from './types';

import { 
    Loader2, Settings, Command, Hammer, History, Target, User, Trash2, Users, 
    FileText, Type, X, Mic, Compass, Map, AlertCircle, Linkedin, Github, 
    Mail, Briefcase, BarChart, ShieldCheck, Calendar, DollarSign
} from 'lucide-react';

const DEFAULT_CONFIG: AIConfig = {
  provider: AIProvider.OPENAI,
  apiKey: '', 
  modelName: 'gpt-4o-mini',
  baseUrl: 'https://api.openai.com/v1'
};

const App: React.FC = () => {
  const [mode, setMode] = useState<'SOLO' | 'GROUP'>('SOLO');
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [targetRole, setTargetRole] = useState<string>("");
  const [experienceLevel, setExperienceLevel] = useState<string>("Mid-Level (3-5 Yrs)");
  
  const [comparisonCandidates, setComparisonCandidates] = useState<CandidateInput[]>([]);
  const [isAddingText, setIsAddingText] = useState(false);
  const [newTextName, setNewTextName] = useState("");
  const [newTextContent, setNewTextContent] = useState("");
  const [jobDesc, setJobDesc] = useState<string>("");
  
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [remasterResult, setRemasterResult] = useState<RemasterResult | null>(null);
  
  const [interviewResult, setInterviewResult] = useState<InterviewPrepResult | null>(null);
  const [pivotResult, setPivotResult] = useState<PivotResult | null>(null);
  const [roadmapResult, setRoadmapResult] = useState<RoadmapResult | null>(null);
  const [linkedinResult, setLinkedinResult] = useState<LinkedInProfile | null>(null);
  const [githubProfileResult, setGithubProfileResult] = useState<GithubProfileResult | null>(null);
  const [coldEmailResult, setColdEmailResult] = useState<ColdEmailResult | null>(null);
  const [plan90Result, setPlan90Result] = useState<Plan90DaysResult | null>(null);
  const [salaryResult, setSalaryResult] = useState<SalaryNegotiationResult | null>(null);

  const [showRemaster, setShowRemaster] = useState(false);
  const [showColdEmail, setShowColdEmail] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>(DEFAULT_CONFIG);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Updated History Type to support both types
  const [history, setHistory] = useState<(AnalysisResult | ComparisonResult)[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem('careerfry_config');
    if (savedConfig) {
      try { setAiConfig(JSON.parse(savedConfig)); } catch (e) {}
    }
    const savedHistory = localStorage.getItem('careerfry_history');
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (interviewResult || pivotResult || roadmapResult || showRemaster || linkedinResult || githubProfileResult || showColdEmail || plan90Result || salaryResult) {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [interviewResult, pivotResult, roadmapResult, showRemaster, linkedinResult, githubProfileResult, showColdEmail, plan90Result, salaryResult]);

  const handleSaveSettings = (newConfig: AIConfig) => {
    setAiConfig(newConfig);
    localStorage.setItem('careerfry_config', JSON.stringify(newConfig));
  };

  const saveToHistory = (newResult: AnalysisResult | ComparisonResult) => {
    const updatedHistory = [newResult, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('careerfry_history', JSON.stringify(updatedHistory));
  };

  // Update existing history item with new executive data (e.g., if we generate salary scripts later)
  const updateCurrentHistory = (update: Partial<AnalysisResult>) => {
      if (!result) return;
      const updatedResult = { ...result, ...update };
      setResult(updatedResult);
      
      const updatedHistory = history.map(h => 
          (h.timestamp === result.timestamp) ? updatedResult : h
      );
      setHistory(updatedHistory);
      localStorage.setItem('careerfry_history', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('careerfry_history');
  };

  const handleApiError = (err: any) => {
      console.error(err);
      setErrorMsg(err.message || "An error occurred. Please try again.");
      // Do NOT reset app state on error to allow retry
      // Only set to ERROR if we don't have a result yet (initial loading)
      if (!result && !comparisonResult) {
          setAppState(AppState.ERROR);
      }
      setLoadingAction(null);
  };

  const handleRoast = async () => {
    if (!file && !resumeText.trim()) return;
    setAppState(AppState.ANALYZING);
    setErrorMsg("");
    try {
      const data = await analyzeResume(file, resumeText, jobDesc, aiConfig, { role: targetRole, level: experienceLevel });
      setResult(data);
      saveToHistory(data);
      setAppState(AppState.COMPLETE);
    } catch (err: any) {
      handleApiError(err);
    }
  };

  const handleComparator = async () => {
      if (comparisonCandidates.length < 2) return;
      setAppState(AppState.COMPARING);
      setErrorMsg("");
      try {
          const data = await compareResumes(comparisonCandidates, jobDesc, aiConfig);
          setComparisonResult(data);
          saveToHistory(data); // Save comparison to history
          setAppState(AppState.COMPARISON_COMPLETE);
      } catch (err: any) {
          handleApiError(err);
      }
  };

  const handleRemaster = async (input: RemasterInput) => {
    if (!file && !resumeText) return null;
    try {
        const data = await remasterResume(file, resumeText, jobDesc, input, aiConfig);
        setRemasterResult(data);
        return data;
    } catch (err: any) {
        handleApiError(err);
        throw err;
    }
  };

  const handle90Day = async () => {
      if (!file && !resumeText) return;
      setLoadingAction('PLAN90');
      setErrorMsg("");
      try {
          const ctx = targetRole || "Specific Role";
          const data = await generate90DayPlan(file, resumeText, ctx, aiConfig);
          // Validate the data structure before setting
          const validatedData = {
              roleContext: data?.roleContext || ctx,
              days30: data?.days30 || { focus: "Not available", goals: [] },
              days60: data?.days60 || { focus: "Not available", goals: [] },
              days90: data?.days90 || { focus: "Not available", goals: [] }
          };
          setPlan90Result(validatedData);
          updateCurrentHistory({ plan90Days: validatedData });
      } catch (err: any) {
          handleApiError(err);
      } finally {
          setLoadingAction(null);
      }
  };

  const handleSalary = async () => {
      if (!file && !resumeText) return;
      setLoadingAction('SALARY');
      setErrorMsg("");
      try {
           const ctx = `${targetRole || "Role"} (${experienceLevel})`;
           const data = await generateSalaryScripts(file, resumeText, ctx, aiConfig);
           setSalaryResult(data);
           updateCurrentHistory({ salaryNegotiation: data });
      } catch (err: any) {
           handleApiError(err);
      } finally {
           setLoadingAction(null);
      }
  };

  // Wrapper handlers for other actions
  const wrapAction = async (action: string, fn: () => Promise<void>) => {
      setLoadingAction(action);
      setErrorMsg("");
      try { await fn(); } catch(e) { handleApiError(e); } finally { setLoadingAction(null); }
  };

  const handleReset = () => {
    setFile(null); setResumeText(""); setComparisonCandidates([]); setJobDesc("");
    setResult(null); setComparisonResult(null); setRemasterResult(null);
    setInterviewResult(null); setPivotResult(null); setRoadmapResult(null);
    setLinkedinResult(null); setGithubProfileResult(null); setColdEmailResult(null);
    setPlan90Result(null); setSalaryResult(null);
    setShowRemaster(false); setShowColdEmail(false);
    setAppState(AppState.IDLE); setIsAddingText(false); setErrorMsg("");
  };

  const handleLoadFromHistory = (item: AnalysisResult | ComparisonResult) => {
    handleReset(); // Clean state
    
    // Check if it's a Solo Audit
    if ('overallScore' in item) {
        setMode('SOLO');
        setResult(item as AnalysisResult);
        setAppState(AppState.COMPLETE);
        // Restore context if available
        if (item.jobDescription) setJobDesc(item.jobDescription);
        if (item.resumeContent) setResumeText(item.resumeContent);

        // Restore persisted state if available
        if(item.plan90Days) setPlan90Result(item.plan90Days);
        if(item.salaryNegotiation) setSalaryResult(item.salaryNegotiation);
    } 
    // Otherwise it's a Group Audit
    else {
        setMode('GROUP');
        setComparisonResult(item as ComparisonResult);
        setAppState(AppState.COMPARISON_COMPLETE);
        if (item.jobDescription) setJobDesc(item.jobDescription);
    }

    // Reset transient
    setInterviewResult(null); setPivotResult(null); setRoadmapResult(null);
    setLinkedinResult(null); setGithubProfileResult(null); setColdEmailResult(null);
    setShowRemaster(false); setShowColdEmail(false); setErrorMsg("");
  };

  const toggleMode = (newMode: 'SOLO' | 'GROUP') => { handleReset(); setMode(newMode); };
  const addComparisonFile = (newFile: File) => { if (comparisonCandidates.length >= 5) return; setComparisonCandidates([...comparisonCandidates, { type: 'FILE', file: newFile, id: Math.random().toString(36).substr(2, 9) }]); };
  const addComparisonText = () => { if (!newTextName || !newTextContent) return; setComparisonCandidates([...comparisonCandidates, { type: 'TEXT', name: newTextName, text: newTextContent, id: Math.random().toString(36).substr(2, 9) }]); setNewTextName(""); setNewTextContent(""); setIsAddingText(false); };
  const removeCandidate = (id: string) => { setComparisonCandidates(comparisonCandidates.filter(c => c.id !== id)); };
  const isSoloReady = (file !== null) || (resumeText.trim().length > 50);

  return (
    <div className="min-h-screen bg-transparent text-zinc-100 font-sans selection:bg-white selection:text-black flex flex-col relative z-0">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} config={aiConfig} onSave={handleSaveSettings} />
      <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} history={history} onSelect={handleLoadFromHistory} onClear={clearHistory} />

      <header className="border-b border-white/10 bg-black sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={handleReset}>
            <div className="bg-white text-black p-2"><Command size={24} /></div>
            <div>
              <h1 className="font-serif font-bold text-2xl leading-none tracking-tight text-white">RESUME_AUDITOR_V5</h1>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Total Warfare Edition</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!aiConfig.apiKey && <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-full mr-2"><ShieldCheck size={12} className="text-zinc-500" /><span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wide">Free Tier</span></div>}
            <button onClick={() => setIsHistoryOpen(true)} className="px-4 py-2 border border-zinc-800 hover:border-white transition-all text-zinc-500 hover:text-white bg-black hover:bg-zinc-900"><History size={18} /></button>
            <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-3 px-4 py-2 border border-zinc-800 hover:border-white transition-all text-zinc-500 hover:text-white bg-black hover:bg-zinc-900"><Settings size={18} /></button>
          </div>
        </div>
      </header>

      <main className="flex-grow p-6 md:p-12 z-10">
        {errorMsg && <div className="max-w-4xl mx-auto mb-8 p-4 border border-zinc-700 bg-zinc-900/40 text-white text-xs font-mono text-center uppercase tracking-widest flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-4 shadow-lg"><AlertCircle size={16} /> [System Alert]: {errorMsg}</div>}

        {(appState === AppState.IDLE || appState === AppState.ANALYZING || appState === AppState.COMPARING) && (
          <div className="max-w-4xl mx-auto pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-center mb-12">
                <div className="border border-zinc-700 bg-black p-1 flex gap-1 shadow-xl">
                    <button onClick={() => toggleMode('SOLO')} className={`px-6 py-2 flex items-center gap-2 text-xs font-mono uppercase tracking-widest transition-all ${mode === 'SOLO' ? 'bg-white text-black font-bold shadow-lg' : 'text-zinc-500 hover:text-white'}`}><User size={14} /> Solo Audit</button>
                    <button onClick={() => toggleMode('GROUP')} className={`px-6 py-2 flex items-center gap-2 text-xs font-mono uppercase tracking-widest transition-all ${mode === 'GROUP' ? 'bg-white text-black font-bold shadow-lg' : 'text-zinc-500 hover:text-white'}`}><Users size={14} /> Group Audit</button>
                </div>
            </div>

            <div className="text-center mb-16 border-b border-zinc-800 pb-12">
              <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tighter text-white">{mode === 'SOLO' ? "Ruthless. Specific. Data-Driven." : "The Talent Benchmark."}</h1>
              <p className="text-lg text-zinc-400 font-serif italic max-w-xl mx-auto leading-relaxed">{mode === 'SOLO' ? "\"Stop guessing. Let the AI tear apart your CV with precision context.\"" : "\"Rank up to 5 candidates objectively against your specific criteria.\""}</p>
            </div>

            <div className="grid md:grid-cols-12 gap-12">
                <div className="md:col-span-8 space-y-8">
                  <div className="bg-surface border border-zinc-800 p-1 shadow-2xl shadow-black/50">
                    <div className="border border-zinc-800 p-8 md:p-12 bg-black">
                        {mode === 'SOLO' ? (
                             <FileUpload selectedFile={file} onFileSelect={(f) => { setFile(f); setResumeText(""); }} resumeText={resumeText} onTextChange={(t) => { setResumeText(t); setFile(null); }} />
                        ) : (
                            <div className="space-y-6 mb-8">
                                <div className="space-y-3">{comparisonCandidates.map((c, idx) => (<div key={c.id} className="relative p-4 border border-zinc-700 bg-zinc-900 flex items-center justify-between group"><div className="flex items-center gap-3 overflow-hidden"><div className="w-8 h-8 bg-zinc-800 flex items-center justify-center text-xs font-mono text-white font-bold">{idx + 1}</div><div className="flex items-center gap-3">{c.type === 'FILE' ? <FileText size={16} className="text-zinc-500" /> : <Type size={16} className="text-zinc-500" />}<span className="text-sm font-mono text-zinc-300 truncate">{c.type === 'FILE' ? c.file.name : c.name}</span></div></div><button onClick={() => removeCandidate(c.id)} className="text-zinc-600 hover:text-white transition-colors"><Trash2 size={16} /></button></div>))}</div>
                                {comparisonCandidates.length < 5 && (<div className="border-t border-zinc-800 pt-6">{!isAddingText ? (<div className="grid grid-cols-2 gap-4"><div className="border border-dashed border-zinc-700 hover:border-white bg-transparent p-4 flex flex-col items-center justify-center text-zinc-500 hover:text-white cursor-pointer transition-all h-24 relative"><input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => { if(e.target.files?.[0]) addComparisonFile(e.target.files[0]); }} /><div className="flex flex-col items-center gap-2 text-xs font-mono uppercase font-bold"><FileText size={18} /> Add PDF/Image</div></div><button onClick={() => setIsAddingText(true)} className="border border-dashed border-zinc-700 hover:border-white bg-transparent p-4 flex flex-col items-center justify-center text-zinc-500 hover:text-white cursor-pointer transition-all h-24"><div className="flex flex-col items-center gap-2 text-xs font-mono uppercase font-bold"><Type size={18} /> Paste Text</div></button></div>) : (<div className="bg-zinc-900 border border-zinc-700 p-4 animate-in fade-in slide-in-from-top-2"><div className="flex justify-between items-center mb-4"><span className="text-xs font-mono font-bold uppercase text-white">Add Candidate (Text)</span><button onClick={() => setIsAddingText(false)}><X size={14} className="text-zinc-500 hover:text-white" /></button></div><input className="w-full bg-black border border-zinc-700 p-3 text-sm text-white mb-3 font-mono placeholder:text-zinc-700 focus:border-white outline-none" placeholder="Candidate Name" value={newTextName} onChange={(e) => setNewTextName(e.target.value)} /><textarea className="w-full bg-black border border-zinc-700 p-3 text-sm text-white h-32 mb-3 font-mono placeholder:text-zinc-700 focus:border-white outline-none resize-none" placeholder="Paste resume content here..." value={newTextContent} onChange={(e) => setNewTextContent(e.target.value)} /><button onClick={addComparisonText} disabled={!newTextName || !newTextContent} className="w-full py-2 bg-white text-black text-xs font-mono font-bold uppercase disabled:bg-zinc-800 disabled:text-zinc-500">Add Candidate</button></div>)}</div>)}
                            </div>
                        )}
                        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3"><label className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Briefcase size={12} /> Target Role</label><input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="w-full bg-black border border-zinc-700 p-3 text-sm text-white focus:border-white outline-none font-mono placeholder:text-zinc-800 uppercase" placeholder="e.g. Wizard, Janitor, CEO" /></div>
                            <div className="space-y-3"><label className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><BarChart size={12} /> Seniority Level</label><select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="w-full bg-black border border-zinc-700 p-3 text-sm text-white focus:border-white outline-none font-mono uppercase appearance-none"><option>Intern / Student</option><option>Junior (0-2 Yrs)</option><option>Mid-Level (3-5 Yrs)</option><option>Senior (5-8 Yrs)</option><option>Lead / Manager</option><option>Executive / VP</option></select></div>
                        </div>
                        <div className="mb-8 group"><label className="text-xs font-mono font-bold text-zinc-500 uppercase mb-3 block tracking-widest">Job Description / Context (Optional)</label><textarea className="w-full bg-black border border-zinc-700 p-6 text-sm text-white focus:border-white outline-none transition-all resize-none h-32 font-mono" placeholder="// PASTE JOB DESCRIPTION HERE..." value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} /></div>
                        {mode === 'SOLO' ? (
                            <button onClick={handleRoast} disabled={!isSoloReady || appState === AppState.ANALYZING} className={`w-full py-5 text-sm font-mono font-bold uppercase tracking-[0.2em] flex items-center justify-center transition-all border group ${!isSoloReady ? 'border-zinc-800 bg-zinc-900 text-zinc-600 cursor-not-allowed' : 'border-white bg-white text-black hover:bg-zinc-200 shadow-xl shadow-white/10'}`}>
                                {appState === AppState.ANALYZING ? <><Loader2 className="animate-spin mr-3" /> Auditing...</> : <span className="group-hover:scale-105 transition-transform duration-300">Start Audit</span>}
                            </button>
                        ) : (
                            <button onClick={handleComparator} disabled={comparisonCandidates.length < 2 || appState === AppState.COMPARING} className={`w-full py-5 text-sm font-mono font-bold uppercase tracking-[0.2em] flex items-center justify-center transition-all border ${comparisonCandidates.length < 2 ? 'border-zinc-800 bg-zinc-900 text-zinc-600 cursor-not-allowed' : 'border-white bg-white text-black hover:bg-zinc-200 shadow-xl shadow-white/10'}`}>
                                {appState === AppState.COMPARING ? <><Loader2 className="animate-spin mr-3" /> Ranking...</> : "Compare Candidates"}
                            </button>
                        )}
                    </div>
                  </div>
                </div>
                <div className="md:col-span-4 space-y-8 md:pt-4">
                   <div className="border-t border-zinc-800 pt-4"><h3 className="font-serif font-bold text-white text-xl mb-2">Protocol</h3><p className="text-zinc-500 text-sm leading-relaxed">System handles all professions including fictional scenarios. Strict confidentiality.</p></div>
                </div>
            </div>
          </div>
        )}

        {/* RESULTS: SOLO */}
        {appState === AppState.COMPLETE && result && mode === 'SOLO' && (
          <>
            <RoastDashboard data={result} onReset={handleReset} context={{ role: targetRole || "General", level: experienceLevel }} />
            
            <div className="max-w-6xl mx-auto mt-12 pb-20 border-t border-zinc-800 pt-12 no-print">
               <div className="bg-black border border-dashed border-zinc-800 p-8">
                  <h3 className="text-xl font-serif font-bold text-white mb-6 text-center">Executive Actions</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <button onClick={() => setShowRemaster(true)} className="px-4 py-6 font-mono font-bold uppercase tracking-widest flex flex-col items-center gap-3 border bg-black border-zinc-800 text-zinc-400 hover:text-white hover:border-white hover:bg-zinc-900"><Hammer size={20} /> Remaster</button>
                      <button onClick={() => wrapAction('INTERVIEW', () => generateInterviewQuestions(file, resumeText, jobDesc, aiConfig).then(setInterviewResult))} disabled={loadingAction === 'INTERVIEW'} className="px-4 py-6 font-mono font-bold uppercase tracking-widest flex flex-col items-center gap-3 border bg-black border-zinc-800 text-zinc-400 hover:text-white hover:border-white hover:bg-zinc-900">{loadingAction === 'INTERVIEW' ? <Loader2 className="animate-spin" /> : <Mic size={20} />} Interview</button>
                      <button onClick={() => wrapAction('PIVOT', () => generateCareerPivots(file, resumeText, aiConfig).then(setPivotResult))} disabled={loadingAction === 'PIVOT'} className="px-4 py-6 font-mono font-bold uppercase tracking-widest flex flex-col items-center gap-3 border bg-black border-zinc-800 text-zinc-400 hover:text-white hover:border-white hover:bg-zinc-900">{loadingAction === 'PIVOT' ? <Loader2 className="animate-spin" /> : <Compass size={20} />} Pivot</button>
                      <button onClick={() => wrapAction('ROADMAP', () => generateSkillRoadmap(file, resumeText, jobDesc, aiConfig).then(setRoadmapResult))} disabled={loadingAction === 'ROADMAP'} className="px-4 py-6 font-mono font-bold uppercase tracking-widest flex flex-col items-center gap-3 border bg-black border-zinc-800 text-zinc-400 hover:text-white hover:border-white hover:bg-zinc-900">{loadingAction === 'ROADMAP' ? <Loader2 className="animate-spin" /> : <Map size={20} />} Roadmap</button>
                      
                      <button onClick={handle90Day} disabled={loadingAction === 'PLAN90'} className="px-4 py-6 font-mono font-bold uppercase tracking-widest flex flex-col items-center gap-3 border bg-black border-zinc-800 text-zinc-400 hover:text-white hover:border-white hover:bg-zinc-900">{loadingAction === 'PLAN90' ? <Loader2 className="animate-spin" /> : <Calendar size={20} />} 90 Day Plan</button>
                      <button onClick={handleSalary} disabled={loadingAction === 'SALARY'} className="px-4 py-6 font-mono font-bold uppercase tracking-widest flex flex-col items-center gap-3 border bg-black border-zinc-800 text-zinc-400 hover:text-white hover:border-white hover:bg-zinc-900">{loadingAction === 'SALARY' ? <Loader2 className="animate-spin" /> : <DollarSign size={20} />} Negotiation</button>
                      
                      <button onClick={() => wrapAction('LINKEDIN', () => generateLinkedInProfile(file, resumeText, aiConfig).then(setLinkedinResult))} disabled={loadingAction === 'LINKEDIN'} className="px-4 py-6 font-mono font-bold uppercase tracking-widest flex flex-col items-center gap-3 border bg-black border-zinc-800 text-zinc-400 hover:text-white hover:border-white hover:bg-zinc-900">{loadingAction === 'LINKEDIN' ? <Loader2 className="animate-spin" /> : <Linkedin size={20} />} LinkedIn</button>
                      <button onClick={() => wrapAction('GITHUB', () => generateGithubProfileReadme(file, resumeText, aiConfig).then(setGithubProfileResult))} disabled={loadingAction === 'GITHUB'} className="px-4 py-6 font-mono font-bold uppercase tracking-widest flex flex-col items-center gap-3 border bg-black border-zinc-800 text-zinc-400 hover:text-white hover:border-white hover:bg-zinc-900">{loadingAction === 'GITHUB' ? <Loader2 className="animate-spin" /> : <Github size={20} />} GitHub</button>
                      <button onClick={() => setShowColdEmail(true)} className="px-4 py-6 font-mono font-bold uppercase tracking-widest flex flex-col items-center gap-3 border bg-black border-zinc-800 text-zinc-400 hover:text-white hover:border-white hover:bg-zinc-900"><Mail size={20} /> Outreach</button>
                  </div>
               </div>
            </div>
          </>
        )}

        {/* RESULTS: COMPARATOR */}
        {(appState === AppState.COMPARISON_COMPLETE) && comparisonResult && mode === 'GROUP' && (
            <ComparatorView result={comparisonResult} onReset={handleReset} />
        )}

        <div ref={bottomRef} className="scroll-mt-20">
            {showRemaster && <RemasterWizard onRemaster={handleRemaster} result={remasterResult} onClose={() => setShowRemaster(false)} />}
            {interviewResult && <InterviewPrep result={interviewResult} onClose={() => setInterviewResult(null)} />}
            {pivotResult && <CareerPivot result={pivotResult} onClose={() => setPivotResult(null)} onGetRoadmap={(r) => wrapAction('ROADMAP', () => generateSkillRoadmap(file, resumeText, `Transition to: ${r}`, aiConfig).then(setRoadmapResult))} loadingRole={loadingAction === 'ROADMAP' ? '...' : null} />}
            {roadmapResult && <SkillRoadmap result={roadmapResult} onClose={() => setRoadmapResult(null)} />}
            {linkedinResult && <LinkedInGenerator result={linkedinResult} onClose={() => setLinkedinResult(null)} />}
            {githubProfileResult && <GithubProfileGenerator result={githubProfileResult} onClose={() => setGithubProfileResult(null)} />}
            {showColdEmail && <ColdEmailArchitect onGenerate={(c, m) => wrapAction('COLD', () => generateColdEmails(file, resumeText, `Company: ${c}, Manager: ${m}`, aiConfig).then(setColdEmailResult))} result={coldEmailResult} isLoading={loadingAction === 'COLD'} onClose={() => setShowColdEmail(false)} />}
            {plan90Result && <Plan90Days result={plan90Result} onClose={() => setPlan90Result(null)} />}
            {salaryResult && <SalaryScripts result={salaryResult} onClose={() => setSalaryResult(null)} />}
        </div>
      </main>
    </div>
  );
};

export default App;