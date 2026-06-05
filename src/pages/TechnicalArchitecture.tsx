import React from 'react';
import { Layers, ShieldCheck, Cpu, MessageSquare, UserCheck, CheckCircle2, Eye, Repeat, ShieldAlert, BookOpen, AlertTriangle, Play, Database } from 'lucide-react';

export function TechnicalArchitecture() {
  return (
    <div className="max-w-4xl mx-auto space-y-16 py-8">
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold tracking-wide uppercase mb-4">
          <Layers className="w-4 h-4" /> System Design
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">How It Works</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">LinguaLayer sits invisibly between message creation and message display.</p>
      </section>

      <section className="bg-slate-900 p-6 md:p-12 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none"></div>
        
        <h2 className="text-2xl font-bold text-white mb-10 flex items-center justify-center gap-3 relative z-10">
          <Layers className="w-8 h-8 text-indigo-400" />
          Flow Architecture
        </h2>
        
        <div className="space-y-4 md:space-y-6 relative z-10 max-w-2xl mx-auto before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
          {[
            { step: 1, title: "User creates a message", desc: "The sender types or speaks in the language they naturally use.", icon: MessageSquare },
            { step: 2, title: "Sender language is identified", desc: "LinguaLayer detects or confirms the source language, including short informal messages where possible.", icon: CheckCircle2 },
            { step: 3, title: "Receiver language is resolved", desc: "The system checks the receiving user's selected communication language from profile, room, contact memory, or application settings.", icon: UserCheck },
            { step: 4, title: "Context and terminology are prepared", desc: "The system gathers the conversation context, important terms, names, numbers, dates, prices, and any domain-specific language rules.", icon: BookOpen },
            { step: 5, title: "The AI Delivery Engine prepares the receiver-language version", desc: "The message is prepared for the receiver's selected language while trying to preserve meaning, tone, intent, and business-critical details.", icon: Cpu },
            { step: 6, title: "Quality and wrong-language checks run", desc: "The system checks whether the output appears to be in the correct target language and whether the result seems reliable enough to display.", icon: ShieldCheck },
            { step: 7, title: "The receiver sees their own language", desc: "The prepared version is rendered for the receiving user before display.", icon: Eye },
            { step: 8, title: "The conversation continues naturally", desc: "Each participant keeps using their own language while LinguaLayer keeps preparing per-recipient delivery.", icon: Repeat }
          ].map((item, idx) => (
             <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-800 text-indigo-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-3 md:ml-0 z-10">
                  <span className="font-bold text-sm">{item.step}</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-800/80 backdrop-blur-sm p-5 border border-slate-700 rounded-2xl shadow-xl hover:border-indigo-500/30 transition-colors">
                  <h3 className="font-bold text-slate-100 mb-1 flex items-center gap-2"><item.icon className="w-4 h-4 text-indigo-400" />{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
             </div>
          ))}
        </div>
      </section>

      <section className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col items-center text-center mb-10">
           <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
             <Cpu className="w-8 h-8 text-indigo-600" />
           </div>
           <h2 className="text-3xl font-bold text-slate-900 mb-4">
             What the AI Delivery Engine contains
           </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: UserCheck, title: "Language Profile Resolver", desc: "Identifies sender and receiver language profiles." },
            { icon: CheckCircle2, title: "Sender Language Identifier", desc: "Detects the exact source language." },
            { icon: Layers, title: "Conversation Context Layer", desc: "Tracks conversation context to maintain flow." },
            { icon: BookOpen, title: "Terminology and Policy Layer", desc: "Applies glossary rules and business policies." },
            { icon: Cpu, title: "Translation / Preparation Layer", desc: "Preserves intent, tone, limits, and facts." },
            { icon: AlertTriangle, title: "Quality Estimation Layer", desc: "Flags ambiguous wording and can suggest safer phrasing when the original message creates a high translation risk." },
            { icon: ShieldAlert, title: "Wrong-Language Guard", desc: "Checks that output is in the receiver's requested language before display." },
            { icon: Play, title: "Rendering Layer", desc: "Delivers per-recipient output seamlessly." },
            { icon: Database, title: "Optional Audit Layer", desc: "Supports compliance logging for enterprise environments." }
          ].map((layer, idx) => (
             <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <layer.icon className="w-6 h-6 text-indigo-500 mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">{layer.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{layer.desc}</p>
             </div>
          ))}
        </div>
      </section>

      {/* Strengthen Message Accuracy */}
      <section className="bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-xl text-white mt-12">
        <div className="max-w-3xl mx-auto space-y-8">
           <h2 className="text-3xl font-bold text-white flex items-center gap-3">
             <ShieldCheck className="w-8 h-8 text-emerald-400" />
             Message Accuracy & Semantic Preservation
           </h2>
           
           <p className="text-slate-300">
             Before processing translations, LinguaLayer enforces strict accuracy criteria to ensure the message intent is perfectly retained. The system always retains the exact original message internally as the source of truth, and will block or flag messages when uncertain rather than silently changing the meaning.
           </p>

           <div className="grid sm:grid-cols-2 gap-4">
              <ul className="space-y-3">
                 <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> <strong>Intended Meaning:</strong> Never add, soften, intensify, or omit information.</li>
                 <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> <strong>Entities:</strong> Perfect preservation of names, addresses, and business terms.</li>
                 <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> <strong>Numbers & Prices:</strong> Exact retention of quantities, dates, times, currencies, and numerical values.</li>
              </ul>
              <ul className="space-y-3">
                 <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> <strong>Questions & Requests:</strong> Do not change a question into a statement, or a request into a promise.</li>
                 <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> <strong>Tone & Uncertainty:</strong> Retain the sender's politeness level, urgency, and any inherent ambiguity.</li>
                 <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> <strong>Safety Flagging:</strong> Flag or block low-confidence translations instead of guessing.</li>
              </ul>
           </div>

           <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 mt-6 space-y-4">
              <div className="flex gap-2 items-center text-sm"><span className="text-slate-400 font-mono">Original Source of Truth:</span> <span className="font-medium text-white">"Would you be able to check the 5 invoices tomorrow?"</span></div>
              <div className="grid md:grid-cols-2 gap-4">
                 <div className="bg-emerald-900/20 border border-emerald-800 p-3 rounded-lg">
                    <span className="text-emerald-400 text-xs font-bold uppercase block mb-1">Preserved Intent</span>
                    <span className="text-sm text-slate-300">Retains the polite request structure, the precise number '5', and 'tomorrow'.</span>
                 </div>
                 <div className="bg-red-900/20 border border-red-800 p-3 rounded-lg">
                    <span className="text-red-400 text-xs font-bold uppercase block mb-1">Blocked Behavior</span>
                    <span className="text-sm text-slate-300">Converting to "Check the invoices." (Loses politeness, quantity, time, and changes request to command).</span>
                 </div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}
