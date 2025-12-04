import { AnalysisResult, AIConfig, AIProvider, RemasterInput, RemasterResult, ComparisonResult, CandidateInput, InterviewPrepResult, PivotResult, RoadmapResult, LinkedInProfile, GithubProfileResult, ColdEmailResult, Plan90DaysResult, SalaryNegotiationResult } from "../types";

// --- UTILITIES ---

const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (!base64String) {
        reject(new Error("Failed to read file: Result is empty."));
        return;
      }
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const cleanJsonOutput = (text: string): string => {
  if (!text) return "{}";
  let cleaned = text.trim();
  
  // 1. Remove Markdown fences (Standard & Loose)
  cleaned = cleaned.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '');
  
  // 2. Remove comments (// ...) to prevent parse errors
  cleaned = cleaned.replace(/\/\/.*$/gm, ''); 
  
  // 3. Extract JSON object
  // Find the FIRST '{' and the LAST '}' to strip any conversational prefix/suffix
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  } else if (firstBrace !== -1) {
      // Truncated response: Take from start
      cleaned = cleaned.substring(firstBrace);
  }

  // 4. Remove Bad Control Characters
  // Removes non-printable characters (ASCII 0-31) EXCEPT newlines (\n), carriage returns (\r), and tabs (\t)
  cleaned = cleaned.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 5. Fix Trailing Commas (Common AI Error)
  // Replaces ", }" with "}" and ", ]" with "]"
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

  return cleaned;
};

// Robust JSON Parser with Auto-Repair
const safeJsonParse = (jsonString: string): any => {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.warn("Initial JSON parse failed. Attempting repairs...", e);
        
        let repaired = jsonString;

        // Repair Strategy 0: Fix unquoted property values (common with small models)
        // Replace patterns like `"key": value,` where value isn't quoted
        repaired = repaired.replace(/"(\w+)":\s*([^"\[\]{},\n]+)([,}\]])/g, (match, key, value, ending) => {
            const trimmed = value.trim();
            // Don't quote numbers, booleans, null
            if (/^-?\d+(\.\d+)?$/.test(trimmed) || trimmed === 'true' || trimmed === 'false' || trimmed === 'null') {
                return `"${key}": ${trimmed}${ending}`;
            }
            // Quote strings that aren't already quoted
            if (!trimmed.startsWith('"')) {
                return `"${key}": "${trimmed}"${ending}`;
            }
            return match;
        });

        // Repair Strategy 1: Auto-Close Truncated JSON
        // Count braces to see if we are missing closing ones
        const openBraces = (repaired.match(/\{/g) || []).length;
        const closeBraces = (repaired.match(/\}/g) || []).length;
        const openBrackets = (repaired.match(/\[/g) || []).length;
        const closeBrackets = (repaired.match(/\]/g) || []).length;

        if (openBraces > closeBraces) {
            repaired += '}'.repeat(openBraces - closeBraces);
        }
        if (openBrackets > closeBrackets) {
            repaired += ']'.repeat(openBrackets - closeBrackets);
        }

        try {
            return JSON.parse(repaired);
        } catch (e2) {
            console.warn("Auto-close failed. Attempting more repairs...");
            
            // Repair Strategy 2: Fix missing commas between properties
            repaired = repaired.replace(/"\s*\n\s*"/g, '",\n"');
            repaired = repaired.replace(/}\s*\n\s*"/g, '},\n"');
            repaired = repaired.replace(/]\s*\n\s*"/g, '],\n"');
            
            try {
                return JSON.parse(repaired);
            } catch (e3) {
                // Repair Strategy 3: Escape unescaped newlines in strings
                console.warn("Missing comma repair failed. Attempting newline escape...");
                const escaped = repaired.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
                try {
                    return JSON.parse(escaped);
                } catch (e4) {
                    // Final fallback: return a partial/default object
                    console.error("All JSON repair attempts failed.");
                    console.error("Raw Output:", jsonString.substring(0, 500) + "...");
                    
                    // Try to extract at least some data for common response types
                    try {
                        // Try to salvage auditor/resume analysis response
                        const nameMatch = jsonString.match(/"candidateName"\s*:\s*"([^"]+)"/);
                        const scoreMatch = jsonString.match(/"overallScore"\s*:\s*(\d+)/);
                        const headlineMatch = jsonString.match(/"roastHeadline"\s*:\s*"([^"]+)"/);
                        const truthMatch = jsonString.match(/"brutalTruth"\s*:\s*"([^"]*?)(?:",|"\s*})/);
                        
                        if (nameMatch && scoreMatch) {
                            console.warn("Returning partial auditor data");
                            return {
                                candidateName: nameMatch[1],
                                overallScore: parseInt(scoreMatch[1]),
                                roastHeadline: headlineMatch ? headlineMatch[1] : "Analysis Partially Complete",
                                brutalTruth: truthMatch ? truthMatch[1] : "Response was truncated. Try again for full analysis.",
                                metrics: { impact: 50, brevity: 50, technicalDepth: 50, formatting: 50 },
                                redFlags: ["Response was truncated - some data may be missing"],
                                greenFlags: [],
                                fixes: [],
                                psychometricProfile: {
                                    archetype: "Unknown",
                                    summary: "Profile could not be fully analyzed due to response truncation.",
                                    traits: [],
                                    cultureFit: "Unknown",
                                    frictionPoints: []
                                }
                            };
                        }
                        
                        // Try to salvage 90-day plan response
                        const roleMatch = jsonString.match(/"roleContext"\s*:\s*"([^"]+)"/);
                        if (roleMatch) {
                            console.warn("Returning partial 90-day plan data");
                            return {
                                roleContext: roleMatch[1],
                                days30: { focus: "Response truncated", goals: ["Please try again for complete plan."] },
                                days60: { focus: "Response truncated", goals: ["Please try again for complete plan."] },
                                days90: { focus: "Response truncated", goals: ["Please try again for complete plan."] }
                            };
                        }
                    } catch {}
                    
                    throw new Error("AI response was incomplete or malformed. Try again or use a different model.");
                }
            }
        }
    }
};

