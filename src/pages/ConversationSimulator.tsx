/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  RefreshCw, 
  Smartphone, 
  Laptop, 
  Play, 
  HelpCircle, 
  Server, 
  Tv, 
  SlidersHorizontal,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ConversationMessage } from "../types/index.ts";
import { ApiClient } from "../services/apiClient.ts";
import { ConversationBubble } from "../components/ConversationBubble.tsx";
import { LanguageSelector } from "../components/LanguageSelector.tsx";

interface ConversationSimulatorProps {
  id?: string;
  simpleMode: boolean;
}

export const ConversationSimulator: React.FC<ConversationSimulatorProps> = ({
  id,
  simpleMode,
}) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [viewMode, setViewMode] = useState<"dual" | "deviceA" | "deviceB">("dual");

  const [langA, setLangA] = useState("English (United States)");
  const [langB, setLangB] = useState("Chinese (Mandarin/Simplified)");
  
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");

  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  const aChatEndRef = useRef<HTMLDivElement | null>(null);
  const bChatEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Regular 1.8-second poll to synchronize laptop (User A) and mobile phone (User B)
  useEffect(() => {
    // Initial fetch
    const fetchInitial = async () => {
      try {
        const initialMsgs = await ApiClient.getSimulationMessages();
        setMessages(initialMsgs);
      } catch (err) {
        console.warn("Could not load initial simulation stream. Fallback to offline slate.", err);
      }
    };
    fetchInitial();

    const interval = setInterval(async () => {
      try {
        const synced = await ApiClient.getSimulationMessages();
        // Structural comparison to avoid flashing re-renders
        if (JSON.stringify(synced) !== JSON.stringify(messages)) {
          setMessages(synced);
        }
      } catch (err) {
        console.warn("Real-time simulation sync error:", err);
      }
    }, 1800);

    return () => clearInterval(interval);
  }, [messages]);

  useEffect(() => {
    aChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    bChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Translate and Broadcast message flow
  const handleSendMessage = async (sender: 'A' | 'B', text: string) => {
    if (!text.trim()) return;
    
    const sourceLanguage = sender === 'A' ? langA : langB;
    const targetLanguage = sender === 'A' ? langB : langA;
    
    if (sender === 'A') {
      setLoadingA(true);
      setInputA("");
    } else {
      setLoadingB(true);
      setInputB("");
    }

    try {
      const recentContext = messages.map(m => ({
        speaker: m.sender,
        language: m.sourceLanguage,
        text: m.originalText
      }));

      const response = await ApiClient.translateText({
        sourceText: text,
        sourceLanguage,
        targetLanguage,
        userLanguage: sourceLanguage,
        conversationContext: recentContext.slice(-6),
        tone: "neutral",
        mode: "normal",
        preserveOriginal: false,
        simpleExplanation: true
      });

      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const newMsg: ConversationMessage = {
        id: "m_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        sender,
        originalText: text,
        translatedText: response.translatedText,
        sourceLanguage,
        targetLanguage,
        timestamp: timeString,
        simpleExplanation: response.simpleExplanation,
        preservedTerms: response.preservedTerms,
        warning: response.warning,
        otherTranslations: response.otherTranslations
      };

      // Broadcast up to the in-memory Node backend server
      await ApiClient.addSimulationMessage(newMsg);

      // Instantly append to state for immediate local responsiveness
      setMessages(prev => {
        if (!prev.some(m => m.id === newMsg.id)) {
          return [...prev, newMsg];
        }
        return prev;
      });
    } catch (e) {
      console.error("Simulation sending translation error:", e);
    } finally {
      setLoadingA(false);
      setLoadingB(false);
    }
  };

  const handleClear = async () => {
    try {
      await ApiClient.clearSimulationMessages();
      setMessages([]);
    } catch (e) {
      console.error("Error clearing simulation state:", e);
      setMessages([]);
    }
  };

  // Run the manual test scenario and broadcast key frames
  const runManualTestScript = async () => {
    try {
      await ApiClient.clearSimulationMessages();
      setMessages([]);
    } catch (e) {
      console.warn(e);
    }

    setLangA("English (United States)");
    setLangB("Chinese (Mandarin/Simplified)");

    const scenario = [
      {
        sender: "A" as const,
        originalText: "Hello brother. Can we trade?",
        translatedText: "你好兄弟。我们可以进行交易吗？",
        sourceLanguage: "English (United States)",
        targetLanguage: "Chinese (Mandarin/Simplified)",
        simpleExplanation: "User A welcomes User B and asks if they can start a business transaction.",
        preservedTerms: [],
        delay: 600
      },
      {
        sender: "B" as const,
        originalText: "没问题，你想什么时候送货？我们的价格是每袋$12，运费共计$150。",
        translatedText: "No problem, when do you want delivery? Our price is $12 per bag, and shipping is $150 total.",
        sourceLanguage: "Chinese (Mandarin/Simplified)",
        targetLanguage: "English (United States)",
        simpleExplanation: "User B quotes the cement price as $12/bag and shipping as $150 total.",
        preservedTerms: ["$12", "$150"],
        delay: 2600
      },
      {
        sender: "A" as const,
        originalText: "That sounds fair. Can we confirm the shipment order ID-8840 for next Tuesday?",
        translatedText: "这听起来很公平。我们能确认下周二的货运单 ID-8840 吗？",
        sourceLanguage: "English (United States)",
        targetLanguage: "Chinese (Mandarin/Simplified)",
        simpleExplanation: "User A agrees to the pricing quotes and requests validation for shipment ID-8840.",
        preservedTerms: ["ID-8840"],
        delay: 4800
      },
      {
        sender: "B" as const,
        originalText: "已经排单，单号 ID-8840 确认完成。我们周二见！",
        translatedText: "Scheduled, order ID-8840 is confirmed. See you on Tuesday!",
        sourceLanguage: "Chinese (Mandarin/Simplified)",
        targetLanguage: "English (United States)",
        simpleExplanation: "User B confirms the entry of shipping list index ID-8840.",
        preservedTerms: ["ID-8840"],
        delay: 6800
      }
    ];

    scenario.forEach((step, idx) => {
      // Typing indicators simulations
      setTimeout(() => {
        if (step.sender === "A") {
          setLoadingA(true);
        } else {
          setLoadingB(true);
        }
      }, step.delay - 450);

      // Send the frame
      setTimeout(async () => {
        const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const newMsg: ConversationMessage = {
          id: `test_msg_${idx}_${Date.now()}`,
          sender: step.sender,
          originalText: step.originalText,
          translatedText: step.translatedText,
          sourceLanguage: step.sourceLanguage,
          targetLanguage: step.targetLanguage,
          timestamp: timeString,
          simpleExplanation: step.simpleExplanation,
          preservedTerms: step.preservedTerms,
          warning: null
        };

        try {
          await ApiClient.addSimulationMessage(newMsg);
        } catch (e) {
          console.warn(e);
        }

        setMessages(prev => {
          if (!prev.some(m => m.id === newMsg.id)) {
            return [...prev, newMsg];
          }
          return prev;
        });
        setLoadingA(false);
        setLoadingB(false);
      }, step.delay);
    });
  };

  return (
    <div id={id} className="space-y-6 animate-fade-in text-left">
      
      {/* Dynamic Header & System Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="font-sans font-extrabold text-slate-900 text-2xl md:text-3xl tracking-tight">
            💬 Conversation Simulator Sandbox
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Simulate real-time messaging between screen targets. Supports actual synchronization if opened on two different devices!
          </p>
        </div>

        {/* Sync state notifier bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Clear Action */}
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-xs md:text-sm rounded-xl hover:bg-slate-200 transition flex items-center space-x-1.5 cursor-pointer active:scale-95"
            title="Clear active stream"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clear Stream</span>
          </button>

          {/* Trigger Script Dialogue */}
          <button
            onClick={runManualTestScript}
            className="px-4 py-2 bg-amber-500 text-white font-semibold text-xs md:text-sm rounded-xl hover:bg-amber-600 transition flex items-center space-x-2 shadow-sm cursor-pointer active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Run Test dialogue (US/UK English ⇄ Chinese)</span>
          </button>
        </div>
      </div>

      {/* Multi-Device Testing Viewport Segment Controllers (Absolute Masterclass for testing Laptop vs Phone!) */}
      <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 font-sans">
        <div className="flex items-center space-x-1.5">
          <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold text-slate-700">Device Simulator Viewport Controller:</span>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm space-x-1 select-none">
          <button
            onClick={() => setViewMode("dual")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 cursor-pointer ${
              viewMode === "dual" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Dual View</span>
          </button>
          
          <button
            onClick={() => setViewMode("deviceA")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 cursor-pointer ${
              viewMode === "deviceA" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Device A (Laptop)</span>
          </button>
          
          <button
            onClick={() => setViewMode("deviceB")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 cursor-pointer ${
              viewMode === "deviceB" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Device B (Mobile Phone)</span>
          </button>
        </div>
      </div>

      {/* Grid of Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* ======== DEVICE A: LAPTOP SIDE PANEL VIEW ======== */}
        {(viewMode === "dual" || viewMode === "deviceA") && (
          <div className={`bg-white border border-slate-200 shadow-lg rounded-[40px] p-6 relative flex flex-col h-[560px] overflow-hidden transition-all duration-300 ${viewMode === "deviceA" ? "lg:col-span-2 max-w-2xl mx-auto w-full" : ""}`}>
            
            {/* Speakers Bezel Node */}
            <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-full flex items-center justify-center space-x-1.5 z-10">
              <div className="w-2 h-2 rounded-full bg-slate-800" />
              <div className="w-14 h-1.5 rounded-full bg-slate-700" />
            </div>

            {/* SmartHeader info */}
            <div className="pt-4 pb-3 border-b border-slate-100 flex items-center justify-between font-sans">
              <div>
                <span className="block text-[10px] text-indigo-500 font-extrabold uppercase tracking-wider">Device screen A</span>
                <span className="text-base font-extrabold text-slate-800 flex items-center gap-1">👤 Person A (Your laptop)</span>
              </div>
              <div className="w-44">
                <LanguageSelector
                  label=""
                  selectedLanguage={langA}
                  onChange={setLangA}
                />
              </div>
            </div>

            {/* Chats stream */}
            <div className="flex-1 overflow-y-auto p-2 space-y-4 my-2 scrollbar-none flex flex-col">
              <AnimatePresence initial={false}>
                {messages.map((m) => {
                  const viewedMsg = {
                    ...m,
                    // English/other sender gets translated or native version depending on direction
                    translatedText: m.sender === 'B' ? m.translatedText : m.originalText,
                    originalText: m.sender === 'B' ? m.originalText : m.translatedText,
                    sourceLanguage: m.sender === 'B' ? m.sourceLanguage : m.targetLanguage,
                  };
                  return (
                    <motion.div
                      key={`a_${m.id}`}
                      initial={{ opacity: 0, y: 15, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 120, damping: 14 }}
                      className={`w-full flex ${m.sender === 'A' ? 'justify-end' : 'justify-start'}`}
                    >
                      <ConversationBubble
                        msg={viewedMsg}
                        showOriginal={false}
                        simpleMode={simpleMode}
                        isOutgoing={m.sender === 'A'}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {loadingA && (
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl text-xs animate-pulse self-start flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Translating outbound content...</span>
                </div>
              )}
              <div ref={aChatEndRef} />
            </div>

            {/* Input Action Form */}
            <div className="pt-2 border-t border-slate-150 flex items-center space-x-2">
              <input
                type="text"
                value={inputA}
                onChange={(e) => setInputA(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage('A', inputA)}
                placeholder={`Write message in ${langA}...`}
                className="flex-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:border-indigo-400 focus:outline-none focus:bg-white text-slate-850 placeholder-slate-400 font-sans"
              />
              <button
                onClick={() => handleSendMessage('A', inputA)}
                disabled={loadingA || !inputA.trim()}
                className="p-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-2xl transition shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======== DEVICE B: MOBILE SIDE PANEL VIEW ======== */}
        {(viewMode === "dual" || viewMode === "deviceB") && (
          <div className={`bg-white border border-slate-200 shadow-lg rounded-[40px] p-6 relative flex flex-col h-[560px] overflow-hidden transition-all duration-300 ${viewMode === "deviceB" ? "lg:col-span-2 max-w-2xl mx-auto w-full" : ""}`}>
            
            {/* Speakers Bezel Node */}
            <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-full flex items-center justify-center space-x-1.5 z-10">
              <div className="w-2 h-2 rounded-full bg-slate-800" />
              <div className="w-14 h-1.5 rounded-full bg-slate-700" />
            </div>

            {/* SmartHeader info */}
            <div className="pt-4 pb-3 border-b border-slate-100 flex items-center justify-between font-sans">
              <div>
                <span className="block text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider">Device screen B</span>
                <span className="text-base font-extrabold text-slate-800 flex items-center gap-1 font-sans">👤 Person B (Your mobile phone)</span>
              </div>
              <div className="w-44">
                <LanguageSelector
                  label=""
                  selectedLanguage={langB}
                  onChange={setLangB}
                />
              </div>
            </div>

            {/* Chats stream */}
            <div className="flex-1 overflow-y-auto p-2 space-y-4 my-2 scrollbar-none flex flex-col">
              <AnimatePresence initial={false}>
                {messages.map((m) => {
                  const viewedMsg = {
                    ...m,
                    // Person B sees corresponding translations
                    translatedText: m.sender === 'A' ? m.translatedText : m.originalText,
                    originalText: m.sender === 'A' ? m.originalText : m.translatedText,
                    sourceLanguage: m.sender === 'A' ? m.sourceLanguage : m.targetLanguage,
                  };
                  return (
                    <motion.div
                      key={`b_${m.id}`}
                      initial={{ opacity: 0, y: 15, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 120, damping: 14 }}
                      className={`w-full flex ${m.sender === 'B' ? 'justify-end' : 'justify-start'}`}
                    >
                      <ConversationBubble
                        msg={viewedMsg}
                        showOriginal={false}
                        simpleMode={simpleMode}
                        isOutgoing={m.sender === 'B'}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {loadingB && (
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl text-xs animate-pulse self-start flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Translating incoming reply...</span>
                </div>
              )}
              <div ref={bChatEndRef} />
            </div>

            {/* Input Action Form */}
            <div className="pt-2 border-t border-slate-150 flex items-center space-x-2">
              <input
                type="text"
                value={inputB}
                onChange={(e) => setInputB(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage('B', inputB)}
                placeholder={`Write message in ${langB}...`}
                className="flex-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:border-emerald-400 focus:outline-none focus:bg-white text-slate-850 placeholder-slate-400 font-sans"
              />
              <button
                onClick={() => handleSendMessage('B', inputB)}
                disabled={loadingB || !inputB.trim()}
                className="p-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-2xl transition shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      <div className="p-4 bg-indigo-50/40 border border-indigo-200/50 rounded-2xl text-xs flex items-center space-x-3 text-left font-sans shadow-sm">
        <Server className="w-5 h-5 text-indigo-600 flex-shrink-0 animate-pulse" />
        <span className="text-slate-650 leading-relaxed font-sans">
          <strong>End-To-End Cross-Device Synchronization Active:</strong> You can open this workspace dashboard in two tabs or link a desktop window with your mobile phone! Set one page tab to <strong>"Device A (Laptop)"</strong> and the other to <strong>"Device B (Mobile Phone)"</strong>. Any typed message will instantly broadcast across screens with flawless spring transitions!
        </span>
      </div>
    </div>
  );
};

export default ConversationSimulator;
