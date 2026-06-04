import React, { useState, useEffect, useRef } from 'react';
import { Play, Download, Pause, RotateCcw, Volume2, VolumeX, Activity } from 'lucide-react';
import { generateDemoVideo, renderFrameContent } from '../services/demoVideoService';

export function VideoDemoMode() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Demo ready");
  const [isMuted, setIsMuted] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Audio state
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<AudioBuffer[]>([]);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  const DURATION = 35 * 1000;
  const CAPTION_SCHEDULE = [
    { time: 0, text: "Meet LinguaLayer AI." },
    { time: 0, text: "Enable it once in Settings." },
    { time: 0, text: "Choose the language you understand." },
    { time: 0, text: "Chat naturally across languages." },
    { time: 0, text: "One person writes in English." },
    { time: 0, text: "The other reads in Mandarin Chinese." },
    { time: 0, text: "Replies appear in each user’s language." },
    { time: 0, text: "One Layer. Every Language." }
  ];

  const [duration, setDuration] = useState(35000);
  const [scheduleData, setScheduleData] = useState(() => CAPTION_SCHEDULE.map(c => ({...c, duration: 3})));
  const [sceneTimings, setSceneTimings] = useState<number[]>([0.5, 7.5, 13.5, 22.5, 29.5]);

  // Preload audio buffers globally so we don't fetch on every play
  useEffect(() => {
    const initAudio = async () => {
      try {
        const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextCtor();
        audioCtxRef.current = ctx;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 3.5;
        gainNode.connect(ctx.destination);
        gainNodeRef.current = gainNode;

        const fetchAndDecode = async (text: string) => {
          const url = `/api/tts?text=${encodeURIComponent(text)}`;
          const res = await fetch(url);
          const arrayBuffer = await res.arrayBuffer();
          return await ctx.decodeAudioData(arrayBuffer);
        };

        const buffers = [];
        let cTime = 0.5;
        const padding = 0.5;
        const newSchedule = [];
        const timings = [];
        
        for (let i = 0; i < CAPTION_SCHEDULE.length; i++) {
          const cap = CAPTION_SCHEDULE[i];
          const buf = await fetchAndDecode(cap.text);
          buffers.push(buf);
          timings.push(cTime);
          newSchedule.push({ ...cap, time: cTime, duration: buf.duration });
          cTime += buf.duration + padding;
        }
        
        audioBuffersRef.current = buffers;
        setScheduleData(newSchedule);
        
        const mappedSceneTimings = [
           timings[0],
           timings[2] || 7.5,
           timings[4] || 13.5,
           timings[6] || 22.5,
           timings[7] || 29.5
        ];
        setSceneTimings(mappedSceneTimings);
        
        setDuration((cTime + 2) * 1000);
        setAudioReady(true);
      } catch (err) {
        console.error("Audio preloading failed:", err);
      }
    };
    initAudio();

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const stopAllAudio = () => {
    activeSourcesRef.current.forEach(source => {
      try { source.stop(); source.disconnect(); } catch (e) {}
    });
    activeSourcesRef.current = [];
  };

  const startAudioPlayback = async (startTimeOffset: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();

    stopAllAudio(); // safety

    // Schedule VO
    audioBuffersRef.current.forEach((buffer, idx) => {
      const scheduleTime = scheduleData[idx].time;
      const bufferDuration = buffer.duration;

      if (scheduleTime >= startTimeOffset) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(gainNodeRef.current!);
        const playTime = ctx.currentTime + (scheduleTime - startTimeOffset);
        source.start(playTime);
        activeSourcesRef.current.push(source);
      } else if (scheduleTime + bufferDuration > startTimeOffset) {
        // start midway
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(gainNodeRef.current!);
        const rawOffset = (startTimeOffset - scheduleTime);
        source.start(ctx.currentTime, rawOffset);
        activeSourcesRef.current.push(source);
      }
    });
  };

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(isMuted ? 0 : 3.5, audioCtxRef.current!.currentTime, 0.1);
    }
  }, [isMuted]);

  useEffect(() => {
    let animationFrameId: number;
    let startTime: number;

    const render = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const currentProgress = Math.min(elapsed / duration, 1);
      
      setProgress(currentProgress);
      drawCanvas(currentProgress);

      if (currentProgress < 1 && isPlaying) {
        animationFrameId = requestAnimationFrame(render);
      } else if (currentProgress >= 1) {
        setIsPlaying(false);
        setProgress(1);
        stopAllAudio();
      }
    };

    if (isPlaying) {
      startTime = performance.now() - (progress * duration);
      animationFrameId = requestAnimationFrame(render);
      startAudioPlayback(progress * (duration / 1000));
    } else {
      stopAllAudio();
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying]); // only restart on play state change, not progress during play

  const togglePlayWithSound = () => {
    if (progress >= 1) {
      setProgress(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const setTimeProgress = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const p = (e.clientX - rect.left) / rect.width;
    const clampedP = Math.max(0, Math.min(1, p));
    setProgress(clampedP);
    if (!isPlaying) {
      drawCanvas(clampedP);
    } else {
      // Re-trigger play to resync audio
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 50);
    }
  };

  const currentSeconds = progress * (duration / 1000);
  const activeCaption = scheduleData.find((c, i, arr) => {
    const nextTime = arr[i+1]?.time || (duration / 1000);
    return currentSeconds >= c.time && currentSeconds < nextTime;
  });

  const drawCanvas = (p: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const time = p * (duration / 1000); 
    
    renderFrameContent(ctx, w, h, time, sceneTimings);
  };

  const handleDownloadVideo = async () => {
    setStatus("Generating HD video (0%)...");
    try {
      const updateProgress = (p: number) => {
        if (p < 0) setStatus("Fetching pristine voice audio...");
        else setStatus(`Generating HD video (${Math.floor(p * 100)}%)...`);
      };

      const blob = await generateDemoVideo(updateProgress);
      if (!blob || blob.size === 0) throw new Error("Empty blob generated");

      setStatus("Finalizing download...");
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = blob.type.includes('mp4') ? 'LinguaLayer_AI_Demo.mp4' : 'LinguaLayer_AI_Demo.webm';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus("Download perfectly generated");
    } catch (e) {
      console.error(e);
      setStatus("Demo file could not be generated. Please try again.");
    }
  };

  useEffect(() => { drawCanvas(progress); }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">LinguaLayer Video Demo</h2>
        <p className="text-slate-600 text-lg">Watch the premium ad demonstrating the Universal Language Layer.</p>
        <div className="text-sm font-semibold text-emerald-700 bg-emerald-100 px-4 py-2 inline-block rounded-full shadow-sm animate-pulse">
          {status}
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative aspect-video flex flex-col justify-center items-center group ring-4 ring-indigo-500/20">
        <canvas 
          ref={canvasRef} 
          width={1280} 
          height={720} 
          className={`w-full h-full object-contain transition-transform duration-500 ${isPlaying ? 'scale-[1.02]' : 'scale-100'}`}
        />
        
        {/* Caption Overlay */}
        <div className="absolute bottom-12 md:bottom-16 left-0 w-full px-2 md:px-12 z-10 pointer-events-none transition-all duration-300 flex flex-col justify-end items-center pb-4">
           {activeCaption && (
             <div className="bg-black/85 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-2xl backdrop-blur-md text-xs sm:text-sm md:text-base font-medium max-w-[95%] md:max-w-xl text-center animate-fade-in mx-auto border-b-2 border-indigo-500">
               {activeCaption.text}
             </div>
           )}
        </div>

        {/* Playback Control Bar */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 pb-4 px-4 md:px-8 flex items-center gap-3 md:gap-4 z-20">
          <button 
            onClick={togglePlayWithSound}
            className="text-white hover:text-indigo-400 transition transform hover:scale-110 active:scale-95"
            aria-label="Play or Pause"
            disabled={!audioReady}
          >
            {isPlaying ? <Pause className="w-8 h-8"/> : progress >= 1 ? <RotateCcw className="w-8 h-8"/> : <Play className="w-8 h-8"/>}
          </button>
          
          <div className="flex-1 group/progress cursor-pointer h-6 flex items-center relative" onClick={setTimeProgress}>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all" style={{ width: `${progress * 100}%` }} />
            </div>
            {/* Scrubber handle */}
            <div 
              className="absolute h-4 w-4 bg-white rounded-full shadow border-2 border-indigo-500 top-1 opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `calc(${progress * 100}% - 8px)` }}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white/80 font-mono text-sm">
              0:{Math.floor(progress * (duration / 1000)).toString().padStart(2, '0')} / 0:{Math.floor(duration / 1000).toString().padStart(2, '0')}
            </span>
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="text-white hover:text-indigo-400 transition ml-2 relative"
            >
              {isMuted ? <VolumeX className="w-6 h-6"/> : <Volume2 className="w-6 h-6"/>}
              {isPlaying && !isMuted && <Activity className="w-4 h-4 absolute -top-2 -right-2 text-emerald-400 animate-pulse"/>}
            </button>
          </div>
        </div>
        
        {/* Large Play Overlay (disappears when playing) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-600/90 text-white rounded-full flex items-center justify-center shadow-xl backdrop-blur-md">
               {progress >= 1 ? <RotateCcw className="w-10 h-10 md:w-12 md:h-12" /> : <Play className="w-10 h-10 md:w-12 md:h-12 ml-1 md:ml-2" />}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <button 
          onClick={handleDownloadVideo}
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-indigo-700 transition shadow-xl hover:shadow-indigo-500/20 active:scale-95 text-lg"
        >
          <Download className="w-6 h-6"/>
          Download Full HD Ad Video
        </button>
      </div>
    </div>
  );
}
