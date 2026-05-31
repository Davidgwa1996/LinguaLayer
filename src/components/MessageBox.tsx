/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Send, ArrowRightLeft, Sparkles } from "lucide-react";
import LanguageSelector from "./LanguageSelector.tsx";
import ToneSelector from "./ToneSelector.tsx";

interface MessageBoxProps {
  id?: string;
  onTranslate: (text: string, sourceLang: string, targetLang: string, tone: string) => void;
  isLoading: boolean;
  defaultSourceLang?: string;
  defaultTargetLang?: string;
  simpleMode?: boolean;
}

export const MessageBox: React.FC<MessageBoxProps> = ({
  id,
  onTranslate,
  isLoading,
  defaultSourceLang = "English",
  defaultTargetLang = "Chinese",
  simpleMode = false,
}) => {
  const [text, setText] = useState("");
  const [sourceLang, setSourceLang] = useState(defaultSourceLang);
  const [targetLang, setTargetLang] = useState(defaultTargetLang);
  const [tone, setTone] = useState("neutral");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onTranslate(text, sourceLang, targetLang, tone);
  };

  const handleSwap = () => {
    if (sourceLang === "auto") {
      setSourceLang("English");
    } else {
      const prevSource = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(prevSource);
    }
  };

  return (
    <div id={id} className="w-full bg-white border border-slate-200 shadow-sm rounded-3xl p-5 md:p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Language Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div className="w-full sm:flex-1">
            <LanguageSelector
              label={simpleMode ? "My Language" : "Source Language"}
              selectedLanguage={sourceLang}
              onChange={setSourceLang}
              autoOption={true}
            />
          </div>

          <button
            type="button"
            onClick={handleSwap}
            className="p-2.5 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all active:scale-95 flex-shrink-0"
            title="Swap Languages"
          >
            <ArrowRightLeft className="w-4 h-4 rotate-90 sm:rotate-0" />
          </button>

          <div className="w-full sm:flex-1">
            <LanguageSelector
              label={simpleMode ? "Their Language" : "Target Language"}
              selectedLanguage={targetLang}
              onChange={setTargetLang}
            />
          </div>
        </div>

        {/* Text Area input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1 font-sans">
            Write Message
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message here..."
            className="w-full p-4 h-32 rounded-2xl border border-slate-200 text-slate-800 focus:border-slate-400 focus:outline-none transition-all placeholder-slate-400 text-sm md:text-base font-sans resize-none"
            required
          />
        </div>

        {/* Tone Selection (hidden in simple mode to avoid choice overload) */}
        {!simpleMode && (
          <div className="pt-1">
            <ToneSelector selectedTone={tone} onChange={setTone} />
          </div>
        )}

        {/* Submission button */}
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className={`w-full flex items-center justify-center p-4 rounded-2xl font-semibold text-base md:text-lg tracking-tight select-none transition-all cursor-pointer ${
            isLoading || !text.trim()
              ? "bg-slate-100 text-slate-400 border-transparent cursor-not-allowed"
              : "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99] shadow-md"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
              <span>Translating Layer...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-300 fill-current animate-pulse" />
              <span>Translate & Protect Message</span>
            </div>
          )}
        </button>
      </form>
    </div>
  );
};
export default MessageBox;
