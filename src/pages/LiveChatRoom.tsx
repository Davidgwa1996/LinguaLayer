import React, { useState, useRef, useEffect } from "react";
import { Send, Copy, UserPlus, MessageSquare, Globe, Search, Download, Mic, Pin } from "lucide-react";
import { ChatMessage } from "../types/index.ts";
import { ApiClient } from "../services/apiClient.ts";
import { ConversationBubble } from "../components/ConversationBubble.tsx";
import { getCurrentAuthUser } from "../services/authService.ts";
import { upsertUserProfile } from "../services/userService.ts";
import { createRoom, joinRoom, updateRoomTheme, pinMessage, unpinMessage } from "../services/roomService.ts";
import { sendTextMessage, sendVoiceMessage, listenToMessages, addReaction } from "../services/messageService.ts";
import { auth, db } from "../services/firebaseClient.ts";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { MessageInput } from "../components/MessageInput.tsx";
import { ThemeCustomizer, ChatTheme } from "../components/ThemeCustomizer.tsx";
import { PinnedMessageBar } from "../components/PinnedMessageBar.tsx";
import { TranslationService } from "../services/translationService.ts";

const LANGUAGES = [
  { code: "en-US", name: "US English", nativeName: "English (US)" },
  { code: "en-GB", name: "UK English", nativeName: "English (UK)" },
  { code: "zh-CN", name: "Chinese", nativeName: "中文" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ar", name: "Arabic", nativeName: "العربية" }
];

export const LiveChatRoom: React.FC<{ selectedLanguage: string, onChangeLanguage: () => void }> = ({ selectedLanguage, onChangeLanguage }) => {
  const [roomId, setRoomId] = useState<string>("");
  const [activeRoom, setActiveRoom] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [timestampMode, setTimestampMode] = useState<"absolute" | "relative">("absolute");
  const [fastMode] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [participantLanguages, setParticipantLanguages] = useState<string[]>([]);
  const [theme, setTheme] = useState<ChatTheme>("default");
  const [pinnedMessageId, setPinnedMessageId] = useState<string | null>(null);
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsInitializing(true);
        setInitError("");
        
        const user = await getCurrentAuthUser();
        if (!user) throw new Error("No authenticated user");
        const langConfig = LANGUAGES.find(l => l.code === selectedLanguage);
        await upsertUserProfile(user.uid, selectedLanguage, langConfig?.name || selectedLanguage);

        const params = new URLSearchParams(window.location.search);
        let currentRoom = params.get("roomId") || params.get("room");
        
        if (!currentRoom) {
          const parts = window.location.pathname.split("/").filter(Boolean);
          if (parts[0] === "chat" && parts[1]) currentRoom = parts[1];
        }
        
        if (currentRoom) {
           await joinRoom(currentRoom, user.uid, { code: selectedLanguage, name: langConfig?.name || selectedLanguage });
           setActiveRoom(currentRoom);
           const newUrl = new URL(window.location.href);
           newUrl.searchParams.set("room", currentRoom);
           window.history.replaceState({}, "", newUrl);
        }
      } catch (e: any) {
        console.error("Initialization error:", e);
        setInitError("Authentication missing. Please reload to sign in.");
      } finally {
        setIsInitializing(false);
      }
    };

    if (selectedLanguage) {
      initializeChat();
    }
  }, [selectedLanguage]);

  useEffect(() => {
    if (!activeRoom) return;
    
    const unsubMessages = listenToMessages(activeRoom, (msgs) => {
      setMessages(msgs as ChatMessage[]);
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    });

    const roomRef = doc(db, "rooms", activeRoom);
    const unsubRoom = onSnapshot(roomRef, (snap) => {
       const data = snap.data();
       if (data) {
          if (data.theme) setTheme(data.theme as ChatTheme);
          if (data.pinnedMessageId) setPinnedMessageId(data.pinnedMessageId);
          else setPinnedMessageId(null);
          
          if (data.participantLanguages) {
            setParticipantLanguages(data.participantLanguages);
          }
          
          if (data.typing) {
            const currentUserUid = auth.currentUser?.uid;
            let isOtherTyping = false;
            if (currentUserUid) {
              Object.keys(data.typing).forEach(uid => {
                 if (uid !== currentUserUid && Date.now() - data.typing[uid] < 3000) {
                     isOtherTyping = true;
                 }
              });
            }
            setPartnerTyping(isOtherTyping);
          }
       }
    });

    return () => { unsubMessages(); unsubRoom(); };
  }, [activeRoom]);

  const translatingRef = useRef<Set<string>>(new Set());
  const [translationError, setTranslationError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeRoom || messages.length === 0) return;

    const translatePending = async () => {
      const msgsToTranslate = messages.filter(msg => {
        const msgSourceCode = msg.originalLanguageCode || msg.senderLanguageCode;
        if (msgSourceCode === selectedLanguage) return false;
        if (msg.translations?.[selectedLanguage] && msg.translations[selectedLanguage].status !== "failed" && msg.translations[selectedLanguage].translatedText) return false;
        if (translatingRef.current.has(msg.id)) return false;
        return true;
      });

      if (msgsToTranslate.length === 0) return;

      msgsToTranslate.forEach(msg => translatingRef.current.add(msg.id));
      
      try {
        const langConfig = LANGUAGES.find(l => l.code === selectedLanguage);
        const langName = langConfig?.name || "English";

        const batchReq: import("../types/index.ts").BatchTranslationRequest = {
          items: msgsToTranslate.map(msg => ({
            id: msg.id,
            sourceText: msg.originalText,
            sourceLanguageCode: msg.originalLanguageCode || msg.senderLanguageCode || "unknown",
            sourceLanguage: msg.originalLanguage || msg.senderLanguageName || "Unknown",
            targetLanguageCode: selectedLanguage,
            targetLanguage: langName
          })),
          mode: fastMode ? "simple" : "normal"
        };
        
        const response = await TranslationService.translateBatch(batchReq);

        const batchUpdatePromises = response.results.map(async (res) => {
          if (res.translatedText === "Translation failed") {
             setTranslationError("Failed to translate some messages.");
             translatingRef.current.delete(res.id);
             return Promise.resolve();
          }
          
          const msgRef = doc(db, "rooms", activeRoom, "messages", res.id);
          await updateDoc(msgRef, {
            [`translations.${selectedLanguage}`]: {
              targetLanguage: langName,
              targetLanguageCode: selectedLanguage,
              translatedText: res.translatedText,
              confidence: res.confidence,
              warning: res.warning,
              ambiguity: res.ambiguity,
              status: "ready"
            }
          });
        });
        
        await Promise.all(batchUpdatePromises);
        setTranslationError(null);
      } catch (err: any) {
        console.error("Batch auto-translation failed:", err);
        msgsToTranslate.forEach(msg => translatingRef.current.delete(msg.id));
        setTranslationError(err.message || "Failed to translate messages.");
      }
    };
    
    translatePending();
  }, [messages, selectedLanguage, activeRoom, fastMode]);

  const handleStartRoom = async () => {
    try {
        setIsInitializing(true);
        const user = await getCurrentAuthUser();
        if (!user) throw new Error("No user");
        const langConfig = LANGUAGES.find(l => l.code === selectedLanguage);
        
        let newRoom = roomId.trim();
        if (newRoom) {
            await joinRoom(newRoom, user.uid, { code: selectedLanguage, name: langConfig?.name || selectedLanguage });
        } else {
            newRoom = await createRoom(user.uid, { code: selectedLanguage, name: langConfig?.name || selectedLanguage });
        }
        
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("room", newRoom);
        window.history.pushState({}, "", newUrl);
        setActiveRoom(newRoom);
    } catch (e: any) {
        console.error("Join/Create Room Error", e);
        setInitError("We could not start your chat session. Please check your connection and try again.");
    } finally {
        setIsInitializing(false);
    }
  };

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    if (activeRoom) {
      url.searchParams.set("room", activeRoom);
      navigator.clipboard.writeText(url.toString());
      if ((window as any).showToast) {
        (window as any).showToast("Chat link copied! Send this to your partner.", "success", 3000);
      }
    }
  };

  const toggleTimestampMode = () => setTimestampMode(prev => prev === "absolute" ? "relative" : "absolute");

  const handleTyping = () => {
      if (!activeRoom) return;
      const currentUserUid = auth.currentUser?.uid;
      if (!currentUserUid) return;

      updateDoc(doc(db, "rooms", activeRoom), {
         [`typing.${currentUserUid}`]: Date.now()
      }).catch(() => {});

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
          updateDoc(doc(db, "rooms", activeRoom), {
             [`typing.${currentUserUid}`]: 0
          }).catch(() => {});
      }, 2000);
  };

  const handleSendMessage = async () => {
    if (!inputVal.trim() || !activeRoom) return;
    
    setLoading(true);
    setSendError(null);
    const textToSend = inputVal;

    try {
      if (!selectedLanguage) throw new Error("Please choose your language first.");
      const user = auth.currentUser;
      if (!user?.uid) throw new Error("Please sign in before sending.");

      const langConfig = LANGUAGES.find(l => l.code === selectedLanguage);
      
      // Calculate missing languages that need translation
      const targetLanguages = Array.from(new Set(participantLanguages.filter(code => code !== selectedLanguage)));
      const precomputedTranslations: Record<string, any> = {};

      if (targetLanguages.length > 0) {
        try {
          const batchReq: import("../types/index.ts").BatchTranslationRequest = {
            items: targetLanguages.map((targetCode, index) => {
              const targetLangConfig = LANGUAGES.find(l => l.code === targetCode);
              const targetName = targetLangConfig?.name || "English";
              return {
                id: `temp_${index}`,
                sourceText: textToSend,
                sourceLanguageCode: selectedLanguage,
                sourceLanguage: langConfig?.name || selectedLanguage,
                targetLanguageCode: targetCode,
                targetLanguage: targetName
              };
            }),
            mode: fastMode ? "simple" : "normal"
          };

          const res = await TranslationService.translateBatch(batchReq);
          
          res.results.forEach(result => {
             if (result.translatedText === "Translation failed") {
                precomputedTranslations[result.targetLanguageCode] = { status: "failed", targetLanguageCode: result.targetLanguageCode };
             } else {
                const targetLangConfig = LANGUAGES.find(l => l.code === result.targetLanguageCode);
                const targetName = targetLangConfig?.name || "English";
                precomputedTranslations[result.targetLanguageCode] = {
                  targetLanguage: targetName,
                  targetLanguageCode: result.targetLanguageCode,
                  translatedText: result.translatedText,
                  confidence: result.confidence,
                  warning: result.warning,
                  ambiguity: result.ambiguity,
                  status: "ready"
                };
             }
          });
        } catch (err: any) {
          console.error("Failed to precompute translation batch", err);
          targetLanguages.forEach(code => {
             precomputedTranslations[code] = { status: "failed", targetLanguageCode: code };
          });
        }
      }

      // Ensure idempotently joined before sending
      await joinRoom(activeRoom, user.uid, { code: selectedLanguage, name: langConfig?.name || selectedLanguage });

      await sendTextMessage(
        activeRoom, 
        textToSend, 
        {
          uid: user.uid,
          languageCode: selectedLanguage,
          languageName: langConfig?.name || selectedLanguage
        },
        precomputedTranslations
      );
      
      // Clear input only after successful send
      setInputVal("");
    } catch (err: any) {
      console.error("Send failed:", err);
      let friendlyError = "Failed to send message. Please try again.";
      if (err.message) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.error) friendlyError = parsed.error;
        } catch (e) {
          if (err.message.includes("429") || err.message.includes("quota") || err.message.includes("RESOURCE_EXHAUSTED")) {
            friendlyError = "API quota exceeded. Please try again later.";
          } else {
            friendlyError = err.message;
          }
        }
      }
      setSendError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleSendVoice = async (audioBlob: Blob, durationMs: number) => {
    if (!activeRoom) return;
    setLoading(true);
    setSendError(null);

    try {
      if (!selectedLanguage) throw new Error("Please choose your language first.");
      const user = auth.currentUser;
      if (!user?.uid) throw new Error("Please sign in before sending.");
      
      const langConfig = LANGUAGES.find(l => l.code === selectedLanguage);
      await joinRoom(activeRoom, user.uid, { code: selectedLanguage, name: langConfig?.name || selectedLanguage });
      
      await sendVoiceMessage(activeRoom, audioBlob, durationMs, {
        uid: user.uid,
        languageCode: selectedLanguage,
        languageName: langConfig?.name || selectedLanguage
      });
    } catch (err: any) {
      console.error("Send voice failed:", err);
      setSendError(err.message || "Failed to send voice message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (newTheme: ChatTheme) => {
      setTheme(newTheme);
      if (activeRoom) {
          try {
              await updateRoomTheme(activeRoom, newTheme);
          } catch(e) { console.error("Could not update theme", e); }
      }
  };

  const handlePinToggle = async (messageId: string) => {
      if (!activeRoom) return;
      try {
          if (pinnedMessageId === messageId) {
             await unpinMessage(activeRoom);
          } else {
             await pinMessage(activeRoom, messageId);
          }
      } catch (err) {
          console.error("Could not pin message", err);
      }
  };

  const handleReact = async (msgId: string, emoji: string) => {
      try {
          const user = auth.currentUser;
          if (user?.uid) {
            await addReaction(activeRoom, msgId, emoji, user.uid);
          }
      } catch (err) {
          console.error("Reaction failed", err);
      }
  };

  if (isInitializing) {
    return (
      <div className="flex h-[100svh] w-full flex-col items-center justify-center p-4 bg-slate-50">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
         <p className="text-slate-600 font-medium">Preparing your secure chat...</p>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="flex h-[100svh] w-full flex-col items-center justify-center p-4 bg-slate-50">
         <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-sm border border-red-100 text-center">
            <div className="text-red-500 mb-2 text-3xl">⚠️</div>
            <p className="text-slate-800 mb-4 font-medium">{initError}</p>
            <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 transition">
               Retry
            </button>
         </div>
      </div>
    );
  }

  if (!activeRoom) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 border border-slate-100 shadow-sm text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <UserPlus className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Join a Room</h1>
          <p className="mt-2 text-slate-500 mb-6">Create or join a room to start.</p>
          
          <input 
            type="text" 
            placeholder="Room code (e.g. room-123)" 
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 mb-4 focus:border-indigo-500 flex-1 outline-none text-slate-800"
          />
          <button 
            onClick={handleStartRoom}
            className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            disabled={loading}
          >
            Create / Join Room
          </button>
        </div>
      </div>
    );
  }

  const currentLangNative = LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName || "English";
  const currentUseruid = auth.currentUser?.uid || '';
  
  const filteredMessages = messages.filter(msg => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const isSelf = msg.senderId === currentUseruid;
      const dt = isSelf ? msg.originalText : (msg.translations?.[selectedLanguage]?.translatedText || msg.originalText);
      return dt.toLowerCase().includes(q);
  });

  const getThemeVars = () => {
      switch(theme) {
        case "dark": return { main: "bg-slate-900", card: "bg-slate-800 border-slate-700", text: "text-slate-100" };
        case "ocean": return { main: "bg-blue-50", card: "bg-white border-blue-100", text: "text-slate-900" };
        case "sunset": return { main: "bg-orange-50", card: "bg-white border-orange-100", text: "text-slate-900" };
        case "forest": return { main: "bg-green-50", card: "bg-white border-green-100", text: "text-slate-900" };
        default: return { main: "bg-slate-50", card: "bg-white border-slate-100", text: "text-slate-900" };
      }
  };

  const themeVars = getThemeVars();
  const pinnedMsg = pinnedMessageId ? messages.find(m => m.id === pinnedMessageId) || null : null;

  return (
    <main className={`min-h-[100svh] px-0 sm:px-4 py-0 sm:py-4 flex flex-col ${themeVars.main}`}>
      <section className={`mx-auto flex min-h-[100svh] sm:min-h-[calc(100svh-2rem)] w-full max-w-2xl flex-col sm:rounded-3xl shadow-sm overflow-hidden flex-1 relative ${themeVars.card} transition-colors`}>
        {/* Header */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between border-b p-3 sm:p-4 gap-3 z-10 ${themeVars.text} ${themeVars.card}`}>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Live Chat Room</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="max-w-full truncate rounded-lg bg-slate-100/50 px-2 py-0.5 text-xs font-mono text-slate-600">{activeRoom}</span>
              <button onClick={handleCopyLink} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center">
                <Copy className="h-3 w-3 mr-1" /> Copy Link
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={onChangeLanguage} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/50 px-3 py-1.5 text-xs font-medium hover:bg-slate-100 transition shadow-sm text-slate-800">
              <Globe className="h-3.5 w-3.5" />
              <span>{currentLangNative}</span>
            </button>
          </div>
        </div>

        <ThemeCustomizer currentTheme={theme} onThemeChange={handleThemeChange} />
        
        <PinnedMessageBar 
            message={pinnedMsg} 
            viewerLanguage={selectedLanguage} 
            onUnpin={() => handlePinToggle(pinnedMessageId!)}
            onScrollTo={() => {
                const el = document.getElementById(`msg-${pinnedMessageId}`);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
        />

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 pb-8"
        >
          {filteredMessages.length === 0 ? (
            <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
              <MessageSquare className="mb-4 h-12 w-12 text-slate-200" />
              <p>{searchQuery ? "No messages found matching search." : "Room is empty. Send a message to get started!"}</p>
            </div>
          ) : (
            filteredMessages.map(msg => {
              const viewerProfile = { 
                id: currentUseruid,
                name: "Me", 
                languageCode: selectedLanguage, 
                preferredLanguage: LANGUAGES.find(l => l.code === selectedLanguage)?.name || "English" 
              };
              
              const senderProfile = { 
                id: msg.senderId,
                name: msg.senderId === currentUseruid ? 'Me' : 'Partner',
                languageCode: msg.originalLanguageCode, 
                preferredLanguage: msg.originalLanguage 
              };
              
              return (
                <ConversationBubble
                  key={msg.id}
                  id={`msg-${msg.id}`}
                  message={msg}
                  viewer={viewerProfile}
                  sender={senderProfile}
                  timestampMode={timestampMode}
                  onToggleTimestampMode={toggleTimestampMode}
                  onReact={(emoji) => handleReact(msg.id, emoji)}
                  isPinned={pinnedMessageId === msg.id}
                  onPinToggle={() => handlePinToggle(msg.id)}
                />
              )
            })
          )}
          {partnerTyping && (
             <div className="text-xs text-slate-500 italic mt-2 animate-pulse flex items-center">
                 <span className="mr-1">Partner is typing</span>
                 <span className="flex space-x-0.5">
                    <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full animation-delay-200"></span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full animation-delay-400"></span>
                 </span>
             </div>
          )}
        </div>

        {/* Input Area */}
        {translationError && (
            <div className="mx-3 sm:mx-4 mt-2 rounded-xl bg-orange-50 border border-orange-100 p-3 flex flex-wrap items-center justify-between gap-2 shadow-sm z-20">
                <span className="text-sm font-semibold text-orange-800">{translationError}</span>
                <button onClick={() => setTranslationError(null)} className="text-xs bg-transparent border border-orange-200 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition font-semibold">Dismiss</button>
            </div>
        )}
        {sendError && (
            <div className="mx-3 sm:mx-4 mt-2 rounded-xl bg-red-50 border border-red-100 p-3 flex flex-wrap items-center justify-between gap-2 shadow-sm z-20">
                <span className="text-sm font-semibold text-red-800">{sendError}</span>
                <div className="flex gap-2">
                    <button onClick={() => setSendError(null)} className="text-xs bg-transparent border border-red-200 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100 transition font-semibold">Dismiss</button>
                    <button onClick={handleSendMessage} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50" disabled={loading}>Retry</button>
                </div>
            </div>
        )}
        <MessageInput 
          inputVal={inputVal}
          setInputVal={setInputVal}
          loading={loading}
          onSendTextMessage={handleSendMessage}
          onSendVoiceMessage={handleSendVoice}
          onTyping={handleTyping}
          themeVars={themeVars}
        />
      </section>
    </main>
  );
};
