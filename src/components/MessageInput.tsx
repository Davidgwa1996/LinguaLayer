import React, { useState } from 'react';
import { checkSourceMessageReadiness } from '../sourceMessageReadiness';
import { Send, CheckCircle2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const [readinessResult, setReadinessResult] = useState(() => checkSourceMessageReadiness(""));
  const [showWarning, setShowWarning] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setReadinessResult(checkSourceMessageReadiness(newText));
    setShowWarning(false);
  };

  const handleSendRequest = () => {
    if (!readinessResult.isReady) return;

    if (readinessResult.level === "needs_attention" && !showWarning) {
      setShowWarning(true);
      return;
    }

    onSend(text);
    setText("");
    setReadinessResult(checkSourceMessageReadiness(""));
    setShowWarning(false);
  };

  return (
    <div className="w-full bg-white border-t border-slate-200 p-4 relative shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] rounded-t-3xl">
      <AnimatePresence>
        {showWarning && readinessResult.level === "needs_attention" && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="mb-4 p-4 bg-yellow-50/90 backdrop-blur border border-yellow-200/50 rounded-2xl flex items-start gap-3 shadow-sm"
          >
            <Info className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-900">
              <p className="font-semibold mb-1 text-yellow-800">{readinessResult.warnings[0]}</p>
              <p className="mb-4 opacity-80">{readinessResult.suggestions[0]}</p>
              <div className="flex gap-2">
                <button onClick={() => setShowWarning(false)} className="px-4 py-1.5 bg-white border border-yellow-200 text-yellow-700 rounded-lg shadow-sm font-medium hover:bg-yellow-50 transition text-xs">
                  Edit Message
                </button>
                <button onClick={() => { onSend(text); setText(""); setShowWarning(false); setReadinessResult(checkSourceMessageReadiness("")); }} className="px-4 py-1.5 bg-yellow-500 text-white rounded-lg shadow-sm font-medium hover:bg-yellow-600 transition text-xs">
                  Send Anyway
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-3">
        <div className="flex-1 relative bg-slate-50 border border-slate-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 rounded-3xl transition-all shadow-inner">
          <textarea
            value={text}
            onChange={handleChange}
            placeholder="Type a clear message in your language..."
            className="w-full max-h-32 min-h-[50px] p-4 bg-transparent outline-none resize-none text-slate-900 placeholder:text-slate-400"
            rows={1}
          />
        </div>
        <button 
          onClick={handleSendRequest}
          disabled={!readinessResult.isReady && text.trim().length === 0}
          className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex-shrink-0"
        >
          <Send className="w-5 h-5 ml-1" />
        </button>
      </div>
      <p className="text-xs font-medium text-slate-400 mt-3 text-center flex items-center justify-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Source Message Readiness helps ensure accurate delivery.
      </p>
    </div>
  );
}
