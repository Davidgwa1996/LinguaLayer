/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Modality } from "@google/genai";
import { getCleanApiKey } from "./geminiTranslation.service.ts";

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const key = getCleanApiKey();
    aiInstance = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

export class TextToSpeechService {
  static async textToSpeech(text: string, voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' = 'Kore'): Promise<string> {
    const key = getCleanApiKey();
    if (!key) {
      // Return a dummy empty string or mock base64 audio block if key is missing
      throw new Error("GEMINI_API_KEY is not defined. Cannot complete dynamic TTS.");
    }

    const ai = getAI();
    try {
      // Call gemini-3.1-flash-tts-preview as mentioned in the skill guidelines
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("No audio payload returned from Gemini TTS engine.");
      }
      return base64Audio;
    } catch (error) {
      console.error("Gemini TTS engine error:", error);
      throw error;
    }
  }
}
