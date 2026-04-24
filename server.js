require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors());
app.use(express.json());

function normalizeSource(raw) {
  const map = {
    'chatgpt': 'ChatGPT',
    'chat.openai.com': 'ChatGPT',
    'chatgpt.com': 'ChatGPT',
    'perplexity': 'Perplexity',
    'perplexity.ai': 'Perplexity',
    'claude': 'Claude',
    'claude.ai': 'Claude',
    'gemini': 'Google Gemini',
    'gemini.google.com': 'Google Gemini',
    'copilot': 'Microsoft Copilot',
    'copilot.microsoft.com': 'Microsoft Copilot',
  };
  const key = raw.trim().toLowerCase();
  return map[key] || raw.trim();
}

app.post('/track', async (req, res) => {
  const { siteId, source: rawSource, page, referrer } = req.body;

  if (!siteId || !rawSource || !page) {
    return res.status(400).json({ error: 'Missing required fields: siteId, source, page' });
  }

  const source = normalizeSource(rawSource);

  try {
    await pool.query(
      'INSERT INTO events (site_id, source, page, referrer) VALUES ($1, $2, $3, $4)',
      [siteId, source, page, referrer || null]
    );
    res.status(202).json({ status: 'ok' });
  } catch (err) {
    console.error('DB insert error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (_, res) => res.send('OK'));

app.listen(port, () => console.log(`AI Traffic backend listening on port ${port}`));
