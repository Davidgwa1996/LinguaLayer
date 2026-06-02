import React from 'react';
import { Pin, X } from 'lucide-react';
import { ChatMessage } from '../types';

interface PinnedMessageBarProps {
  message: ChatMessage | null;
  viewerLanguage: string;
  onUnpin: () => void;
  onScrollTo: () => void;
}

export const PinnedMessageBar: React.FC<PinnedMessageBarProps> = ({ message, viewerLanguage, onUnpin, onScrollTo }) => {
  if (!message) return null;

  const getDisplayText = () => {
    if (message.type === 'voice') return "🎤 Voice message";
    if (message.originalLanguageCode === viewerLanguage) return message.originalText;
    const translation = message.translations?.[viewerLanguage];
    if (translation) return translation.translatedText;
    return message.originalText;
  };

  return (
    <div className="bg-white/90 backdrop-blur border-b border-indigo-100 px-4 py-2 flex items-center justify-between cursor-pointer sticky top-0 z-20 shadow-sm" onClick={onScrollTo}>
        <div className="flex items-center gap-3 overflow-hidden flex-1">
            <Pin className="text-indigo-500 w-4 h-4 shrink-0" />
            <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold text-indigo-600">Pinned Message</span>
                <span className="text-sm text-slate-700 truncate">{getDisplayText()}</span>
            </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onUnpin(); }} 
          className="p-1.5 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-100 transition ml-2"
        >
            <X className="w-4 h-4" />
        </button>
    </div>
  );
};
