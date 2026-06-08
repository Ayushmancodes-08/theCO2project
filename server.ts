import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environmental variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use general JSON parser
  app.use(express.json());

  // API Route: Generate personalized insights using Gemini API
  app.post('/api/generate-insights', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'GEMINI_API_KEY is not configured in the workspace environments.',
        });
      }

      const { quizAnswers, totals, totalSum, currentDailyAvg, highestCategory } = req.body;

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are EcoMark Personal AI Advisor, a brilliant and precise carbon emissions analysis counselor. 
Analyze the following user data carefully and render a concise, professional diagnosis and action checklist:

1. Quiz profile:
   - Primary commute: ${quizAnswers?.transportMode || 'unknown'}
   - Commute distance per weekday: ${quizAnswers?.commuteDistance || 0} km
   - Daily diet pattern: ${quizAnswers?.dietType || 'unknown'}
   - Home energy grid: ${quizAnswers?.homeEnergy || 'unknown'}
   - Consumer habits: ${quizAnswers?.purchaseHabit || 'unknown'}

2. 30-Day total emissions logged: ${totalSum?.toFixed(1) || 0} kg CO2
3. Daily average emission: ${currentDailyAvg?.toFixed(1) || 0} kg CO2 per day (target is below 5.5 kg CO2)
4. Highest emission category: ${highestCategory || 'unknown'} with total of ${totals?.[highestCategory]?.toFixed(1) || 0} kg CO2.

Output format instructions:
- Output directly in raw Markdown format. Keep it concise, friendly, but authoritative.
- Include a structural heading "EcoMark Personalized AI Advisor Report".
- Provide an "Impact Assessment" section evaluating their daily average against the Paris Accord 1.5°C ceiling (daily limit of 5.5 kg).
- Provide a targeted "Deep-Dive" focus on their highest category (${highestCategory}) and recommend specific daily changes to lower it by at least 25%.
- Include a 3-bullet "Custom Action Checklist" with expected CO2 savings (e.g., -15 kg CO2/week).
- Do not use generic placeholders. Refer exactly to their provided numbers.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const insight = response.text;

      return res.json({
        success: true,
        insight,
      });
    } catch (error: any) {
      console.error('Gemini API Integration Failure:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Undergoing internal model diagnostics.',
      });
    }
  });

  // Serve static assets or mount Vite dev server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production statics path
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EcoMark server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Critical Server Boot Failure:', err);
});
