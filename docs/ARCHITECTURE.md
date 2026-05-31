# LinguaLayer AI: Architectural Overview & Spec

## System Paradigm
LinguaLayer AI operates as an **ephemeral communication layer** integrated on the user's local operating systems and browser interfaces.
Rather than storing, duplicating or routing chat messages to persistent datastores, LinguaLayer handles string transformations **pre-encryption** (outgoing) or **post-decryption** (incoming) relative to the communication protocols.

```
+-------------------------------------------------------------+
|                     Client App (Signal / WhatsApp)          |
|  +--------------------+             +--------------------+  |
|  | Outgoing Keyboard  |             | Incoming Overlay   |  |
|  | Intercept (Raw Input|             | (Intercept Decrypt)|  |
|  +---------+----------+             +---------+----------+  |
+------------|----------------------------------^-------------+
             | Pre-Encryption                   | Post-Decryption
             v                                  |
   +---------+---------+              +---------+----------+
   |  LinguaLayer API  +-------------->  Gemini AI Engine  |
   |  (Transient SSL)  |              | ('gemini-3.5-flash')|
   +-------------------+              +--------------------+
```

## Modular Structure
The codebase is divided into the following functional units:
1. **Full-stack API & Dashboard (`server.ts` & `/src`):** Exposes transit proxy pathways for secure SSL translating, text-to-speech rendering, and configuration storage.
2. **Chrome Extension Overlay (`/chrome-extension`):** Injects light overlays dynamically on top of webpage coordinates to assist in chat reading and writing.
3. **Android Keyboard Service (`/android-keyboard`):** Custom Input Method Service (IME) translating characters and paragraphs inside fields of WhatsApp, Signal, Instagram, or SMS directly before committing letters to final send lines.

## Fallback Contingency Mode
When network operations are degraded, or local configurations enforce a Zero Cloud policy:
* **ML Kit Language identification** is invoked locally on-device.
* **ML Kit Translation packages** execute localized language matrix calculations directly in storage cache memory.
* High stakes terms (legal, contracts, visa queues, healthcare emergencies) trigger interactive caution modals recommending official human interpreters.
