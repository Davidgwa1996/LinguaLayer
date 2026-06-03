import React from 'react';
import { Layers, ShieldCheck, Cpu } from 'lucide-react';

export function TechnicalArchitecture() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Technical Architecture</h1>
        <p className="text-lg text-slate-600">The Universal Language Layer in action.</p>
      </section>

      <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-indigo-600" />
          AI Engine Layer
        </h2>
        
        <p className="text-sm text-slate-600 mb-6">
          The engine does not rewrite the user's intended message. It safely delivers meaning across language barriers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[
            "1. Source Message Readiness Check",
            "2. Language Detection",
            "3. Meaning-Preservation Delivery",
            "4. Critical-Term Preservation",
            "5. Wrong-Language Validation",
            "6. Confidence Scoring",
            "7. Receiver-Language Rendering"
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="w-6 h-6 bg-indigo-100 text-indigo-700 font-bold rounded flex items-center justify-center text-xs">✓</div>
              <span className="text-sm font-semibold text-slate-700">{item}</span>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl">
          <h3 className="font-bold text-amber-900 mb-2">Source Message Readiness Check</h3>
          <p className="text-sm text-amber-800">
            The Source Message Readiness Check does not rewrite the user’s message. It simply encourages clear writing so the delivery engine can preserve meaning accurately.
          </p>
        </div>
      </section>

      <section className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-lg relative overflow-hidden">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Layers className="w-6 h-6 text-emerald-400" />
          Flow Architecture
        </h2>
        
        <div className="space-y-4">
          <div className="bg-slate-800 p-4 border border-slate-700 rounded-xl relative">
            <span className="text-slate-300 font-medium">User writes a clear message in their own language</span>
          </div>
          <div className="flex justify-center">
            <div className="w-0.5 h-6 bg-slate-700"></div>
          </div>
          <div className="bg-slate-800 p-4 border border-slate-700 rounded-xl relative">
            <span className="text-slate-300 font-medium">Source Message Readiness Check gives optional guidance</span>
          </div>
          <div className="flex justify-center">
            <div className="w-0.5 h-6 bg-slate-700"></div>
          </div>
          <div className="bg-indigo-900 p-4 border border-indigo-700 rounded-xl relative shadow-inner">
            <span className="text-indigo-200 font-bold">Language Delivery Engine prepares receiver-language version</span>
          </div>
          <div className="flex justify-center">
            <div className="w-0.5 h-6 bg-slate-700"></div>
          </div>
          <div className="bg-emerald-900 p-4 border border-emerald-700 rounded-xl relative">
            <span className="text-emerald-100 font-bold">Receiver sees the message in their own language</span>
          </div>
        </div>
      </section>
    </div>
  );
}
