import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanJsonOutput, safeJsonParse } from './jsonUtils';

let warnSpy: ReturnType<typeof vi.spyOn>;
let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  warnSpy.mockRestore();
  errorSpy.mockRestore();
});

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