const SAFETY_PROTOCOL = `CRITICAL INSTRUCTIONS:
1. Output ONLY valid JSON - no markdown fences, no explanations, no text before/after
2. All string values must use double quotes and escape internal quotes with backslash
3. No trailing commas in arrays or objects
4. Complete all arrays and objects properly
`;

const PROMPTS = {
    AUDITOR: `${SAFETY_PROTOCOL}
You are an elite Executive Recruiter and Resume Analyst with 20+ years of experience at top firms.

ANALYSIS FRAMEWORK:
1. OVERALL ASSESSMENT (0-100 score)
   - Below 50: Critical issues, major rewrite needed
   - 50-70: Significant gaps, needs substantial improvement  
   - 70-85: Competitive but has room for optimization
   - 85-100: Exceptional, ready for top-tier opportunities

2. BRUTAL HONESTY SECTION
   - Create a punchy, memorable headline summarizing the resume's biggest flaw
   - Write a candid 2-3 sentence "brutal truth" assessment
   - Be direct but constructive - like a mentor who genuinely wants them to succeed

3. METRIC SCORING (0-100 each)
   - Impact: Do bullets quantify achievements? (revenue, %, users, savings)
   - Brevity: Is it concise? No fluff, no buzzwords without substance
   - Technical Depth: Does it demonstrate actual expertise, not just keyword stuffing?
   - Formatting: Clean, scannable, ATS-friendly structure

4. RED FLAGS: List specific problems (weak verbs, unexplained gaps, generic statements)
5. GREEN FLAGS: List genuine strengths worth highlighting

6. LINE-BY-LINE FIXES: For 3-5 weak bullets, provide:
   - Original text
   - Improved version with metrics/specifics
   - Reason why the change matters

7. ATS ANALYSIS (if job description provided):
   - Match score (0-100)
   - Missing keywords from JD
   - Keywords already present

8. PSYCHOMETRIC PROFILE (infer from writing style):
   - Archetype (e.g., "The Builder", "The Strategist", "The Firefighter")
   - Key traits with scores and explanations
   - Potential culture fit assessment
   - Likely friction points in workplace dynamics
`,
    
    REMASTER: `${SAFETY_PROTOCOL}
You are a world-class Executive Resume Writer who has helped C-suite executives, tech leaders, and career changers land roles at Fortune 500 companies.

YOUR MISSION: Transform this resume into a compelling professional narrative.

REWRITING RULES:
1. IMPACT-FIRST BULLETS
   - Start every bullet with a strong action verb
   - Include metrics wherever possible (%, $, time saved, users affected)
   - Use CAR format: Challenge → Action → Result
   - Example: "Reduced customer churn 34% by implementing predictive analytics model"

2. STRUCTURE
   - Professional Summary: 3-4 punchy sentences capturing unique value proposition
   - Experience: Focus on last 10 years, most recent roles get most detail
   - Skills: Organized by category, relevant to target role
   - Education: Brief unless recent grad

3. LANGUAGE UPGRADE
   - Replace passive voice with active
   - Eliminate filler words: "responsible for", "helped", "assisted"
   - Use industry-specific terminology appropriately
   - Keep sentences under 25 words

4. CUT REPORT: List anything you removed and why (outdated tech, irrelevant roles, fluff)

5. OUTPUT: Complete rewritten resume in clean Markdown format
`,

    INTERVIEW: `${SAFETY_PROTOCOL}
You are a Senior Technical Interviewer and Hiring Manager preparing a challenging interview.

Generate 5 interview questions designed to:
1. Probe the gaps or weak spots in the resume
2. Verify claimed expertise through technical depth
3. Assess problem-solving and communication skills
4. Reveal how they handle pressure/failure

For each question provide:
- The question itself (direct, not leading)
- Which interviewer persona would ask it (Technical Lead, HR, CEO, etc.)
- Context: What aspect of the resume triggered this question
- Good Answer Key: What a strong response would include
- Bad Answer Trap: Red flags in a weak response

Also generate a 30-second Elevator Pitch the candidate should use.
`,
    
    COMPARATOR: `${SAFETY_PROTOCOL}
You are the Chief Hiring Officer evaluating candidates for a critical role.

COMPARATIVE ANALYSIS:
1. LEADERBOARD: Rank all candidates with scores and clear reasoning
2. CATEGORY BREAKDOWN: Score each candidate on:
   - Technical Skills fit
   - Leadership/Collaboration signals
   - Growth trajectory
   - Culture fit indicators

3. DREAM TEAM ANALYSIS: If you could hire multiple, which 2-3 would form the best team?
   - Team name that captures their synergy
   - Why these specific people complement each other
   - Each person's role in the team dynamic
   - Collective blind spots to watch for
`,

    PIVOT: `${SAFETY_PROTOCOL}
You are a Career Transition Strategist who has helped thousands of professionals reinvent their careers.

Generate 3 realistic career pivot options:

For EACH pivot:
1. SPECIFIC ROLE: Not "Marketing" - instead "Growth Marketing Manager at Series B SaaS Startup"
2. FIT SCORE (0-100): How naturally do their skills transfer?
3. WHY IT FITS: Connect specific experiences to this role's requirements
4. GAP ANALYSIS: What skills/experiences are missing?
5. TRANSITION DIFFICULTY: Easy/Medium/Hard with explanation
6. MARKET OUTLOOK: Is this field growing? Salary expectations?
7. BRIDGE PROJECT: One project they could do THIS MONTH to build credibility
8. TRANSLATION LAYER: Take one bullet from their resume and show how to reframe it for this new role

Be creative but realistic - pivots should leverage existing strengths while stretching into adjacent territories.
`,
    
    ROADMAP: `${SAFETY_PROTOCOL}
You are a Learning & Development Expert creating a personalized upskilling plan.

Create a 4-WEEK intensive skill development roadmap:

For EACH week:
1. THEME: Clear focus area
2. TASKS: 5-7 specific, actionable items (not vague "learn X")
   - Include time estimates
   - Mix theory and hands-on practice
3. RESOURCES: Specific courses, books, tutorials (with links if known)
4. CHECKPOINT: How to verify mastery before moving on

RULES:
- Week 1: Foundations - fill critical knowledge gaps
- Week 2: Core Skills - build primary competencies  
- Week 3: Applied Practice - projects and real-world application
- Week 4: Polish & Portfolio - create demonstrable proof of skills

Be SPECIFIC to their target goal and current skill level.
`,

    LINKEDIN: `${SAFETY_PROTOCOL}
You are a LinkedIn Profile Optimization Expert.

Create a compelling LinkedIn presence:

1. HEADLINES (3 options): 
   - Mix of keyword-rich and personality-forward
   - Must fit in 220 characters
   - Examples: "Engineering Leader | Building Teams That Ship | Ex-Google"

2. ABOUT SECTION:
   - Hook in first line (shows above "see more")
   - Tell a story, not a list
   - Include a clear call-to-action
   - 2000 characters max

3. EXPERIENCE REWRITE:
   - For each role, optimize bullets for LinkedIn's algorithm
   - Front-load with keywords recruiters search for
   - More conversational than resume bullets
`,

    GITHUB: `${SAFETY_PROTOCOL}
You are a Developer Branding Expert creating a standout GitHub profile README.

Create a profile README that:
1. Has a memorable introduction/tagline
2. Showcases key skills with visual badges
3. Highlights 2-3 pinned project descriptions
4. Includes contribution stats or streak info
5. Has clear contact/collaboration CTA
6. Uses clean formatting with appropriate emojis (sparingly)

Output complete Markdown ready to paste into profile.
`,

    COLD_EMAIL: `${SAFETY_PROTOCOL}
You are a Business Development Expert specializing in cold outreach.

Generate 3 cold email templates:

1. DIRECT ASK: Straightforward request for opportunity
2. VALUE-FIRST: Lead with insight/help before asking
3. WARM CONNECTION: Reference mutual interest/connection

For EACH email:
- Subject line (under 50 chars, no spam triggers)
- Body (under 150 words)
- Clear CTA
- Explanation of why this approach works

Emails should feel human, not templated. Reference specific details from their background.
`,
    
    PLAN_90: `${SAFETY_PROTOCOL}
You are an Executive Onboarding Coach creating a strategic 90-day success plan.

Structure the plan around the classic 30-60-90 framework:

DAYS 1-30 (LEARN):
- Focus: Absorb context, build relationships, understand systems
- 5-7 specific goals with measurable outcomes
- Key stakeholders to meet and questions to ask

DAYS 31-60 (CONTRIBUTE):  
- Focus: Deliver early wins, establish credibility
- 5-7 specific goals showing tangible impact
- Projects to own or contribute to

DAYS 61-90 (LEAD):
- Focus: Drive initiatives, propose improvements, expand influence
- 5-7 specific goals demonstrating leadership
- Strategic recommendations to present

Make goals SPECIFIC to the role and company context provided.
`,

    SALARY: `${SAFETY_PROTOCOL}
You are a Salary Negotiation Coach who has helped professionals secure $10M+ in raises collectively.

Create a negotiation toolkit:

1. MARKET VALUE ESTIMATE: Based on role, experience, and typical ranges
2. LEVERAGE POINTS: What makes this candidate valuable? List 3-5 specific points

3. EMAIL SCRIPTS (3 versions):
   
   CONSERVATIVE (Low risk):
   - For risk-averse or early career
   - Polite, appreciative tone
   - Asks for modest increase
   
   BALANCED (Medium risk):
   - Confident but collaborative
   - Uses market data
   - Asks for meaningful increase
   
   AGGRESSIVE (Higher risk):
   - For strong candidates with options
   - Anchors high
   - May include competing offers

For each script include:
- Subject line
- Full email body
- Risk level assessment
- When to use this approach
`
};

