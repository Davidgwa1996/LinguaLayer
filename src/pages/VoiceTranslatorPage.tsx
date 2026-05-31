/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import VoiceRecorder from "../components/VoiceRecorder.tsx";
import { AudioTranslationResponse } from "../types/index.ts";
import { PlayCircle, ShieldAlert, Sparkles, Volume2, Mic, Upload, FileAudio, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import LanguageSelector from "../components/LanguageSelector.tsx";
import PrivacyNotice from "../components/PrivacyNotice.tsx";
import { ApiClient } from "../services/apiClient.ts";
import { AudioClientService } from "../services/audioClient.ts";

interface VoiceTranslatorPageProps {
  id?: string;
  simpleMode: boolean;
}

export const VoiceTranslatorPage: React.FC<VoiceTranslatorPageProps> = ({
  id,
  simpleMode,
}) => {
  const [activeTab, setActiveTab] = useState<"record" | "upload">("record");
  const [targetLang, setTargetLang] = useState("Chinese");
  const [result, setResult] = useState<AudioTranslationResponse | null>(null);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [consentWarning, setConsentWarning] = useState(false);
  const [playing, setPlaying] = useState(false);

  // File Upload states
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "reading" | "translating" | "error">("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTranslationComplete = (res: AudioTranslationResponse) => {
    setResult(res);
  };

  const handleSpeakOutput = async () => {
    if (!result || playing) return;
    setPlaying(true);
    try {
      const isChinese = result.targetLanguage.toLowerCase().includes("chin");
      const voice = isChinese ? "Charon" : "Kore";
      const base64Audio = await ApiClient.textToSpeech(result.translatedText, voice);
      AudioClientService.playBase64Audio(base64Audio);
    } catch (e) {
      console.warn("Backend Speech service blocked or key missing. Falling back to native SpeechSynthesis:", e);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(result.translatedText);
        const isChinese = result.targetLanguage.toLowerCase().includes("chin");
        const isFrench = result.targetLanguage.toLowerCase().includes("fren");
        const isSpanish = result.targetLanguage.toLowerCase().includes("span");
        const isSwahili = result.targetLanguage.toLowerCase().includes("swah");
        
        if (isChinese) utterance.lang = "zh-CN";
        else if (isFrench) utterance.lang = "fr-FR";
        else if (isSpanish) utterance.lang = "es-ES";
        else if (isSwahili) utterance.lang = "sw-KE";
        else utterance.lang = "en-US";
        
        window.speechSynthesis.speak(utterance);
      }
    } finally {
      setPlaying(false);
    }
  };

  const handleConsentChange = (val: boolean) => {
    setPrivacyConsent(val);
    if (val) {
      setConsentWarning(false);
    }
  };

  // Convert File to Base64 String
  const fileToBase64 = (selectedFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = () => {
        const resultString = reader.result as string;
        // Strip dataUrl prefix to get pure base64 (e.g., data:audio/mp3;base64,xxxx)
        const base64Parts = resultString.split(",");
        if (base64Parts.length > 1) {
          resolve(base64Parts[1]);
        } else {
          reject(new Error("File conversion to Base64 failed."));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const processAudioFile = async (selectedFile: File) => {
    if (!privacyConsent) {
      setConsentWarning(true);
      return;
    }

    // Constraints check (Limit to typical formats & 15MB limit)
    const allowedExtensions = [".mp3", ".wav", ".webm", ".m4a", ".ogg", ".aac"];
    const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();
    const isAudioType = selectedFile.type.startsWith("audio/") || allowedExtensions.includes(fileExt);

    if (!isAudioType) {
      setUploadError("Invalid file selection. Please select an audio file (MP3, WAV, WebM, M4A, or OGG).");
      setUploadStatus("error");
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      setUploadError("The selected file exceeds the 15MB limit. Please provide a shorter audio clip.");
      setUploadStatus("error");
      return;
    }

    setFile(selectedFile);
    setUploadError(null);
    setUploadStatus("reading");

    try {
      const base64Data = await fileToBase64(selectedFile);
      setUploadStatus("translating");
      
      const mimeType = selectedFile.type || `audio/${fileExt.replace(".", "")}`;
      const translationRes = await ApiClient.translateAudio(base64Data, mimeType, targetLang);
      
      handleTranslationComplete(translationRes);
      setUploadStatus("idle");
    } catch (err) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : "Failure executing AI Translation on audio file.");
      setUploadStatus("error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processAudioFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAudioFile(e.dataTransfer.files[0]);
    }
  };

  const clearUpload = () => {
    setFile(null);
    setUploadError(null);
    setUploadStatus("idle");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div id={id} className="space-y-6 animate-fade-in text-left">
      <div>
        <h2 className="font-sans font-extrabold text-slate-900 text-2xl md:text-3xl tracking-tight">
          🎙️ Voice Translator Node
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Translate speech into beautiful written or spoken output using multimodal Gemini AI. Speak live or upload pre-recorded messages.
        </p>
      </div>

      {/* Consent Warning Block */}
      {consentWarning && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs md:text-sm flex items-start space-x-2.5 animate-pulse">
          <span className="font-extrabold text-sm mt-0.5">⚠️ Attention:</span>
          <span>Please review and authorize the data collection disclaimer in the Privacy Shield checkmark below before voice translations can proceed.</span>
        </div>
      )}

      {/* Privacy Notice with consent check block */}
      <PrivacyNotice
        consented={privacyConsent}
        onConsentChange={handleConsentChange}
      />

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => { setActiveTab("record"); setUploadError(null); }}
          className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "record"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Mic className="w-4 h-4" />
          Live Microphone Record
        </button>
        <button
          onClick={() => { setActiveTab("upload"); }}
          className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "upload"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload Audio File
        </button>
      </div>

      {/* Target Language configuration row */}
      <div className="w-full max-w-sm">
        <LanguageSelector
          label="Translate audio stream to:"
          selectedLanguage={targetLang}
          onChange={(lang) => {
            setTargetLang(lang);
            // If the user shifts language and already has a file loaded, re-process it
            if (activeTab === "upload" && file) {
              processAudioFile(file);
            }
          }}
        />
      </div>

      {activeTab === "record" ? (
        /* Audio Recorder node */
        <VoiceRecorder
          targetLanguage={targetLang}
          consentedToPrivacy={privacyConsent}
          onRequestConsent={() => setConsentWarning(true)}
          onTranslationComplete={handleTranslationComplete}
        />
      ) : (
        /* Native Drag-and-drop Audio File Uploader card */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
            dragOver
              ? "border-indigo-500 bg-indigo-50/50"
              : "border-slate-300 bg-slate-50 hover:bg-slate-100/50"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*"
            className="hidden"
          />

          {uploadStatus === "idle" && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center mx-auto">
                <FileAudio className="w-6 h-6 text-slate-500" />
              </div>
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-slate-900 text-white font-semibold text-sm rounded-xl shadow-sm hover:bg-slate-800 transition active:scale-95"
                >
                  Choose Audio File
                </button>
                <p className="text-xs text-slate-500 mt-2">
                  or drag and drop your recording here
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports MP3, WAV, WebM, M4A up to 15MB
                </p>
              </div>
            </div>
          )}

          {uploadStatus === "reading" && (
            <div className="py-4 space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-slate-200 border-t-indigo-600 animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-700">Converting audio encoding stream...</p>
            </div>
          )}

          {uploadStatus === "translating" && (
            <div className="py-4 space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-slate-200 border-t-amber-500 animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-700">Processing Gemini Multimodal Translation...</p>
              <p className="text-xs text-slate-400">Uploading and decoding file to transcribers</p>
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-rose-700">Translation Aborted</p>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">{uploadError}</p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition"
                >
                  Retry Upload
                </button>
                <button
                  onClick={clearUpload}
                  className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-300 transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {file && uploadStatus !== "error" && uploadStatus !== "reading" && uploadStatus !== "translating" && (
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between max-w-md mx-auto text-left">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <FileAudio className="w-4 h-4" />
                </div>
                <div className="truncate text-xs">
                  <span className="block font-semibold text-slate-700 truncate max-w-[180px]">{file.name}</span>
                  <span className="block text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => processAudioFile(file)}
                  className="p-1.5 hover:bg-slate-200 text-slate-600 rounded transition flex items-center gap-1.5 text-xs font-medium"
                  title="Re-run Analysis"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reprocess
                </button>
                <button
                  onClick={clearUpload}
                  className="p-1.5 hover:bg-rose-50 text-rose-600 rounded transition text-xs font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Result showcase block */}
      {result && (
        <div className="bg-slate-100 hover:bg-slate-200/50 transition duration-300 p-5 md:p-6 rounded-3xl border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold font-sans uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Multimodal Result Stream Generated
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Detected: {result.detectedLanguage} (Accuracy: {Math.round(result.confidence * 100)}%)
              </span>
              {result.emotionDetected && (
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold capitalize">
                  Emotion: {result.emotionDetected}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Transcript pane */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="block text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                Voice Original Transcript
              </span>
              <p className="font-serif leading-relaxed text-slate-700 text-sm md:text-base">
                “{result.transcript || "No words captured."}”
              </p>
            </div>

            {/* Translated Output pane */}
            <div className="bg-slate-900 p-4 rounded-2xl text-white space-y-1 shadow-sm">
              <span className="block text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                Target Translation output ({result.targetLanguage})
              </span>
              <p className="font-sans font-semibold leading-relaxed text-sm md:text-base">
                {result.translatedText || "Analyzing transcription..."}
              </p>
            </div>

          </div>

          {/* Warning */}
          {result.warning && (
            <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs md:text-sm">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
              <span>{result.warning}</span>
            </div>
          )}

          {/* Listening sound generator controls */}
          <button
            onClick={handleSpeakOutput}
            disabled={playing}
            className="w-full flex items-center justify-center space-x-2 p-4 rounded-2xl border bg-slate-900 border-transparent text-white text-sm md:text-base font-semibold hover:bg-slate-800 active:scale-95 transition"
          >
            <Volume2 className={`w-5 h-5 text-amber-400 ${playing ? "animate-pulse" : ""}`} />
            <span>{playing ? "Synthesizing AI output..." : `Read Translation Aloud (${result.targetLanguage})`}</span>
          </button>
        </div>
      )}
    </div>
  );
};
export default VoiceTranslatorPage;

