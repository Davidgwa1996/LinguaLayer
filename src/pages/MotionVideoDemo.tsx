/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Smartphone, 
  Laptop, 
  Tv, 
  Sparkles, 
  ShieldCheck, 
  Volume2, 
  HelpCircle,
  Eye
} from "lucide-react";

interface DemoStep {
  sender: "A" | "B";
  text: string;
  translated: string;
  sourceLang: string;
  targetLang: string;
  explanation: string;
  isFlagged?: boolean;
}

const DEMO_STEPS: DemoStep[] = [
  {
    sender: "A",
    text: "Hello brother. Can we trade?",
    translated: "你好兄弟。我们可以进行交易吗？",
    sourceLang: "English (United States)",
    targetLang: "Chinese (Mandarin/Simplified)",
    explanation: "User A types in English on Laptop. Instantly translates to natural Chinese. Original text is auto-preserved securely server-side."
  },
  {
    sender: "B",
    text: "没问题，你想什么时候送货？我们的价格是每袋$12，运费共计$150。",
    translated: "No problem, when do you want delivery? Our price is $12 per bag, and shipping is $150 total.",
    sourceLang: "Chinese (Mandarin/Simplified)",
    targetLang: "English (United States)",
    explanation: "User B replies in Chinese on their phone. User A sees it instantly converted to English in real time."
  },
  {
    sender: "A",
    text: "That sounds fair. Can we confirm the shipment order ID-8840 for next Tuesday?",
    translated: "这听起来很公平。我们能确认下周二的货运单 ID-8840 吗？",
    sourceLang: "English (United States)",
    targetLang: "Chinese (Mandarin/Simplified)",
    explanation: "Context-aware AI translation preserves prices and specific identifiers like 'ID-8840' intact with zero hallucinations."
  },
  {
    sender: "B",
    text: "已经排单，单号 ID-8840 确认完成。我们周二见！",
    translated: "Scheduled, order ID-8840 is confirmed. See you on Tuesday!",
    sourceLang: "Chinese (Mandarin/Simplified)",
    targetLang: "English (United States)",
    explanation: "The translation completes. Users communicate seamlessly across borders using their native mobile and desktop screens."
  }
];

