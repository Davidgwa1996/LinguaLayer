# LinguaLayer AI Universal Engine: API Specification

The API manages high-performance, real-time message translation, language identification, multi-modal voice processing, and text-to-speech.

## Base URL
All requests are routed to the base prefix: `/api`

---

## 1. Translate Message Text
Exposes context-aware text translations with tone adaptations and business protection preserves.

* **Path:** `POST /api/translate`
* **Content-Type:** `application/json`
* **JSON parameters:**
  ```json
  {
    "sourceText": "Please ship 150 blocks to Nairobi Warehouse, order number ID-58679",
    "sourceLanguage": "auto",
    "targetLanguage": "Chinese",
    "userLanguage": "English",
    "tone": "business",
    "mode": "business",
    "conversationContext": []
  }
  ```
* **Success response (status: 200 OK):**
  ```json
  {
    "detectedLanguage": "English",
    "sourceLanguage": "English",
    "targetLanguage": "Chinese",
    "translatedText": "请发运 150 块水泥到内罗毕仓库，订单号为 ID-58679。",
    "simpleExplanation": "The text asks to ship building packages to a specific address with order ID.",
    "toneUsed": "business",
    "preservedTerms": ["150", "Nairobi Warehouse", "ID-58679"],
    "confidence": 0.98,
    "warning": null,
    "sensitiveContentFlag": false
  }
  ```

---

## 2. Translate Audio Wave Sound (Multi-modal)
Accepts base64-encoded audio clips from client microphones, transcribing and translating inside a single multi-modal AI pass.

* **Path:** `POST /api/translate-audio`
* **Content-Type:** `application/json`
* **JSON parameters:**
  ```json
  {
    "audioBase64": "UklGRu...",
    "mimeType": "audio/webm",
    "targetLanguage": "Chinese"
  }
  ```
* **Success response (status: 200 OK):**
  ```json
  {
    "detectedLanguage": "English",
    "transcript": "Hello when do you want delivery?",
    "targetLanguage": "Chinese",
    "translatedText": "你好，你想什么时候送货？",
    "emotionDetected": "polite",
    "confidence": 0.94,
    "warning": null,
    "audioOutputUrl": null
  }
  ```

---

## 3. Text-To-Speech Synthesis (Gemini TTS)
Converts translated outputs into high-fidelity custom synthetic speech.

* **Path:** `POST /api/tts`
* **Content-Type:** `application/json`
* **JSON arguments:**
  ```json
  {
    "text": "你好，你想什么时候送货？",
    "voiceName": "Charon"
  }
  ```
* **Success response (status: 200 OK):**
  ```json
  {
    "audioBase64": "UklGRu..."
  }
  ```

---

## 4. System Options Profile Settings
Store client profiles.

* **Path:** `POST /api/settings/:userId`
* **JSON payload:**
  ```json
  {
    "preferredLanguage": "English",
    "simpleMode": false,
    "privacyHistoryConsent": false
  }
  ```
* **Response:** Saves configurations and echoes back payload structures.
