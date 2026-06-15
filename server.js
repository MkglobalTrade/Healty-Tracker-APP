import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5173;

app.use(express.json());

// Serve static files from dist
app.use(express.static(join(__dirname, 'dist')));

// API endpoint for Claude
app.post('/api/claude', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'ANTHROPIC_API_KEY is not configured. Please set it in your environment variables.' 
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🏥 Health Command Center running at http://localhost:${PORT}`);
  console.log(`\n📝 Note: To use AI features (chat, news, lab analysis), set ANTHROPIC_API_KEY:`);
  console.log(`   export ANTHROPIC_API_KEY="your-key-here"\n`);
});
