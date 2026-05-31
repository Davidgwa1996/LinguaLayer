/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShieldCheck, EyeOff, Lock, Database, Trash2, Heart } from "lucide-react";

export const PrivacyPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div>
        <h2 className="font-sans font-extrabold text-slate-900 text-2xl md:text-3xl tracking-tight">
          🛡️ Privacy Consent &amp; Security Shield
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          LinguaLayer AI is built upon security, absolute consent, and architectural privacy. Read how we protect you.
        </p>
      </div>

      {/* Military Grade Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-3xl space-y-2 shadow-sm flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
            <Lock className="w-4 h-4 text-slate-500" />
            <span>End-to-End Integrity</span>
          </div>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            We <strong>never</strong> bypass, modify, or break the end-to-end encryption architectures of tools like Signal, WhatsApp, or iMessage. Translation layers intercept content pre-encryption (for sending) or post-decryption (for receiving UI overlays) directly on your hardware.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-3xl space-y-2 shadow-sm flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
            <EyeOff className="w-4 h-4 text-slate-500" />
            <span>Transient Engine processing</span>
          </div>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            All AI translations via the secure premium Google Gemini endpoints occur transiently. Text chunks and speech buffers are processed in-memory and deleted immediately afterwards. We maintain zero database archives of your messaging on cloud clusters.
          </p>
        </div>

      </div>

      {/* Core Privacy Pillars editorial content */}
      <div className="bg-white border border-slate-200 p-6 rounded-[32px] space-y-6 shadow-sm">
        <h3 className="font-sans font-bold text-slate-900 text-base md:text-lg">
          The Five Pillars of Privacy-First Translation:
        </h3>

        <div className="space-y-5">
          <div className="flex items-start space-x-3.5 text-xs md:text-sm text-slate-700">
            <span className="p-1 px-2.5 rounded-lg bg-slate-900 text-white font-mono text-xs font-extrabold mt-0.5">1</span>
            <div>
              <strong className="block font-sans text-slate-900 text-sm md:text-base font-semibold">Absolute User Sovereignty</strong>
              <span className="block text-slate-500 text-xs md:text-sm mt-0.5 leading-relaxed">
                You configure your preferred native languages, target languages, and communication tones. No automated language scrapers inspect your screens without an explicit trigger action.
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 text-xs md:text-sm text-slate-700">
            <span className="p-1 px-2.5 rounded-lg bg-slate-900 text-white font-mono text-xs font-extrabold mt-0.5">2</span>
            <div>
              <strong className="block font-sans text-slate-900 text-sm md:text-base font-semibold">Zero Global Databasing</strong>
              <span className="block text-slate-500 text-xs md:text-sm mt-0.5 leading-relaxed">
                We store settings locally on your client apparatus. Custom contact mappings are saved inside the browser cache or phone memory. If you wish to enable message archiving, it remains an opt-in togglable parameter.
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 text-xs md:text-sm text-slate-700">
            <span className="p-1 px-2.5 rounded-lg bg-slate-900 text-white font-mono text-xs font-extrabold mt-0.5">3</span>
            <div>
              <strong className="block font-sans text-slate-900 text-sm md:text-base font-semibold">Double Shield Verification</strong>
              <span className="block text-slate-500 text-xs md:text-sm mt-0.5 leading-relaxed">
                Our servers omit logging actual message body payloads from log targets, using customized security proxies. Even developers cannot inspect user transcriptions or chats.
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 text-xs md:text-sm text-slate-700">
            <span className="p-1 px-2.5 rounded-lg bg-slate-900 text-white font-mono text-xs font-extrabold mt-0.5">4</span>
            <div>
              <strong className="block font-sans text-slate-900 text-sm md:text-base font-semibold">High Stakes Security Warnings</strong>
              <span className="block text-slate-500 text-xs md:text-sm mt-0.5 leading-relaxed">
                Our AI model automatically triggers alerts if you execute translations touching immigration passport queues, critical emergency protocols, medical surgery setups, or financial binding contracts, recommending human-expert authorization backups.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-emerald-50/50 border border-emerald-100/60 rounded-2xl text-xs flex items-center space-x-2.5">
        <Heart className="w-5 h-5 text-emerald-600 flex-shrink-0 fill-current animate-pulse" />
        <span className="text-slate-600 font-sans">
          <strong>Thank you:</strong> LinguaLayer is designed to foster natural connections with uncompromised human protection values. Feel free to purge settings under the Settings page at any time.
        </span>
      </div>
    </div>
  );
};
export default PrivacyPage;
