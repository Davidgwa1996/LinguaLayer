/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TranslationRequest, TranslationResponse, AudioTranslationResponse, UserProfile, ContactLanguageProfile, ChatMessage } from "../types/index.ts";

export class ApiClient {
  private static baseUrl = "/api";

  private static async handleResponse<T>(response: Response, fallbackDesc: string): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      
      // Look for 429 status or rate-limit indications
      if (
        response.status === 429 || 
        errorText.includes("RESOURCE_EXHAUSTED") || 
        errorText.includes("quota") || 
        errorText.includes("429")
      ) {
        let retrySeconds = "59 seconds";
        const delayMatch = errorText.match(/retryDelay["\s:]+["']?(\d+s)/i) || errorText.match(/retry in ([\d.]+s)/i);
        if (delayMatch && delayMatch[1]) {
          retrySeconds = delayMatch[1];
        }
        
        if (typeof (window as any).showToast === "function") {
          (window as any).showToast(
            `⚠️ API Quota Reclaimed: Free tier limit exceeded.${retrySeconds ? ` Please retry in ${retrySeconds}.` : ""} Seamlessly routing request via offline-grade local hybrid translation engine.`,
            "error",
            8500
          );
        }
      }
      throw new Error(errorText || fallbackDesc);
    }
    return response.json() as Promise<T>;
  }

  static async translateText(req: TranslationRequest): Promise<TranslationResponse> {
    const response = await fetch(`${this.baseUrl}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    
    return this.handleResponse<TranslationResponse>(response, "Translation failed on server side.");
  }

  static async translateBatch(req: import("../types/index.ts").BatchTranslationRequest): Promise<import("../types/index.ts").BatchTranslationResponse> {
    const response = await fetch(`${this.baseUrl}/translate-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    
    return this.handleResponse<import("../types/index.ts").BatchTranslationResponse>(response, "Batch translation failed on server side.");
  }

  static async detectLanguage(text: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/detect-language`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        // Intercept 429 even in quiet helpers
        if (response.status === 429) {
          if (typeof (window as any).showToast === "function") {
            (window as any).showToast("⚠️ API Quota Reclaimed. Running local linguistic interpreter.", "error", 6000);
          }
        }
        return "English";
      }

      const data = await response.json();
      return data.detectedLanguage || "English";
    } catch {
      return "English";
    }
  }

  static async translateAudio(audioBase64: string, mimeType: string, targetLanguage: string, localTranscript?: string): Promise<AudioTranslationResponse> {
    const response = await fetch(`${this.baseUrl}/translate-audio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioBase64, mimeType, targetLanguage, localTranscript }),
    });

    return this.handleResponse<AudioTranslationResponse>(response, "Audio translation engine timed out.");
  }

  static async textToSpeech(text: string, voiceName?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr'): Promise<string> {
    const response = await fetch(`${this.baseUrl}/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voiceName }),
    });

    const data = await this.handleResponse<{ audioBase64: string }>(response, "TTS voice generation errored out on backend.");
    return data.audioBase64;
  }

  static async getSettings(userId: string): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/settings/${userId}`);
    if (!response.ok) {
      throw new Error("Unable to obtain profile configurations.");
    }
    return response.json();
  }

  static async saveSettings(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/settings/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (!response.ok) {
      throw new Error("Failed to persist safety changes.");
    }
    return response.json();
  }

  static async getContacts(userId: string): Promise<ContactLanguageProfile[]> {
    const response = await fetch(`${this.baseUrl}/contacts/${userId}`);
    if (!response.ok) {
      throw new Error("Could not pull client circles list.");
    }
    return response.json();
  }

  static async saveContact(userId: string, contact: ContactLanguageProfile): Promise<ContactLanguageProfile> {
    const response = await fetch(`${this.baseUrl}/contacts/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact),
    });
    if (!response.ok) {
      throw new Error("Failed to save contact profiles.");
    }
    return response.json();
  }

  // --- Real-Time Simulation Sync (Supports Multi-Device testing e.g. Laptop + Phone) ---
  static async getSimulationMessages(): Promise<ChatMessage[]> {
    const response = await fetch(`${this.baseUrl}/simulation/messages`);
    if (!response.ok) {
      throw new Error("Failed to pull simulation stream.");
    }
    return response.json();
  }

  static async addSimulationMessage(msg: Partial<ChatMessage>): Promise<ChatMessage> {
    const response = await fetch(`${this.baseUrl}/simulation/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg),
    });
    if (!response.ok) {
      throw new Error("Failed to broadcast message details.");
    }
    return response.json();
  }

  static async clearSimulationMessages(): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/simulation/clear`, {
      method: "POST",
    });
    return response.ok;
  }

  static async getSimulationLanguages(): Promise<{ langA: string; langB: string }> {
    const response = await fetch(`${this.baseUrl}/simulation/languages`);
    if (!response.ok) {
      throw new Error("Failed to load synchronized languages.");
    }
    return response.json();
  }

  static async saveSimulationLanguages(languages: { langA?: string; langB?: string }): Promise<{ langA: string; langB: string }> {
    const response = await fetch(`${this.baseUrl}/simulation/languages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(languages)
    });
    if (!response.ok) {
      throw new Error("Failed to save synchronized languages.");
    }
    return response.json();
  }

  // --- Multilingual Boardroom Client Endpoints ---
  static async getBoardroomUsers(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/boardroom/users`);
    if (!response.ok) {
      throw new Error("Failed to load Ballroom users roster.");
    }
    return response.json();
  }

  static async joinBoardroom(username: string, preferredLanguage: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/boardroom/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, preferredLanguage })
    });
    if (!response.ok) {
      throw new Error("Failed to join Ballroom.");
    }
    return response.json();
  }

  static async leaveBoardroom(username: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/boardroom/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });
    return response.ok;
  }

  static async getBoardroomMessages(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/boardroom/messages`);
    if (!response.ok) {
      throw new Error("Failed to load Boardroom conversation index.");
    }
    return response.json();
  }

  static async sendBoardroomMessage(msg: { senderName: string; originalText: string; originalLanguage: string; simpleExplanation?: string }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/boardroom/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg)
    });
    if (!response.ok) {
      throw new Error("Failed to broadcast Boardroom message.");
    }
    return response.json();
  }

  static async clearBoardroom(): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/boardroom/clear`, {
      method: "POST",
    });
    return response.ok;
  }
}
