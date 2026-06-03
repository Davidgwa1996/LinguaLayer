export async function generateDemoVideo(updateProgress?: (p: number) => void): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas context missing");

      // Set up Audio Context for rendering
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextCtor();
      const dest = audioCtx.createMediaStreamDestination();

      // Voiceover TTS Volume - Make it loud and clear
      const ttsGain = audioCtx.createGain();
      ttsGain.gain.value = 3.5; 
      ttsGain.connect(dest);

      // Fetch TTS Audio
      const ttsTexts = [
        "Meet LinguaLayer AI.",
        "Enable it once in Settings.",
        "Choose the language you understand.",
        "Chat naturally across languages.",
        "One person writes in English.",
        "The other reads in Mandarin Chinese.",
        "Replies appear in each user’s language.",
        "One Layer. Every Language."
      ];

      const fetchAndDecode = async (text: string) => {
        const url = `/api/tts?text=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        return await audioCtx.decodeAudioData(arrayBuffer);
      };

      const buffers = [];
      for (const text of ttsTexts) {
        if (updateProgress) updateProgress(-0.1); // indicate downloading
        let buffer;
        try {
           buffer = await fetchAndDecode(text);
        } catch (e) {
           console.error("TTS fetch failed, falling back to silent buffer", e);
           buffer = audioCtx.createBuffer(1, audioCtx.sampleRate, audioCtx.sampleRate);
        }
        buffers.push(buffer);
      }

      // Video Stream
      const fps = 30;
      const stream = canvas.captureStream(fps); 
      // Merge audio track into video stream
      const audioTracks = dest.stream.getAudioTracks();
      if (audioTracks.length > 0) {
        stream.addTrack(audioTracks[0]);
      }

      let options: any = { mimeType: 'video/webm' };
      if (MediaRecorder.isTypeSupported('video/mp4')) {
         options = { mimeType: 'video/mp4' };
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
         options = { mimeType: 'video/webm;codecs=vp8,opus' };
      }

      const recorder = new MediaRecorder(stream, options);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        audioCtx.close();
        resolve(new Blob(chunks, { type: options.mimeType || 'video/webm' }));
      };

      // Start recording before scheduling to capture immediate audio
      recorder.start();

      let recordingStartTime = audioCtx.currentTime;

      const scheduleTimes: number[] = [];
      let cTime = 0.5;
      const padding = 0.5;
      buffers.forEach((buffer) => {
        scheduleTimes.push(cTime);
        cTime += buffer.duration + padding;
      });
      const durationSeconds = cTime + 2;

      buffers.forEach((buffer, idx) => {
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(ttsGain);
        source.start(recordingStartTime + scheduleTimes[idx]);
      });
      
      const drawFrame = () => {
        const time = audioCtx.currentTime - recordingStartTime;
        if (time >= durationSeconds) {
          recorder.stop();
          return;
        }

        const w = canvas.width;
        const h = canvas.height;
        
        renderFrameContent(ctx, w, h, time, scheduleTimes);

        if (updateProgress) updateProgress(time / durationSeconds);

        requestAnimationFrame(drawFrame);
      };

      requestAnimationFrame(drawFrame);

    } catch (err) {
      reject(err);
    }
  });
}

export function renderFrameContent(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, scheduleTimes?: number[]) {
  // Use passed scene timings or fallback to default
  const t1 = scheduleTimes && scheduleTimes.length > 2 ? scheduleTimes[2] : 7;
  const t2 = scheduleTimes && scheduleTimes.length > 4 ? scheduleTimes[4] : 13;
  const t3 = scheduleTimes && scheduleTimes.length > 6 ? scheduleTimes[6] : 22;
  const t4 = scheduleTimes && scheduleTimes.length > 7 ? scheduleTimes[7] : 29;

  // Cinematic deep dark background
  const bgGradient = ctx.createLinearGradient(0, 0, 0, h);
  
  if (time >= t4) {
    bgGradient.addColorStop(0, '#020617'); // scene 5 dark
    bgGradient.addColorStop(1, '#0f172a');
  } else {
    bgGradient.addColorStop(0, '#f8fafc'); 
    bgGradient.addColorStop(1, '#e2e8f0'); 
  }
  
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, w, h);

  const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  const drawBadge = (numStr: string, x: number, y: number) => {
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.roundRect(x, y, 60, 60, 16);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(numStr, x + 30, y + 33);
    ctx.textBaseline = 'alphabetic'; // reset
  };

  const drawPhone = (x: number, y: number, wPhone: number, hPhone: number) => {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(x, y, wPhone, hPhone, 40);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(x + 10, y + 10, wPhone - 20, hPhone - 20, 30);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(x + wPhone/2 - 40, y + 18, 80, 24, 12);
    ctx.fill();
    ctx.restore();
  };

  const drawSwitch = (x: number, y: number, active: boolean) => {
    ctx.fillStyle = active ? '#3b82f6' : '#cbd5e1';
    ctx.beginPath();
    ctx.roundRect(x, y, 50, 30, 15);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + (active ? 34 : 16), y + 15, 12, 0, Math.PI * 2);
    ctx.fill();
  };

  if (time < t1) {
    // 0-t1: Scene 1
    const rawOpacity = time > t1 - 1 ? 1 - (time - (t1 - 1)) : (time < 1 ? time : 1);
    ctx.globalAlpha = Math.max(0, Math.min(1, rawOpacity));
    
    drawBadge("1", 120, 120);

    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.font = 'bold 70px -apple-system, sans-serif';
    ctx.fillText("Enable", 120, 260);
    ctx.fillText("LinguaLayer", 120, 340);
    ctx.fillText("in Settings", 120, 420);

    ctx.fillStyle = '#475569';
    ctx.font = '24px -apple-system, sans-serif';
    ctx.fillText("A built-in communication", 120, 480);
    ctx.fillText("layer that helps you", 120, 515);
    ctx.fillText("understand and be", 120, 550);
    ctx.fillText("understood—effortlessly.", 120, 585);

    drawPhone(w - 480, h/2 - 300, 320, 640);
    
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px -apple-system, sans-serif';
    ctx.fillText("Settings", w - 440, h/2 - 200);

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath(); ctx.roundRect(w - 450, h/2 - 140, 260, 150, 16); ctx.fill();
    
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px -apple-system, sans-serif';
    ctx.fillText("LinguaLayer", w - 430, h/2 - 100);
    
    drawSwitch(w - 260, h/2 - 120, time > 2);

    ctx.fillStyle = '#0f172a';
    ctx.fillText("Preferred Language", w - 430, h/2 - 20);
    ctx.fillStyle = '#64748b';
    ctx.fillText("English >", w - 240, h/2 - 20);

  } else if (time < t2) {
    // t1-t2: Scene 2
    const rawOpacity = time > t2 - 1 ? 1 - (time - (t2 - 1)) : (time < t1 + 1 ? time - t1 : 1);
    ctx.globalAlpha = Math.max(0, Math.min(1, rawOpacity));
    
    drawBadge("1", 120, 120);

    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.font = 'bold 70px -apple-system, sans-serif';
    ctx.fillText("Choose your", 120, 260);
    ctx.fillText("preferred", 120, 340);
    ctx.fillText("language", 120, 420);

    ctx.fillStyle = '#475569';
    ctx.font = '24px -apple-system, sans-serif';
    ctx.fillText("Set the language you want", 120, 480);
    ctx.fillText("to read and write in across", 120, 515);
    ctx.fillText("conversations.", 120, 550);

    drawPhone(w - 480, h/2 - 300, 320, 640);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px -apple-system, sans-serif';
    ctx.fillText("Settings", w - 440, h/2 - 200);

    // Context menu showing languages
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath(); ctx.roundRect(w - 450, h/2 - 140, 260, 60, 16); ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px -apple-system, sans-serif';
    ctx.fillText("LinguaLayer", w - 430, h/2 - 100);
    drawSwitch(w - 260, h/2 - 120, true);

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 10;
    ctx.beginPath(); ctx.roundRect(w - 450, h/2 - 60, 260, 240, 16); ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.fillStyle = '#0f172a';
    ctx.fillText("English", w - 430, h/2 - 30);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText("✓", w - 220, h/2 - 30);

    ctx.fillStyle = '#334155';
    ctx.fillText("Spanish", w - 430, h/2 + 10);
    ctx.fillText("Mandarin Chinese", w - 430, h/2 + 50);
    ctx.fillText("French", w - 430, h/2 + 90);
    ctx.fillText("Arabic", w - 430, h/2 + 130);
    ctx.fillText("Swahili", w - 430, h/2 + 170);

  } else if (time < t3) {
    const rawOpacity = time > t3 - 1 ? 1 - (time - (t3 - 1)) : (time < t2 + 1 ? time - t2 : 1);
    ctx.globalAlpha = Math.max(0, Math.min(1, rawOpacity));
    
    drawBadge("2", w/2 - 30, 60);

    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.font = 'bold 50px -apple-system, sans-serif';
    ctx.fillText("Chat naturally.", w/2, 180);
    ctx.fillStyle = '#475569';
    ctx.font = '24px -apple-system, sans-serif';
    ctx.fillText("Each in your own language.", w/2, 220);

    // Phone A
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.font = 'bold 20px -apple-system, sans-serif';
    ctx.fillText("Phone A", w/2 - 400, 300);
    ctx.fillStyle = '#475569';
    ctx.font = '16px -apple-system, sans-serif';
    ctx.fillText("Preferred Language", w/2 - 400, 325);
    ctx.fillStyle = '#0f172a';
    ctx.fillText("English", w/2 - 400, 345);

    drawPhone(w/2 - 280, 260, 240, 480);
    
    ctx.fillStyle = '#2563eb';
    ctx.beginPath(); ctx.roundRect(w/2 - 260, 400, 190, 70, 16); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.font = 'bold 16px -apple-system, sans-serif';
    ctx.fillText("Hello, can we meet", w/2 - 245, 430);
    ctx.fillText("tomorrow at 10?", w/2 - 245, 455);

    // Phone B
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.font = 'bold 20px -apple-system, sans-serif';
    ctx.fillText("Phone B", w/2 + 300, 300);
    ctx.fillStyle = '#475569';
    ctx.font = '16px -apple-system, sans-serif';
    ctx.fillText("Preferred Language", w/2 + 300, 325);
    ctx.fillStyle = '#0f172a';
    ctx.fillText("中文 (简体)", w/2 + 300, 345);

    drawPhone(w/2 + 30, 260, 240, 480);

    if (time > t2 + 2) {
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath(); ctx.roundRect(w/2 + 50, 400, 190, 70, 16); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px -apple-system, sans-serif';
      ctx.fillText("你好，我们明天", w/2 + 65, 430);
      ctx.fillText("10点见面可以吗？", w/2 + 65, 455);

      ctx.beginPath();
      ctx.moveTo(w/2 - 40, 435);
      ctx.quadraticCurveTo(w/2, 400, w/2 + 30, 435);
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

  } else if (time < t4) {
    const rawOpacity = time > t4 - 1 ? 1 - (time - (t4 - 1)) : (time < t3 + 1 ? time - t3 : 1);
    ctx.globalAlpha = Math.max(0, Math.min(1, rawOpacity));
    
    drawBadge("2", w/2 - 30, 60);

    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.font = 'bold 50px -apple-system, sans-serif';
    ctx.fillText("Replies appear instantly.", w/2, 170);
    ctx.fillStyle = '#475569';
    ctx.font = '24px -apple-system, sans-serif';
    ctx.fillText("Each person sees the conversation", w/2, 210);
    ctx.fillText("directly in their own language.", w/2, 240);

    drawPhone(w/2 - 280, 280, 240, 480);
    // Prev
    ctx.fillStyle = '#2563eb';
    ctx.beginPath(); ctx.roundRect(w/2 - 260, 360, 190, 70, 16); ctx.fill();

    drawPhone(w/2 + 30, 280, 240, 480);
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath(); ctx.roundRect(w/2 + 50, 360, 190, 70, 16); ctx.fill();

    if (time > t3 + 1.5) {
      // Reply from B
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath(); ctx.roundRect(w/2 + 70, 450, 180, 70, 16); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.font = 'bold 16px -apple-system, sans-serif';
      ctx.fillText("可以，没问题！", w/2 + 85, 480);
      ctx.fillText("明天 10 点见！", w/2 + 85, 505);

      // Connect back
      ctx.beginPath();
      ctx.moveTo(w/2 + 30, 485);
      ctx.quadraticCurveTo(w/2, 450, w/2 - 40, 485);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    if (time > t3 + 2.5) {
      // Seen by A
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath(); ctx.roundRect(w/2 - 260, 450, 200, 70, 16); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'left';
      ctx.fillText("Sure, that works for me.", w/2 - 245, 480);
      ctx.fillText("See you tomorrow at 10!", w/2 - 245, 505);
    }
  } else {
    // Scene 5
    const rawOpacity = time < t4 + 1 ? time - t4 : 1;
    ctx.globalAlpha = Math.max(0, Math.min(1, rawOpacity));

    ctx.textAlign = 'center';
    
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath(); ctx.roundRect(w/2 - 60, h/2 - 160, 120, 35, 10); ctx.fill();
    ctx.fillStyle = '#6366f1';
    ctx.beginPath(); ctx.roundRect(w/2 - 60, h/2 - 145, 120, 35, 10); ctx.fill();
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath(); ctx.roundRect(w/2 - 60, h/2 - 130, 120, 35, 10); ctx.fill();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 36px -apple-system, sans-serif';
    ctx.fillText("LinguaLayer AI", w/2, h/2 - 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px -apple-system, sans-serif';
    ctx.fillText("One Layer. Every Language.", w/2, h/2 + 50);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px -apple-system, sans-serif';
    ctx.fillText("Built into your device. Natural conversations across apps.", w/2, h/2 + 110);
  }

  ctx.globalAlpha = 1.0;
}


// Generate an actually valid audio file using MediaRecorder and AudioContext
export async function generateVoiceoverAudio(): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextCtor();
      const dest = ctx.createMediaStreamDestination();
      
      const oscillator = ctx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = 440;
      
      const gain = ctx.createGain();
      gain.gain.value = 0.1;
      
      oscillator.connect(gain);
      gain.connect(dest);
      
      const recorder = new MediaRecorder(dest.stream);
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' }); // Use webm for universal browser support
        resolve(blob);
      };
      
      recorder.start();
      oscillator.start();
      
      setTimeout(() => {
        recorder.stop();
        oscillator.stop();
        ctx.close();
      }, 500); // 500ms of audio
      
    } catch(e) {
      reject(e);
    }
  });
}
