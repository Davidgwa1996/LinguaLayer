import React from 'react';
import { Target, Building, Globe, Zap, Settings, Shield, MessageCircle, Smartphone, Cpu, ChevronRight, Truck, HardHat, HeartPulse, CheckCircle2 } from 'lucide-react';

export function MarketOpportunity() {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-16">
      
      {/* Section 1: Market Opportunity */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Market Opportunity</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Focusing the commercial potential around enterprise friction and long-term platform strategy.</p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden space-y-12">
          <p className="text-slate-600 leading-relaxed text-lg">
            LinguaLayer AI targets the growing need for multilingual communication in digital messaging, business operations, customer support, logistics, healthcare navigation, field operations, and cross-border communication.
          </p>
          <ul className="space-y-4 text-slate-700">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span>People and businesses communicate across languages every day.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span>Existing translation tools often interrupt the conversation.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span>LinguaLayer focuses on recipient-aware delivery, where each person reads in their own selected language.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span>The commercial opportunity is not just translation; it is communication flow, language routing, trust, and integration.</span>
            </li>
          </ul>

          <div className="border-t border-slate-100 pt-10 space-y-12">
            
            {/* The Problem */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building className="w-6 h-6 text-indigo-600" />
                The Problem
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Multilingual communication tools already exist, but the experience remains fragmented. Users may need to press translate, long-press messages, switch applications, use app-specific features, or depend on selected devices and communication surfaces. This interrupts the natural flow of communication.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Apple Live Translation, Google Pixel Live Translate, Samsung Galaxy AI, and WhatsApp message translation demonstrate that automatic multilingual communication is valuable and technically possible. However, their features are commonly limited by ecosystem, device model, supported application, communication surface, language availability, or required user action.
              </p>
              <p className="text-slate-900 font-medium leading-relaxed bg-amber-50 p-5 rounded-2xl border border-amber-100 mt-4">
                The remaining opportunity is to create a consistent recipient-aware communication layer that can be enabled simply, remembers each user’s preferred communication language, and works across supported Android communication surfaces.
              </p>
            </div>

            {/* The Solution */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-indigo-600" />
                The Solution
              </h2>
              <p className="text-slate-600 leading-relaxed">
                LinguaLayer AI is designed as a recipient-aware multilingual communication layer for supported Android devices and enterprise communication systems. Each person writes in the language they understand, while LinguaLayer identifies the sender language, checks the receiver’s selected language, prepares the receiver-language version, and displays it before the conversation is interrupted.
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                 {[
                   { num: "1", title: "Sender writes normally", desc: "The sender writes normally in their language." },
                   { num: "2", title: "Language identified", desc: "LinguaLayer identifies or confirms the sender language." },
                   { num: "3", title: "Receiver language checked", desc: "The receiver's preferred communication language is checked." },
                   { num: "4", title: "Message prepared", desc: "The AI Delivery Engine prepares the receiver-language version." },
                   { num: "5", title: "Context checked", desc: "Meaning, names, numbers, dates, prices, tone, and context are checked." },
                   { num: "6", title: "Message displayed", desc: "The correct version is displayed to the receiver." },
                   { num: "7", title: "Conversation flows", desc: "Each participant continues communicating naturally in their own language." }
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
              <p className="text-slate-600 leading-relaxed font-medium pt-2">
                LinguaLayer’s purpose is not merely to add another translate button. Its purpose is to make multilingual communication feel like ordinary communication across supported systems.
              </p>
            </div>
            
          </div>
        </div>
      </section>

      {/* Section 2: Opportunity 1: OEM / Android System-Service Partnership */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
           <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20">
             <Smartphone className="w-8 h-8 text-white" />
           </div>
           <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Opportunity 1: OEM / Android System-Service Partnership</h2>
        </div>
        
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-12">
            <div className="space-y-4 pb-4">
              <p className="text-slate-600 leading-relaxed text-lg">
                This is the long-term system-level vision. LinguaLayer could be offered to Android vendors and OEM partners as a system-service layer that sits inside phone settings. Users would enable it once, choose their communication language, and supported messaging surfaces could display communication in the user's selected language. This is the future OEM/system-service vision (not currently integrated into Android). The current MVP proves the communication-layer concept in a live chat environment.
              </p>
              <p className="text-slate-600 leading-relaxed text-lg">
                LinguaLayer is intended to be accessible across Android devices that support the required system capabilities. The system should not be designed exclusively for flagship or high-end smartphones.
              </p>
              <p className="text-slate-600 leading-relaxed text-lg">
                LinguaLayer’s Android opportunity is not limited to premium devices. The proposed system-service model can use capability-based delivery, providing a lightweight text communication experience on supported standard devices and enhanced on-device AI features on devices with stronger processing capabilities. This gives Android vendors the opportunity to provide a consistent multilingual communication experience across different device ranges while adapting features to each device’s supported capabilities. The goal is broad Android accessibility, beginning with devices and OEM partners that support the required capabilities, rather than limiting LinguaLayer only to premium devices.
              </p>
            </div>

            <div className="border-t border-slate-100 pt-10">
               <h3 className="text-2xl font-bold text-slate-900 mb-2">Android / OEM System Mock</h3>
               <p className="text-slate-500 mb-8">Vision for enabling LinguaLayer as a phone-level communication service.</p>

               <div className="space-y-8">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                     <div className="flex-1 space-y-2">
                       <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">Step 1</span>
                       <h4 className="font-bold text-slate-900 text-lg">Open Android Settings</h4>
                       <p className="text-sm text-slate-600">The user opens the normal Android Settings application.</p>
                     </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                     <div className="flex-1 space-y-2">
                       <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">Step 2</span>
                       <h4 className="font-bold text-slate-900 text-lg">Open Languages and Communication</h4>
                       <p className="text-sm text-slate-600">The user opens a familiar system section for language and communication preferences.</p>
                     </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                     <div className="flex-1 space-y-2 order-2 md:order-1">
                       <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">Step 3</span>
                       <h4 className="font-bold text-slate-900 text-lg">Enable LinguaLayer AI</h4>
                       <p className="text-sm text-slate-600">The user turns on LinguaLayer using one simple system toggle.</p>
                     </div>
                     <div className="w-full md:w-64 bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0 order-1 md:order-2">
                        <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-slate-100 mb-2">
                           <div>
                             <span className="font-bold text-slate-900 text-sm block">LinguaLayer AI</span>
                             <span className="text-xs text-slate-500">Live communication across languages</span>
                           </div>
                           <div className="w-10 h-6 bg-indigo-500 rounded-full relative shadow-inner shrink-0">
                             <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                     <div className="flex-1 space-y-2">
                       <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">Step 4</span>
                       <h4 className="font-bold text-slate-900 text-lg">Choose preferred communication language</h4>
                       <p className="text-sm text-slate-600">The user selects the language they want to read and use during communication.</p>
                     </div>
                     <div className="w-full md:w-64 bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0">
                        <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                           <span className="font-medium text-slate-900 text-sm">Preferred Language</span>
                           <span className="text-sm text-slate-500 flex items-center">English <ChevronRight className="w-4 h-4 ml-1" /></span>
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                     <div className="flex-1 space-y-2 order-2 md:order-1">
                       <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">Step 5</span>
                       <h4 className="font-bold text-slate-900 text-lg">Choose where LinguaLayer works</h4>
                       <p className="text-sm text-slate-600">The user selects whole-phone support where available, or chooses individual supported communication applications.</p>
                     </div>
                     <div className="w-full md:w-64 bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0 order-1 md:order-2 space-y-2">
                        <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                           <span className="font-medium text-slate-900 text-sm">Whole phone</span>
                           <div className="w-8 h-4 bg-indigo-500 rounded-full relative shadow-inner shrink-0">
                             <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                           </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-slate-100 divide-y divide-slate-100">
                          {['WhatsApp', 'SMS / Messages', 'Gmail', 'Telegram'].map((app) => (
                              <div key={app} className="flex justify-between items-center p-3 opacity-50">
                                 <span className="font-medium text-slate-900 text-sm">{app}</span>
                                 <div className="w-8 h-4 bg-slate-300 rounded-full relative shadow-inner shrink-0">
                                   <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                     <div className="flex-1 space-y-2">
                       <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">Processing Options</span>
                       <h4 className="font-bold text-slate-900 text-lg">Capabilities & Privacy</h4>
                       <p className="text-sm text-slate-600">Available features depend on your Android version, device capabilities, and supported applications.</p>
                     </div>
                     <div className="w-full md:w-64 bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0 space-y-2 divide-y divide-slate-100">
                        <div className="flex justify-between items-center p-2">
                           <span className="font-medium text-slate-900 text-sm block">On-device processing</span>
                           <div className="w-8 h-4 bg-indigo-500 rounded-full relative shadow-inner shrink-0">
                             <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                           </div>
                        </div>
                        <div className="flex justify-between items-center p-2">
                           <span className="font-medium text-slate-900 text-sm block">Secure cloud-assisted</span>
                           <div className="w-8 h-4 bg-slate-300 rounded-full relative shadow-inner shrink-0">
                             <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                           </div>
                        </div>
                        <div className="flex justify-between items-center p-2">
                           <span className="font-medium text-slate-900 text-sm block">Privacy mode strict</span>
                           <div className="w-8 h-4 bg-indigo-500 rounded-full relative shadow-inner shrink-0">
                             <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                     <div className="flex-1 space-y-2">
                       <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">Step 6</span>
                       <h4 className="font-bold text-slate-900 text-lg">Communicate naturally with Immutable Truth</h4>
                       <p className="text-sm text-slate-600">Messages from supported communication surfaces appear in the user’s selected language while conversations continue normally. The canonical source is always preserved.</p>
                     </div>
                     <div className="w-full md:w-80 shrink-0 space-y-4">
                        <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 shadow-inner">
                           <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">User B (Chinese) UX</div>
                           <div className="flex justify-start">
                               <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm shadow-sm inline-block">
                                   <div className="flex flex-col">
                                      <span>价格为 £5,200。请勿发货。</span>
                                      <button className="text-[10px] mt-2 opacity-60 text-left underline w-fit cursor-pointer text-slate-500">
                                         Hide original
                                      </button>
                                      <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] italic opacity-80 break-words font-mono text-slate-600">
                                         EN: The price is £5,200. Do not ship.
                                      </div>
                                   </div>
                               </div>
                           </div>
                        </div>
                     </div>
                  </div>

               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Opportunity 2: Enterprise Communication SDK */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
           <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20">
             <Building className="w-8 h-8 text-white" />
           </div>
           <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Opportunity 2: Enterprise Communication SDK</h2>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
           <div className="max-w-2xl mx-auto space-y-12">
             <div className="space-y-4">
               <h3 className="text-2xl font-bold text-slate-900">A business integration path for multilingual frontline and customer communication.</h3>
               <p className="text-slate-600 leading-relaxed text-lg">
                 LinguaLayer can also be offered as an SDK/API for businesses that manage multilingual conversations. This includes customer support, logistics, healthcare navigation, field operations, marketplaces, and multilingual frontline teams. The SDK is not just a translation API. It provides recipient-language routing, language profiles, meaning preservation, wrong-language checks, glossary rules, and per-viewer rendering.
               </p>
             </div>

             <div className="border-t border-slate-100 pt-10">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Integration Guide</h3>
                <div className="space-y-6">
                   {[
                     { step: 1, title: "Connect LinguaLayer SDK", desc: "The business connects LinguaLayer to its chat, support, logistics, field-service, marketplace, or internal communication platform." },
                     { step: 2, title: "Add user language profiles", desc: "Each user or customer has a preferred communication language. The system can read this from a profile, account setting, CRM record, support ticket, or contact record." },
                     { step: 3, title: "Send messages through the AI Delivery Engine", desc: "When a message is sent, LinguaLayer identifies the sender language, checks the receiver language, and prepares the receiver-language version." },
                     { step: 4, title: "Apply business glossary and context rules", desc: "The business can define important terms, product names, medical navigation terms, logistics codes, prices, dates, and phrases that must be preserved accurately." },
                     { step: 5, title: "Run quality and wrong-language checks", desc: "LinguaLayer checks whether the message appears in the correct receiver language and whether the result is safe enough to display." },
                     { step: 6, title: "Display the right version to each user", desc: "Each user sees the version prepared for their selected language, while the system can optionally store audit logs for enterprise review." }
                   ].map(item => (
                     <div key={item.step} className="flex gap-4 items-start">
                       <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                         {item.step}
                       </div>
                       <div>
                         <h4 className="font-bold text-slate-900">{item.title}</h4>
                         <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
                       </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="border-t border-slate-100 pt-10">
               <h3 className="text-xl font-bold text-slate-900 mb-6">Target Sectors</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {[
                   { title: "Customer Support", icon: MessageCircle },
                   { title: "Logistics", icon: Truck },
                   { title: "Healthcare Navigation", icon: HeartPulse },
                   { title: "Field Operations", icon: HardHat },
                   { title: "Marketplaces", icon: Globe },
                   { title: "Multilingual Frontline Teams", icon: Shield }
                 ].map((sector, i) => (
                    <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center gap-2">
                       <sector.icon className="w-6 h-6 text-indigo-500" />
                       <span className="font-bold text-slate-900 text-sm">{sector.title}</span>
                    </div>
                 ))}
               </div>
             </div>
           </div>
        </div>
      </section>
    </div>
  );
}
