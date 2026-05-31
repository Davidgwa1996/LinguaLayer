/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import MessageBox from "../components/MessageBox.tsx";
import TranslationPanel from "../components/TranslationPanel.tsx";
import { ApiClient } from "../services/apiClient.ts";
import { TranslationResponse } from "../types/index.ts";
import { Info } from "lucide-react";

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

  const handleTranslate = async (text: string, sourceLang: string, targetLang: string, tone: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const mode = simpleMode ? "simple" : "normal";
      const res = await ApiClient.translateText({
        sourceText: text,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        userLanguage: userLanguage,
        tone: tone as any,
        mode: mode as any,
        preserveOriginal: true,
        simpleExplanation: true,
      });
      setResult(res);
    } catch (e) {
      console.error(e);
      setErrorMsg(e instanceof Error ? e.message : "Underlying server connection failed.");
    } finally {
      setLoading(false);
    }
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
        isLoading={loading}
        defaultSourceLang="English"
        defaultTargetLang="Chinese"
        simpleMode={simpleMode}
      />

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-3">
          <span className="w-10 h-10 rounded-full border-4 border-slate-700 border-t-transparent animate-spin" />
          <span className="text-sm font-semibold text-slate-600">Translating universal communication layering in process...</span>
        </div>
      )}

      {!loading && result && (
        <div>
          <TranslationPanel result={result} simpleMode={simpleMode} />
        </div>
      )}

      {/* Information Tip block */}
      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-3xl flex items-start space-x-3 text-xs md:text-sm text-slate-600">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Language Layering System Tip:</strong> When using communication apps like WhatsApp or Telegram, copy the translated output above and paste it inside the chat bar. Recipient translation layers can then pick up and restore it seamlessly.
        </p>
      </div>
    </div>
  );
};
export default TranslatorPage;
