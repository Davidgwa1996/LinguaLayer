import React, { useState } from "react";
import { Send, Mic } from "lucide-react";
import { VoiceRecorder } from "./VoiceRecorder.tsx";

interface MessageInputProps {
  inputVal: string;
  setInputVal: (val: string) => void;
  loading: boolean;
  onSendTextMessage: () => void;
  onSendVoiceMessage: (audioBlob: Blob, durationMs: number) => void;
  onTyping: () => void;
  themeVars?: any;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  inputVal,
  setInputVal,
  loading,
  onSendTextMessage,
  onSendVoiceMessage,
  onTyping,
  themeVars = { card: "bg-white", text: "text-slate-800" }
}) => {
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  if (showVoiceRecorder) {
    return <VoiceRecorder onSend={onSendVoiceMessage} onCancel={() => setShowVoiceRecorder(false)} />;
  }

  return (
    <div className={`flex w-full items-center gap-2 border-t p-2 sm:p-3 shrink-0 ${themeVars.card} z-10 pb-safe sticky bottom-0`}>
      <button 
         onClick={() => setShowVoiceRecorder(true)}
         className="flex h-12 w-12 flex-none shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition shadow-sm active:scale-95"
      >
         <Mic className="h-5 w-5" />
      </button>
      <input 
        type="text" 
        placeholder="Type a message..."
        className="min-w-0 flex-1 rounded-full border border-slate-300 px-4 py-3 text-sm sm:text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition bg-slate-50 text-slate-800"
        value={inputVal}
        onChange={(e) => {
          setInputVal(e.target.value);
          onTyping();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.ctrlKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            onSendTextMessage();
          }
        }}
        autoComplete="off"
      />
      <button 
        disabled={loading || !inputVal.trim()}
        onClick={onSendTextMessage}
        aria-label="Send message"
        className="flex h-12 w-12 flex-none shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700 transition shadow-sm active:scale-95"
      >
        <Send className="h-5 w-5 ml-1" />
      </button>
    </div>
  );
};
