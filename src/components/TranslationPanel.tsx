/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Copy, Check, Volume2, ShieldAlert, Sparkles, Languages } from "lucide-react";
import { TranslationResponse } from "../types/index.ts";
import { ApiClient } from "../services/apiClient.ts";
import { AudioClientService } from "../services/audioClient.ts";

interface TranslationPanelProps {
  id?: string;
  result: TranslationResponse | null;
  simpleMode?: boolean;
}

export const TranslationPanel: React.FC<TranslationPanelProps> = ({
  id,
  result,
  simpleMode = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState(false);

  if (!result) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = async () => {
    if (playing) return;
    setPlaying(true);
    try {
      // Pick voice based on target language or simple preferences
      const isChinese = result.targetLanguage.toLowerCase().includes("chin");
      const isFrench = result.targetLanguage.toLowerCase().includes("fren");
      const voice = isChinese ? "Charon" : isFrench ? "Kore" : "Zephyr";
      
      const base64Audio = await ApiClient.textToSpeech(result.translatedText, voice);
      AudioClientService.playBase64Audio(base64Audio);
    } catch (e) {
      console.warn("Backend TTS engine failed. Falling back to native client-side speech API:", e);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(result.translatedText);
        const isChinese = result.targetLanguage.toLowerCase().includes("chin");
        const isFrench = result.targetLanguage.toLowerCase().includes("fren");
        const isSpanish = result.targetLanguage.toLowerCase().includes("span");
        const isSwahili = result.targetLanguage.toLowerCase().includes("swah");
        
        if (isChinese) utterance.lang = "zh-CN";
        else if (isFrench) utterance.lang = "fr-FR";
        else if (isSpanish) utterance.lang = "es-ES";
        else if (isSwahili) utterance.lang = "sw-KE";
        else utterance.lang = "en-US";
        
        window.speechSynthesis.speak(utterance);
      }
    } finally {
      setPlaying(false);
    }
  };

  return (
    <div
      id={id}
      className={`w-full rounded-3xl border p-5 md:p-6 transition-all duration-300 ${
        result.sensitiveContentFlag || result.warning
          ? "bg-amber-50/50 border-amber-200"
          : "bg-slate-50 border-slate-200/70"
      }`}
    >
      <div className="flex flex-col space-y-4">
        
        {/* Metabar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-500 font-sans">
            <Languages className="w-4 h-4 text-slate-400" />
            <span>Translated Translation Layer Output</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-white border border-slate-200 text-slate-700 shadow-sm`}>
              🎯 {result.detectedLanguage} ➔ {result.targetLanguage}
            </span>
            {!simpleMode && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-white border border-slate-200 text-slate-600 shadow-sm">
                Tone: {result.toneUsed}
              </span>
            )}
          </div>
        </div>

        {/* Translation Output Heading */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 relative shadow-sm">
          <p className="font-sans font-medium text-slate-900 text-lg md:text-xl leading-relaxed select-text">
            {result.translatedText}
          </p>
        </div>

        {/* Warnings */}
        {result.warning && (
          <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200/70 rounded-2xl text-amber-800 text-xs md:text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <span><strong>Caution:</strong> {result.warning}</span>
          </div>
        )}

        {/* Low-Literacy Summary Help (or Simple mode assistance) */}
        {(result.simpleExplanation && (simpleMode || result.targetLanguage !== "English")) && (
          <div className="p-4 bg-slate-100/60 rounded-2xl border border-slate-200/40 text-xs md:text-sm text-slate-600">
            <div className="flex items-center space-x-1.5 font-bold font-sans text-slate-800 uppercase tracking-widest text-[10px] mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-current" />
              <span>Easy Plain Meanings (Helper Assist)</span>
            </div>
            <p className="leading-relaxed italic">“{result.simpleExplanation}”</p>
          </div>
        )}

        {/* Business Mode Terms Saved */}
        {!simpleMode && result.preservedTerms?.length > 0 && (
          <div className="text-xs text-slate-500 font-sans">
            <span className="font-semibold block mb-1">🛡️ Protected Business Values (Preserved):</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {result.preservedTerms.map((term, index) => (
                <span key={index} className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[10px] border border-slate-300">
                  {term}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Read Aloud */}
          <button
            onClick={handleSpeak}
            disabled={playing}
            className="flex items-center justify-center space-x-2 p-3.5 rounded-2xl border bg-white border-slate-200 text-slate-700 text-sm md:text-base font-semibold hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition"
          >
            <Volume2 className={`w-5 h-5 text-indigo-600 ${playing ? "animate-pulse" : ""}`} />
            <span>{playing ? "Speaking..." : "Read Aloud"}</span>
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="flex items-center justify-center space-x-2 p-3.5 rounded-2xl border bg-slate-900 border-transparent text-white text-sm md:text-base font-semibold hover:bg-slate-800 active:scale-95 transition"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-slate-300" />}
            <span>{copied ? "Copied!" : "Copy Translated"}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
export default TranslationPanel;
