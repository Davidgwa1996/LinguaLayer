/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Coffee, ShieldCheck, Heart, User, Briefcase, Smile, Zap } from "lucide-react";

interface ToneSelectorProps {
  id?: string;
  selectedTone: string;
  onChange: (tone: any) => void;
}

const TONES = [
  { value: "neutral", label: "Neutral", desc: "Balanced literal", icon: <Zap className="w-4 h-4" /> },
  { value: "friendly", label: "Friendly", desc: "Warm & warmhearted", icon: <Smile className="w-4 h-4" /> },
  { value: "formal", label: "Formal", desc: "Courteous & professional", icon: <User className="w-4 h-4" /> },
  { value: "business", label: "Business", desc: "Secure numbers/terms", icon: <Briefcase className="w-4 h-4" /> },
  { value: "simple", label: "Simple", desc: "Easy, short terms", icon: <Coffee className="w-4 h-4" /> },
  { value: "respectful", label: "Respectful", desc: "Highly honorific", icon: <ShieldCheck className="w-4 h-4" /> },
  { value: "casual", label: "Casual", desc: "Relaxed slang", icon: <Heart className="w-4 h-4" /> }
];

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  id,
  selectedTone,
  onChange,
}) => {
  return (
    <div id={id} className="w-full">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-sans pl-1">
        Communication Tone Preset
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TONES.map((tone) => {
          const isSelected = selectedTone === tone.value;
          return (
            <button
              key={tone.value}
              type="button"
              onClick={() => onChange(tone.value)}
              className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-200 outline-none ${
                isSelected
                  ? "bg-slate-9 border-slate-900 text-white shadow-md scale-[1.02]"
                  : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center space-x-2 text-sm font-semibold truncate w-full">
                <span className={isSelected ? "text-amber-300" : "text-slate-500"}>
                  {tone.icon}
                </span>
                <span className="truncate">{tone.label}</span>
              </div>
              <span className={`text-[10px] mt-1 truncate w-full line-clamp-1 leading-normal ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                {tone.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default ToneSelector;
