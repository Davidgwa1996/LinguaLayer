import React from 'react';
import { ShieldCheck, Lock, Database, FileText } from 'lucide-react';

export function BusinessProtection() {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      <div className="text-center">
        <div className="w-16 h-16 bg-slate-900 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-xl">
           <ShieldCheck className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Business Protection Layer</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Enterprise-grade security ensuring zero data retention and strict meaning preservation for professional environments.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
         <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <Lock className="w-8 h-8 text-indigo-600 mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">Zero Data Retention</h3>
            <p className="text-slate-600 leading-relaxed">
              LinguaLayer processes messages in real-time and immediately drops them from memory. Source texts and delivered translations are never stored, logged, or used for model training.
            </p>
         </div>
         <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <FileText className="w-8 h-8 text-indigo-600 mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">Critical Term Preservation</h3>
            <p className="text-slate-600 leading-relaxed">
              Business terminology, compliance codes, financial figures, and legal directives are tightly strictly preserved. The engine refuses to hallucinate around unmapped professional terms.
            </p>
         </div>
         <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <Database className="w-8 h-8 text-indigo-600 mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">End-to-End Environment</h3>
            <p className="text-slate-600 leading-relaxed">
              Designed to sit securely between your internal enterprise chat environments (Slack, Teams, internal tools) providing translation before messages enter the network payload.
            </p>
         </div>
         <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden text-white">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mb-6" />
            <h3 className="text-xl font-bold mb-3">Compliance Ready</h3>
            <p className="text-slate-400 leading-relaxed">
              Readiness tooling operates purely on structure, ensuring businesses maintain HIPAA, SOC2, and GDPR compliant flows without exposing PHI or PII to external translation databases.
            </p>
         </div>
      </div>
    </div>
  );
}
