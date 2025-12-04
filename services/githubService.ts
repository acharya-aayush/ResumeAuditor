
import { GitHubRepo } from '../types';

// Helper to extract username from input
const extractUsername = (input: string): string => {
    const cleaned = input.trim();
    if (cleaned.includes('github.com/')) {
        const parts = cleaned.split('github.com/');
        return parts[1].split('/')[0];
    }
    return cleaned;
};

// Generic file fetcher using GitHub Raw API
const fetchFileContent = async (username: string, repoName: string, path: string): Promise<string> => {
    try {
        // Try main branch first, then master if failed (common patterns)
        // We use the API contents endpoint with 'application/vnd.github.raw' header to get raw text
        const response = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${path}`, {
            headers: { 'Accept': 'application/vnd.github.raw' }
        });
        
        if (!response.ok) return "";
        return await response.text();
    } catch (e) {
        return "";
    }
};

// --- SMART EXTRACTION LOGIC ---

const extractTechStack = (text: string, language: string): string => {
    // 1. Look for explicit headers
    const stackHeaderMatch = text.match(/(?:###|##)\s*(?:Built With|Tech Stack|Technologies|Stack)([\s\S]*?)(?:###|##|$)/i);
    if (stackHeaderMatch && stackHeaderMatch[1]) {
        // Clean up bullets and return
        return stackHeaderMatch[1].replace(/[-*]\s+/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1').trim().split('\n').slice(0, 10).join(', ');
    }

    // 2. Fallback: Scan for common keywords if explicit header is missing
    const keywords = [
        "React", "Next.js", "Vue", "Angular", "TypeScript", "JavaScript", "Node.js", "Express", "Python", "Django", "Flask", 
        "FastAPI", "Go", "Rust", "Java", "Spring", "Docker", "Kubernetes", "AWS", "Firebase", "Supabase", "PostgreSQL", 
        "MongoDB", "Redis", "Tailwind", "Bootstrap", "TensorFlow", "PyTorch", "OpenAI", "LLM", "Gemini"
    ];
    
    const found = keywords.filter(k => new RegExp(`\\b${k}\\b`, 'i').test(text));
    return [...new Set([language, ...found])].join(', '); // Dedupe
};

const extractKeyFeatures = (text: string): string[] => {
    // Look for "Features" header
    const featureMatch = text.match(/(?:###|##)\s*(?:Features|Capabilities|What it does)([\s\S]*?)(?:###|##|$)/i);
    
    if (featureMatch && featureMatch[1]) {
        // Extract bullet points
        return featureMatch[1]
            .split('\n')
            .map(l => l.trim())
            .filter(l => l.startsWith('-') || l.startsWith('*'))
            .map(l => l.replace(/^[-*]\s+/, '').replace(/\[(.*?)\]\(.*?\)/g, '$1')) // Remove markdown links
            .slice(0, 6); // Top 6 features
    }
    return [];
};

const extractMetrics = (text: string): string[] => {
    // Look for sentences with numbers/percentages that imply impact
    const sentences = text.split(/[.!?]\s+/);
    const metricRegex = /(\d+%|\d+x|\d+\s*ms|\d+\s*users|\d+\s*stars|\d+\s*downloads|faster|reduced|increased|optimized)/i;
    
    return sentences
        .filter(s => metricRegex.test(s) && s.length < 150) // Short sentences with numbers
        .map(s => s.trim())
        .slice(0, 3);
};

const extractProblemStatement = (text: string): string => {
    // Usually the first paragraph after the title
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    // Skip title (#) and badges (![)
    const introLines = lines.filter(l => !l.startsWith('#') && !l.startsWith('!'));
    
    if (introLines.length > 0) {
        return introLines[0].slice(0, 300); // First meaningful paragraph
    }
    return "No description available.";
};

// 1. Fetch List of Repos (Lightweight)
export const listGitHubRepos = async (input: string): Promise<GitHubRepo[]> => {
    const username = extractUsername(input);

    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=40&type=owner`);
        
        if (!response.ok) {
            if (response.status === 404) throw new Error(`GitHub User '${username}' not found.`);
            if (response.status === 403) throw new Error("GitHub API Rate limit exceeded. Try again later.");
            throw new Error("Failed to fetch repositories.");
        }

        const repos: any[] = await response.json();

        return repos
            .filter((r: any) => !r.fork)
            .map((r: any) => ({
                id: r.id,
                name: r.name,
                description: r.description || "",
                language: r.language || "N/A",
                stars: r.stargazers_count,
                url: r.html_url,
                updatedAt: new Date(r.updated_at).toLocaleDateString(),
                selected: false
            }));

    } catch (error: any) {
        console.error("GitHub Fetch Error:", error);
        throw new Error(error.message || "Could not fetch GitHub data.");
    }
};

// 2. Process Selected Repos (Heavyweight - Fetches README + DOCS)
export const processSelectedRepos = async (usernameInput: string, repos: GitHubRepo[]): Promise<string> => {
    const username = extractUsername(usernameInput);
    
    const enrichedRepos = await Promise.all(repos.map(async (r) => {
        // Fetch README and DOCUMENTATION in parallel
        const [readmeRaw, docRaw, docsRaw] = await Promise.all([
            fetchFileContent(username, r.name, 'README.md'),
            fetchFileContent(username, r.name, 'DOCUMENTATION.md'), // Common naming
            fetchFileContent(username, r.name, 'docs/index.md')     // Another common pattern
        ]);

        const fullContext = (readmeRaw + "\n" + docRaw + "\n" + docsRaw).trim();
        
        if (!fullContext) {
            // Fallback to basic info if no files found
            return `PROJECT: ${r.name}\nDESC: ${r.description}\nURL: ${r.url}`;
        }

        // --- SMART PARSING ---
        const techStack = extractTechStack(fullContext, r.language);
        const features = extractKeyFeatures(fullContext);
        const metrics = extractMetrics(fullContext);
        const problem = extractProblemStatement(fullContext);

        // Format for the AI Prompt
        return `
--- PROJECT ANALYSIS ---
NAME: ${r.name}
URL: ${r.url}
STATS: ${r.stars} Stars | Updated: ${r.updatedAt}

1. CORE CONCEPT (Problem/Solution):
${problem}

2. TECH STACK (Detected):
${techStack}

3. KEY FEATURES (from Docs):
${features.length > 0 ? features.map(f => `- ${f}`).join('\n') : "- No features explicitly listed."}

4. METRICS / IMPACT (Detected Numbers):
${metrics.length > 0 ? metrics.map(m => `* ${m}`).join('\n') : "* No explicit performance metrics found."}
------------------------
        `;
    }));

    return enrichedRepos.join('\n\n');
};
