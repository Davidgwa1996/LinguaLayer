import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send } from 'lucide-react';

interface ChatVoiceRecorderProps {
  onSend: (audioBlob: Blob, durationMs: number) => void;
  onCancel: () => void;
}

export const ChatVoiceRecorder: React.FC<ChatVoiceRecorderProps> = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm' };
      const recorder = new MediaRecorder(stream, MediaRecorder.isTypeSupported('audio/webm') ? options : undefined);
      
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const type = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
        const blob = new Blob(chunksRef.current, { type });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone', err);
      alert('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (audioUrl && audioBlob) {
    return (
      <div className="flex w-full items-center gap-2 border-t border-slate-200 bg-white p-3 shrink-0">
        <button onClick={onCancel} className="p-2 text-slate-500 hover:text-red-500 rounded-full hover:bg-slate-100 transition">
          <Trash2 className="w-5 h-5" />
        </button>
        <div className="flex-1 rounded-full bg-slate-100 px-4 py-2 flex items-center justify-between">
            <audio src={audioUrl} controls className="h-8 w-full max-w-[200px]" />
        </div>
        <button 
          onClick={() => onSend(audioBlob, duration * 1000)}
          className="flex h-12 w-12 flex-none shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700 transition shadow-sm active:scale-95"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center gap-2 border-t border-slate-200 bg-white p-3 shrink-0">
      {!isRecording ? (
        <>
            <button onClick={onCancel} className="p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100 transition">
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="flex-1 rounded-full border border-slate-300 px-4 py-3 text-base bg-slate-50 flex items-center justify-center text-slate-500">
                Tap microphone to record
            </div>
            <button 
              onClick={startRecording}
              className="flex h-12 w-12 flex-none shrink-0 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition shadow-sm active:scale-95"
            >
              <Mic className="h-5 w-5" />
            </button>
        </>
      ) : (
        <>
            <div className="flex-1 rounded-full border border-red-300 bg-red-50 px-4 py-3 flex items-center gap-2 text-red-600 font-medium">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                Recording {formatTime(duration)}
            </div>
            <button 
              onClick={stopRecording}
              className="flex h-12 w-12 flex-none shrink-0 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-900 transition shadow-sm active:scale-95"
            >
              <Square className="h-5 w-5" fill="currentColor" />
            </button>
        </>
      )}
    </div>
  );
};