// --- GEMINI API EXECUTOR ---
const executeGeminiAPI = async <T>(
    file: File | null,
    text: string | null,
    systemPrompt: string,
    userPrompt: string,
    config: AIConfig
): Promise<T> => {
    const modelName = config.modelName || 'gemini-2.5-flash';
    const baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
    
    // Gemini uses a different endpoint format
    const endpoint = `${baseUrl}/models/${modelName}:generateContent?key=${config.apiKey}`;
    
    // Build content parts
    const parts: any[] = [];
    
    // Add image if provided
    if (file) {
        try {
            const b64 = await fileToBase64(file);
            // Extract base64 data and mime type from data URL
            const matches = b64.match(/^data:(.+);base64,(.+)$/);
            if (matches) {
                parts.push({
                    inline_data: {
                        mime_type: matches[1],
                        data: matches[2]
                    }
                });
            }
        } catch (e) {
            console.warn("Failed to process image for Gemini:", e);
        }
    }
    
    // Add text content
    let textContent = userPrompt;
    if (text) {
        textContent = `<resume_content>\n${text}\n</resume_content>\n\n${userPrompt}`;
    }
    parts.push({ text: textContent });
    
    const payload = {
        contents: [
            {
                role: "user",
                parts: parts
            }
        ],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: "application/json"
        }
    };
    
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
        const errText = await res.text();
        if (res.status === 400 && errText.includes("API_KEY")) {
            throw new Error("Invalid API key. Please check your Gemini API key in Settings.");
        }
        if (res.status === 403) {
            throw new Error("API access denied. Make sure your API key has access to the selected model.");
        }
        if (res.status === 404) {
            throw new Error(`Model not found. The model "${modelName}" may not be available. Try gemini-2.5-flash or gemini-2.0-flash.`);
        }
        if (res.status === 429) {
            throw new Error("Rate limit exceeded. Please wait a moment and try again, or try a different model.");
        }
        throw new Error(`Gemini API Error (${res.status}): ${errText.substring(0, 150)}`);
    }
    
    const data = await res.json();
    
    // Check for truncation (finishReason)
    const finishReason = data.candidates?.[0]?.finishReason;
    if (finishReason === 'MAX_TOKENS') {
        console.warn("Response was truncated due to max tokens limit");
    }
    
    // Gemini response format is different
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        console.error("Unexpected Gemini response:", data);
        throw new Error("Gemini returned an unexpected response format.");
    }
    
    const rawOutput = data.candidates[0].content.parts[0].text;
    const cleanedOutput = cleanJsonOutput(rawOutput);
    return safeJsonParse(cleanedOutput);
};

