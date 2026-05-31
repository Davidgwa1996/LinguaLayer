/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface BigButtonProps {
  id?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'accent' | 'success';
  disabled?: boolean;
}

export const BigButton: React.FC<BigButtonProps> = ({
  id,
  onClick,
  label,
  subLabel,
  icon,
  variant = 'primary',
  disabled = false,
}) => {
  const getColors = () => {
    if (disabled) {
      return "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed";
    }
    switch (variant) {
      case 'primary':
        return "bg-slate-900 border-slate-900 text-white hover:bg-slate-800 focus:ring-slate-500 shadow-sm";
      case 'secondary':
        return "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 focus:ring-slate-500 border shadow-sm";
      case 'accent':
        return "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm";
      case 'success':
        return "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm";
      case 'danger':
        return "bg-rose-600 border-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm";
    }
  };

  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 active:scale-[0.98] outline-none focus:ring-2 focus:ring-offset-2 ${getColors()}`}
    >
      <div className="flex items-center space-x-4 text-left">
        {icon && <div className="text-2xl flex-shrink-0">{icon}</div>}
        <div>
          <span className="block font-sans font-semibold text-lg md:text-xl tracking-tight leading-snug">{label}</span>
          {subLabel && <span className="block text-xs md:text-sm opacity-85 mt-0.5 font-sans leading-tight">{subLabel}</span>}
        </div>
      </div>
      <div className="text-xl pl-2">➔</div>
    </button>
  );
};
export default BigButton;
