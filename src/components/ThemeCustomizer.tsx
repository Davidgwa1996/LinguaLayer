import React from 'react';

export type ChatTheme = "default" | "dark" | "ocean" | "sunset" | "forest";

interface ThemeCustomizerProps {
  currentTheme: ChatTheme;
  onThemeChange: (theme: ChatTheme) => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ currentTheme, onThemeChange }) => {
  const themes: { id: ChatTheme, label: string, color: string }[] = [
    { id: "default", label: "Default", color: "bg-slate-50 border-slate-200" },
    { id: "dark", label: "Dark", color: "bg-slate-900 border-slate-700" },
    { id: "ocean", label: "Ocean", color: "bg-blue-100 border-blue-200" },
    { id: "sunset", label: "Sunset", color: "bg-orange-50 border-orange-200" },
    { id: "forest", label: "Forest", color: "bg-green-50 border-green-200" },
  ];

  return (
    <div className="flex gap-2 items-center px-4 py-2 bg-white/80 backdrop-blur-sm border-b border-white-200 overflow-x-auto scroolbar-hide">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Theme:</span>
        <div className="flex gap-2">
            {themes.map(t => (
                <button
                    key={t.id}
                    onClick={() => onThemeChange(t.id)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${t.color} ${currentTheme === t.id ? 'border-indigo-500 scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`}
                    title={t.label}
                />
            ))}
        </div>
    </div>
  );
};