// --- GENERIC API EXECUTOR (OpenAI Compatible + Gemini) ---
const executeAI = async <T>(
    file: File | null, 
    text: string | null,
    systemPrompt: string, 
    userPrompt: string, 
    config: AIConfig,
    schema: any
): Promise<T> => {
    
    const schemaText = `\nOUTPUT JSON SCHEMA:\n${JSON.stringify(schema)}`;
    const fullSystemPrompt = systemPrompt + schemaText;

    // For local models (Ollama), don't send images - convert to text description
    const isLocalModel = config.provider === AIProvider.OLLAMA;
    
    // --- GEMINI API (Different format) ---
    if (config.provider === AIProvider.GEMINI) {
        return executeGeminiAPI<T>(file, text, fullSystemPrompt, userPrompt, config);
    }

    // --- OpenAI-Compatible API ---
    const messages: any[] = [{ role: "system", content: fullSystemPrompt }];
    
    if (file && !isLocalModel) {
         const b64 = await fileToBase64(file);
         messages.push({ role: "user", content: [
             { type: "text", text: userPrompt },
             { type: "image_url", image_url: { url: b64 } }
         ]});
    } else {
         // Text-only mode (or local model fallback)
         let content = userPrompt;
         if (text) {
             content = `<resume_content>\n${text}\n</resume_content>\n\n${userPrompt}`;
         } else if (file) {
             content = `[Note: A file "${file.name}" was uploaded but this model doesn't support image input. Please paste the text content instead.]\n\n${userPrompt}`;
         }
         messages.push({ role: "user", content });
    }

    const baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    
    // Build headers - Ollama doesn't need auth
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.apiKey && config.provider !== AIProvider.OLLAMA) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
    }
    
    // OpenRouter specific headers
    if (config.provider === AIProvider.OPENROUTER) {
        headers['HTTP-Referer'] = window.location.href;
        headers['X-Title'] = 'Resume Auditor';
    }
    
    const payload: any = {
        model: config.modelName,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
    };
    
    // Local models (Ollama) - add options for better output
    if (config.provider === AIProvider.OLLAMA) {
        payload.options = {
            num_predict: 4096,  // Max tokens to generate
            temperature: 0.7,
            top_p: 0.9,
            repeat_penalty: 1.1,
        };
    }
    
    // JSON mode - only for providers that support it
    if (baseUrl.includes('openai.com') || baseUrl.includes('groq.com')) {
        payload.response_format = { type: "json_object" };
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
        const errText = await res.text();
        if (res.status === 401) {
            throw new Error("⚠️ INVALID API KEY. Please check your configuration in Settings.");
        }
        if (res.status === 404) {
            throw new Error(`⚠️ MODEL NOT FOUND: "${config.modelName}" doesn't exist on this provider. Check model name in Settings.`);
        }
        if (res.status === 429) {
            throw new Error("⚠️ RATE LIMIT EXCEEDED. You are sending too many requests too quickly.");
        }
        if (res.status === 402 || errText.includes('insufficient_quota')) {
            throw new Error("⚠️ INSUFFICIENT BALANCE. Your API Key has run out of credits.");
        }
        // Connection refused - likely Ollama not running
        if (errText.includes('ECONNREFUSED') || errText.includes('Failed to fetch')) {
            throw new Error("⚠️ CONNECTION FAILED. Is Ollama running? Start it with: ollama serve");
        }
        throw new Error(`API Error (${res.status}): ${errText}`);
    }
    
    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content || "{}";
    
    try {
        return safeJsonParse(cleanJsonOutput(rawContent));
    } catch (e) {
         throw e;
    }
};

