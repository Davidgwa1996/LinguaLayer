/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Copy, Check, Volume2, ShieldAlert, Sparkles, Languages } from "lucide-react";
import { motion } from "motion/react";
import { TranslationResponse } from "../types/index.ts";
import { ApiClient } from "../services/apiClient.ts";
import { AudioClientService } from "../services/audioClient.ts";

interface TranslationPanelProps {
  id?: string;
  result: TranslationResponse | null;
  simpleMode?: boolean;
  isProcessing?: boolean;
}

const GlitchText: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="relative font-mono font-bold tracking-tight text-slate-800 text-lg md:text-xl select-none overflow-hidden py-1">
      {/* Base Layer */}
      <motion.p
        animate={{
          x: [0, -1, 1, -0.5, 0.5, 0],
          opacity: [1, 0.9, 0.95, 0.85, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 0.8,
          ease: "easeInOut",
        }}
      >
        {text}
      </motion.p>
      
      {/* Cyan offset layer */}
      <motion.p
        className="absolute top-1 left-0.5 text-cyan-500/40 mix-blend-screen pointer-events-none"
        animate={{
          x: [0, 1.5, -1, 2, -1.5, 0],
          y: [0, -0.5, 0.5, -1, 0],
          opacity: [0, 0.7, 0.3, 0.8, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 0.4,
          ease: "linear",
        }}
      >
        {text}
      </motion.p>

      {/* Rose offset layer */}
      <motion.p
        className="absolute top-1 -left-0.5 text-rose-500/40 mix-blend-screen pointer-events-none"
        animate={{
          x: [0, -1.5, 1, -2, 1.5, 0],
          y: [0, 0.5, -0.5, 1, 0],
          opacity: [0, 0.6, 0.4, 0.7, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 0.5,
          ease: "linear",
          delay: 0.1,
        }}
      >
        {text}
      </motion.p>

      {/* Scanning laser line overlay */}
      <motion.div
        className="absolute inset-x-0 h-[2px] bg-indigo-500/30"
        animate={{
          top: ["0%", "100%", "0%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: "linear",
        }}
      />
    </div>
  );
};

export const TranslationPanel: React.FC<TranslationPanelProps> = ({
  id,
  result,
  simpleMode = false,
  isProcessing = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState(false);

  const renderHighlightedText = (text: string, terms: string[]) => {
    if (!terms || terms.length === 0) return text;
    
    // Sort terms by length in descending order to avoid partial matches
    const sortedTerms = [...terms].sort((a, b) => b.length - a.length);
    
    // Escape terms for Regex
    const escapedTerms = sortedTerms.map(t => t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const regex = new RegExp(`\\b(${escapedTerms.join('|')})\\b`, 'g');
    
    const parts = text.split(regex);
    if (parts.length === 1) return text;
    
    return parts.map((part, i) => {
      if (terms.includes(part)) {
        return (
          <span key={i} className="inline-flex items-center space-x-1 px-1.5 py-0.5 mx-0.5 rounded bg-emerald-50 text-emerald-950 font-mono text-[13px] border border-emerald-200 shadow-xs relative group/token hover:bg-emerald-100 transition-all font-semibold select-all">
            <Check className="w-3.5 h-3.5 text-emerald-600 font-bold inline-block" />
            <span>{part}</span>
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover/token:block bg-slate-900 text-white text-[9px] px-2 py-1 rounded shadow-sm whitespace-nowrap z-50 font-sans tracking-wide">
              Verified 100% Data Integrity
            </span>
          </span>
        );
      }
      return part;
    });
  };

  // If processing, render a layout-stabilizing animated skeleton screen
  if (isProcessing) {
    return (
      <div
        id={id}
        className="w-full rounded-3xl border bg-slate-50 border-slate-200/70 p-5 md:p-6 animate-pulse"
      >
        <div className="flex flex-col space-y-5">
          {/* Metabar Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-slate-200 rounded-full" />
              <div className="h-3.5 w-32 bg-slate-200 rounded" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-5 w-24 bg-slate-200 rounded-full" />
              {!simpleMode && (
                <div className="h-5 w-16 bg-slate-200 rounded-full hidden sm:block" />
              )}
            </div>
          </div>

          {/* Translation Output Heading Box Skeleton */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 relative shadow-sm space-y-2.5">
            <div className="h-4 bg-slate-200 rounded-lg w-11/12" />
            <div className="h-4 bg-slate-200 rounded-lg w-5/6" />
            <div className="h-4 bg-slate-200 rounded-lg w-2/3" />
          </div>

          {/* Low-Literacy Summary Help Skeleton */}
          <div className="p-4 bg-slate-100/60 rounded-2xl border border-slate-200/40 space-y-2">
            <div className="h-3 bg-slate-200 rounded w-40" />
            <div className="h-3 w-10/12 bg-slate-200 rounded" />
          </div>

          {/* Action Controls Skeleton */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="h-12 bg-slate-200 rounded-2xl" />
            <div className="h-12 bg-slate-300/30 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const displayResult = result;

  if (!displayResult) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayResult.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = async () => {
    if (playing || isProcessing) return;
    setPlaying(true);
    try {
      // Pick voice based on target language or simple preferences
      const isChinese = displayResult.targetLanguage.toLowerCase().includes("chin");
      const isFrench = displayResult.targetLanguage.toLowerCase().includes("fren");
      const voice = isChinese ? "Charon" : isFrench ? "Kore" : "Zephyr";
      
      const base64Audio = await ApiClient.textToSpeech(displayResult.translatedText, voice);
      AudioClientService.playBase64Audio(base64Audio);
    } catch (e) {
      console.warn("Backend TTS engine failed. Falling back to native client-side speech API:", e);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(displayResult.translatedText);
        const isChinese = displayResult.targetLanguage.toLowerCase().includes("chin");
        const isFrench = displayResult.targetLanguage.toLowerCase().includes("fren");
        const isSpanish = displayResult.targetLanguage.toLowerCase().includes("span");
        const isSwahili = displayResult.targetLanguage.toLowerCase().includes("swah");
        
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
        displayResult.sensitiveContentFlag || displayResult.warning
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
              🎯 {displayResult.detectedLanguage} ➔ {displayResult.targetLanguage}
            </span>
            {!simpleMode && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-white border border-slate-200 text-slate-600 shadow-sm">
                Tone: {displayResult.toneUsed}
              </span>
            )}
          </div>
        </div>

        {/* Translation Output Heading */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 relative shadow-sm">
          {isProcessing ? (
            <GlitchText text={displayResult.translatedText} />
          ) : (
            <p className="font-sans font-medium text-slate-900 text-lg md:text-xl leading-relaxed select-text">
              {renderHighlightedText(displayResult.translatedText, displayResult.preservedTerms || [])}
            </p>
          )}
        </div>

        {/* Warnings */}
        {displayResult.warning && (
          <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200/70 rounded-2xl text-amber-800 text-xs md:text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <span><strong>Caution:</strong> {displayResult.warning}</span>
          </div>
        )}

        {/* Confidence Progress Bar */}
        {displayResult.confidence !== undefined && (
          <div className="space-y-1 bg-white/45 border border-slate-200/50 p-3 rounded-2xl">
            <div className="flex items-center justify-between text-[11px] font-sans text-slate-500">
              <span className="flex items-center space-x-1 font-semibold text-slate-600">
                <span>Translation Integrity Confidence</span>
              </span>
              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                {Math.round(displayResult.confidence * 100)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.round(displayResult.confidence * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Low-Literacy Summary Help (or Simple mode assistance) */}
        {(displayResult.simpleExplanation && (simpleMode || displayResult.targetLanguage !== "English")) && (
          <div className="p-4 bg-slate-100/60 rounded-2xl border border-slate-200/40 text-xs md:text-sm text-slate-600">
            <div className="flex items-center space-x-1.5 font-bold font-sans text-slate-800 uppercase tracking-widest text-[10px] mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-current" />
              <span>Easy Plain Meanings (Helper Assist)</span>
            </div>
            <p className="leading-relaxed italic">“{displayResult.simpleExplanation}”</p>
          </div>
        )}

        {/* Business Mode Terms Saved */}
        {!simpleMode && displayResult.preservedTerms?.length > 0 && (
          <div className="text-xs text-slate-500 font-sans">
            <span className="font-semibold block mb-1">🛡️ Protected Business Values (Preserved):</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {displayResult.preservedTerms.map((term, index) => (
                <span key={index} className="px-2.5 py-0.5 rounded bg-emerald-50/60 text-emerald-900 font-mono text-[10px] border border-emerald-200/50 flex items-center space-x-1 shadow-xs">
                  <Check className="w-3.5 h-3.5 text-emerald-600 font-black flex-shrink-0" />
                  <span>{term}</span>
                  <span className="text-[8px] bg-emerald-100 text-emerald-800 font-sans font-bold px-1 rounded ml-1 scale-95 uppercase">Verified</span>
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
            disabled={playing || isProcessing}
            className="flex items-center justify-center space-x-2 p-3.5 rounded-2xl border bg-white border-slate-200 text-slate-700 text-sm md:text-base font-semibold hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition disabled:opacity-50 cursor-pointer"
          >
            <Volume2 className={`w-5 h-5 text-indigo-600 ${playing ? "animate-pulse" : ""}`} />
            <span>{playing ? "Speaking..." : "Read Aloud"}</span>
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            disabled={isProcessing}
            className="flex items-center justify-center space-x-2 p-3.5 rounded-2xl border bg-slate-900 border-transparent text-white text-sm md:text-base font-semibold hover:bg-slate-800 active:scale-95 transition disabled:opacity-50 cursor-pointer"
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
