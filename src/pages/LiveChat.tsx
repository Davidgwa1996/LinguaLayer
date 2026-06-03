import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Globe, Link as LinkIcon, Copy, Users, Send, Check, LogOut, ArrowLeft } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { SUPPORTED_LANGUAGES } from '../supportedLanguages';
import { prepareMessageDelivery } from '../translationService';

export function LiveChat() {
  const [roomId, setRoomId] = useState<string | null>(() => localStorage.getItem('activeRoomId'));
  const [language, setLanguage] = useState<string>(() => localStorage.getItem('lingualayer-lang') || 'en');
  
  useEffect(() => {
    if (roomId) localStorage.setItem('activeRoomId', roomId);
    else localStorage.removeItem('activeRoomId');
  }, [roomId]);
  
  useEffect(() => {
    localStorage.setItem('lingualayer-lang', language);
  }, [language]);

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mySentMessagesRef = useRef<Set<string>>(new Set());
  
  const [participantId] = useState(() => {
    const saved = localStorage.getItem('lingualayer-pid');
    if (saved) return saved;
    const newId = Math.random().toString(36).substring(2, 10);
    localStorage.setItem('lingualayer-pid', newId);
    return newId;
  });
  const [activeTypers, setActiveTypers] = useState<Record<string, any>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = auth?.onAuthStateChanged((u) => {
      const email = u?.email?.toLowerCase();
      setIsAdmin(email === 'njaudavid5@gmail.com' || email === 'njaudavid5@mail.com');
      setTimeout(() => setAuthLoading(false), 50);
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  const [messageHistory, setMessageHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('lingualayer-chat-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('lingualayer-chat-history', JSON.stringify(messageHistory));
  }, [messageHistory]);

  const [pendingRoomId, setPendingRoomId] = useState<string | null>(() => localStorage.getItem('pendingRoomId'));
  const [roomStatus, setRoomStatus] = useState<'active'|'ended'|null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    // Only check if we are considering joining
    if (pendingRoomId && !roomId) {
      if (!db) {
         setRoomStatus('active'); // fallback
         return;
      }
      setStatusLoading(true);
      getDoc(doc(db, 'rooms', pendingRoomId)).then((docSnap) => {
        if (docSnap.exists()) {
           setRoomStatus(docSnap.data().status === 'ended' ? 'ended' : 'active');
        } else {
           setRoomStatus('ended'); // Invalid room
        }
        setStatusLoading(false);
      });
    }
  }, [pendingRoomId, roomId]);

  const sendSystemMessage = async (action: 'joined' | 'left', rId: string) => {
    if (!db) return;
    try {
      await addDoc(collection(db, 'rooms', rId, 'messages'), {
        id: Date.now().toString() + participantId,
        type: 'system',
        action,
        participantId,
        timestamp: Date.now()
      });
    } catch (e) {
      console.warn("Could not send system message", e);
    }
  };

  useEffect(() => {
    if (!roomId) return;
    
    // Broadcast joined
    sendSystemMessage('joined', roomId);

    const bc = new BroadcastChannel(`lingualayer-room-${roomId}`);
    bc.onmessage = (e) => {
      setMessages(prev => {
        if (prev.some(m => m.id === e.data.id)) return prev;
        return [...prev, e.data].sort((a,b) => a.timestamp - b.timestamp);
      });
    };

    let unsubscribeMessages = () => {};
    let unsubscribeRoom = () => {};

    if (db) {
      try {
        const q = query(collection(db, 'rooms', roomId, 'messages'), orderBy('timestamp', 'asc'));
        unsubscribeMessages = onSnapshot(q, (snapshot) => {
          const loadedMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMessages(loadedMessages);
        }, (err) => {
          console.warn("Firestore error:", err);
        });

        // Listen for typing events
        unsubscribeRoom = onSnapshot(doc(db, 'rooms', roomId), (docSnapshot) => {
           if (docSnapshot.exists()) {
             const data = docSnapshot.data();
             if (data.status === 'ended') {
               setRoomStatus('ended');
               setPendingRoomId(roomId);
               setRoomId(null);
             }
             if (data.activeTypers) {
               setActiveTypers(data.activeTypers);
             }
           }
        });

      } catch (e) {
        console.warn("Firestore not available", e);
      }
    }

    return () => {
      sendSystemMessage('left', roomId);
      unsubscribeMessages();
      unsubscribeRoom();
      bc.close();
    };
  }, [roomId, participantId]);

  const [translatedCache, setTranslatedCache] = useState<Record<string, string>>({});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTypers]);

  useEffect(() => {
    let isSubscribed = true;
    const translateMissing = async () => {
      for (const msg of messages) {
         if (msg.type === 'system') continue;
         if (msg.originalLanguage !== language) {
            const cacheKey = `${msg.id}-${language}`;
            if (!translatedCache[cacheKey]) {
               try {
                  const targetLanguageName = SUPPORTED_LANGUAGES.find(l => l.code === language)?.name || language;
                  const sourceLanguageName = SUPPORTED_LANGUAGES.find(l => l.code === msg.originalLanguage)?.name || msg.originalLanguage;
                  
                  const res = await fetch('/api/translate', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ 
                       sourceText: msg.text, 
                       targetLanguage: language, 
                       targetLanguageName,
                       sourceLanguage: msg.originalLanguage,
                       sourceLanguageName
                     })
                  });
                  const data = await res.json();
                  if (isSubscribed && data && data.translatedText) {
                     const translatedText = data.translatedText;
                     setTranslatedCache(prev => ({...prev, [cacheKey]: translatedText}));
                     
                     setMessageHistory(prev => {
                       if (prev.some(h => h.id === msg.id)) return prev;
                       return [{
                         id: msg.id,
                         text: translatedText,
                         originalText: msg.text,
                         lang: language,
                         timestamp: msg.timestamp
                       }, ...prev].slice(0, 50);
                     });
                  }
               } catch (e) {
                  console.error("Translation fail", e);
               }
            }
         }
      }
    };
    translateMissing();
    return () => { isSubscribed = false; };
  }, [messages, language, translatedCache]);

  const handleCreateRoom = async () => {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    // Remove the hash update from here since we use copy link
    setRoomId(newRoomId);
    
    if (db) {
      try {
        await setDoc(doc(db, 'rooms', newRoomId), { created: serverTimestamp(), activeTypers: {}, status: 'active' });
      } catch (e) {
         console.warn("Could not create room in Firestore", e);
      }
    }
  };

  const handleCopyLink = () => {
    // Generate the correct join link based on current room
    const host = window.location.origin;
    const link = `${host}/#/room/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const notifyTyping = async (isTyping: boolean) => {
    if (!db || !roomId) return;
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        [`activeTypers.${participantId}`]: isTyping ? { time: Date.now(), email: auth?.currentUser?.email || 'A user' } : { time: 0, email: auth?.currentUser?.email || 'A user' }
      });
    } catch (e) {
      // ignore
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    if (e.target.value.trim().length > 0) {
      notifyTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        notifyTyping(false);
      }, 2000);
    } else {
      notifyTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !roomId) return;
    
    notifyTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    const msgId = Date.now().toString();
    mySentMessagesRef.current.add(msgId);
    const payload = {
      id: msgId,
      text: inputText,
      originalLanguage: language,
      timestamp: Date.now()
    };

    setInputText('');
    
    setMessageHistory(prev => {
      if (prev.some(h => h.id === payload.id)) return prev;
      return [{
        id: payload.id,
        text: payload.text,
        originalText: payload.text,
        lang: language,
        timestamp: payload.timestamp
      }, ...prev].slice(0, 50);
    });

    // Local and broadcast updates immediately
    setMessages(prev => {
      if (prev.some(m => m.id === payload.id)) return prev;
      return [...prev, payload];
    });

    const bc = new BroadcastChannel(`lingualayer-room-${roomId}`);
    bc.postMessage(payload);
    bc.close();

    if (db) {
       try {
         await addDoc(collection(db, 'rooms', roomId, 'messages'), payload);
       } catch (e) {
         console.warn("Firestore add disabled.", e);
       }
    }
  };

  const handleLeaveRoom = () => {
    setRoomId(null);
    localStorage.removeItem('activeRoomId');
    window.location.hash = '';
  };

  const handleEndSession = async () => {
    if (!roomId || !db || !isAdmin) return;
    try {
       await updateDoc(doc(db, 'rooms', roomId), { status: 'ended' });
       localStorage.removeItem('pendingRoomId');
       setPendingRoomId(null);
       setRoomId(null);
    } catch (e) {
       console.error("Failed to end session", e);
    }
  };

  const renderMessageContent = (msg: { type?: string, id: string; text: string; originalLanguage: string }) => {
     if (msg.originalLanguage === language) {
        return msg.text; 
     }
     const cacheKey = `${msg.id}-${language}`;
     if (translatedCache[cacheKey]) {
         return translatedCache[cacheKey];
     }
     return "..."
  };

  // Compute active typers
  const activeOtherTypers = Object.entries(activeTypers).filter(([pid, data]) => {
     if (pid === participantId) return false;
     const time = typeof data === 'number' ? data : data?.time || 0;
     return Date.now() - time < 3000;
  });
  const otherTypersCount = activeOtherTypers.length;
  const firstTyperEmail = otherTypersCount > 0 ? (activeOtherTypers[0][1]?.email || 'Someone') : null;

  if (!roomId && authLoading) {
     return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading secure environment...</div>;
  }

  if (!roomId) {
    if (statusLoading) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Checking room status...</div>;
    }

    if (pendingRoomId) {
       if (roomStatus === 'ended') {
          return (
            <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <LogOut className="w-8 h-8 text-slate-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Session Ended</h2>
              <p className="text-slate-500 mb-8">This session has ended. Please ask the owner for a new session link.</p>
              <button onClick={() => { setPendingRoomId(null); localStorage.removeItem('pendingRoomId'); }} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                 <ArrowLeft className="w-4 h-4" /> Go Back
              </button>
            </div>
          );
       }
       
       if (roomStatus === 'active') {
          return (
            <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <MessageSquare className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Join Live Chat</h2>
              <p className="text-slate-500 mb-8">Choose your preferred language to begin.</p>
              
              <div className="text-left mb-8 flex justify-center">
                 <div className="w-full max-w-sm">
                   <label className="block text-sm font-semibold text-slate-700 mb-2">Your language</label>
                   <select 
                     className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     value={language}
                     onChange={(e) => setLanguage(e.target.value)}
                   >
                     {SUPPORTED_LANGUAGES.map(lang => (
                       <option key={lang.code} value={lang.code}>{lang.name} ({lang.nativeName})</option>
                     ))}
                   </select>
                 </div>
              </div>

              <button onClick={() => setRoomId(pendingRoomId)} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 mb-4">
                 <MessageSquare className="w-5 h-5" />
                 Join Session
              </button>
              <button onClick={() => { setPendingRoomId(null); localStorage.removeItem('pendingRoomId'); }} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                 <ArrowLeft className="w-4 h-4" /> Cancel
              </button>
            </div>
          );
       }
    }

    if (isAdmin) {
      return (
        <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <MessageSquare className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Live Chat</h2>
          <p className="text-slate-500 mb-8">Create a room to start talking.</p>
          
          <div className="text-left mb-8 flex justify-center">
             <div className="w-full max-w-sm">
               <label className="block text-sm font-semibold text-slate-700 mb-2">Choose your language</label>
               <select 
                 className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 value={language}
                 onChange={(e) => setLanguage(e.target.value)}
               >
                 {SUPPORTED_LANGUAGES.map(lang => (
                   <option key={lang.code} value={lang.code}>{lang.name} ({lang.nativeName})</option>
                 ))}
               </select>
             </div>
          </div>

          <button onClick={handleCreateRoom} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 mb-4">
             <MessageSquare className="w-5 h-5" />
             Create Room
          </button>
        </div>
      );
    } else {
      return (
         <div className="text-center mt-20 text-slate-500 p-4">
             Link invalid or you have no room ID. To join a room, you must click a valid invite link.
         </div>
      );
    }
  }

  return (
    <div className="w-full h-full min-h-[100dvh] bg-slate-50 flex flex-col pt-0 md:pt-4 md:px-4 !pb-[env(safe-area-inset-bottom)] overflow-hidden fixed top-0 left-0 w-screen md:relative md:w-auto z-50 md:z-auto">
       <div className="w-full max-w-3xl mx-auto h-full flex flex-col bg-white md:rounded-3xl border-x md:border border-slate-200 shadow-sm relative overflow-hidden">
          
          {/* Header */}
          <div className="p-3 md:p-4 border-b border-slate-100 bg-white flex flex-col z-10 shadow-sm sticky top-0 shrink-0">
             <div className="flex flex-row justify-between items-center mb-3">
                <div className="flex items-center gap-2 min-w-0">
                   <button onClick={handleLeaveRoom} className="mr-1 md:mr-2 p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="Leave Chat">
                      <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                   </button>
                   <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-indigo-600 flex items-center justify-center transform rotate-3 shadow-md shrink-0">
                     <Globe className="w-4 h-4 md:w-5 md:h-5 text-white transform -rotate-3" />
                   </div>
                   <span className="font-extrabold text-base md:text-lg text-slate-900 tracking-tight truncate">LinguaLayer <span className="text-indigo-600">AI</span></span>
                </div>
                {auth?.currentUser?.email && (
                  <div className="text-xs font-medium text-slate-500 truncate max-w-[120px] md:max-w-xs text-right">
                    {auth.currentUser.email}
                  </div>
                )}
             </div>

             <div className="flex flex-row justify-between items-center">
                <div className="flex-1 min-w-0 flex items-center gap-2">
                   <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm md:text-base"><MessageSquare className="w-4 h-4 text-indigo-600"/> Live Chat</h3>
                   {isAdmin && <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold uppercase tracking-wide shrink-0">Owner</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0 max-w-[60%]">
                    {isAdmin && (
                      <>
                        <button onClick={handleEndSession} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 transition-colors border border-rose-200">
                          <LogOut className="w-4 h-4" />
                          <span className="hidden md:inline">End Session</span>
                        </button>
                        <button onClick={handleCopyLink} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200">
                           {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                           <span className="hidden md:inline">{copied ? 'Copied!' : 'Copy Link'}</span>
                        </button>
                      </>
                    )}
                   <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5">
                      <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                      <select 
                        className="text-xs font-semibold text-slate-900 bg-transparent focus:outline-none cursor-pointer max-w-[100px] md:max-w-none text-ellipsis"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                      >
                        {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                      </select>
                   </div>
                </div>
             </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto w-full bg-slate-50 overflow-x-hidden flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 mt-12 text-sm max-w-sm mx-auto">
                 Room joined. You will type and read in {SUPPORTED_LANGUAGES.find(l => l.code === language)?.name}. Start chatting!
              </div>
            ) : (
              messages.map(msg => {
                if (msg.type === 'system') {
                   return (
                      <div key={msg.id} className="flex justify-center my-2">
                         <span className="text-[11px] font-medium text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full">
                            A user has {msg.action} the room
                         </span>
                      </div>
                   );
                }
                
                return (
                  <div key={msg.id} className={`flex w-full ${msg.originalLanguage === language ? 'justify-end' : 'justify-start'}`}>
                     <div className={`px-4 py-3 rounded-2xl max-w-[85%] md:max-w-[70%] text-[15px] shadow-sm break-words ${msg.originalLanguage === language ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'}`}>
                        {renderMessageContent(msg)}
                     </div>
                  </div>
                );
              })
            )}
            
            {otherTypersCount > 0 && (
              <div className="flex w-full justify-start">
                 <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-xs text-slate-500 font-medium ml-1">
                       {otherTypersCount > 1 ? `${otherTypersCount} people are typing...` : `${firstTyperEmail} is typing...`}
                    </span>
                 </div>
              </div>
            )}
            
            <div ref={messagesEndRef} className="h-4 w-full flex-shrink-0" />
          </div>

          {/* Input Area */}
          <div className="p-3 md:p-4 bg-white border-t border-slate-200 shrink-0 sticky bottom-0 z-10 w-full mb-[env(safe-area-inset-bottom)]">
             <div className="flex items-center gap-2 max-w-full">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Write in ${SUPPORTED_LANGUAGES.find(l => l.code === language)?.name}...`}
                  className="w-full min-w-0 flex-1 bg-slate-50 border border-slate-300 rounded-full px-5 py-3 text-sm md:text-base focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-900"
                />
                <button onClick={handleSendMessage} disabled={!inputText.trim()} className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-full flex items-center justify-center shadow-md transition-all shrink-0">
                   <Send className="w-5 h-5 ml-1" />
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}