// --- EXPORTED FUNCTIONS ---

export const analyzeResume = async (file: File | null, text: string | null, jobDesc: string, config: AIConfig, context?: { role: string, level: string }) => {
    // MERGED SCHEMA: AUDITOR + PSYCHOMETRIC
    const schema = {
        type: "OBJECT",
        properties: {
          candidateName: { type: "STRING" },
          overallScore: { type: "INTEGER" },
          roastHeadline: { type: "STRING" },
          brutalTruth: { type: "STRING" },
          metrics: { type: "OBJECT", properties: { impact: { type: "INTEGER" }, brevity: { type: "INTEGER" }, technicalDepth: { type: "INTEGER" }, formatting: { type: "INTEGER" } }, required: ["impact", "brevity", "technicalDepth", "formatting"] },
          redFlags: { type: "ARRAY", items: { type: "STRING" } },
          greenFlags: { type: "ARRAY", items: { type: "STRING" } },
          fixes: { type: "ARRAY", items: { type: "OBJECT", properties: { original: { type: "STRING" }, improved: { type: "STRING" }, reason: { type: "STRING" } } } },
          atsAnalysis: { type: "OBJECT", properties: { matchScore: { type: "INTEGER" }, missingKeywords: { type: "ARRAY", items: { type: "STRING" } }, matchingKeywords: { type: "ARRAY", items: { type: "STRING" } } }, nullable: true },
          // New Merged Field
          psychometricProfile: { 
              type: "OBJECT",
              properties: {
                  archetype: { type: "STRING" },
                  summary: { type: "STRING" },
                  traits: { type: "ARRAY", items: { type: "OBJECT", properties: { trait: { type: "STRING" }, score: { type: "INTEGER" }, explanation: { type: "STRING" } } } },
                  cultureFit: { type: "STRING" },
                  frictionPoints: { type: "ARRAY", items: { type: "STRING" } }
              }
          }
        },
        required: ["candidateName", "overallScore", "metrics", "fixes", "psychometricProfile"]
    };
    const ctx = context ? `Role: ${context.role}, Level: ${context.level}` : "General";
    const result = await executeAI<AnalysisResult>(file, text, PROMPTS.AUDITOR, `Analyze Resume. Context: ${ctx}. JD: ${jobDesc}`, config, schema);
    
    // Attach Context
    result.jobDescription = jobDesc;
    result.resumeContent = text || (file ? `File uploaded: ${file.name}` : undefined);
    return result;
};

