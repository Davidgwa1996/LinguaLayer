/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Volume2, Sparkles, Check, Globe, Smile, CheckCheck, Pin } from "lucide-react";
import { ChatMessage, UserProfile } from "../types/index.ts";
import { ApiClient } from "../services/apiClient.ts";
import { AudioClientService } from "../services/audioClient.ts";
import { ReactionCounter } from "./ReactionCounter.tsx";

export interface ConversationBubbleProps {
  id?: string;
  message: ChatMessage;
  viewer: UserProfile;
  sender: UserProfile;
  timestampMode: "absolute" | "relative";
  onToggleTimestampMode: () => void;
  onReact?: (emoji: string) => void;
  readStatus?: boolean;
  isPinned?: boolean;
  onPinToggle?: () => void;
}

const EMOJIS = ["👍", "❤️", "😂", "😮", "🙏"];

function safeFormatTime(createdAt: any, mode: "absolute" | "relative"): string {
  if (!createdAt) return "";
  let date: Date;
  
  if (typeof createdAt?.toDate === 'function') {
    date = createdAt.toDate();
  } else if (createdAt && typeof createdAt === 'object' && 'seconds' in createdAt) {
    date = new Date(createdAt.seconds * 1000);
  } else if (typeof createdAt === 'string') {
    date = new Date(createdAt);
  } else if (typeof createdAt === 'number') {
    date = new Date(createdAt);
  } else {
    return String(createdAt);
  }

  if (isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const ConversationBubble: React.FC<ConversationBubbleProps> = ({
  id,
  message,
  viewer,
  sender,
  timestampMode,
  onToggleTimestampMode,
  onReact,
  readStatus,
  isPinned,
  onPinToggle
}) => {
  const [playing, setPlaying] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  if (!message || !viewer || !sender) {
    return null; // Defensive guard against undefined props
  }
  
  const isSelf = viewer.id === sender.id;
  
  let isNativeMatch = isSelf || (message.originalLanguageCode || message.senderLanguageCode) === viewer.languageCode;
  let displayText = "";
  let languageLabel = "";
  let isPending = false;
  
  if (message.type === 'voice') {
     displayText = message.transcript || "🎤 Voice message";
     languageLabel = message.originalLanguageName || message.senderLanguageName || "Voice";
  } else if (isNativeMatch) {
    displayText = message.originalText || "";
    languageLabel = isSelf ? "Original" : (message.originalLanguageName || viewer.preferredLanguage || "Unknown");
  } else {
    const translation = message.translations?.[viewer.languageCode || 'en'];
    if (translation && (translation.translatedText || translation.status === "failed")) {
      if (translation.status === "failed") {
        displayText = "Message could not be prepared in your language. Tap to retry.";
        languageLabel = viewer.preferredLanguage || "Translated";
      } else {
        displayText = showOriginal ? (message.originalText || "") : translation.translatedText;
        languageLabel = showOriginal ? (message.originalLanguageName || "Original") : (viewer.preferredLanguage || "Translated");
      }
    } else {
      displayText = "Preparing message...";
      languageLabel = viewer.preferredLanguage || "Preparing";
      isPending = true;
    }
  }

  const handleSpeak = async () => {
    if (playing) return;
    setPlaying(true);
    try {
      if (message.type === 'voice' && message.voiceUrl) {
         const audio = new Audio(message.voiceUrl);
         audio.onended = () => setPlaying(false);
         audio.play();
         return;
      }
      const isChinese = viewer.languageCode?.includes("zh") || false;
      const voiceName = isChinese ? "Charon" : "Kore";
      const base64Audio = await ApiClient.textToSpeech(displayText, voiceName);
      AudioClientService.playBase64Audio(base64Audio);
    } catch (e) {
      console.error(e);
    } finally {
      if (message.type !== 'voice') setPlaying(false);
    }
  };

  const timestampDisplay = safeFormatTime(message.createdAt, timestampMode);

  // Compute aggregated reactions
  const reactionsMap: Record<string, string[]> = message.reactions || {};
  const activeEmojis = Object.entries(reactionsMap).filter(([_, users]) => users.length > 0);

  return (
    <div
      id={id}
      className={`flex flex-col w-full max-w-[85%] mt-2 ${
        isSelf ? "items-end self-end ml-auto" : "items-start self-start mr-auto"
      }`}
    >
      <div className={`flex items-center space-x-1 mb-1 text-[10.5px] font-medium text-slate-500 uppercase tracking-wider ${isSelf ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <span>{sender.name}</span>
        <button onClick={onToggleTimestampMode} className="hover:text-slate-800 transition px-1">
          • {timestampDisplay}
        </button>
      </div>

      <div
        className={`flex flex-col p-3.5 sm:p-4 rounded-3xl relative transition-all group min-w-[120px] max-w-full shadow-sm border ${
          isSelf
            ? "bg-indigo-600 text-white rounded-tr-sm border-indigo-700/50"
            : "bg-white text-slate-800 rounded-tl-sm border-slate-200"
        }`}
      >
        {isPinned && <Pin className={`absolute -top-2 ${isSelf ? '-left-2' : '-right-2'} w-4 h-4 text-amber-500 fill-amber-300 drop-shadow-sm rotate-45 z-10`} />}
        
        {message.type === 'voice' && message.voiceUrl ? (
           <div className={`flex items-center p-2 rounded-2xl mb-2 ${isSelf ? 'bg-indigo-500' : 'bg-slate-100'}`}>
              <audio src={message.voiceUrl} controls className="h-8 w-48" />
           </div>
        ) : (
          <div className="flex flex-col">
            <p className={`font-sans font-medium text-sm md:text-base leading-relaxed break-words text-left ${isPending ? 'animate-pulse text-slate-500 italic' : ''}`}>
              {displayText}
            </p>
            {!isSelf && !isNativeMatch && !isPending && (
              <button 
                onClick={() => setShowOriginal(!showOriginal)}
                className={`mt-2 text-[10px] w-fit font-bold uppercase tracking-wider hover:opacity-80 transition ${isSelf ? 'text-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {showOriginal ? "Show translation" : "Show original"}
              </button>
            )}
          </div>
        )}

        <div className={`flex items-center space-x-2 mt-2.5 pt-2 border-t ${isSelf ? "justify-end border-indigo-500/40 text-indigo-200" : "justify-between border-slate-100 text-slate-400"}`}>
          <div className="flex items-center space-x-1.5">
            {isNativeMatch ? <Check className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            <span className="text-[9.5px] font-bold tracking-wide uppercase">
              {languageLabel}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            {onPinToggle && (
               <button onClick={onPinToggle} className="p-1 rounded-full text-xs transition hover:bg-slate-200 text-slate-500" title="Pin Message">
                   <Pin className="w-3.5 h-3.5" />
               </button>
            )}
            {!isSelf && onReact && (
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 rounded-full text-xs transition hover:bg-slate-200 text-slate-500"
                  title="React"
                >
                  <Smile className="w-3.5 h-3.5" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-2 left-0 sm:left-1/2 sm:-translate-x-1/2 flex items-center space-x-1 bg-white border border-slate-200 shadow-md rounded-full p-1.5 z-10">
                    {EMOJIS.map(e => (
                      <button
                        key={e}
                        onClick={() => {
                          onReact(e);
                          setShowEmojiPicker(false);
                        }}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full cursor-pointer transition transform active:scale-90"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={handleSpeak}
              disabled={playing}
              className={`p-1 rounded-full text-xs transition ${
                isSelf ? "hover:bg-indigo-700/80 text-indigo-200" : "hover:bg-slate-200 text-slate-500"
              }`}
              title="Listen Read Aloud"
            >
              <Volume2 className={`w-3.5 h-3.5 ${playing ? 'animate-pulse text-amber-500' : ''}`} />
            </button>
            {isSelf && (
              <span className="ml-1 flex items-center justify-center" title={readStatus ? "Read" : "Sent"}>
                {readStatus ? <CheckCheck className="w-3.5 h-3.5 text-indigo-200" /> : <Check className="w-3.5 h-3.5 opacity-60" />}
              </span>
            )}
          </div>
        </div>

        {/* Reactions Display */}
        <ReactionCounter reactions={message.reactions || {}} />
      </div>
    </div>
  );
};
export default ConversationBubble;
