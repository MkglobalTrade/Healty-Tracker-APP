export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Usamos la misma variable que ya tienes guardada en Vercel
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "Clave de API no configurada en Vercel." });
  }

  try {
    const requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    // Extraer el mensaje y la imagen/documento del formato original
    const userMessage = requestBody.messages?.[requestBody.messages.length - 1];
    let promptText = "";
    let inlineData = null;

    if (Array.isArray(userMessage.content)) {
      const textBlock = userMessage.content.find(b => b.type === "text");
      const fileBlock = userMessage.content.find(b => b.type === "document" || b.type === "image");
      
      promptText = textBlock ? textBlock.text : "";
      if (fileBlock && fileBlock.source) {
        inlineData = {
          mimeType: fileBlock.source.media_type,
          data: fileBlock.source.data
        };
      }
    } else {
      promptText = userMessage.content || requestBody.messages?.[0]?.content || "";
    }

    // Estructurar la petición para la API oficial de Google Gemini
    const contents = [];
    if (inlineData) {
      contents.push({
        parts: [
          { text: promptText },
          { inlineData: inlineData }
        ]
      });
    } else {
      contents.push({ parts: [{ text: promptText }] });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.ANTHROPIC_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents })
    });

    const geminiData = await response.json();
    const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Devolver el formato exacto que tu App espera recibir en la interfaz
    return res.status(200).json({
      content: [{ type: "text", text: replyText }]
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e) });
  }
}