export const compareResumes = async (candidates: CandidateInput[], jobDesc: string, config: AIConfig) => {
    // MERGED SCHEMA: COMPARATOR + DREAM TEAM
    const schema = {
        type: "OBJECT",
        properties: {
            summary: { type: "STRING" },
            leaderboard: { type: "ARRAY", items: { type: "OBJECT", properties: { rank: { type: "INTEGER" }, candidateName: { type: "STRING" }, score: { type: "INTEGER" }, reason: { type: "STRING" } } } },
            categoryBreakdown: { type: "ARRAY", items: { type: "OBJECT", properties: { category: { type: "STRING" }, rankings: { type: "ARRAY", items: { type: "OBJECT", properties: { rank: { type: "INTEGER" }, candidateName: { type: "STRING" }, score: { type: "INTEGER" }, reason: { type: "STRING" } } } } } } },
            // New Merged Field
            dreamTeamAnalysis: {
                type: "OBJECT",
                properties: {
                    squadName: { type: "STRING" },
                    selectedMembers: { type: "ARRAY", items: { type: "STRING" } },
                    synergyScore: { type: "INTEGER" },
                    rationale: { type: "STRING" },
                    roles: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, role: { type: "STRING" }, contribution: { type: "STRING" } } } },
                    collectiveWeaknesses: { type: "ARRAY", items: { type: "STRING" } }
                }
            }
        },
        required: ["summary", "leaderboard", "dreamTeamAnalysis"]
    };

    let promptContent = `Compare candidates. JD: ${jobDesc || 'None'}`;
    let result: ComparisonResult;

    // For local models, convert files to text descriptions
    const isLocalModel = config.provider === AIProvider.OLLAMA;
    
    // OpenAI Compatible API
    const contentParts: any[] = [{ type: 'text', text: promptContent }];
    let hasFiles = false;
    for (const c of candidates) {
         if (c.type === 'FILE' && !isLocalModel) {
             hasFiles = true;
             const b64 = await fileToBase64(c.file);
             contentParts.push({ type: 'image_url', image_url: { url: b64 } });
         } else if (c.type === 'FILE' && isLocalModel) {
             contentParts.push({ type: 'text', text: `Candidate ${c.file.name}: [File uploaded - please use text input for local models]` });
         } else if (c.type === 'TEXT') {
             contentParts.push({ type: 'text', text: `Candidate ${c.name}: ${c.text}` });
         }
    }
    
    const schemaText = `\nSCHEMA: ${JSON.stringify(schema)}`;
    const messages = [
        { role: "system", content: PROMPTS.COMPARATOR + schemaText },
        { role: "user", content: hasFiles && !isLocalModel ? contentParts : contentParts.map(p => p.text).join('\n') }
    ];
    
    const baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    
    // Build headers
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.apiKey && config.provider !== AIProvider.OLLAMA) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
    }
    if (config.provider === AIProvider.OPENROUTER) {
        headers['HTTP-Referer'] = window.location.href;
        headers['X-Title'] = 'Resume Auditor';
    }
    
    const payload: any = { 
        model: config.modelName, 
        messages, 
        temperature: 0.5,
        max_tokens: 8192,
    };
    
    if (baseUrl.includes('openai.com') || baseUrl.includes('groq.com')) {
        payload.response_format = { type: "json_object" };
    }
    
    const res = await fetch(`${baseUrl}/chat/completions`, { 
        method: 'POST', 
        headers, 
        body: JSON.stringify(payload) 
    });
    
    if (!res.ok) {
        const errText = await res.text();
        if (res.status === 404) {
            throw new Error(`⚠️ MODEL NOT FOUND: "${config.modelName}" doesn't exist. Check model name in Settings.`);
        }
        throw new Error(`API Error (${res.status}): ${errText}`);
    }
    
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    result = safeJsonParse(cleanJsonOutput(raw));

    // Attach Context
    result.timestamp = Date.now();
    result.jobDescription = jobDesc;
    result.candidateData = candidates.map(c => ({
        name: c.type === 'FILE' ? c.file.name : c.name,
        type: c.type,
        text: c.type === 'TEXT' ? c.text : undefined
    }));
    
    return result;
};

