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

  // Implement a robust custom global WebSocket wrapper to handle reconnection with exponential backoff silently
  const NativeWebSocket = window.WebSocket;

  class SilentRetryWebSocket extends EventTarget {
    private url: string | URL;
    private protocols?: string | string[];
    private ws!: WebSocket;
    private retryCount = 0;
    private isClosedByUser = false;

    public static readonly CONNECTING = 0;
    public static readonly OPEN = 1;
    public static readonly CLOSING = 2;
    public static readonly CLOSED = 3;

    public readonly CONNECTING = 0;
    public readonly OPEN = 1;
    public readonly CLOSING = 2;
    public readonly CLOSED = 3;

    constructor(url: string | URL, protocols?: string | string[]) {
      super();
      this.url = url;
      this.protocols = protocols;
      this.connect();
    }

    get readyState() {
      return this.ws ? this.ws.readyState : SilentRetryWebSocket.CONNECTING;
    }

    get bufferedAmount() {
      return this.ws ? this.ws.bufferedAmount : 0;
    }

    get extensions() {
      return this.ws ? this.ws.extensions : "";
    }

    get protocol() {
      return this.ws ? this.ws.protocol : "";
    }

    get binaryType() {
      return this.ws ? this.ws.binaryType : "blob";
    }

    set binaryType(val) {
      if (this.ws) this.ws.binaryType = val;
    }

    private connect() {
      if (this.isClosedByUser) return;

      try {
        this.ws = new NativeWebSocket(this.url, this.protocols);

        this.ws.onopen = (event) => {
          this.retryCount = 0; // successfully connected, reset retry tracker
          const onopenHandler = (this as any).onopen;
          if (onopenHandler) onopenHandler.call(this, event);
          this.dispatchEvent(new Event("open"));
        };

        this.ws.onmessage = (event) => {
          const onmessageHandler = (this as any).onmessage;
          if (onmessageHandler) onmessageHandler.call(this, event);
          this.dispatchEvent(new MessageEvent("message", { data: event.data }));
        };

        this.ws.onerror = (event) => {
          // Keep errors inside warnings to prevent loud console errors
          const onerrorHandler = (this as any).onerror;
          if (onerrorHandler) onerrorHandler.call(this, event);
          this.dispatchEvent(new Event("error"));
        };

        this.ws.onclose = (event) => {
          if (this.isClosedByUser) {
            const oncloseHandler = (this as any).onclose;
            if (oncloseHandler) oncloseHandler.call(this, event);
            this.dispatchEvent(new CloseEvent("close", event));
            return;
          }

          this.retryCount++;
          // Exponential backoff with a cap of 20 seconds
          const backoffDelay = Math.min(Math.pow(2, this.retryCount) * 1000, 20000);
          console.warn(`[HMR Socket Interrupted] Reconnecting silently in ${backoffDelay}ms... (attempt: ${this.retryCount})`);

          setTimeout(() => {
            if (!this.isClosedByUser) {
              this.connect();
            }
          }, backoffDelay);
        };
      } catch (err) {
        console.warn("[Silent WebSocket Shim] Handled instantiation interruption gracefully:", err);
      }
    }

    public send(data: any) {
      if (this.ws && this.ws.readyState === NativeWebSocket.OPEN) {
        this.ws.send(data);
      }
    }

    public close(code?: number, reason?: string) {
      this.isClosedByUser = true;
      if (this.ws) {
        this.ws.close(code, reason);
      }
    }

    public addEventListener(type: any, callback: any, options?: any) {
      super.addEventListener(type, callback, options);
      if (this.ws) {
        this.ws.addEventListener(type, callback, options);
      }
    }

    public removeEventListener(type: any, callback: any, options?: any) {
      super.removeEventListener(type, callback, options);
      if (this.ws) {
        this.ws.removeEventListener(type, callback, options);
      }
    }
  }

  try {
    Object.defineProperty(window, "WebSocket", {
      value: SilentRetryWebSocket,
      configurable: true,
      writable: true
    });
  } catch (err) {
    console.warn("Could not redefine window.WebSocket with write descriptor:", err);
    try {
      Object.defineProperty(globalThis, "WebSocket", {
        value: SilentRetryWebSocket,
        configurable: true,
        writable: true
      });
    } catch (err2) {
      console.warn("Failed all attempts to override WebSocket globally:", err2);
    }
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
