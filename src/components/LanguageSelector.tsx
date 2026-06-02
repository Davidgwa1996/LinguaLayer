/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, Globe } from "lucide-react";

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
  const [typedCustom, setTypedCustom] = useState(isPredefined ? "" : selectedLanguage);
  
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync state if selectedLanguage changes from parent
  useEffect(() => {
    if (!isPredefined) {
      setTypedCustom(selectedLanguage);
    }
  }, [selectedLanguage, isPredefined]);

  // Handle outside click to close dropdown natively
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelectValue = (val: string) => {
    if (val === "Other (Type Custom Language)") {
      const initialCustom = typedCustom || "Swahili";
      setTypedCustom(initialCustom);
      onChange(initialCustom);
    } else {
      onChange(val);
    }
    setIsOpen(false);
    setSearch("");
  };

  const handleCustomTextChange = (val: string) => {
    setTypedCustom(val);
    onChange(val);
  };

  // Filter list when search has text, only if over 10 options available (which is true, 24 > 10)
  const filteredLanguages = LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(search.toLowerCase())
  );

  const currentSelectedItem = LANGUAGES.find(lang => lang.name === selectValue) || { flag: "🌐", name: selectValue };

  return (
    <div id={id} className="w-full space-y-2 relative" ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 font-sans pl-1">
          {label}
        </label>
      )}
      
      {/* Searchable dropdown trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3.5 pr-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm md:text-base font-semibold focus:border-indigo-400 dark:focus:border-indigo-500 focus:outline-none transition-all cursor-pointer shadow-sm text-left"
        >
          <span className="flex items-center space-x-2">
            <span className="text-lg">{currentSelectedItem.flag}</span>
            <span>{currentSelectedItem.name}</span>
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown Overlay Option List */}
        {isOpen && (
          <div className="absolute left-0 right-0 mt-1.5 max-h-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden animate-fade-in">
            {/* Search filter input block - enabled because total options (24) > 10 */}
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 ml-1.5" />
              <input
                type="text"
                placeholder="Search language..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-0 p-1.5 text-xs md:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-0 font-sans"
                autoFocus
              />
            </div>

            {/* Select options scrolling box */}
            <div className="overflow-y-auto max-h-56 divide-y divide-slate-100/50 dark:divide-slate-800/50 pr-1 select-none">
              {autoOption && (
                <button
                  type="button"
                  onClick={() => handleSelectValue("auto")}
                  className="w-full text-left px-3.5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 transition flex items-center space-x-2 cursor-pointer"
                >
                  <span>✨</span>
                  <span>Auto Detect Language</span>
                </button>
              )}

              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((lang) => {
                  const isSelected = lang.name === selectValue;
                  return (
                    <button
                      key={lang.name}
                      type="button"
                      onClick={() => handleSelectValue(lang.name)}
                      className={`w-full text-left px-3.5 py-3 text-xs md:text-sm font-semibold transition flex items-center justify-between cursor-pointer ${
                        isSelected 
                          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" 
                          : "text-slate-700 dark:text-slate-300 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <span className="flex items-center space-x-2.5">
                        <span className="text-base">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching languages found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Render dynamic customizable input textfield if "Other" is picked */}
      {selectValue === "Other (Type Custom Language)" && (
        <div className="animate-fade-in pt-1">
          <input
            type="text"
            value={typedCustom}
            onChange={(e) => handleCustomTextChange(e.target.value)}
            placeholder="Type any custom language (e.g. Yoruba, Gikuyu, etc.)"
            className="w-full p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/20 dark:bg-indigo-950/10 text-slate-800 dark:text-slate-100 text-xs md:text-sm font-medium focus:border-indigo-400 dark:focus:border-indigo-500 focus:outline-none transition-all placeholder-slate-400 shadow-sm"
          />
          <span className="block text-[10px] text-indigo-500 dark:text-indigo-450 font-bold mt-1 pl-1">
            ✨ Premium real-time custom mapping and dictionaries online.
          </span>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