export const remasterResume = async (file: File | null, text: string | null, jobDesc: string, input: RemasterInput, config: AIConfig) => {
    const schema = {
        type: "OBJECT",
        properties: {
            markdownContent: { type: "STRING" },
            cutReport: { type: "ARRAY", items: { type: "OBJECT", properties: { text: { type: "STRING" }, reason: { type: "STRING" } } } },
            improvementsMade: { type: "ARRAY", items: { type: "STRING" } }
        },
        required: ["markdownContent"]
    };
    const userInput = `Projects: ${input.extraProjects}\nAwards: ${input.achievements}`;
    return executeAI<RemasterResult>(file, text, PROMPTS.REMASTER, `Remaster Resume. Inputs: ${userInput}. JD: ${jobDesc}`, config, schema);
};

export const generateInterviewQuestions = async (file: File | null, text: string | null, jobDesc: string, config: AIConfig) => {
    const schema = {
        type: "OBJECT",
        properties: {
            questions: { type: "ARRAY", items: { type: "OBJECT", properties: { askedBy: { type: "STRING" }, question: { type: "STRING" }, context: { type: "STRING" }, goodAnswerKey: { type: "STRING" }, badAnswerTrap: { type: "STRING" } } } },
            elevatorPitch: { type: "STRING" }
        },
        required: ["questions"]
    };
    return executeAI<InterviewPrepResult>(file, text, PROMPTS.INTERVIEW, `Generate Questions. JD: ${jobDesc}`, config, schema);
};

