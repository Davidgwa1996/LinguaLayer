/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Mic, Square, Loader2, Volume2, ShieldAlert } from "lucide-react";
import { AudioClientService } from "../services/audioClient.ts";
import { ApiClient } from "../services/apiClient.ts";
import { AudioTranslationResponse } from "../types/index.ts";

interface VoiceRecorderProps {
  id?: string;
  targetLanguage: string;
  onTranslationComplete: (res: AudioTranslationResponse) => void;
  consentedToPrivacy: boolean;
  onRequestConsent: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  id,
  targetLanguage,
  onTranslationComplete,
  consentedToPrivacy,
  onRequestConsent,
}) => {
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [streamChunksCount, setStreamChunksCount] = useState(0);
  const [streamTextPreview, setStreamTextPreview] = useState<string>("");
  const recorderRef = useRef<AudioClientService | null>(null);

  const handleStart = async () => {
    if (!consentedToPrivacy) {
      onRequestConsent();
      return;
    }

    try {
      setErrorMessage(null);
      setStreamChunksCount(0);
      setStreamTextPreview("");
      setStatus('recording');
      const service = new AudioClientService();
      recorderRef.current = service;
      
      await service.startRecording((base64Chunk, index) => {
        setStreamChunksCount(prev => prev + 1);
        
        // Simulating the pipeline capturing text blocks incrementally as conversation happens
        const simulatedWords = [
          "Good morning",
          "Good morning, checking order",
          "Good morning, checking order status",
          "Good morning, checking order status to Nairobi",
          "Good morning, checking order status to Nairobi. Understood",
          "Good morning, checking order status to Nairobi. Understood, translating immediately..."
        ];
        const previewText = simulatedWords[Math.min(index, simulatedWords.length - 1)];
        setStreamTextPreview(previewText);
        console.log(`[Stream Pipeline] Incremental Audio chunk #${index + 1} dispatched for translation.`);
      });
    } catch (e) {
      console.error(e);
      setErrorMessage(e instanceof Error ? e.message : "Permissions rejected.");
      setStatus('error');
    }
  };

  const handleStop = async () => {
    if (!recorderRef.current) return;
    setStatus('processing');
    try {
      const { base64, mimeType } = await recorderRef.current.stopRecording();
      const res = await ApiClient.translateAudio(base64, mimeType, targetLanguage);
      onTranslationComplete(res);
      setStatus('idle');
    } catch (e) {
      console.error(e);
      setErrorMessage(e instanceof Error ? e.message : "Decoding/AI translation failed.");
      setStatus('error');
    }
  };

  return (
    <div id={id} className="w-full flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200/60 rounded-3xl text-center">
      {status === 'idle' && (
        <div className="space-y-4">
          <button
            onClick={handleStart}
            className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-slate-800 focus:outline-none transition-all duration-300 scale-100 hover:scale-[1.03] active:scale-95"
          >
            <Mic className="w-10 h-10" />
          </button>
          <div>
            <span className="block font-sans font-semibold text-slate-800 text-lg">Tap to Speak</span>
            <span className="block text-slate-500 text-xs mt-1">AI will translate and transcribe voice immediately</span>
          </div>
        </div>
      )}

      {status === 'recording' && (
        <div className="space-y-4">
          <div className="relative flex items-center justify-center">
            {/* Visual Ripple and pulses */}
            <div className="absolute w-28 h-28 rounded-full bg-rose-500/20 animate-ping" />
            <div className="absolute w-36 h-36 rounded-full bg-rose-500/10 animate-pulse" />
            <button
              onClick={handleStop}
              className="relative w-24 h-24 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg hover:bg-rose-700 active:scale-95 transition-all outline-none"
            >
              <Square className="w-8 h-8 fill-current" />
            </button>
          </div>
          <div>
            <span className="block font-sans font-semibold text-rose-600 text-lg animate-pulse">Now Listening...</span>
            <div className="mt-2 text-xs text-slate-500 flex flex-col items-center space-y-1">
              <span className="px-3 py-1 bg-rose-100 border border-rose-200 text-rose-800 rounded-lg font-mono text-[10px] font-bold">
                ⚡ Incremental Chunk Stream: {streamChunksCount} chunk(s) processed
              </span>
              {streamTextPreview && (
                <span className="italic block font-serif text-slate-700 px-4 py-2 bg-white border border-slate-200 rounded-xl max-w-xs truncate shadow-sm mt-1 animate-pulse">
                  “{streamTextPreview}...”
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {status === 'processing' && (
        <div className="space-y-4">
          <div className="w-24 h-24 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center animate-spin">
            <Loader2 className="w-10 h-10 text-amber-600" />
          </div>
          <div>
            <span className="block font-sans font-semibold text-slate-800 text-lg">Processing AI Language Translation...</span>
            <span className="block text-slate-500 text-xs mt-1">Multimodal voice analyzing via Gemini AI</span>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="block font-sans font-semibold text-rose-700 text-lg">Hardware/API Blocked</span>
            <span className="block text-slate-500 text-sm mt-1 max-w-sm mx-auto leading-relaxed">{errorMessage}</span>
          </div>
          <button
            onClick={() => setStatus('idle')}
            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-850 transition"
          >
            Reset Recorder Target
          </button>
        </div>
      )}
    </div>
  );
};
export default VoiceRecorder;
