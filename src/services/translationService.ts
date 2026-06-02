import { ApiClient } from "./apiClient.ts";
import { TranslationRequest, TranslationResponse, BatchTranslationRequest, BatchTranslationResponse } from "../types/index.ts";

export class TranslationService {
  private static extractFriendlyError(err: any): string {
    let friendlyError = "Failed to translate message.";
    const errMsg = err?.message || String(err);
    
    try {
      if (errMsg.includes("{")) {
        const parsed = JSON.parse(errMsg);
        if (parsed.error) friendlyError = parsed.error;
      }
    } catch (e) {
      // Not JSON
    }

    if (
      errMsg.includes("429") || 
      errMsg.includes("quota") || 
      errMsg.includes("RESOURCE_EXHAUSTED") ||
      friendlyError.includes("429") ||
      friendlyError.includes("Quota") ||
      err?.isQuota
    ) {
      friendlyError = "API quota exceeded/Service busy. Please try again later.";
    } else if (!friendlyError || friendlyError === "Failed to translate message.") {
      friendlyError = errMsg;
    }
    
    return friendlyError;
  }

  static async translateText(req: TranslationRequest): Promise<TranslationResponse> {
    try {
      return await ApiClient.translateText(req);
    } catch (err: any) {
      throw new Error(this.extractFriendlyError(err));
    }
  }

  static async translateBatch(req: BatchTranslationRequest): Promise<BatchTranslationResponse> {
    try {
      return await ApiClient.translateBatch(req);
    } catch (err: any) {
      throw new Error(this.extractFriendlyError(err));
    }
  }
}
