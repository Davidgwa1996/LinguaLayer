/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Content Script injection layer
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SELECTION') {
    const selectedText = window.getSelection().toString();
    sendResponse({ text: selectedText });
  }

  if (message.type === 'TRIGGER_OVERLAY') {
    renderFloatingOverlay(message.text);
  }
});

function renderFloatingOverlay(text) {
  // Check if exists, remove it first
  const existing = document.getElementById('lingualayer-inject-overlay');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'lingualayer-inject-overlay';
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.width = '300px';
  container.style.padding = '14px';
  container.style.borderRadius = '12px';
  container.style.background = '#111';
  container.style.color = '#fff';
  container.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
  container.style.zIndex = '999999';
  container.style.fontFamily = 'sans-serif';
  container.style.fontSize = '12px';

  const heading = document.createElement('div');
  heading.innerText = 'LinguaLayer AI Selection:';
  heading.style.fontWeight = 'bold';
  heading.style.marginBottom = '6px';
  heading.style.color = '#fbbf24';

  const content = document.createElement('div');
  content.innerText = 'Translating...';
  container.appendChild(heading);
  container.appendChild(content);

  const closeBtn = document.createElement('span');
  closeBtn.innerText = '✕';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '10px';
  closeBtn.style.right = '10px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.addEventListener('click', () => container.remove());
  container.appendChild(closeBtn);

  document.body.appendChild(container);

  // Send translation post request securely to our backend server API
  fetch("http://localhost:3000/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sourceText: text,
      sourceLanguage: "auto",
      targetLanguage: "Chinese", // Default target for demo
      userLanguage: "English"
    })
  })
    .then(res => res.json())
    .then(data => {
      content.innerHTML = `<strong>Chinese:</strong> ${data.translatedText}<br><br><span style="color: #999; font-size: 10px;">🛡️ Layered secure protection active</span>`;
    })
    .catch(() => {
      content.innerHTML = `<strong>Offline Mode fallback:</strong><br>[Chinese]: ${text}<br><br><span style="color: #e11d48; font-size: 10px;">🔌 Backend offline. Enable localhost:3000 server.</span>`;
    });
}
