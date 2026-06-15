import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // Manejar peticiones CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY no configurada en Vercel." });
  }

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // Ejecutar la petición usando el SDK oficial estructurado para imágenes/PDFs
    const message = await anthropic.messages.create({
      model: requestBody.model || "claude-3-5-sonnet-20241022",
      max_tokens: requestBody.max_tokens || 4000,
      messages: requestBody.messages,
      system: requestBody.system,
    });

    return res.status(200).json(message);
  } catch (e) {
    console.error("Errores en la función de Claude:", e);
    return res.status(500).json({ error: e.message || String(e) });
  }
}
