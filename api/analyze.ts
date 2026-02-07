import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

const DAILY_LIMIT = Number(process.env.DAILY_LIMIT || '10');
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60 * 24; // 24 hours
const MAX_BODY_SIZE_BYTES = 1024 * 1024; // 1MB
const MODEL_NAME_PATTERN = /^[a-zA-Z0-9._-]+$/;
const UPSTREAM_TIMEOUT_MS = 30_000;

const memoryStore = new Map<string, { count: number; expiry: number }>();

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

type AnalyzeRequestBody = {
  model?: unknown;
  payload?: unknown;
};

const parseEnvList = (input?: string): string[] => {
  if (!input) return [];
  return input
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const getAllowedOrigins = (): string[] => parseEnvList(process.env.ALLOWED_ORIGINS);

const getAllowedModels = (): string[] => parseEnvList(process.env.ALLOWED_GEMINI_MODELS);

const isAllowedModel = (model: string): boolean => {
  const allowList = getAllowedModels();
  if (allowList.length > 0) {
    return allowList.includes(model);
  }

  return MODEL_NAME_PATTERN.test(model) && model.startsWith('gemini-');
};

const applySecurityHeaders = (res: VercelResponse): void => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
};

const applyCorsHeaders = (req: VercelRequest, res: VercelResponse): boolean => {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
  const allowedOrigins = getAllowedOrigins();

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (!origin) {
    return true;
  }

  if (allowedOrigins.length === 0) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    return true;
  }

  return false;
};

const getClientIp = (req: VercelRequest): string => {
  const forwardedForHeader = req.headers['x-forwarded-for'];
  const forwardedFor = Array.isArray(forwardedForHeader)
    ? forwardedForHeader[0]
    : forwardedForHeader || '';
  const firstForwardedIp = forwardedFor.split(',')[0]?.trim();

  const realIpHeader = req.headers['x-real-ip'];
  const realIp = Array.isArray(realIpHeader) ? realIpHeader[0] : realIpHeader;

  return firstForwardedIp || realIp || req.socket.remoteAddress || 'unknown';
};

const getPayloadSizeBytes = (body: unknown): number => {
  try {
    return Buffer.byteLength(JSON.stringify(body ?? {}), 'utf8');
  } catch {
    return MAX_BODY_SIZE_BYTES + 1;
  }
};

const incrementUsageCounter = async (clientIp: string): Promise<number> => {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const key = `audit_limit:${clientIp}`;
    const count = await kv.incr(key);
    if (count === 1) {
      await kv.expire(key, RATE_LIMIT_WINDOW_SECONDS);
    }
    return count;
  }

  const now = Date.now();
  const existing = memoryStore.get(clientIp);

  if (existing && now < existing.expiry) {
    existing.count += 1;
    return existing.count;
  }

  memoryStore.set(clientIp, {
    count: 1,
    expiry: now + RATE_LIMIT_WINDOW_SECONDS * 1000,
  });

  if (memoryStore.size > 10_000) {
    memoryStore.clear();
  }

  return 1;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(res);

  const isCorsAllowed = applyCorsHeaders(req, res);
  if (!isCorsAllowed) {
    res.status(403).json({ error: 'Forbidden origin.' });
    return;
  }

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const bodySizeBytes = getPayloadSizeBytes(req.body);
  if (bodySizeBytes > MAX_BODY_SIZE_BYTES) {
    res.status(413).json({ error: 'Payload too large.' });
    return;
  }

  const body = (req.body ?? {}) as AnalyzeRequestBody;
  const model = typeof body.model === 'string' ? body.model.trim() : '';
  const payload = body.payload;

  if (!model || !isAllowedModel(model)) {
    res.status(400).json({ error: 'Invalid or unsupported model.' });
    return;
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    res.status(400).json({ error: 'Invalid payload.' });
    return;
  }

  const clientIp = getClientIp(req);
  let currentUsage = 0;

  try {
    currentUsage = await incrementUsageCounter(clientIp);
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open on storage outages to preserve availability.
  }

  if (currentUsage > DAILY_LIMIT) {
    res.status(429).json({
      error: 'Daily limit reached. Add your own API key in Settings to continue.',
    });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server configuration error: missing GEMINI_API_KEY.' });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!googleResponse.ok) {
      const providerErrorText = await googleResponse.text();
      res.status(googleResponse.status).json({
        error: 'Provider request failed.',
        details: providerErrorText.slice(0, 400),
      });
      return;
    }

    const data = await googleResponse.json();
    res.status(200).json(data);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      res.status(504).json({ error: 'Upstream request timeout.' });
      return;
    }

    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Proxy error:', message);
    res.status(500).json({ error: message });
  } finally {
    clearTimeout(timeout);
  }
}
