const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const VALID_CATS = ['Food','Transport','Shopping','Entertainment','Health','Education','Bills','Other'];

// POST /api/ai/categorize
router.post('/categorize', async (req, res) => {
  const { description } = req.body;
  if (!description?.trim()) return res.json({ category: null });

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8,
      system: 'Classify this expense into one category. Reply with a single word only: Food, Transport, Shopping, Entertainment, Health, Education, Bills, or Other.',
      messages: [{ role: 'user', content: description }]
    });
    const raw = msg.content[0].text.trim().replace(/\W/g, '');
    const category = VALID_CATS.find(c => c.toLowerCase() === raw.toLowerCase()) || 'Other';
    res.json({ category });
  } catch {
    res.json({ category: null });
  }
});

// POST /api/ai/insights
router.post('/insights', async (req, res) => {
  const { stats, expenses } = req.body;
  if (!stats) return res.json({ insights: [] });

  try {
    const context = JSON.stringify({
      total: stats.total,
      thisMonth: stats.thisMonth,
      count: stats.count,
      byCategory: stats.byCategory,
      sample: (expenses || []).slice(0, 20).map(e => ({
        desc: e.description, amt: e.amount, cat: e.category
      }))
    });

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: `Personal finance AI. Analyze spending data. Return exactly 3 JSON objects as an array.
Schema: [{ "type": "warning"|"tip"|"positive", "title": string (max 7 words), "body": string (max 22 words) }]
Use real numbers from the data. Return ONLY the JSON array, no other text or markdown.`,
      messages: [{ role: 'user', content: context }]
    });

    const raw = msg.content[0].text.trim();
    const insights = JSON.parse(raw);
    res.json({ insights: Array.isArray(insights) ? insights.slice(0, 3) : [] });
  } catch {
    res.json({ insights: [] });
  }
});

// POST /api/ai/chat  (SSE streaming)
router.post('/chat', async (req, res) => {
  const { message, stats, expenses } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const ctx = JSON.stringify({
    total: stats?.total,
    thisMonth: stats?.thisMonth,
    count: stats?.count,
    topCategories: (stats?.byCategory || []).slice(0, 6),
    recent: (expenses || []).slice(0, 25).map(e => ({
      d: e.description, a: e.amount, c: e.category
    }))
  });

  try {
    const stream = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: `You are ExpenseFlow AI, a concise personal finance assistant.
User expense data: ${ctx}
Answer using their real numbers. Keep it short (2-4 sentences). Be direct and friendly.`,
      messages: [{ role: 'user', content: message }],
      stream: true
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch {
    res.write(`data: ${JSON.stringify({ text: 'Something went wrong. Please try again.' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

module.exports = router;
