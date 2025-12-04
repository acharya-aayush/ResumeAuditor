

export interface MetricScore {
  score: number;
  label: string;
  feedback: string;
}

export interface RewriteSuggestion {
  original: string;
  improved: string;
  reason: string;
}

export interface ATSAnalysis {
  matchScore: number;
  missingKeywords: string[];
  matchingKeywords: string[];
}

// Sub-Types for Integrated Features
export interface PsychometricProfile {
    archetype: string;
    summary: string;
    traits: { trait: string; score: number; explanation: string }[];
    cultureFit: string;
    frictionPoints: string[];
}

export interface Plan90DaysResult {
    roleContext: string;
    days30: { focus: string; goals: string[] };
    days60: { focus: string; goals: string[] };
    days90: { focus: string; goals: string[] };
}

export interface SalaryNegotiationResult {
    estimatedMarketValue: string;
    leveragePoints: string[];
    scripts: {
        scenario: "Conservative" | "Balanced" | "Aggressive";
        subjectLine: string; 
        emailBody: string;
        riskLevel: "Low" | "Medium" | "High";
        whyUseIt: string;
    }[];
}

// MAIN ANALYSIS RESULT
export interface AnalysisResult {
  candidateName: string;
  overallScore: number;
  roastHeadline: string;
  brutalTruth: string;
  metrics: {
    impact: number;
    brevity: number;
    technicalDepth: number;
    formatting: number;
  };
  redFlags: string[];
  greenFlags: string[];
  fixes: RewriteSuggestion[];
  atsAnalysis?: ATSAnalysis;
  
  // Integrated Feature (Always present now)
  psychometricProfile?: PsychometricProfile;

  // Persisted Executive Actions (Optional, populated on demand)
  salaryNegotiation?: SalaryNegotiationResult;
  plan90Days?: Plan90DaysResult;
  
  timestamp: number;

  // Context Data for History
  jobDescription?: string;
  resumeContent?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
  COMPARING = 'COMPARING',
  COMPARISON_COMPLETE = 'COMPARISON_COMPLETE'
}

export enum AIProvider {
  OPENAI = 'OPENAI',
  OPENROUTER = 'OPENROUTER',
  GROQ = 'GROQ',
  GEMINI = 'GEMINI',
  OLLAMA = 'OLLAMA',
  CUSTOM = 'CUSTOM' 
}

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  modelName: string;
  baseUrl?: string; 
}

// --- Remaster Types ---

export interface RemasterInput {
  extraProjects: string;
  achievements: string;
  links: string;
}

export interface CutItem {
  text: string;
  reason: string;
}

export interface RemasterResult {
  markdownContent: string;
  cutReport: CutItem[];
  improvementsMade: string[];
}

// --- GitHub Types ---
export interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  language: string;
  stars: number;
  url: string;
  updatedAt: string;
  selected?: boolean;
}

// --- Interview Prep Types ---
export interface InterviewQuestion {
    question: string;
    context: string; 
    goodAnswerKey: string;
    badAnswerTrap: string;
}

export interface InterviewPrepResult {
    questions: InterviewQuestion[];
    elevatorPitch: string;
}

// --- Career Pivot Types ---
export interface PivotOption {
    role: string;
    salaryRange: string;
    fitScore: number; 
    whyItFits: string;
    gapAnalysis: string; 
    transitionDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
    marketOutlook: 'HIGH_GROWTH' | 'STABLE' | 'SATURATED'; 
    bridgeProject: string; 
    translationLayer: { 
        original: string;
        adapted: string;
    };
}

export interface PivotResult {
    options: PivotOption[];
}

// --- Skill Roadmap Types ---
export interface WeekPlan {
    week: number;
    theme: string; 
    tasks: string[];
    resources: string[]; 
    checkpoint: string;
}

export interface RoadmapResult {
    targetGoal: string; 
    schedule: WeekPlan[];
}

// --- LinkedIn Types ---
export interface LinkedInProfile {
    headlines: string[]; 
    aboutSection: string;
    experienceRewrite: {
        company: string;
        role: string;
        optimizedBullets: string[];
    }[];
}

// --- GitHub Profile Types ---
export interface GithubProfileResult {
    markdownContent: string;
}

// --- Cold Email Types ---
export interface ColdEmail {
    type: 'DIRECT' | 'SOFT' | 'VALUE';
    subject: string;
    body: string;
    explanation: string;
}

export interface ColdEmailResult {
    emails: ColdEmail[];
}

// --- Comparison Types (Multi-Candidate) ---

export type CandidateInput = 
  | { type: 'FILE'; file: File; id: string } 
  | { type: 'TEXT'; text: string; name: string; id: string };

export interface RankItem {
  rank: number;
  candidateName: string; 
  score: number; 
  reason: string;
}

export interface CategoryRank {
  category: string; 
  rankings: RankItem[];
}

export interface DreamTeamAnalysis {
    squadName: string;
    selectedMembers: string[]; 
    synergyScore: number;
    rationale: string;
    roles: { name: string; role: string; contribution: string }[];
    collectiveWeaknesses: string[];
}

export interface ComparisonResult {
  summary: string;
  leaderboard: RankItem[];
  categoryBreakdown: CategoryRank[];
  dreamTeamAnalysis?: DreamTeamAnalysis; // Integrated now
  
  // History Context
  timestamp: number;
  jobDescription?: string;
  candidateData?: { name: string, text?: string, type: 'FILE' | 'TEXT' }[];
}

// --- Battle Arena Types (1v1) ---
export interface BattleResult {
  resume1Name: string;
  resume2Name: string;
  overallWinner: 'resume1' | 'resume2' | 'tie';
  verdict: string;
  headToHead: {
    category: string;
    winner: 'resume1' | 'resume2' | 'tie';
    resume1Score: number;
    resume2Score: number;
    reason: string;
  }[];
  resume1UniqueStrengths: string[];
  resume2UniqueStrengths: string[];
  resume1Weaknesses: string[];
  resume2Weaknesses: string[];
  commonStrengths: string[];
}

// --- EXTRA TYPES FOR COMPONENTS ---

export interface CoverLetterResult {
    markdownContent: string;
    matchAnalysis: string;
}

export interface NetworkingResult {
    messages: {
        target: string;
        subject: string;
        body: string;
    }[];
}
