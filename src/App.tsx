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
import { getCurrentAuthUser } from "./services/authService.ts";
import { upsertUserProfile } from "./services/userService.ts";

import HomePage from "./pages/HomePage.tsx";
import TranslatorPage from "./pages/TranslatorPage.tsx";
import { LanguageStartScreen } from "./components/LanguageStartScreen.tsx";
import { AuthScreen } from "./components/AuthScreen.tsx";
import { LiveChatRoom } from "./pages/LiveChatRoom.tsx";
import VoiceTranslatorPage from "./pages/VoiceTranslatorPage.tsx";
import BusinessModePage from "./pages/BusinessModePage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import PrivacyPage from "./pages/PrivacyPage.tsx";
import MotionVideoDemo from "./pages/MotionVideoDemo.tsx";

import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import type { User as FirebaseAuthUser } from "firebase/auth";

const LiveChatFlow: React.FC<{ settings: UserProfile }> = ({ settings }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return sessionStorage.getItem("lingualayer_session_language") || "";
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<FirebaseAuthUser | null>(null);

  useEffect(() => {
    getCurrentAuthUser().then(u => {
      setIsAuthenticated(!!u);
      setUser(u);
    }).catch(() => {
      setIsAuthenticated(false)
      setUser(null);
    });
  }, []);

  const handleStartLanguage = (code: string) => {
    sessionStorage.setItem("lingualayer_session_language", code);
    setSelectedLanguage(code);
    if (user) {
      handleAuthSuccess(user, code);
    }
  };

  const handleAuthSuccess = async (u?: FirebaseAuthUser | null, code?: string) => {
    const authU = u || await getCurrentAuthUser();
    const lang = code || selectedLanguage;
    setUser(authU);
    if (authU && lang) {
      try {
        const LANGUAGES = [
          { code: "en", name: "English", nativeName: "English" },
          { code: "zh-CN", name: "Mandarin Chinese", nativeName: "中文" },
          { code: "ru", name: "Russian", nativeName: "Русский" },
          { code: "pt", name: "Portuguese", nativeName: "Português" },
          { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
          { code: "ar", name: "Arabic", nativeName: "العربية" },
          { code: "fr", name: "French", nativeName: "Français" },
          { code: "es", name: "Spanish", nativeName: "Español" },
          { code: "de", name: "German", nativeName: "Deutsch" },
          { code: "it", name: "Italian", nativeName: "Italiano" },
          { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
          { code: "bn", name: "Bengali", nativeName: "বাংলা" },
          { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
          { code: "tr", name: "Turkish", nativeName: "Türkçe" },
          { code: "ja", name: "Japanese", nativeName: "日本語" },
          { code: "te", name: "Telugu", nativeName: "తెలుగు" }
        ];
        const langConfig = LANGUAGES.find(l => l.code === lang);
        await upsertUserProfile(authU.uid, lang, langConfig?.name || lang);
      } catch (e) {
        console.error(e);
      }
    }
    setIsAuthenticated(true);
  };

  const handleChangeLanguage = () => {
    setSelectedLanguage("");
    sessionStorage.removeItem("lingualayer_session_language");
  };

  if (!selectedLanguage) {
    return <LanguageStartScreen onStart={handleStartLanguage} />;
  }

  if (isAuthenticated === null) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <ErrorBoundary onReset={handleChangeLanguage}>
      <LiveChatRoom selectedLanguage={selectedLanguage} onChangeLanguage={handleChangeLanguage} settings={settings} />
    </ErrorBoundary>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("livechat"); // Default to simulator!
  
  const [settings, setSettings] = useState<UserProfile>({
    userId: "default-user",
    preferredLanguage: "English",
    simpleModeEnabled: false,
    privacyHistoryConsent: false,
  });
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "error" | "success" | "info"; countdownSeconds?: number }[]>([]);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("lingualayer_theme");
      return saved === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("lingualayer_theme", darkMode ? "dark" : "light");
    } catch {}
  }, [darkMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setToasts(prev => prev.map(t => {
        if (t.countdownSeconds !== undefined) {
          if (t.countdownSeconds <= 1) return null;
          return { ...t, countdownSeconds: t.countdownSeconds - 1 };
        }
        return t;
      }).filter((t): t is any => t !== null));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadedSettings = LocalSettingsService.getLocalSettings();
    setSettings(loadedSettings);

    (window as any).showToast = (message: string, type: "error" | "success" | "info" = "info", duration = 8000, countdownSeconds?: number) => {
      const id = Math.random().toString(36).slice(2);
      setToasts(prev => [...prev, { id, message, type, countdownSeconds }]);
      if (duration > 0 && !countdownSeconds) {
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
      }
    };
    return () => { delete (window as any).showToast; };
  }, []);

  const handleUpdateSettings = async (updated: Partial<UserProfile>) => {
    const fresh = LocalSettingsService.saveLocalSettings(updated);
    setSettings(fresh);
  };

  const handleToggleSimpleMode = async (enabled: boolean) => {
    const fresh = LocalSettingsService.saveLocalSettings({ simpleModeEnabled: enabled });
    setSettings(prev => ({...prev, simpleModeEnabled: enabled}));
  };

  const navigationItems = [
    { id: "livechat", label: "Live Chat", icon: <MessageSquare className="w-5 h-5" /> },
    { id: "home", label: "Overview", icon: <Home className="w-5 h-5" /> },
    { id: "translator", label: "Simple text", icon: <Languages className="w-5 h-5" /> },
    { id: "videodemo", label: "Video Demo Mode", icon: <Video className="w-5 h-5" /> },
    { id: "voice", label: "Speaker translator", icon: <Mic className="w-5 h-5" /> },
    { id: "business", label: "Business protect", icon: <Briefcase className="w-5 h-5" /> },
    { id: "settings", label: "Preferences", icon: <Settings className="w-5 h-5" /> },
    { id: "privacy", label: "Security shield", icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  const renderActivePage = () => {
    switch (currentPage) {
      case "home": return <HomePage onNavigate={setCurrentPage} simpleMode={settings.simpleModeEnabled} />;
      case "translator": return <TranslatorPage simpleMode={settings.simpleModeEnabled} userLanguage={settings.preferredLanguage} />;
      case "livechat": return <LiveChatFlow settings={settings} />;
      case "videodemo": return <MotionVideoDemo />;
      case "voice": return <VoiceTranslatorPage simpleMode={settings.simpleModeEnabled} />;
      case "business": return <BusinessModePage />;
      case "settings": return <SettingsPage settings={settings} onUpdateSettings={handleUpdateSettings} simpleMode={settings.simpleModeEnabled} onToggleSimpleMode={handleToggleSimpleMode} />;
      case "privacy": return <PrivacyPage />;
      default: return <LiveChatFlow settings={settings} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${darkMode ? "bg-slate-950 text-slate-100 dark" : "bg-[#fafafa] text-slate-800"}`}>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3.5 md:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div onClick={() => setCurrentPage("home")} className="flex items-center space-x-2.5 cursor-pointer hover:opacity-90 select-none group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md font-extrabold text-sm font-sans tracking-tight transition group-hover:scale-105">LL</div>
            <div>
              <span className="block font-sans font-black text-slate-900 tracking-tight leading-3 text-lg md:text-xl">LinguaLayer <span className="text-indigo-600 font-sans">AI</span></span>
              <span className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Universal Language Layer</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={() => handleToggleSimpleMode(!settings.simpleModeEnabled)} className={`hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition active:scale-95 shadow-sm ${settings.simpleModeEnabled ? 'bg-amber-100/80 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
            <Sparkles className={`w-4 h-4 ${settings.simpleModeEnabled ? 'text-amber-500 fill-current animate-pulse' : 'text-slate-400'}`} />
            <span>{settings.simpleModeEnabled ? "Simple Mode is ON" : "Detail Mode"}</span>
          </button>
          <div className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-full text-xs font-extrabold text-slate-700 dark:text-slate-350 tracking-wide shadow-sm flex items-center space-x-1">
            <span>🗣️ {settings.preferredLanguage}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row relative">
        <nav className={`fixed inset-y-0 left-0 top-[65px] z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 md:translate-x-0 md:static md:w-60 lg:w-64 flex flex-col p-4 space-y-1.5 shadow-sm h-full ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {navigationItems.map(item => {
            const isSelected = item.id === currentPage;
            return (
              <button key={item.id} onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }} className={`w-full flex items-center space-x-3.5 p-3.5 rounded-2xl font-sans font-semibold text-sm transition outline-none cursor-pointer ${isSelected ? "bg-slate-900 dark:bg-slate-800 text-white shadow-md shadow-slate-900/10 dark:shadow-black/10 scale-[1.02]" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100"}`}>
                <div className={isSelected ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600"}>{item.icon}</div>
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-4 mt-2 border-t border-slate-150 dark:border-slate-800 flex flex-col space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 pl-2">Appearance Theme</span>
            <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center justify-between p-3.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/45 cursor-pointer transition-all font-semibold text-sm outline-none">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{darkMode ? "🌙" : "☀️"}</span>
                <span>{darkMode ? "Dark Theme" : "Light Theme"}</span>
              </div>
              <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${darkMode ? "bg-indigo-600" : "bg-slate-200"}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${darkMode ? "translate-x-4" : "translate-x-0"}`} />
              </div>
            </button>
          </div>
          <div className="mt-8 p-4 rounded-2xl bg-[#fafafa]/80 dark:bg-[#121620]/30 border border-dashed border-slate-200 dark:border-slate-800 text-center font-sans">
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-3">Currently Running</span>
            <span className="block font-bold text-xs text-slate-700 dark:text-slate-350 mt-1">Universal Engine v1.2</span>
            <span className="block text-[10px] text-emerald-600 dark:text-emerald-450 mt-1 font-bold">● Active Sandbox Mode</span>
          </div>
        </nav>

        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-xs z-20 md:hidden" style={{ top: "65px" }} />}

        <main className="flex-1 p-0 md:p-8 max-w-5xl mx-auto w-full md:min-h-0">
          <AnimatePresence mode="wait">
            <motion.div key={currentPage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18, ease: "easeOut" }} className="w-full h-full md:bg-white md:dark:bg-slate-900 md:border md:border-slate-200/90 md:dark:border-slate-800 md:rounded-[32px] md:p-8 md:min-h-[460px] md:shadow-sm flex flex-col justify-between">
              {renderActivePage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full px-4 md:px-0 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div key={toast.id} initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }} className={`p-4 rounded-3xl shadow-xl font-sans text-xs md:text-sm font-semibold pointer-events-auto flex items-start gap-3 border transition-all ${toast.type === "error" ? "bg-rose-50 border-rose-200 text-rose-900 shadow-rose-950/5" : toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-emerald-950/5" : "bg-indigo-50 border-indigo-200 text-indigo-950 shadow-indigo-950/5"}`}>
              <div className="text-base select-none">{toast.type === "error" ? "🛑" : toast.type === "success" ? "✅" : "ℹ️"}</div>
              <div className="flex-1 leading-snug">
                <div>{toast.message}</div>
              </div>
              <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="text-slate-400 hover:text-slate-700 font-bold ml-1 text-xs cursor-pointer transition p-0.5">✕</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
