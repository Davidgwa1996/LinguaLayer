/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Languages,
  MessageSquare,
  Mic,
  Briefcase,
  Settings,
  ShieldCheck,
  Home,
  Menu,
  X,
  Sparkles,
  Video,
} from "lucide-react";

import { LocalSettingsService } from "./services/localSettings.ts";
import { UserProfile } from "./types/index.ts";

import HomePage from "./pages/HomePage.tsx";
import TranslatorPage from "./pages/TranslatorPage.tsx";
import ConversationSimulator from "./pages/ConversationSimulator.tsx";
import VoiceTranslatorPage from "./pages/VoiceTranslatorPage.tsx";
import BusinessModePage from "./pages/BusinessModePage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import PrivacyPage from "./pages/PrivacyPage.tsx";
import MotionVideoDemo from "./pages/MotionVideoDemo.tsx";

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [settings, setSettings] = useState<UserProfile>({
    userId: "default-user",
    preferredLanguage: "English",
    simpleMode: false,
    privacyHistoryConsent: false,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "error" | "success" | "info" }[]>([]);

  // Initialize and load configurations
  useEffect(() => {
    const loadedSettings = LocalSettingsService.getLocalSettings();
    setSettings(loadedSettings);

    (window as any).showToast = (message: string, type: "error" | "success" | "info" = "info", duration = 8000) => {
      const id = Math.random().toString(36).slice(2);
      setToasts(prev => [...prev, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
      }
    };

    return () => {
      delete (window as any).showToast;
    };
  }, []);

  const handleUpdateSettings = (updated: Partial<UserProfile>) => {
    const fresh = LocalSettingsService.saveLocalSettings(updated);
    setSettings(fresh);
  };

  const handleToggleSimpleMode = (enabled: boolean) => {
    const fresh = LocalSettingsService.saveLocalSettings({ simpleMode: enabled });
    setSettings(fresh);
  };

  const navigationItems = [
    { id: "home", label: "Overview", icon: <Home className="w-5 h-5" /> },
    { id: "translator", label: "Simple text", icon: <Languages className="w-5 h-5" /> },
    { id: "simulator", label: "Simulate game", icon: <MessageSquare className="w-5 h-5" /> },
    { id: "videodemo", label: "Video Demo Mode", icon: <Video className="w-5 h-5" /> },
    { id: "voice", label: "Speaker translator", icon: <Mic className="w-5 h-5" /> },
    { id: "business", label: "Business protect", icon: <Briefcase className="w-5 h-5" /> },
    { id: "settings", label: "Preferences", icon: <Settings className="w-5 h-5" /> },
    { id: "privacy", label: "Security shield", icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  const renderActivePage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={setCurrentPage} simpleMode={settings.simpleMode} />;
      case "translator":
        return (
          <TranslatorPage
            simpleMode={settings.simpleMode}
            userLanguage={settings.preferredLanguage}
          />
        );
      case "simulator":
        return <ConversationSimulator simpleMode={settings.simpleMode} />;
      case "videodemo":
        return <MotionVideoDemo />;
      case "voice":
        return <VoiceTranslatorPage simpleMode={settings.simpleMode} />;
      case "business":
        return <BusinessModePage />;
      case "settings":
        return (
          <SettingsPage
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            simpleMode={settings.simpleMode}
            onToggleSimpleMode={handleToggleSimpleMode}
          />
        );
      case "privacy":
        return <PrivacyPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} simpleMode={settings.simpleMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800 flex flex-col font-sans">
      
      {/* 1. Header component layer */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 py-3.5 md:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo brand styling */}
          <div
            onClick={() => setCurrentPage("home")}
            className="flex items-center space-x-2.5 cursor-pointer hover:opacity-90 select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md font-extrabold text-sm font-sans tracking-tight transition group-hover:scale-105">
              LL
            </div>
            <div>
              <span className="block font-sans font-black text-slate-900 tracking-tight leading-3 text-lg md:text-xl">
                LinguaLayer <span className="text-indigo-600 font-sans">AI</span>
              </span>
              <span className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">
                Universal Language Layer
              </span>
            </div>
          </div>
        </div>

        {/* Right header configuration widget panels */}
        <div className="flex items-center space-x-3">
          
          {/* Fast header Easy simple mode widget indicator */}
          <button
            onClick={() => handleToggleSimpleMode(!settings.simpleMode)}
            className={`hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition active:scale-95 shadow-sm ${
              settings.simpleMode
                ? "bg-amber-100/80 border-amber-200 text-amber-800"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Sparkles className={`w-4 h-4 ${settings.simpleMode ? 'text-amber-500 fill-current animate-pulse' : 'text-slate-400'}`} />
            <span>{settings.simpleMode ? "Simple Mode is ON" : "Detail Mode"}</span>
          </button>

          {/* Default country native language tag indicator preview */}
          <div className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-extrabold text-slate-700 tracking-wide shadow-sm flex items-center space-x-1">
            <span>🗣️ {settings.preferredLanguage}</span>
          </div>
        </div>
      </header>

      {/* 2. Main content container split grids */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        
        {/* Navigation Sidebar Drawer for desktop layout, sliding absolute card for mobile */}
        <nav
          className={`fixed inset-y-0 left-0 top-[65px] z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 md:translate-x-0 md:static md:w-60 lg:w-64 flex flex-col p-4 space-y-1.5 shadow-sm ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {navigationItems.map((item) => {
            const isSelected = item.id === currentPage;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3.5 p-3.5 rounded-2xl font-sans font-semibold text-sm transition outline-none cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-[1.02]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className={isSelected ? "text-white" : "text-slate-400 group-hover:text-slate-600"}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Quick info widget bottom panel */}
          <div className="mt-auto p-4 rounded-2xl bg-[#fafafa]/80 border border-dashed border-slate-200 text-center font-sans">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-3">Currently Running</span>
            <span className="block font-bold text-xs text-slate-700 mt-1">Universal Engine v1.2</span>
            <span className="block text-[10px] text-emerald-600 mt-1 font-bold">● Active Sandbox Mode</span>
          </div>
        </nav>

        {/* Mobile backdrop dim blur */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-20 md:hidden"
            style={{ top: "65px" }}
          />
        )}

        {/* Render actual content modules panels framed by standard animations */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-5xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="bg-white border border-slate-200/90 rounded-[32px] p-5 md:p-8 min-h-[460px] shadow-sm flex flex-col justify-between"
            >
              {renderActivePage()}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* 3. Footer layer */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 font-sans px-4 mt-auto">
        <p>© 2026 LinguaLayer AI universal communication platform. Consent and privacy metrics active.</p>
        <p className="mt-1 text-[10px] text-slate-300">Formulated in Google Cloud Run sandbox frame environment.</p>
      </footer>

      {/* 4. Global Toast Notifications Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full px-4 md:px-0 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              className={`p-4 rounded-3xl shadow-xl font-sans text-xs md:text-sm font-semibold pointer-events-auto flex items-start gap-3 border transition-all ${
                toast.type === "error"
                  ? "bg-rose-50 border-rose-200 text-rose-900 shadow-rose-950/5"
                  : toast.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-emerald-950/5"
                  : "bg-indigo-50 border-indigo-200 text-indigo-950 shadow-indigo-950/5"
              }`}
            >
              <div className="text-base select-none">
                {toast.type === "error" ? "🛑" : toast.type === "success" ? "✅" : "ℹ️"}
              </div>
              <div className="flex-1 leading-snug">
                {toast.message}
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-slate-400 hover:text-slate-700 font-bold ml-1 text-xs cursor-pointer transition p-0.5"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
