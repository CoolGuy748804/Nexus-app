// api/gemini.js
// Backend proxy for the Nexus app. Keeps the Gemini API key out of the
// browser entirely — the key lives only in Vercel's environment variables.
//
// Deploy: put this file at /api/gemini.js in your repo, add an environment
// variable named GEMINI_API_KEY in your Vercel project settings (Settings
// → Environment Variables), then redeploy.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server misconfigured: GEMINI_API_KEY is not set' });
    return;
  }

  try {
    const upstream = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Upstream request to Gemini failed' });
  }
};
