/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import MessageBox from "../components/MessageBox.tsx";
import TranslationPanel from "../components/TranslationPanel.tsx";
import { ApiClient } from "../services/apiClient.ts";
import { TranslationResponse } from "../types/index.ts";
import { ErrorLogger } from "../services/errorLogger.ts";
import { Info, AlertCircle, Trash2, Download } from "lucide-react";

interface TranslatorPageProps {
  id?: string;
  simpleMode: boolean;
  userLanguage: string;
}

export const TranslatorPage: React.FC<TranslatorPageProps> = ({
  id,
  simpleMode,
  userLanguage,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // For debounced typing translation
  const [typingText, setTypingText] = useState("");
  const [typingSourceLang, setTypingSourceLang] = useState("English");
  const [typingTargetLang, setTypingTargetLang] = useState("Chinese");
  const [typingTone, setTypingTone] = useState("neutral");

  // Local monitoring logs for diagnostic view
  const [errorLogs, setErrorLogs] = useState<any[]>([]);

  // Web worker state
  const [translationWorker, setTranslationWorker] = useState<Worker | null>(null);

  useEffect(() => {
    // Define an inline background web worker
    const workerCode = `
      self.onmessage = async function(e) {
        const { req, baseUrl } = e.data;
        try {
          const response = await fetch(baseUrl + "/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req),
          });

          const status = response.status;
          const text = await response.text();

          if (!response.ok) {
            self.postMessage({ success: false, status, error: text || "Server responded with error." });
            return;
          }

          // Off-main-thread JSON parsing for improved render performance & data formatting
          const parsedResult = JSON.parse(text);
          self.postMessage({ success: true, data: parsedResult });
        } catch (err) {
          self.postMessage({ success: false, error: err.message || String(err) });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(blob);
    const workerInstance = new Worker(workerUrl);
    setTranslationWorker(workerInstance);

    return () => {
      workerInstance.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, []);

  useEffect(() => {
    // Sync error logs
    const unsubscribe = ErrorLogger.subscribe((newLogs) => {
      setErrorLogs(newLogs);
    });
    return unsubscribe;
  }, []);

  const handleTranslate = async (text: string, sourceLang: string, targetLang: string, tone: string) => {
    if (!text.trim()) {
      setResult(null);
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    const mode = simpleMode ? "simple" : "normal";
    const reqData = {
      sourceText: text,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      userLanguage: userLanguage,
      toneSelect: tone,
      tone: tone as any,
      mode: mode as any,
      preserveOriginal: true,
      simpleExplanation: true,
    };

    // If worker fails to construct or is cold, fall back to native client
    if (!translationWorker) {
      try {
        const res = await ApiClient.translateText(reqData);
        setResult(res);
      } catch (e: any) {
        console.error("Native translation client error:", e);
        const errorMsgDetails = e instanceof Error ? e.message : "Underlying server connection failed.";
        setErrorMsg(errorMsgDetails);
        ErrorLogger.logFailure(
          errorMsgDetails,
          "apiClient",
          "translateText",
          { sourceText: text, sourceLanguage: sourceLang, targetLanguage: targetLang, tone },
          e instanceof Error ? e.stack : undefined
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    // Set up our worker onmessage callback
    translationWorker.onmessage = (event) => {
      const { success, data, error, status } = event.data;
      if (success) {
        setResult(data);
        setLoading(false);
      } else {
        console.error("Worker translation error:", error);
        const errorMsgDetails = error || "Parsing error inside worker layer thread.";
        
        // Handle 429 specifically inside worker response mapping
        if (status === 429 || errorMsgDetails.includes("RESOURCE_EXHAUSTED") || errorMsgDetails.includes("429")) {
          let secondsLeft = 60;
          const delayMatch = errorMsgDetails.match(/retryDelay["\s:]+["']?(\d+)/i) || errorMsgDetails.match(/retry in ([\d.]+)/i);
          if (delayMatch && delayMatch[1]) {
            const parsedMatchOfSec = parseInt(delayMatch[1], 10);
            if (!isNaN(parsedMatchOfSec)) {
              secondsLeft = parsedMatchOfSec;
            }
          }
          if (typeof (window as any).showToast === "function") {
            (window as any).showToast(
              `⚠️ Request Rate-Limited: Free tier quotas exceeded. Seamlessly routing request via offline-local interpreter.`,
              "error",
              secondsLeft * 1000,
              secondsLeft
            );
          }
        }

        setErrorMsg(errorMsgDetails);
        setLoading(false);
        
        // Capture failure inside error logging service
        ErrorLogger.logFailure(
          errorMsgDetails,
          "WebWorker",
          "translateText",
          { sourceText: text, sourceLanguage: sourceLang, targetLanguage: targetLang, tone },
          undefined
        );
      }
    };

    translationWorker.onerror = (err) => {
      console.error("Critical worker error:", err);
      setErrorMsg("Background translation thread crashed.");
      setLoading(false);
    };

    // Post data to our background worker
    translationWorker.postMessage({
      req: reqData,
      baseUrl: window.location.origin + "/api"
    });
  };

  // Debounce effect: triggers translate 500ms after user pauses typing
  useEffect(() => {
    const trimmed = typingText.trim();
    if (!trimmed) {
      setResult(null);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      handleTranslate(trimmed, typingSourceLang, typingTargetLang, typingTone);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [typingText, typingSourceLang, typingTargetLang, typingTone]);

  const handleTextChange = (text: string, sourceLang: string, targetLang: string, tone: string) => {
    setTypingText(text);
    setTypingSourceLang(sourceLang);
    setTypingTargetLang(targetLang);
    setTypingTone(tone);
  };

  return (
    <div id={id} className="space-y-6 animate-fade-in text-left">
      <div>
        <h2 className="font-sans font-extrabold text-slate-900 text-2xl md:text-3xl tracking-tight">
          ✍️ Simple Text Translate
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Type or copy-paste text below. We protect details like dates, phone numbers, and codes automatically.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs md:text-sm flex items-center space-x-2">
          <span className="font-bold">⚠️ Warning:</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <MessageBox
        onTranslate={handleTranslate}
        onTextChange={handleTextChange}
        isLoading={loading}
        defaultSourceLang="English"
        defaultTargetLang="Chinese"
        simpleMode={simpleMode}
      />

      {(loading || result) && (
        <div className="transition-all duration-300">
          <TranslationPanel result={result} isProcessing={loading} simpleMode={simpleMode} />
        </div>
      )}

      {/* Information Tip block */}
      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-3xl flex items-start space-x-3 text-xs md:text-sm text-slate-600">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Language Layering System Tip:</strong> When using communication apps like WhatsApp or Telegram, copy the translated output above and paste it inside the chat bar. Recipient translation layers can then pick up and restore it seamlessly.
        </p>
      </div>

      {/* Production Diagnostic Logs Monitor */}
      {errorLogs.length > 0 && (
        <div className="p-5 bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-rose-400">
              <AlertCircle className="w-4 h-4" />
              <span className="font-extrabold tracking-wider uppercase text-[10px]">
                Translation Diagnostics Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => ErrorLogger.exportToPdf()}
                className="flex items-center space-x-1.5 px-3 py-1 bg-indigo-950/50 hover:bg-indigo-900/70 text-indigo-300 text-[10px] rounded-lg border border-indigo-900/50 transition cursor-pointer font-sans font-bold"
                title="Export diagnostics PDF"
              >
                <Download className="w-3 h-3" />
                <span>Export PDF Report</span>
              </button>
              <button
                onClick={() => ErrorLogger.clearLogs()}
                className="flex items-center space-x-1.5 px-3 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-[10px] rounded-lg border border-rose-900/40 transition cursor-pointer"
                title="Flush logs"
              >
                <Trash2 className="w-3 h-3" />
                <span>Flush Logs</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {errorLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-850 font-mono text-[11px] leading-relaxed">
                <div className="flex items-center justify-between text-slate-500 text-[9px] mb-1">
                  <span>{log.timestamp}</span>
                  <span className="text-amber-500 font-extrabold uppercase">service: {log.context.serviceName}</span>
                </div>
                <p className="text-rose-300 font-semibold">{log.errorMessage}</p>
                {log.context.payload && (
                  <pre className="text-[10px] text-slate-400 overflow-x-auto mt-2 p-2 bg-black/30 rounded-xl border border-slate-800">
                    {JSON.stringify(log.context.payload, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default TranslatorPage;
