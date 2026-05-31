/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class AudioClientService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  async startRecording(onChunk?: (base64Chunk: string, index: number) => void): Promise<void> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Microphone access is not supported by your browser or inside this view.");
    }

    try {
      this.audioChunks = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine best audio mime type supported
      let options = { mimeType: "audio/webm" };
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        options = { mimeType: "audio/ogg" };
      }
      if (!MediaRecorder.isTypeSupported("audio/ogg")) {
        // Fallback to standard if others are missing
        options = { mimeType: "" };
      }

      this.mediaRecorder = new MediaRecorder(stream, options);
      
      let chunkIndex = 0;
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          
          if (onChunk) {
            const currentIdx = chunkIndex++;
            const reader = new FileReader();
            reader.readAsDataURL(event.data);
            reader.onloadend = () => {
              const resultData = reader.result as string;
              const base64Part = resultData.split(",")[1];
              if (base64Part) {
                onChunk(base64Part, currentIdx);
              }
            };
          }
        }
      };

      // Request data chunks every 1500ms to allow incremental pipeline translation streaming
      this.mediaRecorder.start(1500);
    } catch (err) {
      console.error("MIC initialization error:", err);
      throw new Error(err instanceof Error ? err.message : "Microphone permissions denied.");
    }
  }

  async stopRecording(): Promise<{ base64: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("No active Recording found."));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const mimeType = this.mediaRecorder?.mimeType || "audio/webm";
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });
          
          // Blob to base64 conversion
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const resultData = reader.result as string;
            // Base64 chunk comes after the mime header: "data:audio/webm;base64,..."
            const base64Content = resultData.split(",")[1];
            
            // Turn off microphone tracks to release hardware resource
            this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
            
            resolve({
              base64: base64Content,
              mimeType: mimeType
            });
          };
        } catch (e) {
          reject(e);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  static playBase64Audio(base64: string, mimeType: string = "audio/wav"): void {
    try {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play().catch(e => {
        console.warn("Auto-play permission block:", e);
      });
    } catch (e) {
      console.error("Fails to output play audio:", e);
    }
  }
}
