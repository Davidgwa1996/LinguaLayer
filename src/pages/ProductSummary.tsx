import React from 'react';
import { Network, Globe, Smartphone, Lightbulb, Users, Shield, Cpu, Activity, ArrowRight, CheckCircle2, MessageSquare, Target } from 'lucide-react';

export function ProductSummary() {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Product Summary</h1>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden space-y-16">
        
        {/* Core Identity */}
        <section className="space-y-6">
           <h2 className="text-3xl font-extrabold text-slate-900 text-center">What is LinguaLayer AI?</h2>
           <p className="text-lg text-slate-600 leading-relaxed text-center max-w-3xl mx-auto font-medium">
             LinguaLayer AI is a communication layer that helps people chat naturally across different languages. Each person writes in the language they understand, while the receiver sees the message in their own selected language.
           </p>
           <p className="text-lg text-slate-600 leading-relaxed text-center max-w-3xl mx-auto">
             It is not designed to feel like a separate translator tool. It is designed to make multilingual communication feel like normal messaging.
           </p>
        </section>

        {/* The Problem & Existing Systems */}
        <section className="space-y-8 border-t border-slate-100 pt-12">
          <div className="space-y-4">
             <h3 className="text-2xl font-bold text-slate-900">The Problem</h3>
             <p className="text-slate-600 leading-relaxed">
               People already have translation tools, but multilingual communication is still not smooth. In many cases, users still need to copy text, press translate, switch apps, long-press messages, or use app-specific features. This interrupts the conversation and makes communication feel slow, especially in business, customer support, trade, healthcare navigation, logistics, and everyday cross-language conversations.
             </p>
          </div>

          <div className="space-y-6 pt-4">
             <h3 className="text-xl font-bold text-slate-900">Existing systems are already close, but still limited</h3>
             
             <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                   <h4 className="font-bold text-slate-900 flex items-center gap-2"><Smartphone className="w-5 h-5 text-indigo-500"/> Apple Live Translation</h4>
                   <p className="text-sm text-slate-600">Apple's Live Translation is one of the closest consumer examples. In Messages, it can automatically translate text as the user types, deliver it in the recipient's language, and translate replies back for the sender. This is very close to the idea of each person writing in their own language and each person reading in their own language.</p>
                   <div className="mt-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-100">
                     <strong>Limitation:</strong> However, Apple's experience is mainly limited to Apple-controlled communication surfaces such as Messages, Phone, and FaceTime. It is not a universal Android-style communication layer that users can enable across whole-phone or selected third-party communication surfaces.
                   </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                   <h4 className="font-bold text-slate-900 flex items-center gap-2"><Cpu className="w-5 h-5 text-indigo-500"/> Google Pixel Live Translate</h4>
                   <p className="text-sm text-slate-600">Google Pixel Live Translate is also close because it is enabled through system settings and can translate speech and text on Pixel devices. It can work with some conversations and some supported chat experiences.</p>
                   <div className="mt-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-100">
                     <strong>Limitation:</strong> However, it is still device-specific, feature-specific, and app-limited. It often works through detected language prompts, bubbles, or supported surfaces rather than a complete recipient-aware communication layer for every selected app and participant.
                   </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                   <h4 className="font-bold text-slate-900 flex items-center gap-2"><Globe className="w-5 h-5 text-indigo-500"/> Samsung Galaxy AI</h4>
                   <p className="text-sm text-slate-600">Samsung Galaxy AI also overlaps strongly with this vision. Samsung exposes language features through Settings and supports Live Translate for calls, Chat Translation, Writing Assist, and selected app experiences.</p>
                   <div className="mt-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-100">
                     <strong>Limitation:</strong> However, Samsung's approach is still fragmented across calls, writing tools, selected apps, and supported languages. It does not yet operate as one unified recipient-aware language delivery layer across all chosen communication surfaces.
                   </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                   <h4 className="font-bold text-slate-900 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-indigo-500"/> WhatsApp Translation</h4>
                   <p className="text-sm text-slate-600">WhatsApp also supports message translation inside WhatsApp.</p>
                   <div className="mt-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-100">
                     <strong>Limitation:</strong> However, it remains app-specific and often requires the user to take action such as translating inside WhatsApp. It does not solve language delivery across the whole device or across different communication platforms.
                   </div>
                </div>
             </div>

             <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl text-indigo-900 font-medium">
               The gap is not that translation does not exist. The gap is that multilingual communication is still fragmented, app-limited, and often interruptive.
             </div>
          </div>
        </section>

        {/* The Solution */}
        <section className="space-y-6 border-t border-slate-100 pt-12">
          <h3 className="text-2xl font-bold text-slate-900">The Solution</h3>
          <p className="text-slate-600 leading-relaxed mb-8">
            LinguaLayer AI focuses on recipient-aware language delivery. Instead of treating translation as an extra button, LinguaLayer treats language as part of the communication flow.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
             {[
               { num: "1", title: "Sender writes naturally", desc: "The sender writes in the language they understand." },
               { num: "2", title: "Sender language is identified", desc: "LinguaLayer detects or confirms the sender's message language." },
               { num: "3", title: "Receiver language is checked", desc: "LinguaLayer checks the receiver's selected communication language from their profile, room setting, device preference, or contact memory." },
               { num: "4", title: "AI Delivery Engine prepares the message", desc: "The AI Delivery Engine prepares the receiver-language version while preserving meaning, tone, names, numbers, dates, prices, business terms, and context." },
               { num: "5", title: "Wrong-language guard checks the result", desc: "The system checks that the final message is actually in the receiver's selected language." },
               { num: "6", title: "Receiver reads naturally", desc: "The receiver sees the message directly in their own language, without needing to copy, paste, long-press, or open another translator." }
             ].map((step, i) => (
                <div key={i} className="flex gap-4 items-start bg-slate-50 p-5 rounded-2xl border border-slate-100">
                   <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">{step.num}</div>
                   <div>
                     <h4 className="font-bold text-slate-900">{step.title}</h4>
                     <p className="text-sm text-slate-600 mt-1">{step.desc}</p>
                   </div>
                </div>
             ))}
          </div>
        </section>

        {/* What makes LinguaLayer different? */}
        <section className="space-y-6 border-t border-slate-100 pt-12">
          <h3 className="text-2xl font-bold text-slate-900">What makes LinguaLayer different?</h3>
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
             {[
               { title: "Recipient-aware delivery", desc: "LinguaLayer focuses on who is receiving the message and what language that person has selected." },
               { title: "Pre-display preparation", desc: "The goal is to prepare the receiver-language version before the message appears, so the user does not first see a foreign-language message." },
               { title: "Per-user language profiles", desc: "Each person can have their own communication language, allowing multi-person conversations where every participant reads in their preferred language." },
               { title: "Meaning preservation", desc: "The AI Delivery Engine is designed to protect important details such as names, numbers, dates, prices, addresses, business terms, and tone." },
               { title: "Wrong-language prevention", desc: "The system checks that the output is not delivered in the wrong language." },
               { title: "Conversation continuity", desc: "The user continues chatting normally instead of stopping to translate." },
               { title: "Future OEM/system-service vision", desc: "The long-term vision is for Android vendors or OEM partners to offer LinguaLayer as a system-service feature inside Settings, where users can enable it for whole-phone or selected communication surfaces." },
               { title: "Enterprise SDK path", desc: "LinguaLayer can also be offered as an enterprise communication SDK for customer support, logistics, healthcare navigation, field operations, and multilingual frontline teams." }
             ].map((feature, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1 hover:border-indigo-200 transition-colors">
                   <h4 className="font-bold text-slate-900 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> {feature.title}</h4>
                   <p className="text-sm text-slate-600 pl-6">{feature.desc}</p>
                </div>
             ))}
          </div>
        </section>

        {/* How LinguaLayer compares */}
        <section className="space-y-6 border-t border-slate-100 pt-12">
          <h3 className="text-2xl font-bold text-slate-900">How LinguaLayer compares</h3>
          
          <div className="grid md:grid-cols-2 gap-8 pt-4">
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-4 text-lg border-b border-slate-200 pb-3">Existing systems</h4>
                <ul className="space-y-4">
                   <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span><span className="text-slate-700">Powerful translation features already exist</span></li>
                   <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span><span className="text-slate-700">Often limited to one ecosystem, device, app, or surface</span></li>
                   <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span><span className="text-slate-700">May require user action such as translate buttons, long-pressing, bubbles, or app-specific tools</span></li>
                   <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span><span className="text-slate-700">Not always designed around per-receiver language routing</span></li>
                   <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span><span className="text-slate-700">Not always consistent across multiple platforms</span></li>
                </ul>
             </div>

             <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-200 shadow-sm">
                <h4 className="font-bold text-indigo-900 mb-4 text-lg border-b border-indigo-200 pb-3">LinguaLayer AI</h4>
                <ul className="space-y-4">
                   <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span className="text-indigo-900">Focuses on recipient-aware language delivery</span></li>
                   <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span className="text-indigo-900">Prepares the receiver-language version before display</span></li>
                   <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span className="text-indigo-900">Supports the vision of one language preference controlling multiple communication surfaces</span></li>
                   <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span className="text-indigo-900">Includes AI Delivery Engine, wrong-language guard, and meaning preservation</span></li>
                   <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span className="text-indigo-900">Is designed for OEM/system-service partnership and enterprise SDK deployment</span></li>
                </ul>
             </div>
          </div>
        </section>

        {/* David's Vision */}
        <section className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-center text-white mt-12 shadow-xl shadow-slate-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="relative z-10">
             <h3 className="text-2xl md:text-3xl font-bold mb-6">David's Vision</h3>
             <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto italic leading-relaxed">
               "I built LinguaLayer AI because I believe language should not interrupt communication. My goal is to make multilingual conversations feel natural, where each person writes and reads in the language they understand, while the system handles language delivery in the background."
             </p>
          </div>
        </section>

      </div>
    </div>
  );
}
