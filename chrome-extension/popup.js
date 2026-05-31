/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Chrome context manager
document.addEventListener('DOMContentLoaded', async () => {
  const sourceText = document.getElementById('sourceText');
  const targetLanguage = document.getElementById('targetLanguage');
  const translateButton = document.getElementById('translateButton');
  const output = document.getElementById('output');

  // Attempt to load default language from browser storage
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['targetLanguage'], (result) => {
      if (result.targetLanguage) {
        targetLanguage.value = result.targetLanguage;
      }
    });
  }

  // Auto import selected text on webpage if any
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_SELECTION' }, (response) => {
        if (response && response.text) {
          sourceText.value = response.text;
        }
      });
    }
  });

  translateButton.addEventListener('click', async () => {
    const text = sourceText.value.trim();
    if (!text) return;

    output.style.display = 'block';
    output.innerText = 'Analyzing Layer...';

    // Store settings locally safely
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ targetLanguage: targetLanguage.value });
    }

    try {
      // In production, the extension connects to the backend API hosting LinguaLayer
      // Target pointing to sandbox Applet URL or localhost port fallback
      const serverUrl = "http://localhost:3000/api/translate";
      const response = await fetch(serverUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceText: text,
          sourceLanguage: "auto",
          targetLanguage: targetLanguage.value,
          userLanguage: "English"
        })
      });

      if (!response.ok) throw new Error("Connection failed");
      const result = await response.json();
      
      output.innerText = result.translatedText;
    } catch (e) {
      console.warn(e);
      output.innerText = `[Mock Mode - Engine Offline] Target Language: ${targetLanguage.value}\nText: ${text}`;
    }
  });
});
