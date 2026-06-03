import express from "express";
import cors from "cors";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());

  app.use(express.json());

  // API Route for translation
  app.post("/api/translate", async (req, res) => {
    try {
      const { sourceText, targetLanguage, targetLanguageName, sourceLanguageName } = req.body;
      if (!sourceText || !targetLanguage) {
        return res.status(400).json({ error: "Missing parameters" });
      }

      if (!process.env.GEMINI_API_KEY) {
         // Fallback to mymemory if gemini isn't configured
         const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=autodetect|${targetLanguage}`;
         const fallbackRes = await fetch(url);
         const fallbackData = await fallbackRes.json();
         return res.json({ translatedText: fallbackData?.responseData?.translatedText || sourceText });
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      // Use gemini for superior translation
      const sourceStr = sourceLanguageName ? `from ${sourceLanguageName}` : 'the sender';
      const prompt = `You are LinguaLayer AI’s Language Delivery Engine.
Your job is to prepare ${sourceStr}’s message for display in the receiver’s selected language: ${targetLanguageName || targetLanguage}.
Preserve the sender’s meaning exactly.
Do not add information.
Do not remove information.
Do not rewrite the user’s intention.
Do not make unclear statements certain.
Do not turn questions into statements.
Do not turn requests into promises.
Preserve names, numbers, dates, prices, addresses, phone numbers, product names, and business terms.
If the source message is unclear, preserve the uncertainty in the receiver language.
Only return the translated text without any quotes, explanations, or markdown formatting.

Text: ${sourceText}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      
      const translatedText = response.text?.trim() || sourceText;
      return res.json({ translatedText });
    } catch (error) {
      console.error("Translation API Error:", error);
      res.status(500).json({ error: "Failed to translate" });
    }
  });

  // API Route for TTS proxy
  app.get("/api/tts", async (req, res) => {
    try {
      const text = req.query.text as string;
      if (!text) {
        return res.status(400).json({ error: "Missing text parameter" });
      }
      
      const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=en-US&client=tw-ob&q=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google TTS failed with status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      res.setHeader('Content-Type', 'audio/mpeg');
      res.send(buffer);
    } catch (error) {
      console.error("TTS API Error:", error);
      res.status(500).json({ error: "Failed to fetch audio" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
