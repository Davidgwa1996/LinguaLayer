# LinguaLayer AI: Manual Test Orchestration Script

This document guides the user or QA engineer on how to run manual testing simulations for the bilingual messaging overlay.

---

## Part 1: Interactive Conversation Test Script

### Goal
Simulate a live negotiation dialogue sequence between **Person A (English)** and **Person B (Chinese)**, verifying of business details (numbers, totals, and place names).

### Execution Procedures
1. Launch the app and click onto the **"2. Conversation Game (Simulator)"** side-panel navigation.
2. Ensure Person A is configured for **English** and Person B is set for **Chinese**.
3. Locate and press the amber button: **"Run Test Dialogue"** to execute the scenario auto, OR type the dialogue manually as follows:

*   **Dialogue Turn 1 (Person A):**
    *   **Input text:** `Hello, can we discuss the price of 50 bags of cement delivered to Nairobi?`
    *   **Translation output expected (on B's Device - Chinese):** `你好，我们可以讨论一下运送到内罗毕的 50 袋水泥的价格吗？`
    *   **Verification metrics:**
        *   [x] Numeric item `50` is preserved correctly.
        *   [x] Subject terms `cement` and `Nairobi` are intact.

*   **Dialogue Turn 2 (Person B):**
    *   **Input text:** `可以，你想什么时候送货？`
    *   **Translation output expected (on A's Device - English):** `Yes, when do you want delivery?`
    *   **Verification metrics:**
        *   [x] Sentence structure is translated naturally without wordiness.

---

## Part 2: Voice Translation & Audio Output Test

### Goal
Test browser voice note recording, multi-modal transcription, and synthetic speech synthesis.

### Execution steps
1. Click on the **"3. Speaker Translator"** page tab.
2. Turn on the **"I authorize safe proxy translations"** toggle in the Privacy Shield component.
3. Click on the big dark mic button: **"Tap to Speak"**.
4. Speak into your computer mic, e.g.: `"How do you do?"`
5. Press the red stop button: **"Square icon"**.
6. Verify of output transcription matching your spoken sentence.
7. Click the **"Read Translation"** button to hear synthesized speech back in the target language.
