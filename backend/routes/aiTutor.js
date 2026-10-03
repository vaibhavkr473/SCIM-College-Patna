import express from 'express';
import { authRequired, attachProfile } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authRequired, attachProfile, async (req, res) => {
  try {
    const { question, course, history } = req.body;
    if (!question) return res.status(400).json({ error: 'Missing required field: question' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        error: 'AI tutor is not available right now. Please try asking your professor on the Doubt Board tab instead.',
      });
    }

    const systemPrompt = `You are an AI academic tutor for SCIM College, Patna, helping ${course || "BBA/BCA"} students. Provide clear, educational answers about business administration and computer applications topics. Keep answers concise but informative. If a question is not academic, gently redirect the student to ask academic questions. Always respond in English unless the question is in another language.`;

    const contents = [];
    if (history && history.length > 0) {
      for (const msg of history) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nStudent question: ${question}` }],
    });

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
      }
    );

    if (!geminiResponse.ok) {
      return res.json({
        error: 'The AI tutor encountered an error. Please try again or ask your professor on the Doubt Board.',
      });
    }

    const data = await geminiResponse.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer) {
      return res.json({ error: 'Sorry, I could not generate an answer. Please try rephrasing your question.' });
    }

    res.json({ answer });
  } catch {
    res.json({
      error: 'The AI tutor is not available right now. Please try asking your professor on the Doubt Board tab instead.',
    });
  }
});

export default router;
