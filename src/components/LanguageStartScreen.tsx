import React, { useState } from "react";
import { MessageSquare, ArrowRight } from "lucide-react";

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "zh-CN", name: "Mandarin Chinese", nativeName: "中文" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" }
];

export const LanguageStartScreen: React.FC<{ onStart: (code: string) => void }> = ({ onStart }) => {
  const [selected, setSelected] = useState("en-US");

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lg border border-slate-100">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <MessageSquare className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Choose your language</h1>
        <p className="mb-8 text-slate-500">Messages will appear in the language you understand.</p>

        <div className="mb-8 grid grid-cols-2 gap-3">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setSelected(lang.code)}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 p-4 transition-all ${
                selected === lang.code
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                  : "border-slate-100 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <span className="text-lg font-bold">{lang.nativeName}</span>
              <span className="text-xs">{lang.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => onStart(selected)}
          className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-indigo-600 py-4 font-bold text-white transition hover:bg-indigo-700"
        >
          <span>Continue</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
