import express from "express";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Protect backend API
  app.use(helmet());
  
  // Rate limiting to prevent unlimited spam requests
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    message: { error: "Too many requests from this IP, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(cors());
  app.use(express.json());
  
  // Error Tracking API
  app.post("/api/error-track", (req, res) => {
    // In production, this would integrate with Sentry, Logflare, or Firebase Crashlytics custom logs
    console.error(`[CRASH-TRACK] client-side error: ${req.body.error}`, req.body);
    res.status(200).json({ status: "logged" });
  });

  // Apply rate limiter specifically to API endpoints
  app.use("/api/", apiLimiter);

  // API Route for v1 sessions
  app.get("/api/v1/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));
  app.post("/api/v1/sessions", (req, res) => res.json({ status: "created", id: "mock-session" }));
  app.get("/api/v1/sessions/:sessionId", (req, res) => res.json({ status: "active", id: req.params.sessionId }));
  app.post("/api/v1/sessions/:sessionId/join", (req, res) => res.json({ status: "joined" }));
  app.post("/api/v1/sessions/:sessionId/leave", (req, res) => res.json({ status: "left" }));
  app.post("/api/v1/sessions/:sessionId/rejoin", (req, res) => res.json({ status: "rejoined" }));
  app.post("/api/v1/sessions/:sessionId/end", (req, res) => res.json({ status: "ended" }));
  app.patch("/api/v1/sessions/:sessionId/participants/:participantId/language", (req, res) => res.json({ status: "updated" }));
  app.post("/api/v1/sessions/:sessionId/messages", (req, res) => res.json({ status: "sent" }));
  app.get("/api/v1/sessions/:sessionId/messages", (req, res) => res.json({ messages: [] }));

  // API Route for translation
  app.post("/api/translate", async (req, res) => {
    try {
      const { sourceText, targetLanguage, targetLanguageName, sourceLanguage, sourceLanguageName } = req.body;
      if (!sourceText || !targetLanguage) {
        return res.status(400).json({ error: "Missing parameters" });
      }

      if (sourceLanguage === targetLanguage) {
        return res.json({ translatedText: sourceText });
      }

      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === "") {
         // Fallback to mymemory if gemini isn't configured
         try {
           const fallbackSource = sourceLanguage || "autodetect";
           const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${fallbackSource}|${targetLanguage}`;
           const fallbackRes = await fetch(url);
           if (!fallbackRes.ok) throw new Error("MyMemory non-OK");
           const fallbackData = await fallbackRes.json();
           const fallbackText = fallbackData?.responseData?.translatedText;
           if (fallbackText && !fallbackText.includes("MYMEMORY WARNING")) {
             return res.json({ translatedText: fallbackText });
           }
         } catch (e) {
           console.error("MyMemory fallback failed:", e);
         }
         return res.json({ translatedText: "Configuration Error: Please add a valid Gemini API key to enable AI Delivery processing." });
      }

      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        // Use gemini for superior translation
        const sourceStr = sourceLanguageName ? `from ${sourceLanguageName}` : (sourceLanguage ? `from ${sourceLanguage}` : 'the sender');
        const prompt = `You are a strict, fidelity-first translation engine for real communication, not a paraphrasing assistant.
Translate the following message ${sourceStr} into the target language: ${targetLanguageName || targetLanguage}.
PRESERVE the original meaning exactly.
DO NOT add information. DO NOT omit information. DO NOT soften, intensify, summarise, explain, or normalise the message.
PRESERVE question/statement form, negation, intent, names, numbers, dates, prices, units, product names, tracking numbers, and domain-specific terms.
If the source message is ambiguous and the intended meaning is not clear from context, return LOW_CONFIDENCE instead of guessing.

IMPORTANT: Do not output any explanation, markdown, or quotes unless they were in the original text. Output ONLY the strict translation.

Text: ${sourceText}`;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            temperature: 0,
            maxOutputTokens: 256
          }
        });
        
        const translatedText = response.text?.trim();
        if (translatedText) {
          return res.json({ translatedText });
        }
      } catch (geminiError) {
        console.error("Gemini Translation Error, falling back:", geminiError);
      }
      
      // Fallback if Gemini fails, is invalid, or returns empty
      try {
        const fallbackSource = sourceLanguage || "autodetect";
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${fallbackSource}|${targetLanguage}`;
        const fallbackRes = await fetch(url);
        if (!fallbackRes.ok) {
           throw new Error("MyMemory API returned non-OK status");
        }
        const fallbackData = await fallbackRes.json();
        const fallbackText = fallbackData?.responseData?.translatedText;
        
        if (fallbackText && !fallbackText.includes("MYMEMORY WARNING")) {
          return res.json({ translatedText: fallbackText });
        } else {
          return res.json({ translatedText: "Configuration Error: Please add a valid Gemini API key to enable AI Delivery processing." });
        }
      } catch (fallbackError) {
        console.error("Fallback Translation Error:", fallbackError);
        return res.json({ translatedText: "Configuration Error: Please add a valid Gemini API key to enable AI Delivery processing." });
      }

    } catch (error) {
      console.error("Translation API Error:", error);
      res.status(500).json({ error: "Failed to translate" });
    }
  });

  // Batch Translation API
  app.post("/api/translate-batch", async (req, res) => {
    try {
      const { messages, targetLanguage, targetLanguageName } = req.body;
      if (!messages || !Array.isArray(messages) || !targetLanguage) {
        return res.status(400).json({ error: "Missing parameters" });
      }

      if (messages.length === 0) {
        return res.json({ translatedTexts: {} });
      }

      // If Gemini is available, try robust translation
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "") {
        try {
          const { GoogleGenAI } = await import("@google/genai");
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          
          const prompt = `You are a strict, fidelity-first translation engine, not a paraphrasing assistant.
Your job is to translate these messages into ${targetLanguageName || targetLanguage}. 
DO NOT mutate the original meaning. DO NOT guess silently if ambiguous.
You must extract and protect spans (names, numbers, IDs, dates, prices) so they remain EXACTLY intact.
Preserve tone, negation, question marks, and business intent perfectly.

For each message, generate a translation, and do a verification step internally before output.
Return ONLY a valid JSON object mapping the exact same message IDs to their translated text.
Example format:
{
  "msg-123": "Translated text preserving all IDs and meaning",
  "msg-456": "Another translated message"
}

Do not format as markdown, just output raw JSON.

Messages:
${JSON.stringify(messages)}`;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { temperature: 0, responseMimeType: "application/json" }
          });
          
          const translatedTexts = JSON.parse(response.text?.trim() || "{}");
          if (Object.keys(translatedTexts).length > 0) {
             return res.json({ translatedTexts });
          }
        } catch (geminiError) {
          console.error("Batch Gemini Error, falling back to MyMemory:", geminiError);
        }
      }

      // Fallback to MyMemory
      const translatedTexts: Record<string, string> = {};
      await Promise.all(messages.map(async (msg) => {
          try {
             if (msg.lang === targetLanguage) {
                 translatedTexts[msg.id] = msg.text;
                 return;
             }
             const fallbackSource = msg.lang || "autodetect";
             const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(msg.text)}&langpair=${fallbackSource}|${targetLanguage}`;
             const fallbackRes = await fetch(url);
             if (!fallbackRes.ok) throw new Error("MyMemory non-OK");
             const fallbackData = await fallbackRes.json();
             const fallbackText = fallbackData?.responseData?.translatedText;
             if (fallbackText && !fallbackText.includes("MYMEMORY WARNING")) {
                 translatedTexts[msg.id] = fallbackText;
             } else {
                 translatedTexts[msg.id] = "Configuration Error: Please add a valid Gemini API key.";
             }
          } catch (e) {
             translatedTexts[msg.id] = "Configuration Error: Please add a valid Gemini API key.";
          }
      }));

      return res.json({ translatedTexts });
    } catch (error) {
      console.error("Batch Translation API Error:", error);
      res.status(500).json({ error: "Failed to translate batch" });
    }
  });

  // API Route for Text Prediction & Spell check
  app.post("/api/predict", async (req, res) => {
    try {
      const { text, language } = req.body;
      if (!text) return res.json({ suggestion: "" });
      
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === "") {
         return res.json({ suggestion: "" });
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `You are a real-time typing assistant for a chat application.
The user is typing in ${language || 'English'}.
Current input: "${text}"

Provide a brief, natural continuation (prediction) of what they might type next, OR correct their spelling/grammar if it's obviously wrong.
Wait, if it's correct, just suggest the next 1-3 words.
Return ONLY the suggested addition or the corrected full text. If you return an addition, just return the next words (nothing else).
Limit your response to a maximum of 3-5 words. Do not format as markdown.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { temperature: 0.1, maxOutputTokens: 20 }
      });
      
      let suggestion = response.text?.trim() || "";
      return res.json({ suggestion });
    } catch (error) {
      return res.json({ suggestion: "" });
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
