import React, { useState } from 'react';
import { Send, CheckCircle2, ArrowRightLeft, X } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../supportedLanguages';

export function SimpleText() {
  const [text, setText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [result, setResult] = useState<string | null>(null);

  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setIsTranslating(true);
    setResult(null);
    try {
      const sourceLanguageName = SUPPORTED_LANGUAGES.find(l => l.code === sourceLang)?.name || sourceLang;
      const targetLanguageName = SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sourceText: text, 
          targetLanguage: targetLang, 
          targetLanguageName,
          sourceLanguage: sourceLang,
          sourceLanguageName
        })
      });
      const data = await response.json();
      
      if (data && data.translatedText) {
        setResult(data.translatedText);
      } else {
        setResult("Error processing message");
      }
    } catch(e) {
      setResult("Error processing message");
    } finally {
      setIsTranslating(false);
    }
  };

  const clearText = () => {
    setText('');
    setResult(null);
  };

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    if (result && result !== "Error processing message") {
      setText(result);
      setResult(text);
    } else {
      setText('');
      setResult(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Simple Text Engine</h1>
        <p className="text-lg text-slate-600">Test the core meaning-preservation layer without chat synchronization.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Source Language</label>
              <select 
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={`src-${lang.code}`} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={handleSwap}
              className="mt-6 p-3 rounded-full hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors"
              title="Swap Languages"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Target Language</label>
              <select 
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={`tgt-${lang.code}`} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
             <div className="flex justify-between items-center mb-2">
               <label className="block text-sm font-semibold text-slate-700">Original Text</label>
               {text && (
                 <button onClick={clearText} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-xs font-medium">
                   <X className="w-3 h-3" /> Clear
                 </button>
               )}
             </div>
             <textarea 
               value={text}
               onChange={(e) => setText(e.target.value)}
               placeholder="Type a clear message..."
               className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[120px] focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-none shadow-inner"
             />
          </div>

          <div className="flex justify-end">
             <button disabled={isTranslating} onClick={handleTranslate} className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                {isTranslating ? 'Preparing...' : 'Prepare / Deliver Message'}
             </button>
          </div>

          {result && (
            <div className="pt-6 border-t border-slate-100">
               <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Delivered Output
               </label>
               <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl text-emerald-900 font-medium whitespace-pre-wrap min-h-[120px]">
                  {result}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
