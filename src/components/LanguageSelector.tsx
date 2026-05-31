/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface LanguageSelectorProps {
  id?: string;
  selectedLanguage: string;
  onChange: (lang: string) => void;
  label?: string;
  autoOption?: boolean;
}

export const LANGUAGES = [
  { code: "en_US", name: "English (United States)", flag: "🇺🇸" },
  { code: "en_GB", name: "English (United Kingdom)", flag: "🇬🇧" },
  { code: "zh_CN", name: "Chinese (Mandarin/Simplified)", flag: "🇨🇳" },
  { code: "zh_HK", name: "Chinese (Cantonese)", flag: "🇭🇰" },
  { code: "es_LA", name: "Spanish (Latin America)", flag: "🇪🇸" },
  { code: "es_ES", name: "Spanish (Spain)", flag: "🇪🇸" },
  { code: "sw", name: "Swahili", flag: "🇰🇪" },
  { code: "fr_FR", name: "French (France)", flag: "🇫🇷" },
  { code: "fr_CA", name: "French (Canada)", flag: "🇨🇦" },
  { code: "ar_SA", name: "Arabic (Saudi Arabia)", flag: "🇸🇦" },
  { code: "ar_EG", name: "Arabic (Egypt)", flag: "🇪🇬" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "pt_BR", name: "Portuguese (Brazil)", flag: "🇧🇷" },
  { code: "pt_PT", name: "Portuguese (Portugal)", flag: "🇵🇹" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "custom", name: "Other (Type Custom Language)", flag: "✨" },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  id,
  selectedLanguage,
  onChange,
  label = "Select Language",
  autoOption = false
}) => {
  const isPredefined = LANGUAGES.some(lang => lang.name === selectedLanguage && lang.code !== "custom");
  const selectValue = isPredefined ? selectedLanguage : "Other (Type Custom Language)";
  const [typedCustom, setTypedCustom] = React.useState(isPredefined ? "" : selectedLanguage);

  const handleSelectChange = (val: string) => {
    if (val === "Other (Type Custom Language)") {
      const initialCustom = typedCustom || "Swahili";
      setTypedCustom(initialCustom);
      onChange(initialCustom);
    } else {
      onChange(val);
    }
  };

  const handleCustomTextChange = (val: string) => {
    setTypedCustom(val);
    onChange(val);
  };

  return (
    <div id={id} className="w-full space-y-2">
      {label && (
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 font-sans pl-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={selectValue}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="w-full p-3.5 pr-10 rounded-2xl border border-slate-200 bg-white text-slate-800 text-sm md:text-base font-medium focus:border-slate-400 focus:outline-none transition-all cursor-pointer shadow-sm appearance-none"
        >
          {autoOption && (
            <option value="auto">
              ✨ Auto Detect Language
            </option>
          )}
          {LANGUAGES.map((lang) => (
            <option key={lang.name} value={lang.name}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 text-sm">
          ▼
        </div>
      </div>

      {/* Render dynamic customizable input textfield if Custom is picked */}
      {selectValue === "Other (Type Custom Language)" && (
        <div className="animate-fade-in">
          <input
            type="text"
            value={typedCustom}
            onChange={(e) => handleCustomTextChange(e.target.value)}
            placeholder="Type any custom language (e.g. Yoruba, Gikuyu, etc.)"
            className="w-full p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/20 text-slate-800 text-sm font-medium focus:border-indigo-400 focus:outline-none transition-all placeholder-slate-400 shadow-sm"
          />
          <span className="block text-[10px] text-indigo-500 font-semibold mt-1 pl-1">
            ✨ Endless language dictionary mapping enabled.
          </span>
        </div>
      )}
    </div>
  );
};
export default LanguageSelector;
