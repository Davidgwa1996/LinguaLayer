/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BigButton } from "../components/BigButton.tsx";
import { Languages, MessageSquareCode, Disc, Settings, ShieldCheck, Keyboard, Briefcase, Info, FileText } from "lucide-react";
import { jsPDF } from "jspdf";

interface HomePageProps {
  id?: string;
  onNavigate: (page: string) => void;
  simpleMode: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
  id,
  onNavigate,
  simpleMode,
}) => {
  const generateDemoPDF = () => {
    try {
      const doc = new jsPDF();

      // Standard header styling
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("LinguaLayer AI - Universal Communication Suite", 14, 25);

      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.5);
      doc.line(14, 28, 196, 28);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text("Industry Overview & Technical Capabilities Documentation", 14, 34);
      doc.text("Generated: May 2026", 145, 34);

      // Section 1: Executive Summary
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.text("1. Executive Summary", 14, 46);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85); // slate-700
      
      const introText = "LinguaLayer AI acts as an end-to-end translation adapter layer, allowing borderless live speech transcription, secure pre-encryption translation, and industry-grade commercial token shields. The suite addresses standard LLM rate exceptions by preserving financial figures, legal addresses, order tokens, and construction variables exactly as typed.";
      const splitIntro = doc.splitTextToSize(introText, 180);
      doc.text(splitIntro, 14, 52);

      // Section 2: Core Platform Capabilities
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(79, 70, 229);
      doc.text("2. Key Architectural Components", 14, 75);

      const capabilities = [
        {
          title: "A. Simple Text Translator (Contextual & Tone Adaptive)",
          desc: "Uses contextual translation models powered by Gemini AI to adapt responses based on historical conversations, maintaining natural, polite relationships."
        },
        {
          title: "B. Audio & Speaker Translator Node",
          desc: "Integrates incremental stream chunk pipelines that encode and translate voice streams, bypassing latency and converting oral prompts into written target language outputs."
        },
        {
          title: "C. Business Values Defender (Zero-Leak Security)",
          desc: "Extracts or locks critical operational variables (currencies, numbers, IDs) prior to LLM submission, fully preventing hallucinations or mistranslations."
        },
        {
          title: "D. System-Wide Keyboard Injectors (Local Integration)",
          desc: "Enables direct real-time language translations embedded locally inside device clipboard actions or native Messaging environments."
        }
      ];

      let currentY = 82;
      capabilities.forEach((cap) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        doc.text(cap.title, 14, currentY);
        
        currentY += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        const splitDesc = doc.splitTextToSize(cap.desc, 180);
        doc.text(splitDesc, 14, currentY);
        
        currentY += (splitDesc.length * 5) + 3;
      });

      // Section 3: Safe hybrid fallback
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(79, 70, 229);
      doc.text("3. High-Performance Hybrid Fallback", 14, currentY + 3);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const fallbackText = "Equipped with a highly resilient offline-grade local hybrid linguistic fallback, the system continues translating critical logistics and order prompts (e.g. good morning, ship orders to Nairobi, bag of cement) with zero external network dependency, ensuring 100% cloud privacy and avoiding 429 quota exceptions.";
      const splitFallback = doc.splitTextToSize(fallbackText, 180);
      doc.text(splitFallback, 14, currentY + 9);

      // Footer
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("LinguaLayer AI Suite. This document is fully configured for distribution on professional platforms.", 14, 280);

      doc.save("LinguaLayer_AI_Overview.pdf");
      
      if (typeof (window as any).showToast === "function") {
        (window as any).showToast("📋 LinguaLayer AI Overview PDF generated and ready for LinkedIn sharing!", "success", 5000);
      }
    } catch (e) {
      console.error("PDF creation failed:", e);
      if (typeof (window as any).showToast === "function") {
        (window as any).showToast("🛑 PDF rendering encountered a browser frame blockage.", "error", 5000);
      }
    }
  };

  return (
    <div id={id} className="space-y-8 animate-fade-in">
      
      {/* Editorial Headline */}
      <div className="text-center space-y-4 max-w-2xl mx-auto py-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-white text-[10px] uppercase font-bold tracking-widest font-sans animate-pulse">
          <span>✨ Universally Communicating Layer</span>
        </div>
        <h1 className="font-sans font-extrabold text-slate-900 text-3xl md:text-5xl tracking-tight leading-[1.08]">
          Talk Naturally, <br />
          We Do The Translation.
        </h1>
        <p className="font-sans text-sm md:text-base text-slate-500 leading-relaxed">
          LinguaLayer AI works like water between languages. Speak or type in your language — recipients hear or read in theirs. No copy-pasting, privacy guaranteed.
        </p>

        {/* Demo PDF Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={generateDemoPDF}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs md:text-sm rounded-2xl shadow-md transition active:scale-95 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-white" />
            <span>Download Demo PDF (Share on LinkedIn)</span>
          </button>
        </div>
      </div>

      {/* Visual Launcher Dashboard (Standard Big Buttons matching simple / low-literacy guide) */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold font-sans text-slate-400 uppercase tracking-widest pl-1">
          Open LinguaLayer Features
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BigButton
            onClick={() => onNavigate("translator")}
            label="1. Simple Translate"
            subLabel="Write a text, decide the language and get instant translations."
            icon="✏️"
            variant="primary"
          />

          <BigButton
            onClick={() => onNavigate("simulator")}
            label="2. Conversation Game (Simulator)"
            subLabel="Person A (English) chats with Person B (Chinese) live."
            icon="💬"
            variant="accent"
          />

          <BigButton
            onClick={() => onNavigate("voice")}
            label="3. Voice Recorder Translator"
            subLabel="Big microphone. Tap, record, transcribe, translate, and speak."
            icon="🎙️"
            variant="success"
          />

          <BigButton
            onClick={() => onNavigate("business")}
            label="4. Business Values Defender"
            subLabel="Protects order IDs, currency figures, tracking links, and locations."
            icon="💼"
            variant="secondary"
          />

          <BigButton
            onClick={() => onNavigate("settings")}
            label="5. App Options & Languages"
            subLabel="Adjust your native language and enable Simple Clear Mode."
            icon="⚙️"
            variant="secondary"
          />

          <BigButton
            onClick={() => onNavigate("privacy")}
            label="6. Privacy Consent & Systems"
            subLabel="Review our military-grade security model policies."
            icon="🛡️"
            variant="secondary"
          />
        </div>
      </div>

      {/* Core values block */}
      {!simpleMode && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2 text-left">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-2xl w-10 h-10 flex items-center justify-center">
              <Keyboard className="w-5 h-5" />
            </div>
            <h4 className="font-sans font-bold text-slate-900 text-sm">System Unified Keyboards</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Provides direct language translation inside WhatsApp, Instagram, and SMS on Android without copying.
            </p>
          </div>

          <div className="space-y-2 text-left">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl w-10 h-10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-sans font-bold text-slate-900 text-sm">Pre-Encryption Shields</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Translations occur locally prior to data being locked, respecting end-to-end security architectures.
            </p>
          </div>

          <div className="space-y-2 text-left">
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-2xl w-10 h-10 flex items-center justify-center">
              <Languages className="w-5 h-5" />
            </div>
            <h4 className="font-sans font-bold text-slate-900 text-sm">Context &amp; Tone Layers</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Maintains communication structure. Preserve business codes, currency prices, addresses, and tracking orders.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
export default HomePage;
