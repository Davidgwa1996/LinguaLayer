/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ShieldAlert, CheckCircle, HelpCircle, Briefcase, Sparkles, Database, FileText } from "lucide-react";
import { ApiClient } from "../services/apiClient.ts";
import { GlossaryService } from "../../server/services/glossary.service.ts";

export const BusinessModePage: React.FC = () => {
  const [text, setText] = useState(
    "Please ship 150 blocks of concrete to Nairobi Warehouse, order number ID-58679. Balance $4,500 due on 12/10/2026."
  );
  const [loading, setLoading] = useState(false);
  const [translated, setTranslated] = useState("");
  const [preservedList, setPreservedList] = useState<string[]>([]);
  const [targetLang, setTargetLang] = useState("Chinese");

  const handleDemoTranslate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const result = await ApiClient.translateText({
        sourceText: text,
        sourceLanguage: "auto",
        targetLanguage: targetLang,
        userLanguage: "English",
        mode: "business",
        tone: "business",
        preserveOriginal: true,
        simpleExplanation: true,
      });

      setTranslated(result.translatedText);
      
      // Perform local client glossary extraction matching backend protection layers
      const localPreserved = GlossaryService.verifyGlossary(text, result.translatedText);
      setPreservedList([...new Set([...result.preservedTerms, ...localPreserved])]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div>
        <h2 className="font-sans font-extrabold text-slate-900 text-2xl md:text-3xl tracking-tight">
          💼 Business Values Defender
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Protects numbers, currencies, order codes, legal terms, addresses and contact fields so your operations stay reliable.
        </p>
      </div>

      {/* Overview Dashboard Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Protected items checklist representation */}
        <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-3xl space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
            <Database className="w-4 h-4 text-slate-500" />
            <span>Active Safeguards List</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs md:text-sm text-slate-700">
            <div className="flex items-center space-x-1.5 p-2 bg-white rounded-xl border border-slate-200/60 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Numbers Protected</span>
            </div>
            <div className="flex items-center space-x-1.5 p-2 bg-white rounded-xl border border-slate-200/60 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Currency Rates</span>
            </div>
            <div className="flex items-center space-x-1.5 p-2 bg-white rounded-xl border border-slate-200/60 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Legal Names</span>
            </div>
            <div className="flex items-center space-x-1.5 p-2 bg-white rounded-xl border border-slate-200/60 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Shipping Locations</span>
            </div>
            <div className="flex items-center space-x-1.5 p-2 bg-white rounded-xl border border-slate-200/60 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Order IDs/Links</span>
            </div>
            <div className="flex items-center space-x-1.5 p-2 bg-white rounded-xl border border-slate-200/60 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Transaction Dates</span>
            </div>
          </div>
        </div>

        {/* Explain Card */}
        <div className="bg-indigo-50/40 p-5 border border-indigo-100 rounded-3xl font-sans self-stretch flex flex-col justify-center space-y-2">
          <h4 className="font-bold text-slate-900 text-sm md:text-base leading-snug">Why this matters in E-commerce:</h4>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            Standard translation engines often translate brand names literally (e.g. converting a name like Apple or cement brands) or garble tracking codes (e.g. order-A528 becomes order-fifth). LinguaLayer locks business tokens into strict placeholders before sending to the LLM.
          </p>
        </div>

      </div>

      {/* Tactile Demo Sandbox */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 space-y-4 shadow-sm">
        <h3 className="font-sans font-bold text-slate-800 text-sm md:text-base flex items-center space-x-1.5 pl-1">
          <Sparkles className="w-4 h-4 text-indigo-600 fill-current" />
          <span>Interactive Safeguard Playground</span>
        </h3>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1 font-sans">
            Write a business order message
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-4 h-24 rounded-2xl border border-slate-200 text-slate-800 focus:border-slate-400 focus:outline-none placeholder-slate-400 font-sans resize-none text-xs md:text-sm"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="p-3.5 bg-white border border-slate-200 rounded-2xl text-xs md:text-sm font-semibold outline-none focus:border-slate-400 cursor-pointer shadow-sm"
          >
            <option value="Chinese">🇨🇳 Chinese</option>
            <option value="French">🇫🇷 French</option>
            <option value="Spanish">🇪🇸 Spanish</option>
            <option value="Arabic">🇸🇦 Arabic</option>
            <option value="Swahili">🇰🇪 Swahili</option>
          </select>

          <button
            onClick={handleDemoTranslate}
            disabled={loading || !text.trim()}
            className={`flex-1 p-3.5 font-semibold text-xs md:text-sm rounded-2xl transition shadow-md flex items-center justify-center space-x-2 select-none ${
              loading || !text.trim()
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99] cursor-pointer"
            }`}
          >
            {loading ? (
              <span className="flex items-center space-x-2 justify-center">
                <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Engaging Secure Encryption Shield...</span>
              </span>
            ) : (
              <span>Translate & Protect Business Data</span>
            )}
          </button>
        </div>

        {/* Deliver output streams */}
        {translated && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-indigo-500 uppercase tracking-wider font-sans">
                  Pruned Translations output
                </span>
                <p className="font-sans font-semibold text-slate-900 text-sm md:text-base leading-relaxed">
                  {translated}
                </p>
              </div>

              {/* Extraction tags block */}
              <div className="space-y-1.5 self-start">
                <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider font-sans">
                  Saved tokens (Protected from alterations)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {preservedList.length > 0 ? (
                    preservedList.map((tok, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-800 font-mono text-[10px] uppercase font-bold tracking-tight">
                        🔒 {tok}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">None detected. Feel free to input numbers or tracking codes.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
export default BusinessModePage;
