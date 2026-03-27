const createPartialAuditFallback = (jsonString: string) => {
  const nameMatch = jsonString.match(/"candidateName"\s*:\s*"([^"]+)"/);
  const scoreMatch = jsonString.match(/"overallScore"\s*:\s*(\d+)/);
  const headlineMatch = jsonString.match(/"roastHeadline"\s*:\s*"([^"]+)"/);
  const truthMatch = jsonString.match(/"brutalTruth"\s*:\s*"([^"]*?)(?:",|"\s*})/);

  if (!nameMatch || !scoreMatch) {
    return null;
  }

  return {
    candidateName: nameMatch[1],
    overallScore: parseInt(scoreMatch[1], 10),
    roastHeadline: headlineMatch ? headlineMatch[1] : 'Analysis Partially Complete',
    brutalTruth: truthMatch ? truthMatch[1] : 'Response was truncated. Try again for full analysis.',
    metrics: { impact: 50, brevity: 50, technicalDepth: 50, formatting: 50 },
    redFlags: ['Response was truncated - some data may be missing'],
    greenFlags: [],
    fixes: [],
    psychometricProfile: {
      archetype: 'Unknown',
      summary: 'Profile could not be fully analyzed due to response truncation.',
      traits: [],
      cultureFit: 'Unknown',
      frictionPoints: [],
    },
  };
};

const createPartialPlanFallback = (jsonString: string) => {
  const roleMatch = jsonString.match(/"roleContext"\s*:\s*"([^"]+)"/);

  if (!roleMatch) {
    return null;
  }

  return {
    roleContext: roleMatch[1],
    days30: { focus: 'Response truncated', goals: ['Please try again for complete plan.'] },
    days60: { focus: 'Response truncated', goals: ['Please try again for complete plan.'] },
    days90: { focus: 'Response truncated', goals: ['Please try again for complete plan.'] },
  };
};

export const cleanJsonOutput = (text: string): string => {
  if (!text) return '{}';

  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json|JSON)?\s*/i, '').replace(/\s*```$/i, '');
  cleaned = cleaned.replace(/\/\/.*$/gm, '');

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  } else if (firstBrace !== -1) {
    cleaned = cleaned.substring(firstBrace);
  }

  cleaned = cleaned.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  cleaned = cleaned.replace(/([^\\])"([^"]*)\n([^"]*)"(?=\s*[,}\]])/g, '$1"$2\\n$3"');

  return cleaned;
};

export const safeJsonParse = <T = unknown>(jsonString: string): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.warn('Initial JSON parse failed. Attempting repairs...', error);

    let repaired = jsonString;

    repaired = repaired.replace(/"(\w+)":\s*([^"\[\]{},\n]+)([,}\]])/g, (match, key, value, ending) => {
      const trimmed = value.trim();
      if (/^-?\d+(\.\d+)?$/.test(trimmed) || trimmed === 'true' || trimmed === 'false' || trimmed === 'null') {
        return `"${key}": ${trimmed}${ending}`;
      }

      if (!trimmed.startsWith('"')) {
        return `"${key}": "${trimmed}"${ending}`;
      }

      return match;
    });

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
      return JSON.parse(repaired) as T;
    } catch {
      console.warn('Auto-close failed. Attempting more repairs...');

      repaired = repaired.replace(/"\s*\n\s*"/g, '",\n"');
      repaired = repaired.replace(/}\s*\n\s*"/g, '},\n"');
      repaired = repaired.replace(/]\s*\n\s*"/g, '],\n"');

      try {
        return JSON.parse(repaired) as T;
      } catch {
        console.warn('Missing comma repair failed. Attempting newline escape...');
        const escaped = repaired.replace(/\n/g, '\\n').replace(/\r/g, '\\r');

        try {
          return JSON.parse(escaped) as T;
        } catch {
          console.error('All JSON repair attempts failed.');
          console.error('Raw Output:', jsonString.substring(0, 500) + '...');

          const partialAudit = createPartialAuditFallback(jsonString);
          if (partialAudit) {
            console.warn('Returning partial auditor data');
            return partialAudit as T;
          }

          const partialPlan = createPartialPlanFallback(jsonString);
          if (partialPlan) {
            console.warn('Returning partial 90-day plan data');
            return partialPlan as T;
          }

          throw new Error('AI response was incomplete or malformed. Try again or use a different model.');
        }
      }
    }
  }
};