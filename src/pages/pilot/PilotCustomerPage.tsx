import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Send, LogOut, MessageSquare, Briefcase, User as UserIcon, Globe, Loader2 } from 'lucide-react';
import { createLinguaLayerClient, LinguaLayerClient } from '../../core/LinguaLayerClient';
import { SUPPORTED_LANGUAGES } from '../../supportedLanguages';
import { prepareMessageDelivery } from '../../translationService';
import { useAuth } from '../../lib/AuthContext';

export function PilotCustomerPage() {
  const { user, loading: authLoading, signInWithGoogle, signInAsGuest } = useAuth();
  const [client] = useState(() => createLinguaLayerClient());
  const [sessionId, setSessionId] = useState<string>('');
  const [joined, setJoined] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem('pilotCustomerLanguage') || 'es');
  const [displayName, setDisplayName] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [roomStatus, setRoomStatus] = useState<string>('active');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    localStorage.setItem('pilotCustomerLanguage', language);
  }, [language]);

  useEffect(() => {
    if (user) {
       setIsSigningIn(false);
       if (!displayName && user.displayName) setDisplayName(user.displayName);
       
       // Try to restore an active session for this user
       setIsRestoring(true);
       client.getCustomerActiveSession(user.uid).then(sess => {
          if (sess) {
             setSessionId(sess.id);
             setJoined(true);
          }
       }).finally(() => setIsRestoring(false));
    } else {
       setJoined(false);
       setSessionId('');
    }
  }, [user, client]); // Run once when user logs in

  const handleSignInGoogle = async () => {
    setIsSigningIn(true);
    await signInWithGoogle();
    setIsSigningIn(false);
  };
  
  const handleSignInGuest = async () => {
    setIsSigningIn(true);
    await signInAsGuest();
    setIsSigningIn(false);
  };
  
  useEffect(() => {
    if (joined && sessionId && user) {
       // Re-join quietly inside memory for LinguaLayerClient
       client.joinSession({ sessionId, preferredLanguage: language, displayName: displayName || user.displayName || 'Guest' }).catch(err => {
         console.warn("Rejoin warn", err);
       });

       setMessages([]);

       const uRoom = client.subscribeToSession((sess) => {
          setRoomStatus(sess.status);
       });
       const uMsgs = client.subscribeToMessages((msg) => {
          setMessages(prev => {
             if (prev.some(m => m.id === msg.id)) return prev;
             return [...prev, msg].sort((a,b) => a.timestamp - b.timestamp);
          });
       });
       return () => {
         uRoom();
         uMsgs();
       };
    }
  }, [joined, sessionId, client, user]); // Removed language and displayName from deps to prevent re-subscribing and clearing messages


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartChat = async () => {
     if (!displayName.trim()) return;
     setIsStarting(true);
     try {
       const session = await client.createSession();
       setSessionId(session.id);
       await client.joinSession({ sessionId: session.id, preferredLanguage: language, displayName });
       setJoined(true);
     } catch (err) {
       console.error("Failed to create pilot session", err);
       alert("Failed to start chat. Please try again.");
     } finally {
       setIsStarting(false);
     }
  };

  const handleSend = async () => {
     if (!inputText.trim()) return;
     const textUrl = inputText;
     setInputText('');
     
     const payload = {
       id: Date.now().toString() + client.getParticipantId(),
       participantId: client.getParticipantId(),
       senderName: displayName,
       originalText: textUrl,
       senderLanguage: language, 
       timestamp: Date.now(),
       type: 'chat'
     };
     
     setMessages(prev => [...prev, payload].sort((a,b) => a.timestamp - b.timestamp));
     await client.sendMessage({ text: textUrl, originalPayload: payload });
  };

  const MessageBubble = ({ msg }: { msg: any }) => {
    const isMe = msg.participantId === client.getParticipantId();
    const [displayMsg, setDisplayMsg] = useState(msg.originalText);
    
    useEffect(() => {
       if (!isMe && msg.type === 'chat' && msg.originalText) {
          prepareMessageDelivery(msg.originalText, language, msg.senderLanguage)
             .then(res => setDisplayMsg(res.deliveredText))
             .catch(() => setDisplayMsg(msg.originalText));
       }
    }, [msg, isMe, language]);

    if (msg.type === 'system') return null; // hide system messages in simple chat
    
    return (
       <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
          <div className={`max-w-[85%] rounded-2xl p-3 ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
             {!isMe && <div className="text-xs text-slate-500 font-medium mb-1">{msg.senderName || 'Agent'}</div>}
             <div className="text-sm">{displayMsg}</div>
          </div>
       </div>
    );
  };

  if (!joined) {
     return (
       <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
         <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-200 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
               <UserIcon className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Customer Support</h1>
            <p className="text-slate-500 mb-6 text-sm">Join a pilot support session</p>
            
            {authLoading || isSigningIn || isRestoring ? (
               <div className="py-12 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
                  <span className="text-sm font-medium text-slate-500">{isRestoring ? 'Restoring session...' : 'Authenticating...'}</span>
               </div>
            ) : !user ? (
               <div className="space-y-4">
                  <button type="button" onClick={handleSignInGoogle} disabled={isSigningIn} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2">
                     <Globe className="w-5 h-5 text-indigo-400" /> Sign In with Google
                  </button>
                  <div className="relative my-4">
                     <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                     <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-slate-500 font-bold uppercase tracking-wider">Or</span></div>
                  </div>
                  <button type="button" onClick={handleSignInGuest} disabled={isSigningIn} className="w-full py-4 bg-white border-2 border-indigo-100 hover:bg-indigo-50 text-indigo-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                     <UserIcon className="w-5 h-5 text-indigo-400" /> Continue as Guest
                  </button>
               </div>
            ) : (
            <div className="space-y-4">
               <div>
                  <label className="block text-left text-sm font-medium text-slate-700 mb-1">Your Name</label>
                  <input className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="e.g. Maria" />
               </div>
               <div>
                  <label className="block text-left text-sm font-medium text-slate-700 mb-1">Your Language</label>
                  <select className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 bg-white" value={language} onChange={e => setLanguage(e.target.value)}>
                     {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                  </select>
               </div>
               <button type="button" onClick={handleStartChat} disabled={isStarting || !displayName.trim()} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition shadow-md flex items-center justify-center">
                  {isStarting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Chat'}
               </button>
            </div>
            )}
         </div>
       </div>
     );
  }

  return (
    <div className="h-[100dvh] w-full bg-slate-100 flex flex-col sm:p-4 overflow-hidden">
       <div className="bg-white mx-auto w-full h-full max-w-md sm:rounded-3xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden relative">
          <div className="bg-indigo-600 p-4 shrink-0 flex items-center justify-between shadow-md z-10">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
               </div>
               <div>
                 <h2 className="font-bold text-white leading-tight">Support Team</h2>
                 <p className="text-indigo-100 text-xs flex items-center gap-1">
                   <span className={`w-2 h-2 rounded-full ${roomStatus==='active' ? 'bg-emerald-400' : roomStatus === 'waiting_for_agent' ? 'bg-amber-400' : 'bg-rose-400'}`}></span>
                   {roomStatus==='active' ? 'Live Chat' : roomStatus==='waiting_for_agent' ? 'Waiting for Agent...' : 'Chat Ended'}
                 </p>
               </div>
             </div>
             <button onClick={() => { client.leaveSession(); setJoined(false); }} className="text-white/80 hover:text-white p-3 md:p-2 -mr-2">
                <LogOut className="w-6 h-6 md:w-5 md:h-5" />
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 relative min-h-0">
             <div className="text-center my-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full">Chat Started</span>
             </div>
             {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
             <div ref={messagesEndRef} />
             {roomStatus === 'ended' && (
               <div className="bg-slate-800 text-white p-4 rounded-xl text-center mt-4 mx-2 shadow-lg">
                 Support session has been ended by the agent.
               </div>
             )}
          </div>

          <div className="p-3 md:p-4 bg-white border-t border-slate-100 shrink-0 mb-[env(safe-area-inset-bottom)]">
             <div className="flex gap-2 items-center">
                <input 
                  disabled={roomStatus==='ended'}
                  className="flex-1 bg-slate-100 border-none rounded-full px-4 md:px-5 py-3 md:py-3 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 text-base"
                  placeholder="Type your message..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button disabled={roomStatus==='ended'||!inputText.trim()} onClick={handleSend} className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center disabled:opacity-50 transition shadow-md shrink-0">
                   <Send className="w-5 h-5" />
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}