export const MotionVideoDemo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [activeBubbles, setActiveBubbles] = useState<DemoStep[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            // Cycle to next step or loop
            setCurrentStep(step => {
              const next = (step + 1) % DEMO_STEPS.length;
              if (next === 0) {
                setActiveBubbles([]);
              }
              return next;
            });
            return 0;
          }
          return prev + 1;
        });
      }, 50); // 5 seconds per step
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Sync bubbles when currentStep changes
  useEffect(() => {
    if (currentStep === 0 && progress === 0) {
      setActiveBubbles([DEMO_STEPS[0]]);
      triggerTranslationEffect();
    } else if (currentStep > 0 && progress === 0) {
      setActiveBubbles(prev => [...prev, DEMO_STEPS[currentStep]]);
      triggerTranslationEffect();
    }
  }, [currentStep]);

  const triggerTranslationEffect = () => {
    setIsTranslating(true);
    setTimeout(() => {
      setIsTranslating(false);
    }, 1200);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
    setActiveBubbles([DEMO_STEPS[0]]);
  };

  const handleScrubStep = (stepIdx: number) => {
    setCurrentStep(stepIdx);
    setProgress(0);
    const slice = DEMO_STEPS.slice(0, stepIdx + 1);
    setActiveBubbles(slice);
    triggerTranslationEffect();
  };

  const handleSimulateSpeech = (text: string, id: string) => {
    if (isSpeaking) return;
    setIsSpeaking(id);
    setTimeout(() => {
      setIsSpeaking(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-sans font-extrabold text-slate-900 text-2xl md:text-3xl tracking-tight">
            🎬 Framer Motion Interactive Video Demo
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            An premium movie-style walk-through simulating how LinguaLayer AI works across Laptop & Mobile in high-fidelity.
          </p>
        </div>
      </div>

      {/* Main Movie Frame Viewport */}
      <div className="bg-slate-950 rounded-[32px] p-4 md:p-6 shadow-2xl border border-slate-800 text-white relative overflow-hidden flex flex-col justify-between min-h-[580px]">
        {/* Glow Effects */}
        <div className="absolute top-[-100px] left-[-100px] w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Video Player Header Overlay */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[10px] font-sans font-extrabold text-indigo-400 tracking-wider uppercase">
              LIVE MOTION RECORDING • {isPlaying ? "PLAYING SCREENPLAY" : "RECORDING PAUSED"}
            </span>
          </div>
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-900 text-[11px] font-semibold border border-slate-800 text-slate-400">
            <Tv className="w-3.5 h-3.5 text-indigo-400" />
            <span>Framer Motion Spring Physics Engine enabled</span>
          </div>
        </div>

        {/* The Action Stage: Dual Device Mockups Container */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 my-4 items-stretch">
          
          {/* DEVICE A: LAPTOP SIMULATED VIEW */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-850 relative flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Laptop className="w-3.5 h-3.5 text-indigo-400" />
                <span>Laptop (User A Screen)</span>
              </span>
              <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-indigo-300 border border-slate-800">
                🇺🇸 English (US)
              </span>
            </div>

            {/* Laptop Screen Simulator chats */}
            <div className="flex-1 overflow-y-auto space-y-3 min-h-[220px] p-2 flex flex-col">
              {activeBubbles.map((b, i) => {
                const isOutgoing = b.sender === "A";
                // Notebook user only sees English translations for incoming, and English original for outcoming
                const displayText = isOutgoing ? b.text : b.translated;
                return (
                  <motion.div
                    key={`laptop_${i}`}
                    initial={{ opacity: 0, x: isOutgoing ? 20 : -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className={`p-3 rounded-2xl max-w-[85%] text-xs font-semibold select-none ${
                      isOutgoing 
                        ? "bg-indigo-650 self-end text-white rounded-tr-sm" 
                        : "bg-slate-800 self-start text-slate-200 rounded-tl-sm border border-slate-700"
                    }`}
                  >
                    <p className="leading-relaxed">{displayText}</p>
                    <div className="flex items-center space-x-1.5 mt-1 opacity-60 text-[9px] pointer-events-auto">
                      <span>• Real time translation</span>
                      <button 
                        onClick={() => handleSimulateSpeech(displayText, `l_${i}`)}
                        className="hover:text-amber-400 transition"
                      >
                        <Volume2 className={`w-3 h-3 cursor-pointer ${isSpeaking === `l_${i}` ? "animate-bounce text-amber-400" : ""}`} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}

              {isTranslating && currentStep % 2 === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="self-start text-[11px] text-indigo-400 animate-pulse bg-slate-950 p-2 rounded-xl"
                >
                  ⚡ Directing secure local vocabulary streams...
                </motion.div>
              )}
            </div>

            {/* Laptop Keyboard simulation indicator */}
            <div className="mt-2 text-center text-[10px] text-slate-500 font-sans border-t border-slate-800 pt-2 flex items-center justify-between">
              <span>Status: Active Connection</span>
              <span className="animate-pulse text-indigo-400 font-bold">● Synchronized</span>
            </div>
          </div>

          {/* DEVICE B: MOBILE PHONE SIMULATED VIEW */}
          <div className="bg-slate-900/90 rounded-[32px] p-4 border border-slate-850 relative flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-3 px-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mobile (User B Screen)</span>
              </span>
              <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-emerald-300 border border-slate-800">
                🇨🇳 Chinese (Mandarin)
              </span>
            </div>

            {/* Mobile Chat Viewport */}
            <div className="flex-1 overflow-y-auto space-y-3 min-h-[220px] p-2 flex flex-col">
              {activeBubbles.map((b, i) => {
                const isOutgoing = b.sender === "B";
                // Mobile user only sees Chinese translated for incoming, Chinese original for outgoing
                const displayText = isOutgoing ? b.text : b.translated;
                return (
                  <motion.div
                    key={`mobile_${i}`}
                    initial={{ opacity: 0, x: isOutgoing ? 20 : -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className={`p-3 rounded-2xl max-w-[85%] text-xs font-semibold select-none ${
                      isOutgoing 
                        ? "bg-slate-850 border border-slate-750 self-end text-slate-200 rounded-tr-sm" 
                        : "bg-indigo-650 self-start text-white rounded-tl-sm"
                    }`}
                  >
                    <p className="leading-relaxed">{displayText}</p>
                    <div className="flex items-center space-x-1.5 mt-1 opacity-60 text-[9px] pointer-events-auto">
                      <span>• Instantly translated</span>
                      <button 
                        onClick={() => handleSimulateSpeech(displayText, `m_${i}`)}
                        className="hover:text-amber-400 transition"
                      >
                        <Volume2 className={`w-3 h-3 cursor-pointer ${isSpeaking === `m_${i}` ? "animate-bounce text-amber-400" : ""}`} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}

              {isTranslating && currentStep % 2 === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="self-start text-[11px] text-emerald-400 animate-pulse bg-slate-950 p-2 rounded-xl"
                >
                  ⚡ Directing secure local vocabulary streams...
                </motion.div>
              )}
            </div>

            {/* Mobile speaker bezel */}
            <div className="mt-2 text-center text-[10px] text-slate-400 font-sans border-t border-slate-800 pt-2 flex items-center justify-between px-1">
              <span>Security Status: Secure</span>
              <span className="text-emerald-500 font-semibold flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Lock Active</span>
              </span>
            </div>
          </div>

        </div>

        {/* Dynamic Frame Explanations */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-indigo-950/40 border border-indigo-900 rounded-2xl p-4 my-2 text-xs font-sans leading-relaxed text-indigo-100 flex items-start gap-3"
          >
            <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 animate-pulse" />
            <div>
              <strong className="block text-indigo-300 font-extrabold uppercase tracking-wider mb-1 text-[10px]">
                Motion Walkthrough Step {currentStep + 1} of {DEMO_STEPS.length}:
              </strong>
              <p className="text-slate-200">{DEMO_STEPS[currentStep].explanation}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Video Scrubber & Controls Tray */}
        <div className="mt-4 border-t border-slate-800 pt-4 flex flex-col gap-3">
          {/* Progress Timeline Scrubber */}
          <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-sans">
            <span>0:0{currentStep}</span>
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full relative overflow-hidden cursor-pointer">
              <div 
                className="bg-indigo-500 h-full transition-all duration-75"
                style={{ width: `${(currentStep * 25) + (progress * 0.25)}%` }}
              />
            </div>
            <span>0:04</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Playbacks play, pause, rotate indicators */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePlayPause}
                className={`py-2 px-4 rounded-xl flex items-center space-x-1.5 font-sans font-bold text-xs cursor-pointer active:scale-95 transition ${
                  isPlaying 
                    ? "bg-amber-500 hover:bg-amber-600 text-white" 
                    : "bg-indigo-650 hover:bg-indigo-700 text-white"
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? "Pause Movie Walkthrough" : "Play Movie Walkthrough"}</span>
              </button>

              <button
                onClick={handleReset}
                className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition cursor-pointer active:scale-95"
                title="Reset Timeline"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Scene Select Indicators */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-sans font-extrabold text-slate-400 tracking-wider uppercase mb-0.5">
                Jump to Scenes:
              </span>
              {DEMO_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleScrubStep(idx)}
                  className={`text-[10px] w-6 h-6 rounded-full font-bold flex items-center justify-center transition border ${
                    currentStep === idx 
                      ? "bg-indigo-600 text-white border-indigo-500 font-extrabold shadow" 
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div className="p-4 bg-indigo-50/50 border border-indigo-200/50 rounded-2xl text-xs flex items-center space-x-2.5">
        <HelpCircle className="w-5 h-5 text-indigo-700 flex-shrink-0" />
        <span className="text-slate-600 font-sans font-medium">
          <strong>Interactive Showcase Mode:</strong> This animated component fully utilizes native <code>motion/react</code> spring physics to simulate a real-time cross-device texting session between desktop and mobile with automatic non-hallucinating AI translation.
        </span>
      </div>
    </div>
  );
};

export default MotionVideoDemo;
