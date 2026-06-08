/**
 * EcoQuest RPG — Express server
 *
 * Security hardening:
 * - Request body size limited to 32 KB (prevents payload-inflation DoS)
 * - Per-IP rate limiting on the AI insights endpoint (30 req / 15 min)
 * - Input validation: all user-supplied fields are sanitised before
 *   being interpolated into the Gemini prompt (no raw user text in prompt)
 * - Secrets never echoed back in error responses
 */
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// ─── Types ────────────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count:     number;
  resetAt:   number;
}

// ─── Simple in-memory rate limiter ───────────────────────────────────────────

const RATE_LIMIT_WINDOW_MS  = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX        = 30;              // requests per window per IP
const rateLimitMap          = new Map<string, RateLimitEntry>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count += 1;
  return true;
}

// ─── Input sanitisation helpers ──────────────────────────────────────────────

/** Allowed transport mode values */
const VALID_TRANSPORT  = new Set(['car_ice', 'car_ev', 'transit', 'bike_walk']);
/** Allowed diet type values */
const VALID_DIET       = new Set(['meat_heavy', 'meat_light', 'vegetarian', 'vegan']);
/** Allowed home energy values */
const VALID_ENERGY     = new Set(['coal_gas', 'mix', 'renewable']);
/** Allowed purchase habit values */
const VALID_PURCHASE   = new Set(['high', 'moderate', 'low']);
/** Allowed flight frequency values */
const VALID_FLIGHTS    = new Set(['low', 'moderate', 'high']);

function sanitiseString(value: unknown, allowed: Set<string>, fallback: string): string {
  return typeof value === 'string' && allowed.has(value) ? value : fallback;
}

function sanitiseNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
}

// ─── Server bootstrap ─────────────────────────────────────────────────────────

async function startServer() {
  const app  = express();
  const PORT = 3000;

  // Limit body to 32 KB to prevent payload-inflation attacks
  app.use(express.json({ limit: '32kb' }));

  // ── AI Insights Endpoint ──────────────────────────────────────────────────

  app.post('/api/generate-insights', async (req, res) => {
    try {
      // 1. Rate limiting
      const clientIp = (req.headers['x-forwarded-for'] as string | undefined)
        ?.split(',')[0]
        ?.trim() ?? req.socket.remoteAddress ?? 'unknown';

      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({
          success: false,
          error:   'Too many requests. Please wait a few minutes before trying again.',
        });
      }

      // 2. API key validation (never echo the key in responses)
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
        return res.status(400).json({
          success: false,
          error:   'The Gemini API key is not configured on this server.',
        });
      }

      // 3. Sanitise and validate all user-supplied inputs
      const rawAnswers   = req.body?.quizAnswers ?? {};
      const rawTotals    = req.body?.totals ?? {};

      const transportMode    = sanitiseString(rawAnswers.transportMode,   VALID_TRANSPORT, 'unknown');
      const commuteDistance  = sanitiseNumber(rawAnswers.commuteDistance,  0, 500, 0);
      const dietType         = sanitiseString(rawAnswers.dietType,         VALID_DIET,     'unknown');
      const homeEnergy       = sanitiseString(rawAnswers.homeEnergy,       VALID_ENERGY,   'unknown');
      const purchaseHabit    = sanitiseString(rawAnswers.purchaseHabit,    VALID_PURCHASE, 'unknown');
      const flightFrequency  = sanitiseString(rawAnswers.flightFrequency,  VALID_FLIGHTS,  'unknown');

      const totalSum         = sanitiseNumber(req.body?.totalSum,          0, 1e6,  0);
      const currentDailyAvg = sanitiseNumber(req.body?.currentDailyAvg,   0, 1e4,  0);

      // Derive highest category from sanitised totals (no raw string interpolation)
      const safeTransport  = sanitiseNumber(rawTotals.transport,  0, 1e6, 0);
      const safeFood       = sanitiseNumber(rawTotals.food,        0, 1e6, 0);
      const safeEnergy     = sanitiseNumber(rawTotals.energy,      0, 1e6, 0);
      const safePurchases  = sanitiseNumber(rawTotals.purchases,   0, 1e6, 0);

      const categoryMap: Record<string, number> = {
        transport: safeTransport,
        food:      safeFood,
        energy:    safeEnergy,
        purchases: safePurchases,
      };
      const highestCategory = Object.keys(categoryMap).reduce((a, b) =>
        categoryMap[a] > categoryMap[b] ? a : b
      );
      const highestValue = categoryMap[highestCategory];

      // 4. Build prompt using only sanitised, safe values
      const prompt = `You are EcoMark Personal AI Advisor, a precise carbon-emissions counsellor.
Analyse the data below and provide a concise, friendly but authoritative Markdown report.

User profile:
- Transport mode: ${transportMode}
- Commute distance: ${commuteDistance} km/day
- Diet: ${dietType}
- Home energy: ${homeEnergy}
- Flight frequency: ${flightFrequency}
- Consumer habits: ${purchaseHabit}

30-day totals (kg CO₂):
- Transport: ${safeTransport.toFixed(1)}
- Food: ${safeFood.toFixed(1)}
- Energy: ${safeEnergy.toFixed(1)}
- Purchases: ${safePurchases.toFixed(1)}
- Grand total: ${totalSum.toFixed(1)} kg
- Daily average: ${currentDailyAvg.toFixed(1)} kg (Paris target: ≤5.5 kg)

Highest-impact category: ${highestCategory} (${highestValue.toFixed(1)} kg over 30 days)

Output format:
1. A heading "## EcoMark Personalized AI Advisor Report"
2. An "### Impact Assessment" section comparing their daily average to the Paris Accord ceiling.
3. A "### Deep-Dive: ${highestCategory}" section with two specific actions to cut it by ≥25%.
4. A "### Custom Action Checklist" with exactly 3 bullet points and expected weekly kg CO₂ savings.
Keep the tone encouraging, data-driven, and free of generic placeholders.`;

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model:    'gemini-2.5-flash',
        contents: prompt,
      });

      return res.json({ success: true, insight: response.text });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      console.error('[EcoQuest] Gemini API error:', message);
      return res.status(500).json({
        success: false,
        error:   'The Sage is meditating — please try again shortly.',
      });
    }
  });

  // ── Static / Dev middleware ───────────────────────────────────────────────

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server:  { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EcoQuest server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err: unknown) => {
  console.error('Critical server boot failure:', err);
  process.exit(1);
});
