# LinguaLayer AI: Universal Language Layer

An AI-powered universal language communication layer to translate text messages, voice notes, and live conversations seamlessly between users without duplicating, storing, or breaching communication security metrics.

## Key Highlights
1. **Adaptive Language Translation Engine:** High-performance Express API connected to Google Gemini `gemini-3.5-flash` for context-aware translations.
2. **Conversation Game Simulator:** Interactive web utility demonstrating side-by-side texting flows for low-literacy and multi-language recipients.
3. **Voice Translator Node:** Direct HTML5 speech recording coupled with Gemini multi-modal processing for real-time translation and voice playback.
4. **Android Keyboard Prototype:** Native IME subsystem to translate typed phrases directly inside WhatsApp, SMS, or Telegram pre-transmission.
5. **Chrome Extension Overlay:** Lightweight context overlays to select webpages text, translate, and copy instantly.

---

## Workspace Setup Instruction & Terminal Commands

### 1. Installation of Workspace Node Dependencies
Install all packages and configure environment properties:
```bash
npm install
```

### 2. Launch Local Full-Stack dev server (Express + Vite)
Fires up the backend API and hot-compiles the React UI on unified port 3000:
```bash
npm run dev
```

### 3. Build & Package Production bundles
Triggers standard React client compiles and bundles the Express server into `dist/server.cjs` via `esbuild`:
```bash
npm run build
```

## Technical Documentation Indexes

Explore deeper insights across the system documentation catalog:
1. **[Architectural Overview & Spec](ARCHITECTURE.md):** Architectural diagrams and details describing the transient encryption layer, Chrome content script injection, and Android custom keyboard driver mechanics.
2. **[API Specifications Reference](API_REFERENCE.md):** Restful API contracts mapping multimodal speech transcriptions, settings configurations, and safety checkpoints.
3. **[Deployment & Compilation Guide](DEPLOYMENT_GUIDE.md):** Setup walkthroughs configuring full-stack web builds on Google Cloud Run containers, sideloading Manifest V3 extensions, and compiling Gradle-wrapped Android keyboards.
4. **[strategic Investor & OEM Partnership Pitch](PARTNERSHIP_AND_INVESTOR_PITCH.md):** Strategic details covering TAM, offline resilience with local Google ML Kit packages, and our OEM device keyboard positioning.

---

## Directory Structure Maps
```
lingualayer-ai/
├── chrome-extension/         # Manifest V3 overlay chrome prototype
├── android-keyboard/         # Native Android Kotlin InputMethod IME project
├── docs/                     # Spec architectural articles
├── server/                   # Custom Express backend endpoints 
└── src/                      # Fluent React front-end application
```
