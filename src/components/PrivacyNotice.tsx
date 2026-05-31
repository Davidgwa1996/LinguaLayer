/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShieldCheck, EyeOff, Lock } from "lucide-react";

interface PrivacyNoticeProps {
  id?: string;
  onConsentChange?: (consent: boolean) => void;
  consented?: boolean;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({
  id,
  onConsentChange,
  consented = false,
}) => {
  return (
    <div
      id={id}
      className="p-5 rounded-3xl bg-emerald-50/50 border border-emerald-100 shadow-sm"
    >
      <div className="flex items-start space-x-3">
        <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl flex-shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-sans font-semibold text-slate-900 text-sm md:text-base leading-tight">
            LinguaLayer Privacy Shield: Active
          </h4>
          <p className="text-xs md:text-sm text-slate-600 mt-1.5 leading-relaxed">
            We translate inputs directly before transmitting or after displaying to protect your message chains. Conversations are processed transiently via secure Google Gemini servers and are <strong>never</strong> logged or archived on disk.
          </p>
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500 font-medium">
            <span className="flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Not bypasses end-to-end encryption</span>
            </span>
            <span className="flex items-center space-x-1">
              <EyeOff className="w-3.5 h-3.5 text-emerald-600" />
              <span>No persistent logs retained</span>
            </span>
          </div>

          {onConsentChange && (
            <div className="mt-4 pt-3.5 border-t border-emerald-100/75 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 font-sans">
                I authorize secure voice recording translation
              </span>
              <button
                type="button"
                onClick={() => onConsentChange(!consented)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  consented ? "bg-emerald-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    consented ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default PrivacyNotice;
