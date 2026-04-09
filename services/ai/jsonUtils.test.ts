import { describe, expect, it } from 'vitest';
import { cleanJsonOutput, safeJsonParse } from './jsonUtils';

describe('cleanJsonOutput', () => {
  it('removes markdown fences and trailing commas', () => {
    const raw = '```json\n{ "name": "Aayush", }\n```';
    const cleaned = cleanJsonOutput(raw);
    expect(cleaned).toBe('{ "name": "Aayush" }');
  });

  it('extracts object from surrounding text', () => {
    const raw = 'intro text\n{"score": 88}\nextra';
    const cleaned = cleanJsonOutput(raw);
    expect(cleaned).toBe('{"score": 88}');
  });
});

describe('safeJsonParse', () => {
  it('parses valid JSON as-is', () => {
    const parsed = safeJsonParse<{ ok: boolean }>('{"ok": true}');
    expect(parsed.ok).toBe(true);
  });

  it('repairs unquoted scalar values', () => {
    const parsed = safeJsonParse<{ status: string }>('{"status": done}');
    expect(parsed.status).toBe('done');
  });

  it('returns partial fallback for truncated audit response', () => {
    const parsed = safeJsonParse<{ candidateName: string; overallScore: number }>(
      '{"candidateName":"Aayush","overallScore":91'
    );
    expect(parsed.candidateName).toBe('Aayush');
    expect(parsed.overallScore).toBe(91);
  });
});