/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Eye } from "lucide-react";

interface SimpleModeToggleProps {
  id?: string;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const SimpleModeToggle: React.FC<SimpleModeToggleProps> = ({
  id,
  isEnabled,
  onToggle,
}) => {
  return (
    <div
      id={id}
      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
        isEnabled
          ? "bg-amber-50/70 border-amber-200 shadow-sm"
          : "bg-slate-50 border-slate-200"
      }`}
    >
      <div className="flex items-center space-x-3 pr-2">
        <div className={`p-2 rounded-xl ${isEnabled ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
          {isEnabled ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Eye className="w-5 h-5" />}
        </div>
        <div>
          <span className="block font-sans font-medium text-sm text-slate-900 leading-tight">
            {isEnabled ? "🌟 Simple Easy Mode is ON" : "✨ Hard Words Mode (Detailed)"}
          </span>
          <span className="block text-xs text-slate-500 mt-0.5 leading-tight">
            {isEnabled ? "Fewer options and larger buttons for ease of use." : "Enable Simple Mode for big speech buttons and summary aids."}
          </span>
        </div>
      </div>
      <div>
        <button
          onClick={() => onToggle(!isEnabled)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
            isEnabled ? "bg-amber-500" : "bg-slate-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              isEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
};
export default SimpleModeToggle;
