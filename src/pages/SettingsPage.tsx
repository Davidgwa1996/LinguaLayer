/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import LanguageSelector from "../components/LanguageSelector.tsx";
import SimpleModeToggle from "../components/SimpleModeToggle.tsx";
import { UserProfile } from "../types/index.ts";
import { Settings, User, Save, Trash2, ShieldAlert, LogOut } from "lucide-react";
import { getCurrentAuthUser, logoutSession } from "../services/authService.ts";
import type { User as FirebaseAuthUser } from "firebase/auth";

interface SettingsPageProps {
  id?: string;
  settings: UserProfile;
  onUpdateSettings: (profile: Partial<UserProfile>) => void;
  simpleMode: boolean;
  onToggleSimpleMode: (enabled: boolean) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  id,
  settings,
  onUpdateSettings,
  simpleMode,
  onToggleSimpleMode,
}) => {
  const [authUser, setAuthUser] = useState<FirebaseAuthUser | null>(null);

  useEffect(() => {
    getCurrentAuthUser().then(user => setAuthUser(user)).catch(() => {});
  }, []);
  
  const handlePreferredLangChange = (lang: string) => {
    onUpdateSettings({ preferredLanguage: lang });
  };

  const handleHistoryConsentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({ privacyHistoryConsent: event.target.checked });
  };

  const handleWipeData = () => {
    if (confirm("Are you sure you want to delete all offline cache and custom language configurations from this browser?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to sign out?")) {
      await logoutSession();
      window.location.reload();
    }
  };

  return (
    <div id={id} className="space-y-6 animate-fade-in text-left">
      <div>
        <h2 className="font-sans font-extrabold text-slate-900 text-2xl md:text-3xl tracking-tight">
          ⚙️ Options &amp; Layout Profiles
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure your personal parameters, layouts overlays, and privacy history buffers.
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 md:p-6 space-y-5 shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
          <User className="w-4 h-4 text-slate-500" />
          <span>My Profile Card</span>
        </div>

        {authUser && (
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <p className="text-sm font-semibold text-slate-800">{authUser.email || "Signed in"}</p>
              <p className="text-xs text-slate-500">Connected account</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Home language selector */}
        <div className="w-full max-w-sm">
          <LanguageSelector
            label="My preferred language (I speak this)"
            selectedLanguage={settings.preferredLanguage}
            onChange={handlePreferredLangChange}
          />
          <span className="block text-xs text-slate-500 mt-1.5 pl-1">
            We will translate incoming messages into this native language auto.
          </span>
        </div>

        {/* Split/Simple mode configurations */}
        <div className="pt-2 border-t border-slate-100">
          <SimpleModeToggle
            isEnabled={simpleMode}
            onToggle={onToggleSimpleMode}
          />
        </div>
      </div>

      {/* Privacy Opt-in history cards */}
      <div className="bg-white border border-slate-200/95 rounded-3xl p-5 md:p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
          <Settings className="w-4 h-4 text-indigo-500" />
          <span>Local Storage Buffer Policy</span>
        </div>

        <div className="flex items-start space-x-3 p-1">
          <input
            id="privacyHistoryConsentCheckbox"
            type="checkbox"
            checked={settings.privacyHistoryConsent}
            onChange={handleHistoryConsentChange}
            className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 focus:ring-2 mt-1 cursor-pointer"
          />
          <div className="flex-1 min-w-0">
            <label htmlFor="privacyHistoryConsentCheckbox" className="block text-sm md:text-base font-semibold text-slate-800 leading-tight cursor-pointer select-none">
              Store conversation history locally
            </label>
            <p className="text-xs text-slate-500 mt-1 leading-normal max-w-lg">
              Check this box to cache recent messages securely inside your phone/browser localStorage. We do NOT stream copies of chat streams to backup servers. Default is disabled.
            </p>
          </div>
        </div>
      </div>

      {/* Preserved Terms */}
      <div className="bg-white border border-slate-200/95 rounded-3xl p-5 md:p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
          <Settings className="w-4 h-4 text-indigo-500" />
          <span>Custom Terminology & Brands</span>
        </div>

        <div className="space-y-3">
           <p className="text-xs text-slate-500">
             Add specific brand names, acronyms, or technical phrases that should NEVER be translated (e.g., LinguaLayer, AcmeCorp). Hit Enter to add.
           </p>
           <div className="flex flex-wrap gap-2 mb-2">
             {(settings.preservedTerms || []).map((term, i) => (
               <span key={i} className="flex items-center px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-mono border border-slate-200">
                 {term}
                 <button 
                   type="button"
                   onClick={() => {
                     const newTerms = (settings.preservedTerms || []).filter((_, idx) => idx !== i);
                     onUpdateSettings({ preservedTerms: newTerms });
                   }}
                   className="ml-2 text-slate-400 hover:text-red-500"
                 >
                   &times;
                 </button>
               </span>
             ))}
           </div>
           
           <input
             type="text"
             placeholder="Type a term and press Enter..."
             className="w-full max-w-sm px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
             onKeyDown={(e) => {
               if (e.key === 'Enter') {
                 e.preventDefault();
                 const val = e.currentTarget.value.trim();
                 if (val && !(settings.preservedTerms || []).includes(val)) {
                   onUpdateSettings({ preservedTerms: [...(settings.preservedTerms || []), val] });
                 }
                 e.currentTarget.value = "";
               }
             }}
           />
        </div>
      </div>

      {/* 📱 Real-time Mobile Device Connectivity / Testing */}
      <div className="bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100 rounded-3xl p-5 md:p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-600 font-sans">
            <span className="text-sm">📱</span>
            <span>Connect & Test on Phone / Tablet</span>
          </div>
          <span className="px-2 py-0.5 text-[9px] bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold rounded-full font-mono">
            LIVE MULTI-DEVICE
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-shrink-0 bg-white p-3 rounded-2xl border border-indigo-100 shadow-sm flex flex-col items-center">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(window.location.href)}&color=0f172a`} 
              alt="Scan to test on phone"
              className="w-[140px] h-[140px]"
              referrerPolicy="no-referrer"
            />
            <span className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tight">Scan Camera</span>
          </div>

          <div className="flex-1 space-y-2 text-center md:text-left">
            <h4 className="font-sans font-bold text-slate-800 text-sm md:text-base">
              Run Real-time Translation on Your Phone
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
              Need to test text/voice messaging between multiple screens? Point your phone's camera at this QR code to load the suite on your mobile device instantly.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <input
                id="shareableUrlField"
                type="text"
                readOnly
                value={window.location.href}
                className="w-full max-w-xs px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-xs font-mono focus:outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  if (typeof (window as any).showToast === "function") {
                    (window as any).showToast("📋 URL copied! Send this to your other devices to type and translate in real-time.", "success", 4000);
                  }
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg active:scale-95 transition cursor-pointer"
              >
                Copy URL
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dangerous/Wipe Card actions */}
      <div className="bg-rose-50/50 border border-rose-100 p-5 rounded-3xl space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-rose-500 font-sans pl-0.5">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>Maintenance &amp; Danger Area</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-0.5">
            <span className="block font-sans font-semibold text-rose-900 text-sm md:text-base leading-tight">Wipe offline data store</span>
            <span className="block text-xs text-slate-500 leading-normal">
              Irreversibly deletes local settings, consent caches, and contact circles mappings.
            </span>
          </div>

          <button
            onClick={handleWipeData}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs md:text-sm font-semibold rounded-xl active:scale-95 transition shadow-sm flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4 text-rose-200" />
            <span>Wipe Configuration Cache</span>
          </button>
        </div>
      </div>

    </div>
  );
};
export default SettingsPage;
