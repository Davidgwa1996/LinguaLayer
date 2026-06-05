import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Globe, Link as LinkIcon, Copy, Users, Send, Check, LogOut, ArrowLeft, Smile } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { SUPPORTED_LANGUAGES } from '../supportedLanguages';
import { prepareMessageDelivery } from '../translationService';
import { useAuth } from '../lib/AuthContext';
import debounce from 'lodash/debounce';
import EmojiPicker from 'emoji-picker-react';
import { perf } from '../lib/firebase';
import { trace } from 'firebase/performance';

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
  const [showingOriginals, setShowingOriginals] = useState<Record<string, boolean>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  const { user, loading: authContextLoading, signInWithGoogle } = useAuth();
  
  useEffect(() => {
    if (user) {
      const email = user.email?.toLowerCase();
      setIsAdmin(email === 'njaudavid5@gmail.com' || email === 'njaudavid5@mail.com');
      setAuthLoading(false);
    } else if (!authContextLoading) {
      setAuthLoading(false);
    }
  }, [user, authContextLoading]);

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
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

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
        
        if (!mySentMessagesRef.current.has(e.data.id) && e.data.type !== 'system') {
           setToastMessage("New message received! 🔔");
        }

        return [...prev, e.data].sort((a,b) => a.timestamp - b.timestamp);
      });
    };

    let unsubscribeMessages = () => {};
    let unsubscribeRoom = () => {};
    let isInitialLoad = true;

    if (db) {
      try {
        const q = query(collection(db, 'rooms', roomId, 'messages'), orderBy('timestamp', 'desc'), limit(50));
        unsubscribeMessages = onSnapshot(q, (snapshot) => {
          if (!isInitialLoad) {
             snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    if (data.type !== 'system' && !mySentMessagesRef.current.has(data.id)) {
                        setToastMessage("New message 🔔");
                    }
                }
             });
          }
          const loadedMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).reverse();
          setMessages(loadedMessages);
          isInitialLoad = false;
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

  const fetchActive = useRef<Record<string, boolean>>({});
  
  useEffect(() => {
    let isSubscribed = true;
    const translateMissing = async () => {
      const messagesToTranslate = messages.filter(msg => {
         if (msg.type === 'system') return false;
         if (msg.originalLanguage === language) return false;
         const cacheKey = `${msg.id}-${language}`;
         if (translatedCache[cacheKey] || fetchActive.current[cacheKey]) return false;
         return true;
      });

      if (messagesToTranslate.length === 0) return;

      const batchTargetLanguageName = SUPPORTED_LANGUAGES.find(l => l.code === language)?.name || language;
      const batchPayload = messagesToTranslate.map(msg => ({
          id: msg.id,
          text: msg.text,
          lang: msg.originalLanguage
      }));

      // Mark all as fetching
      messagesToTranslate.forEach(msg => {
          fetchActive.current[`${msg.id}-${language}`] = true;
      });

      try {
        const res = await fetch('/api/translate-batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: batchPayload,
              targetLanguage: language,
              targetLanguageName: batchTargetLanguageName
            })
        });
        const data = await res.json();
        if (isSubscribed && data && data.translatedTexts) {
            setTranslatedCache(prev => {
                const newCache = { ...prev };
                for (const [id, text] of Object.entries(data.translatedTexts)) {
                    newCache[`${id}-${language}`] = text as string;
                }
                return newCache;
            });
            
            setMessageHistory(prev => {
                let updated = [...prev];
                messagesToTranslate.forEach(msg => {
                   const translatedText = data.translatedTexts[msg.id];
                   if (translatedText && !updated.some(h => h.id === msg.id)) {
                       updated = [{
                         id: msg.id,
                         text: translatedText,
                         originalText: msg.text,
                         lang: language,
                         timestamp: msg.timestamp
                       }, ...updated];
                   }
                });
                return updated.sort((a,b) => b.timestamp - a.timestamp).slice(0, 50);
            });
        }
      } catch (e) {
          console.error("Batch translation fail", e);
          messagesToTranslate.forEach(msg => {
              fetchActive.current[`${msg.id}-${language}`] = false;
          });
      }
    };
    translateMissing();
    return () => { isSubscribed = false; };
  }, [messages, language]);

  const handleCreateRoom = async () => {
    if (!auth.currentUser) return;
    const newRoomId = Math.random().toString(36).substring(2, 8);
    // Remove the hash update from here since we use copy link
    setRoomId(newRoomId);
    
    if (db) {
      try {
        await setDoc(doc(db, 'rooms', newRoomId), { created: serverTimestamp(), activeTypers: {}, status: 'active', ownerId: auth.currentUser.uid });
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

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [prediction, setPrediction] = useState("");

  const fetchPrediction = useCallback(
    debounce(async (text: string, lang: string) => {
      if (!text || text.trim().length === 0) {
        setPrediction("");
        return;
      }
      try {
        const res = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, language: SUPPORTED_LANGUAGES.find(l => l.code === lang)?.name || lang })
        });
        const data = await res.json();
        setPrediction(data.suggestion || "");
      } catch (e) {
        setPrediction("");
      }
    }, 600),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    setPrediction("");
    fetchPrediction(e.target.value, language);
    
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

  const handleApplyPrediction = () => {
    if (prediction) {
       setInputText(prev => prev + " " + prediction.trim());
       setPrediction("");
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
       let msgTrace = null;
       try {
         if (perf) {
            msgTrace = trace(perf, "sendMessageDeliveryAndDBWrite");
            msgTrace.start();
         }
         await addDoc(collection(db, 'rooms', roomId, 'messages'), payload);
         if (msgTrace) msgTrace.stop();
       } catch (e) {
         console.warn("Firestore add disabled.", e);
         if (msgTrace) msgTrace.stop();
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

  const toggleOriginal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowingOriginals(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderMessageContent = (msg: { type?: string, id: string; text: string; originalLanguage: string }) => {
     if (msg.originalLanguage === language) {
        return msg.text; 
     }
     const cacheKey = `${msg.id}-${language}`;
     if (translatedCache[cacheKey]) {
         return (
             <div className="flex flex-col">
                 <span>{translatedCache[cacheKey]}</span>
                 <button onClick={(e) => toggleOriginal(msg.id, e)} className="text-[10px] mt-1.5 opacity-60 hover:opacity-100 text-left underline w-fit">
                    {showingOriginals[msg.id] ? 'Hide original' : 'View original'}
                 </button>
                 {showingOriginals[msg.id] && (
                     <div className="mt-1 pt-1 border-t border-current/20 text-xs italic opacity-80 break-words">
                        {msg.originalLanguage.toUpperCase()}: {msg.text}
                     </div>
                 )}
             </div>
         );
     }
     return (
        <span className="inline-flex items-center gap-2 opacity-70">
           <span className="flex space-x-1 shrink-0 px-2 py-1">
             <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
             <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
             <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></div>
           </span>
        </span>
     );
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
          if (!user) {
             return (
               <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
                 <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-indigo-600" />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in Required</h2>
                 <p className="text-slate-500 mb-8">You must be signed in with Google to join this secure live chat.</p>
                 <button onClick={signInWithGoogle} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5" />
                    Sign In with Google
                 </button>
                 <button onClick={() => { setPendingRoomId(null); localStorage.removeItem('pendingRoomId'); }} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Cancel
                 </button>
               </div>
             );
          }

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
    } else if (!user) {
      return (
        <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
           <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-indigo-600" />
           </div>
           <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in Required</h2>
           <p className="text-slate-500 mb-8">You must be signed in with Google to use Live Chat.</p>
           <button onClick={signInWithGoogle} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5" />
              Sign In with Google
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

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
    
    const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    const timeString = timeFormatter.format(date);
    
    if (isToday) return `Today at ${timeString}`;
    if (isYesterday) return `Yesterday at ${timeString}`;
    
    const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    return `${dateFormatter.format(date)} at ${timeString}`;
  };

  return (
    <div className="w-full h-full min-h-[100dvh] bg-slate-50 flex flex-col pt-0 md:pt-4 md:px-4 !pb-[env(safe-area-inset-bottom)] overflow-hidden fixed top-0 left-0 w-screen md:relative md:w-auto z-50 md:z-auto">
       {toastMessage && (
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-10">
             <div className="bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm flex items-center gap-2">
                {toastMessage}
             </div>
          </div>
       )}
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
                
                const isMyMessage = mySentMessagesRef.current.has(msg.id);
                return (
                  <div key={msg.id} className={`flex w-full ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                     <div className={`flex flex-col gap-1 max-w-[85%] md:max-w-[70%] text-[15px]`}>
                       <div className={`px-4 py-3 rounded-2xl shadow-sm break-words ${isMyMessage ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'}`}>
                          {renderMessageContent(msg)}
                       </div>
                       {msg.timestamp && (
                          <div className={`text-[10px] text-slate-400 px-1 ${isMyMessage ? 'text-right' : 'text-left'}`}>
                             {formatTimestamp(msg.timestamp)}
                          </div>
                       )}
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
             {showEmojiPicker && (
                <div className="absolute bottom-full right-4 mb-2 z-50">
                   <EmojiPicker onEmojiClick={(emojiData) => {
                       setInputText(prev => prev + emojiData.emoji);
                       setPrediction("");
                       fetchPrediction(inputText + emojiData.emoji, language);
                       setShowEmojiPicker(false);
                   }} />
                </div>
             )}
             
             {prediction && (
                <div className="px-4 pb-2">
                   <button onClick={handleApplyPrediction} className="text-xs text-indigo-600 font-medium px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full flex items-center gap-1 hover:bg-indigo-100 transition-colors">
                      <span className="opacity-60 text-slate-500">Suggestion(Tab to apply):</span> {prediction}
                   </button>
                </div>
             )}

             <div className="flex items-center gap-2 max-w-full">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-10 h-10 flex items-center justify-center shrink-0 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <input 
                  type="text" 
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                     if (e.key === 'Enter') handleSendMessage();
                     if (e.key === 'Tab' && prediction) {
                        e.preventDefault();
                        handleApplyPrediction();
                     }
                  }}
                  placeholder={`Write in ${SUPPORTED_LANGUAGES.find(l => l.code === language)?.name}...`}
                  spellCheck="true"
                  autoComplete="on"
                  autoCorrect="on"
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

