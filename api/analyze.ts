import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

// --- CONFIGURATION ---
const DAILY_LIMIT = 10;
const RATE_LIMIT_WINDOW = 60 * 60 * 24; // 24 Hours in seconds

// Fallback In-Memory Storage (Resets on server cold start, good for simple protection)
const memoryStore = new Map<string, { count: number; expiry: number }>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', "true");
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // 2. Identify User (IP Based)
  const rawIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const clientIp = rawIp.split(',')[0].trim();

  // 3. Invisible Rate Limiting
  let currentUsage = 0;

  try {
    // Attempt A: Vercel KV (Redis)
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        const key = `audit_limit:${clientIp}`;
        const count = await kv.incr(key);
        if (count === 1) {
            await kv.expire(key, RATE_LIMIT_WINDOW);
        }
        currentUsage = count;
    } 
    // Attempt B: Memory Fallback
    else {
        const now = Date.now();
        const record = memoryStore.get(clientIp);
        
        if (record && now < record.expiry) {
            record.count++;
            currentUsage = record.count;
        } else {
            currentUsage = 1;
            memoryStore.set(clientIp, { 
                count: 1, 
                expiry: now + (RATE_LIMIT_WINDOW * 1000) 
            });
        }
        
        // Garbage collection
        if (memoryStore.size > 10000) memoryStore.clear();
    }
  } catch (error) {
    console.error("Rate Limit Logic Error:", error);
    // Fail open to avoid blocking valid users during DB outage
  }

  // 4. Enforce Limit
  if (currentUsage > DAILY_LIMIT) {
    res.status(429).json({ 
      error: 'Daily Limit Reached. Add your own API Key in Settings to continue.' 
    });
    return;
  }

  // 5. Secure Proxy
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server Config Error: Missing GEMINI_API_KEY env var.' });
    return;
  }

  try {
    const { model, payload } = req.body;
    
    // Hardcoded to Google to prevent relay attacks
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!googleResponse.ok) {
      const errorText = await googleResponse.text();
      res.status(googleResponse.status).json({ error: `Provider Error: ${errorText}` });
      return;
    }

    const data = await googleResponse.json();
    res.status(200).json(data);

  } catch (error: any) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}