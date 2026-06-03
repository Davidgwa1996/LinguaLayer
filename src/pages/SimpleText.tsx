import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../supportedLanguages';

export function SimpleText() {
  const [text, setText] = useState('');
  const [targetLang, setTargetLang] = useState('zh');
  const [result, setResult] = useState<string | null>(null);

  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setIsTranslating(true);
    setResult(null);
    try {
      // Use MyMemory public translation API
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
      const data = await response.json();
      
      if (data && data.responseData && data.responseData.translatedText) {
        setResult(data.responseData.translatedText);
      } else {
        setResult("Error processing message");
      }
    } catch(e) {
      setResult("Error processing message");
    } finally {
      setIsTranslating(false);
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
          <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2">Original Text (English)</label>
             <textarea 
               value={text}
               onChange={(e) => setText(e.target.value)}
               placeholder="Type a clear message..."
               className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[120px] focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-none shadow-inner"
             />
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
             <div className="flex-1 w-full">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Target Language</label>
                <select 
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {SUPPORTED_LANGUAGES.filter(l => l.code !== 'en').map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
             </div>
             <button disabled={isTranslating} onClick={handleTranslate} className="w-full md:w-auto mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                {isTranslating ? 'Translating...' : 'Translate Message'}
             </button>
          </div>

          {result && (
            <div className="pt-6 border-t border-slate-100">
               <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Translation Result
               </label>
               <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl text-emerald-900 font-medium">
                  {result}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
