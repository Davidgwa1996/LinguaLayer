import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Send, LogOut, ShieldCheck, User, Users, Loader2 } from 'lucide-react';
import { createLinguaLayerClient } from '../../core/LinguaLayerClient';
import { SUPPORTED_LANGUAGES } from '../../supportedLanguages';
import { prepareMessageDelivery } from '../../translationService';
import { useAuth } from '../../lib/AuthContext';

export function PilotAgentPage() {
  const [client] = useState(() => createLinguaLayerClient());
  const { user, signInWithGoogle, logout } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [joined, setJoined] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem('pilotAgentLanguage') || 'en');
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [roomStatus, setRoomStatus] = useState<string>('active');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    localStorage.setItem('pilotAgentLanguage', language);
  }, [language]);

  useEffect(() => {
    if (user && !joined) {
      const unsub = client.subscribeToAgentSessions((data) => {
        setSessions(data);
      }, user.uid);
      return unsub;
    }
  }, [user, joined, client]);

  useEffect(() => {
    if (joined && sessionId && user) {
       client.joinSession({ sessionId, preferredLanguage: language, displayName: user?.displayName || 'Support Agent' }).catch(err => {
          console.warn("Agent rejoin warn", err);
       });

       setMessages([]); // Clear previous session messages!

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
  }, [joined, sessionId, client, user]); // Removed language from dependencies to avoid re-subscribing and clearing array on language change

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAcceptSession = async (sid: string) => {
     if (!user) return;
     setIsAccepting(true);
     try {
       await client.acceptSession(sid, user.uid, user.email);
       setSessionId(sid);
       await client.joinSession({ sessionId: sid, preferredLanguage: language, displayName: user.displayName || 'Support Agent' });
       setJoined(true);
     } catch (err) {
       console.error("Failed to accept session", err);
       alert("Failed to accept session. It might have been taken by another agent.");
     } finally {
       setIsAccepting(false);
     }
  };

  const handleOpenMySession = async (sid: string) => {
     if (!user) return;
     setIsAccepting(true);
     try {
       setSessionId(sid);
       await client.joinSession({ sessionId: sid, preferredLanguage: language, displayName: user.displayName || 'Support Agent' });
       setJoined(true);
     } catch (err) {
       console.error("Failed to open session", err);
       alert("Failed to open session.");
     } finally {
       setIsAccepting(false);
     }
  };

  const handleSend = async () => {
     if (!inputText.trim()) return;
     const textUrl = inputText;
     setInputText('');
     
     const payload = {
       id: Date.now().toString() + client.getParticipantId(),
       participantId: client.getParticipantId(),
       senderName: user?.displayName || 'Agent',
       originalText: textUrl,
       senderLanguage: language, 
       timestamp: Date.now(),
       type: 'chat'
     };
     
     setMessages(prev => [...prev, payload].sort((a,b) => a.timestamp - b.timestamp));
     await client.sendMessage({ text: textUrl, originalPayload: payload });
  };

  const handleEndSession = async () => {
    if (window.confirm("End this support session? Customers will not be able to send more messages.")) {
      await client.endSession();
    }
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

    if (msg.type === 'system') return null;
    
    return (
       <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
          <div className={`max-w-[75%] rounded-2xl p-3 ${isMe ? 'bg-slate-800 text-white rounded-tr-sm' : 'bg-indigo-50 border border-indigo-100 text-slate-800 rounded-tl-sm shadow-sm'}`}>
             {!isMe && <div className="text-xs text-indigo-500 font-bold mb-1 flex items-center gap-1"><User className="w-3 h-3" /> {msg.senderName || 'Customer'}</div>}
             <div className="text-sm">{displayMsg}</div>
          </div>
       </div>
    );
  };

  if (!joined) {
     const waitingSessions = sessions.filter(s => s.status === 'waiting_for_agent');
     const mySessions = sessions.filter(s => s.agentUid === user?.uid && s.status === 'active');

     return (
       <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
         <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Users className="w-6 h-6 text-indigo-400" /> Support Dashboard</h1>
              <button onClick={logout} className="text-slate-400 hover:text-white transition flex items-center gap-1 text-sm"><LogOut className="w-4 h-4"/> Sign Out</button>
            </div>
            
            <div className="space-y-6">
               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-1">Your Dashboard Language</label>
                 <select className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" value={language} onChange={e => setLanguage(e.target.value)}>
                    {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                 </select>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-700">
                  <div>
                    <h3 className="text-slate-300 font-bold mb-3 flex items-center justify-between">Waiting Customers <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">{waitingSessions.length}</span></h3>
                    {waitingSessions.length === 0 ? (
                      <div className="text-slate-500 text-sm py-4 italic bg-slate-900/50 rounded-xl text-center border border-slate-700/50">No customers waiting</div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {waitingSessions.map(s => (
                          <div key={s.id} className="bg-slate-900 border border-slate-700 p-3 rounded-xl flex items-center justify-between">
                            <div>
                               <div className="text-white text-sm font-medium">{s.customerName || 'Guest'}</div>
                               <div className="text-xs text-slate-500 font-mono">ID: {s.id}</div>
                            </div>
                            <button disabled={isAccepting} onClick={() => handleAcceptSession(s.id)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50">
                               {isAccepting ? 'Accepting...' : 'Accept'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-slate-300 font-bold mb-3 flex items-center justify-between">Your Active Sessions <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">{mySessions.length}</span></h3>
                    {mySessions.length === 0 ? (
                      <div className="text-slate-500 text-sm py-4 italic bg-slate-900/50 rounded-xl text-center border border-slate-700/50">No active sessions</div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {mySessions.map(s => (
                          <div key={s.id} className="bg-slate-900 border border-slate-700 p-3 rounded-xl flex items-center justify-between">
                            <div>
                               <div className="text-white text-sm font-medium">{s.customerName || 'Guest'}</div>
                               <div className="text-xs text-slate-500 font-mono">ID: {s.id}</div>
                            </div>
                            <button disabled={isAccepting} onClick={() => handleOpenMySession(s.id)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 border border-slate-600">
                               Open
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
               </div>
            </div>
         </div>
       </div>
     );
  }

  return (
    <div className="h-[100dvh] w-full bg-slate-900 flex flex-col md:flex-row overflow-hidden">
       <div className="w-full md:w-80 bg-slate-800 border-b md:border-b-0 md:border-r border-slate-700 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-700">
             <h2 className="text-white font-bold text-lg flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-400" /> Agent Workspace</h2>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto flex-1 hidden md:flex flex-col">
             <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
               <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Active Ticket</div>
               <div className="text-xl font-mono text-white flex items-center gap-2">{sessionId}</div>
               <p className="text-xs text-slate-500 mt-2">Give this ID to the customer so they can connect.</p>
             </div>
             
             <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 space-y-3">
               <div>
                  <div className="text-xs text-slate-500 mb-1">Status</div>
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-bold uppercase ${roomStatus==='active' ? 'bg-emerald-900/30 border-emerald-800 text-emerald-400' : 'bg-rose-900/30 border-rose-800 text-rose-400'}`}>
                     <span className={`w-1.5 h-1.5 rounded-full ${roomStatus==='active' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                     {roomStatus}
                  </div>
               </div>
             </div>
             
             <button onClick={handleEndSession} disabled={roomStatus==='ended'} className="w-full py-2 bg-rose-600/20 text-rose-400 border border-rose-600/30 rounded-lg text-sm font-bold hover:bg-rose-600/30 transition disabled:opacity-50">
               Resolve / End Ticket
             </button>
             <button onClick={() => { client.leaveSession(); setJoined(false); }} className="w-full py-2 bg-slate-700 text-white rounded-lg text-sm font-bold hover:bg-slate-600 transition">
               Leave Workspace
             </button>
          </div>
          
          <div className="md:hidden flex p-2 gap-2 overflow-x-auto">
             <button onClick={handleEndSession} disabled={roomStatus==='ended'} className="flex-1 whitespace-nowrap py-2 px-3 bg-rose-600/20 text-rose-400 border border-rose-600/30 rounded-lg text-xs font-bold hover:bg-rose-600/30 transition disabled:opacity-50">
               End Ticket
             </button>
             <button onClick={() => { client.leaveSession(); setJoined(false); }} className="flex-1 whitespace-nowrap py-2 px-3 bg-slate-700 text-white rounded-lg text-xs font-bold hover:bg-slate-600 transition">
               Leave Workspace
             </button>
          </div>
       </div>

       <div className="flex-1 flex flex-col bg-slate-50 min-h-0 relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 relative">
             <div className="text-center my-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full">Secure Support Channel</span>
             </div>
             {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
             <div ref={messagesEndRef} />
          </div>

          <div className="p-3 md:p-4 bg-white border-t border-slate-200 shrink-0 mb-[env(safe-area-inset-bottom)]">
             <div className="max-w-4xl mx-auto flex gap-2">
                <input 
                  disabled={roomStatus==='ended'}
                  className="flex-1 bg-slate-100 border-none rounded-xl px-4 md:px-5 py-3 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 font-medium text-sm md:text-base"
                  placeholder="Type your reply to the customer..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button disabled={roomStatus==='ended'||!inputText.trim()} onClick={handleSend} className="w-12 h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition shadow-md shrink-0">
                   <Send className="w-5 h-5" />
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}