export const generateCareerPivots = async (file: File | null, text: string | null, config: AIConfig) => {
    const schema = {
        type: "OBJECT",
        properties: {
            options: { type: "ARRAY", items: { type: "OBJECT", properties: { role: { type: "STRING" }, salaryRange: { type: "STRING" }, fitScore: { type: "INTEGER" }, whyItFits: { type: "STRING" }, gapAnalysis: { type: "STRING" }, transitionDifficulty: { type: "STRING", enum: ["EASY", "MEDIUM", "HARD"] }, marketOutlook: { type: "STRING" }, bridgeProject: { type: "STRING" }, translationLayer: { type: "OBJECT", properties: { original: { type: "STRING" }, adapted: { type: "STRING" } } } } } }
        },
        required: ["options"]
    };
    return executeAI<PivotResult>(file, text, PROMPTS.PIVOT, "Generate Pivots", config, schema);
};

export const generateSkillRoadmap = async (file: File | null, text: string | null, context: string, config: AIConfig) => {
    const schema = {
        type: "OBJECT",
        properties: {
            targetGoal: { type: "STRING" },
            schedule: { type: "ARRAY", items: { type: "OBJECT", properties: { week: { type: "INTEGER" }, theme: { type: "STRING" }, tasks: { type: "ARRAY", items: { type: "STRING" } }, resources: { type: "ARRAY", items: { type: "STRING" } }, checkpoint: { type: "STRING" } }, required: ["week", "theme", "tasks", "resources"] } }
        },
        required: ["targetGoal", "schedule"]
    };
    return executeAI<RoadmapResult>(file, text, PROMPTS.ROADMAP, `Target: ${context}`, config, schema);
};

export const generateLinkedInProfile = async (file: File | null, text: string | null, config: AIConfig) => {
    const schema = {
        type: "OBJECT",
        properties: { headlines: { type: "ARRAY", items: { type: "STRING" } }, aboutSection: { type: "STRING" }, experienceRewrite: { type: "ARRAY", items: { type: "OBJECT", properties: { company: { type: "STRING" }, role: { type: "STRING" }, optimizedBullets: { type: "ARRAY", items: { type: "STRING" } } } } } },
        required: ["headlines"]
    };
    return executeAI<LinkedInProfile>(file, text, PROMPTS.LINKEDIN, "Generate Profile", config, schema);
};

export const generateGithubProfileReadme = async (file: File | null, text: string | null, config: AIConfig) => {
    const schema = { type: "OBJECT", properties: { markdownContent: { type: "STRING" } }, required: ["markdownContent"] };
    return executeAI<GithubProfileResult>(file, text, PROMPTS.GITHUB, "Generate README", config, schema);
};

export const generateColdEmails = async (file: File | null, text: string | null, context: string, config: AIConfig) => {
    const schema = {
        type: "OBJECT",
        properties: { emails: { type: "ARRAY", items: { type: "OBJECT", properties: { type: { type: "STRING" }, subject: { type: "STRING" }, body: { type: "STRING" }, explanation: { type: "STRING" } } } } },
        required: ["emails"]
    };
    return executeAI<ColdEmailResult>(file, text, PROMPTS.COLD_EMAIL, `Target: ${context}`, config, schema);
};

export const generate90DayPlan = async (file: File | null, text: string | null, context: string, config: AIConfig) => {
    const schema = {
        type: "OBJECT",
        properties: {
            roleContext: { type: "STRING" },
            days30: { type: "OBJECT", properties: { focus: { type: "STRING" }, goals: { type: "ARRAY", items: { type: "STRING" } } } },
            days60: { type: "OBJECT", properties: { focus: { type: "STRING" }, goals: { type: "ARRAY", items: { type: "STRING" } } } },
            days90: { type: "OBJECT", properties: { focus: { type: "STRING" }, goals: { type: "ARRAY", items: { type: "STRING" } } } }
        },
        required: ["days30", "days60", "days90"]
    };
    return executeAI<Plan90DaysResult>(file, text, PROMPTS.PLAN_90, `Target Context: ${context}`, config, schema);
};

export const generateSalaryScripts = async (file: File | null, text: string | null, context: string, config: AIConfig) => {
    const schema = {
        type: "OBJECT",
        properties: {
            estimatedMarketValue: { type: "STRING" },
            leveragePoints: { type: "ARRAY", items: { type: "STRING" } },
            scripts: { type: "ARRAY", items: { type: "OBJECT", properties: { scenario: { type: "STRING" }, subjectLine: { type: "STRING" }, emailBody: { type: "STRING" }, riskLevel: { type: "STRING" }, whyUseIt: { type: "STRING" } } } }
        },
        required: ["scripts"]
    };
    return executeAI<SalaryNegotiationResult>(file, text, PROMPTS.SALARY, `Target Context: ${context}`, config, schema);
};