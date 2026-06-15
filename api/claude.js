export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Usamos la clave de OpenAI que ya tienes guardada en tu Vercel
  if (!process.env.Open_Ai_Key) {
    return res.status(500).json({ error: "Clave Open_Ai_Key no encontrada en Vercel." });
  }

  try {
    const requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    // Extraer los mensajes del formato original
    const userMessage = requestBody.messages?.[requestBody.messages.length - 1];
    let promptText = "";
    let imageUrl = null;

    if (Array.isArray(userMessage.content)) {
      const textBlock = userMessage.content.find(b => b.type === "text");
      const fileBlock = userMessage.content.find(b => b.type === "image" || b.type === "document");
      
      promptText = textBlock ? textBlock.text : "";
      if (fileBlock && fileBlock.source) {
        // Formatear la imagen/PDF en base64 para OpenAI
        imageUrl = `data:${fileBlock.source.media_type};base64,${fileBlock.source.data}`;
      }
    } else {
      promptText = userMessage.content || requestBody.messages?.[0]?.content || "";
    }

    // Estructurar el mensaje para el modelo GPT-4o de OpenAI
    const openAiMessages = [
      {
        role: "system",
        content: requestBody.system || "You are a clinical lab report analyzer. Extract all test results."
      }
    ];

    if (imageUrl) {
      openAiMessages.push({
        role: "user",
        content: [
          { type: "text", text: promptText },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      });
    } else {
      openAiMessages.push({
        role: "user",
        content: promptText
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.Open_Ai_Key}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: openAiMessages,
        max_tokens: 1500,
        response_format: { type: "json_object" } // Asegurar que responda en JSON puro
      })
    });

    const openAiData = await response.json();
    const replyText = openAiData.choices?.[0]?.message?.content || "";

    // Devolver el formato exacto que la interfaz visual espera recibir
    return res.status(200).json({
      content: [{ type: "text", text: replyText }]
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e) });
  }
}
