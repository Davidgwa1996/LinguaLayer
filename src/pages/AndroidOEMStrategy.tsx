import React from 'react';
import { Smartphone, Cpu, Layers } from 'lucide-react';

export function AndroidOEMStrategy() {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
           <Smartphone className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Android & OEM Vision</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">The ultimate goal of LinguaLayer is to become an embedded system-level utility.</p>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
         <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex gap-4">
               <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                  <Layers className="w-6 h-6 text-slate-700" />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Keyboard vs. System Layer</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Unlike standard "Translator Keyboards" that require the user to manually type and swap languages, LinguaLayer operates at the input/output surface level. It hooks into the Notification and Accessibility subsystems to seamlessly render incoming messages in the user's selected language, and cleanly deliver outgoing messages.
                  </p>
               </div>
            </div>

            <div className="w-full h-[1px] bg-slate-100"></div>

            <div className="flex gap-4">
               <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                  <Cpu className="w-6 h-6 text-slate-700" />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">On-Device NPU Execution</h3>
                  <p className="text-slate-600 leading-relaxed">
                    By partnering with OEMs, LinguaLayer can utilize dedicated Neural Processing Units (NPUs) to perform the Source Message Readiness Check and Language Delivery entirely offline. This eliminates latency, guarantees absolute privacy, and provides fluid communication even without cellular data.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
