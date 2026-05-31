# LinguaLayer AI: Production Deployment & Compilation Guide

This document supplies step-by-step instructions to compile, package, and deploy all three pillars of the **LinguaLayer AI** ecosystem:
1. **Full-Stack Web Core (Express + Vite)**
2. **Chrome Extension Manifest V3 Proxy**
3. **Android IME Keyboard Subsystem**

---

## Pillar 1: Full-Stack Web Engine Deployment

The core translation API and administrative platform are engineered as a lightweight, ephemeral Node.js application.

### Infrastructure Prerequisites
* **Runtime Node:** v18.0.0 or higher
* **Processor Architecture:** amd64 / arm64 compatible
* **Cloud Container Target:** Google Cloud Run (recommended) or standalone VM
* **Required Variable:** `GEMINI_API_KEY` (must be fetched from Google AI Studio settings and injected at runtime)

### 1. Build Compilation Phase
Run the unified packaging script to generate optimal server and bundle resources:
```bash
# 1. Install workspace dependencies
npm install

# 2. Package assets & compile server to optimized bundle
npm run build
```
This builds your client static bundle (`/dist`) and targets your back-end Express router, compiling it to `dist/server.cjs` via `esbuild`. 

### 2. Standalone Node Dev Server Start
To initialize the production service locally:
```bash
# Launch server binding on 0.0.0.0:3000
npm run start
```

### 3. Google Cloud Run Container Setup
Build and push standard Docker container resources to Google Artifact Registry:

```bash
# 1. Build and tag image (Execute from project root)
docker build -t gcr.io/[PROJECT_ID]/lingualayer-core:latest .

# 2. Push image to registry
docker push gcr.io/[PROJECT_ID]/lingualayer-core:latest

# 3. Deploy container onto Cloud Run
gcloud run deploy lingualayer-core \
  --image gcr.io/[PROJECT_ID]/lingualayer-core:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars="GEMINI_API_KEY=AIzaSyYourRealKeyHere"
```

---

## Pillar 2: Chrome Extension Sideloading (Manifest V3)

The extension prototype features light, high-performance **Manifest V3 content scripts**. Content scripts represent the correct industry pattern for dynamically injecting JavaScript and CSS overlays into webpages safely, allowing for real-time text selection, processing, and translation without leaking page tokens.

### Installation Instructions
1. Open Google Chrome or any Chromium-compatible browser (Brave, Edge, Opera).
2. Navigate to `chrome://extensions/` in your address bar.
3. Toggle on the **"Developer mode"** switch located at the top-right corner.
4. Click on the **"Load unpacked"** button in the top-left section.
5. Select the `/chrome-extension` directory from this workspace.
6. The extension is now successfully installed! Click the puzzle-piece icon to pin **LinguaLayer Overlay** to your toolbar.
7. Open any webpage (e.g., WhatsApp Web or an online article), long-press/select any text block, and observe the high-contrast translation action floating toolbar.

---

## Pillar 3: Android IME Custom Keyboard Installation (Gradle)

Because Android officially supports third-party keyboards through the `InputMethodService` system, a custom keyboard represents the safest, most robust, and non-intrusive "layer-like" route for communication processing. It manages string transformations **pre-transmission** directly in the text inputs of *any* app (WhatsApp, Telegram, Signal, or standard SMS).

### Prerequisites
* **Android SDK:** v26 or higher (Android 8.0 Oreo+)
* **Build System:** Gradle v8.0 or higher
* **IDE Recommended:** Android Studio Arctic Fox+ or command-line Gradle wrapper.

### 1. Build and package the APK
Execute the Gradle assembler from your terminal to compile the IME service package:
```bash
cd android-keyboard
# Grant execution permissions
chmod +x gradlew
# Assemble the debug release build package
./gradlew assembleDebug
```
The compiled Android Package file will be located under:
`/android-keyboard/app/build/outputs/apk/debug/app-debug.apk`

### 2. Sideload onto Android Emulator/Device
Ensure USB Debugging (or Virtual Device interface) is enabled, then run:
```bash
adb install app-debug.apk
```

### 3. Activating the Input Method Service
After installation, the user must activate the input layer in system settings:
1. Open Android **Settings** -> **System** -> **Languages & Input** -> **On-screen Keyboard**.
2. Tap **"Manage Keyboards"**.
3. Locate **LinguaLayer Keyboard Service** and toggle it **On** (accepting the standard system IME warning).
4. Launch any messenger (Signal, WhatsApp), tap into an edit text field, prompt the Android notification area or keyboard switcher icon, and select **"LinguaLayer IME"** to begin typing.
