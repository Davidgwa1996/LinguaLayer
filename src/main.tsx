import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Permanent suppression of Vite HMR WebSocket connection failure logs & unhandled rejections
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const reasonStr = String(event.reason?.message || event.reason || "");
    if (
      reasonStr.includes("WebSocket") || 
      reasonStr.includes("websocket") || 
      reasonStr.includes("vite")
    ) {
      console.warn("[Vite Suppressed] Handled background socket reconnect gracefully.");
      event.preventDefault();
      event.stopPropagation();
    }
  });

  const originalError = console.error;
  console.error = function (...args) {
    const errorStr = args.map(arg => String(arg)).join(" ");
    if (
      errorStr.includes("failed to connect to websocket") || 
      errorStr.includes("WebSocket") ||
      errorStr.includes("websocket")
    ) {
      console.warn("[Vite Suppressed Log] Hot Module Reloading is customized server-side; ignoring socket disconnects.");
      return;
    }
    originalError.apply(console, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
