import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, MessageCircle, Globe, Smartphone, Lock, Zap, CheckCircle2, ChevronRight, Settings } from 'lucide-react';

export function LandingPage({ onNavigate }: { onNavigate?: (id: string) => void }) {
  const handleLiveDemoClick = () => {
    onNavigate?.('live-chat');
  };

  return (
    <div className="w-full font-sans text-slate-900 bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-20 px-4 md:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-slate-900/50 mix-blend-multiply rounded-b-3xl"></div>
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-indigo-400 font-bold tracking-widest uppercase text-sm mb-4 block">Universal Language Layer</span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              One Layer. <br className="hidden md:block" /> Every Language.
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Enable LinguaLayer once in your phone settings. Then communicate naturally across supported messaging, social, email, and meeting platforms in your own language.
            </p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button onClick={handleLiveDemoClick} className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 rounded-full font-bold text-white shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Live Demo
            </button>
            <button onClick={() => onNavigate?.('video')} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-full font-bold text-white shadow-lg transition-all flex items-center gap-2 border border-slate-700">
              <Settings className="w-5 h-5" />
              Watch Demo
            </button>
            <button onClick={() => onNavigate?.('market-opportunity')} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-full font-bold text-white shadow-lg transition-all flex items-center gap-2 border border-slate-700">
              <Smartphone className="w-5 h-5" />
              Market Opportunity
            </button>
          </motion.div>
        </div>
      </section>

      {/* Brief Summary Section */}
      <section className="py-24 px-4 md:px-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">What is LinguaLayer AI?</h2>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              “LinguaLayer AI is a communication layer that helps people chat naturally across different languages. Each person writes in the language they understand, while the receiver sees the message in their own selected language. It is not designed to feel like a separate translator tool. It is designed to make multilingual communication feel like normal messaging.”
            </p>
          </motion.div>
        </div>
      </section>

      {/* Scenario Section */}
      <section className="py-24 px-4 md:px-8 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-extrabold tracking-tight mb-8">How it works</h2>
            <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-3xl shadow-sm text-left relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-400"></div>
              <p className="text-lg text-indigo-900 leading-relaxed">
                “I select English. A client selects Mandarin Chinese. I write in English. LinguaLayer identifies my language, checks the client's language profile, prepares the message in Mandarin Chinese, and the client sees the message directly in Mandarin Chinese. Neither person opens a translator.”
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Immutable Source Verification: Meaning Preservation */}
      <section className="py-24 px-4 md:px-8 bg-slate-900 border-b border-slate-800 text-white">
          <div className="max-w-6xl mx-auto text-center space-y-12">
             <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Immutable Source Verification</h2>
                <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                   Translations can be risky. We never mutate the original message. Here is exactly what happens when an English speaker messages a Chinese-speaking user, and they verify the semantic fidelity using <span className="text-white font-semibold">View Original</span>.
                </p>
             </motion.div>

             <div className="grid md:grid-cols-3 gap-6 text-left">
                {/* Image/Mockup 1 */}
                <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 space-y-4">
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Globe className="w-4 h-4"/> 1. Sender (English)</div>
                   <div className="bg-slate-900 rounded-2xl p-4 shadow-inner space-y-3 h-48 flex flex-col justify-end">
                      <div className="flex w-full justify-end">
                         <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 text-sm shadow-sm inline-block">
                             The price is £5,200 for Order AB-2049-7. Do not ship before 10 July 2026.
                         </div>
                      </div>
                   </div>
                   <p className="text-sm text-slate-300">User A sends a strictly formatted business intent in English.</p>
                </div>

                {/* Image/Mockup 2 */}
                <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 space-y-4 shadow-xl shadow-indigo-900/20 relative">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-3xl"></div>
                   <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Globe className="w-4 h-4"/> 2. Receiver (Chinese)</div>
                   <div className="bg-slate-900 rounded-2xl p-4 shadow-inner space-y-3 h-48 flex flex-col justify-end">
                      <div className="flex w-full justify-start">
                         <div className="bg-slate-700 border border-slate-600 text-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm inline-block shadow-sm">
                             <div className="flex flex-col">
                                <span>订单 AB-2049-7 的价格为 £5,200。请勿在 2026 年 7 月 10 日前发货。</span>
                                <button className="text-[10px] mt-2 opacity-60 hover:opacity-100 text-left underline w-fit cursor-pointer transition-opacity text-white">
                                   View original
                                </button>
                             </div>
                         </div>
                      </div>
                   </div>
                   <p className="text-sm text-slate-300">User B receives the translated message. IDs, prices, and dates are perfectly preserved.</p>
                </div>

                {/* Image/Mockup 3 */}
                <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 space-y-4 relative">
                   <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> 3. Immutable Verification</div>
                   <div className="bg-slate-900 rounded-2xl p-4 shadow-inner space-y-3 h-48 flex flex-col justify-end">
                      <div className="flex w-full justify-start">
                         <div className="bg-slate-700 border border-slate-600 text-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm inline-block shadow-sm">
                             <div className="flex flex-col">
                                <span>订单 AB-2049-7 的价格为 £5,200。请勿在 2026 年 7 月 10 日前发货。</span>
                                <button className="text-[10px] mt-2 opacity-60 text-left underline w-fit text-white">
                                   Hide original
                                </button>
                                <div className="mt-2 pt-2 border-t border-slate-500/50 text-[11px] italic opacity-90 break-words font-mono text-emerald-100">
                                   EN: The price is £5,200 for Order AB-2049-7. Do not ship before 10 July 2026.
                                </div>
                             </div>
                         </div>
                      </div>
                   </div>
                   <p className="text-sm text-slate-300">User B clicks "View original". The <span className="font-semibold text-emerald-400">canonical source</span> is revealed exactly as sent.</p>
                </div>
             </div>
          </div>
      </section>

      {/* PART 1: Enable in Settings */}
      <section className="py-24 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl mb-6">1</div>
            <h2 className="text-4xl font-extrabold tracking-tight">Enable LinguaLayer in Settings</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              A built-in communication layer that helps you understand and be understood effortlessly. Just toggle it on and select your preferred language.
            </p>
            <div className="space-y-4 pt-4">
               <div className="flex items-center gap-3 text-slate-700 font-medium bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Enables system-wide
               </div>
               <div className="flex items-center gap-3 text-slate-700 font-medium bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Select supported apps
               </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative mx-auto w-full max-w-sm">
            <div className="bg-slate-900 rounded-[3rem] p-3 shadow-2xl border-4 border-slate-800 outline outline-4 outline-slate-200 shadow-slate-300">
              <div className="bg-slate-50 h-[600px] rounded-[2.5rem] overflow-hidden flex flex-col relative">
                <div className="bg-white pt-10 pb-4 px-6 border-b border-slate-200 flex flex-col items-center">
                   <div className="w-32 h-6 bg-slate-900 absolute top-0 rounded-b-3xl"></div>
                   <h3 className="font-bold text-xl">Settings</h3>
                </div>
                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                  <div className="font-semibold text-slate-500 text-sm pl-2">System</div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                    <div className="p-4 flex justify-between items-center bg-indigo-50/50">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <LayersIcon className="w-4 h-4 text-indigo-600" />
                         </div>
                         <div>
                           <div className="font-bold text-slate-900">LinguaLayer</div>
                           <div className="text-xs text-slate-500">Live communication across languages</div>
                         </div>
                      </div>
                      <div className="w-12 h-6 bg-indigo-500 rounded-full relative shadow-inner">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                      </div>
                    </div>
                    <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition cursor-pointer">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Globe className="w-4 h-4 text-blue-600" />
                         </div>
                         <span className="font-medium text-slate-700">Preferred Language</span>
                      </div>
                      <div className="flex items-center text-slate-500 text-sm">
                        English <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="font-semibold text-slate-500 text-sm pl-2 pt-4">Enable for:</div>
                  <motion.div 
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={{
                      hidden: {},
                      show: { transition: { staggerChildren: 0.15 } }
                    }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden text-sm font-medium"
                  >
                     {['Whole phone', 'WhatsApp', 'SMS / Messages', 'Gmail'].map((app, i) => (
                        <motion.div 
                          key={app} 
                          variants={{
                            hidden: { opacity: 0, x: -10 },
                            show: { opacity: 1, x: 0 }
                          }}
                          className={`p-4 flex justify-between items-center ${i > 0 ? 'border-t border-slate-100' : ''}`}
                        >
                          <span className="text-slate-700">{app}</span>
                          <div className={`w-10 h-5 rounded-full relative shadow-inner ${i === 0 ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                          </div>
                        </motion.div>
                     ))}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PART 2: Chat Naturally */}
      <section className="py-24 px-4 md:px-8 bg-slate-100 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-indigo-300 blur-[100px] rounded-full opacity-30 pointer-events-none"></div>
        <div className="max-w-6xl mx-auto text-center space-y-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
             <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6">2</div>
             <h2 className="text-4xl font-extrabold tracking-tight mb-4">Chat naturally.</h2>
             <p className="text-xl text-slate-600 max-w-2xl mx-auto">
               Each person uses their own language.<br />
               Messages appear in the receiver’s preferred language instantly.
             </p>
          </motion.div>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-16 pt-8">
             {/* Phone A */}
             <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
                <div className="mb-4 text-center md:text-left">
                   <div className="font-bold text-indigo-600 text-lg">Phone A</div>
                   <div className="text-sm text-slate-500 font-medium">Preferred Language: <span className="text-slate-900 font-bold">English</span></div>
                </div>
                <div className="bg-slate-900 rounded-[2.5rem] p-2 shadow-xl border-[6px] border-slate-800 w-[280px]">
                  <div className="bg-white h-[500px] rounded-[2rem] overflow-hidden flex flex-col relative">
                     <div className="bg-slate-50/90 pt-8 pb-3 px-4 border-b border-slate-200 flex items-center gap-3 backdrop-blur z-10 absolute top-0 w-full">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                           <span className="text-indigo-600 font-bold text-xs">P</span>
                        </div>
                        <div>
                           <div className="font-bold text-sm leading-tight text-slate-900">Peter</div>
                        </div>
                     </div>
                     <div className="p-4 pt-24 space-y-4 flex-1 bg-slate-50 flex flex-col overflow-hidden">
                        <div className="bg-white p-3 rounded-2xl rounded-tl-sm self-start max-w-[85%] text-slate-700 shadow-sm border border-slate-100 text-sm">
                           Hello, can we meet tomorrow at 10?
                           <span className="text-[10px] text-slate-400 block text-right mt-1">9:41 AM</span>
                        </div>
                        <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-sm self-end max-w-[85%] shadow-sm text-sm">
                           Sure, that works for me. See you tomorrow at 10!
                           <span className="text-[10px] text-indigo-300 block text-right mt-1">9:42 AM ✓✓</span>
                        </div>
                     </div>
                  </div>
                </div>
             </motion.div>

             {/* Phone B */}
             <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
                <div className="mb-4 text-center md:text-left">
                   <div className="font-bold text-indigo-600 text-lg">Phone B</div>
                   <div className="text-sm text-slate-500 font-medium">Preferred Language: <span className="text-slate-900 font-bold">中文 (简体)</span></div>
                </div>
                <div className="bg-slate-900 rounded-[2.5rem] p-2 shadow-xl border-[6px] border-slate-800 w-[280px]">
                  <div className="bg-white h-[500px] rounded-[2rem] overflow-hidden flex flex-col relative">
                     <div className="bg-slate-50/90 pt-8 pb-3 px-4 border-b border-slate-200 flex items-center gap-3 backdrop-blur z-10 absolute top-0 w-full">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                           <span className="text-indigo-600 font-bold text-xs">D</span>
                        </div>
                        <div>
                           <div className="font-bold text-sm leading-tight text-slate-900">David</div>
                        </div>
                     </div>
                     <div className="p-4 pt-24 space-y-4 flex-1 bg-slate-50 flex flex-col overflow-hidden">
                        <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-sm self-end max-w-[85%] text-sm shadow-sm">
                           你好，我们明天10点见面可以吗？
                           <span className="text-[10px] text-indigo-300 block text-right mt-1">9:41 ✓✓</span>
                        </div>
                        <div className="bg-white p-3 rounded-2xl rounded-tl-sm self-start max-w-[85%] text-slate-700 shadow-sm border border-slate-100 text-sm">
                           可以，没问题！明天10点见！
                           <span className="text-[10px] text-slate-400 block text-right mt-1">9:42</span>
                        </div>
                     </div>
                  </div>
                </div>
             </motion.div>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto italic pt-8 font-medium">
            LinguaLayer is designed as a phone-level communication layer, not a single-platform translator. The vision is to make messages, chats, social DMs, emails, and meeting captions appear in the user’s selected language automatically.
          </p>
        </div>
      </section>

      {/* PART 3: One Layer. Every Language. */}
      <section className="bg-slate-950 text-white py-24 px-4 md:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-transparent"></div>
        <div className="max-w-5xl mx-auto relative z-10 space-y-12">
           <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <div className="w-16 h-16 bg-indigo-900/50 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-indigo-500/30">
                 <LayersIcon className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                 LinguaLayer AI<br />
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">One Layer. Every Language.</span>
              </h2>
              <p className="text-xl text-slate-400 font-medium">
                 Built into your device. Natural conversations across apps.
              </p>
           </motion.div>

           <motion.div 
             initial="hidden"
             whileInView="show"
             viewport={{ once: true }}
             variants={{
               hidden: {},
               show: { transition: { staggerChildren: 0.1 } }
             }}
             className="flex flex-wrap justify-center gap-6 py-8"
           >
              {[
                 { icon: MessageCircle, label: "Messaging" },
                 { icon: MessageCircle, label: "Chats" },
                 { icon: Smartphone, label: "Social" },
                 { icon: MessageCircle, label: "Email" },
                 { icon: Globe, label: "Communities" },
                 { icon: LayersIcon, label: "And more" }
              ].map((item, i) => (
                 <motion.div 
                   key={i}
                   variants={{
                     hidden: { opacity: 0, y: 20 },
                     show: { opacity: 1, y: 0 }
                   }}
                   className="flex flex-col items-center gap-3 group"
                 >
                    <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 group-hover:border-indigo-500/50 group-hover:bg-indigo-900/20 transition-all shadow-md">
                       <item.icon className="w-6 h-6 text-slate-400 group-hover:text-indigo-400" />
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                 </motion.div>
              ))}
           </motion.div>

           <div className="grid md:grid-cols-4 gap-6 pt-12 border-t border-slate-800">
              <div className="flex flex-col items-center text-center space-y-2">
                 <ShieldCheck className="w-8 h-8 text-indigo-400" />
                 <h4 className="font-bold">Private by design</h4>
                 <p className="text-xs text-slate-400">On-device intelligence</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                 <Zap className="w-8 h-8 text-indigo-400" />
                 <h4 className="font-bold">Real-time</h4>
                 <p className="text-xs text-slate-400">Seamless & instant</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                 <Lock className="w-8 h-8 text-indigo-400" />
                 <h4 className="font-bold">Secure</h4>
                 <p className="text-xs text-slate-400">Your data stays yours</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                 <Smartphone className="w-8 h-8 text-indigo-400" />
                 <h4 className="font-bold">Always on</h4>
                 <p className="text-xs text-slate-400">Across your device</p>
              </div>
           </div>

           <div className="pt-24 pb-16 border-t border-slate-800/50 mt-16 flex justify-center">
              <h3 className="text-3xl font-extrabold text-white mb-8 text-center max-w-2xl mx-auto">Write naturally. Read naturally. Connect globally.</h3>
           </div>
        </div>
      </section>
    </div>
  );
}

function LayersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 12 12 17 22 12" />
      <polyline points="2 17 12 22 22 17" />
    </svg>
  );
}

