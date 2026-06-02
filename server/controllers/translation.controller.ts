/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from "express";
import { GeminiTranslationService } from "../services/geminiTranslation.service.ts";
import { LanguageDetectionService } from "../services/languageDetection.service.ts";
import { AudioTranscriptionService } from "../services/audioTranscription.service.ts";
import { TextToSpeechService } from "../services/textToSpeech.service.ts";
import { GlossaryService } from "../services/glossary.service.ts";
import { SafetyFilterService } from "../services/safetyFilter.service.ts";

export class TranslationController {
  /**
   * Handle text translation with context, tone, mode, safety scanning and glossary
   */
  static async translate(req: Request, res: Response): Promise<void> {
    try {
      const {
        sourceText,
        sourceLanguage,
        targetLanguage,
        userLanguage,
        conversationContext,
        tone,
        mode,
        preserveOriginal,
        simpleExplanation,
      } = req.body;

      // Execute translation via service
      const translation = await GeminiTranslationService.translateText({
        sourceText,
        sourceLanguage,
        sourceLanguageCode: req.body.sourceLanguageCode,
        targetLanguage,
        targetLanguageCode: req.body.targetLanguageCode,
        conversationContext,
        tone,
        mode,
      });

      // Live safety scanner context
      const safetyResult = SafetyFilterService.scan(sourceText);
      if (safetyResult.flagged && !translation.warning) {
        translation.warning = safetyResult.reason;
      }

      res.json(translation);
    } catch (error: any) {
      console.error("Translation Endpoint Exception:", error);
      const isQuota = error?.message?.includes("429") || error?.message?.includes("Quota exceeded") || error?.message?.includes("RESOURCE_EXHAUSTED");
      res.status(isQuota ? 429 : 500).json({
        error: "Translation failed",
        info: error instanceof Error ? error.message : "Unknown engine mismatch",
        isQuota
      });
    }
  }

  static async translateBatch(req: Request, res: Response): Promise<void> {
    try {
      const { items, mode } = req.body;
      if (!items || !Array.isArray(items)) {
        res.status(400).json({ error: "Invalid batch request format" });
        return;
      }
      
      const results = await Promise.all(items.map(async (item) => {
        try {
          const translation = await GeminiTranslationService.translateText({
            sourceText: item.sourceText,
            sourceLanguage: item.sourceLanguage || "Unknown",
            sourceLanguageCode: item.sourceLanguageCode,
            targetLanguage: item.targetLanguage || "English",
            targetLanguageCode: item.targetLanguageCode,
            mode: mode as any
          });
          
          const safetyResult = SafetyFilterService.scan(item.sourceText);
          if (safetyResult.flagged && !translation.warning) {
            translation.warning = safetyResult.reason;
          }
          
          return {
            id: item.id,
            translatedText: translation.translatedText,
            confidence: translation.confidence,
            targetLanguageCode: item.targetLanguageCode,
            warning: translation.warning,
            ambiguity: translation.ambiguity
          };
        } catch (e: any) {
          console.error("Batch item translation failed:", e);
          return {
            id: item.id,
            translatedText: "Translation failed",
            confidence: 0,
            targetLanguageCode: item.targetLanguageCode,
            warning: "Individual translation failed"
          };
        }
      }));
      
      res.json({ results });
    } catch (error: any) {
      console.error("Batch Translation Endpoint Exception:", error);
      const isQuota = error?.message?.includes("429") || error?.message?.includes("Quota exceeded") || error?.message?.includes("RESOURCE_EXHAUSTED");
      res.status(isQuota ? 429 : 500).json({
        error: "Batch translation failed",
        isQuota
      });
    }
  }

  /**
   * Handle language detection for raw text strings
   */
  static async detectLanguage(req: Request, res: Response): Promise<void> {
    try {
      const { text } = req.body;
      const detected = await LanguageDetectionService.detect(text);
      res.json({ detectedLanguage: detected });
    } catch (error: any) {
      console.error("Detect Language Exception:", error);
      const isQuota = error?.message?.includes("429") || error?.message?.includes("Quota exceeded") || error?.message?.includes("RESOURCE_EXHAUSTED");
      res.status(isQuota ? 429 : 500).json({ error: "Language detection failed", isQuota });
    }
  }

  /**
   * Handle audio note translations (base64 audio -> transcription and translation via Gemini)
   */
  static async translateAudio(req: Request, res: Response): Promise<void> {
    try {
      const { audioBase64, mimeType, targetLanguage, localTranscript } = req.body;

      const result = await AudioTranscriptionService.translateAudio(
        audioBase64,
        mimeType,
        targetLanguage,
        localTranscript
      );
      res.json(result);
    } catch (error: any) {
      console.error("Audio Translation Exception:", error);
      const isQuota = error?.message?.includes("429") || error?.message?.includes("Quota exceeded") || error?.message?.includes("RESOURCE_EXHAUSTED");
      res.status(isQuota ? 429 : 500).json({
        error: "Audio translation failed",
        details: error instanceof Error ? error.message : "Invalid audio decoding",
        isQuota
      });
    }
  }

  /**
   * Handle text-to-speech generation using Gemini TTS
   */
  static async textToSpeech(req: Request, res: Response): Promise<void> {
    try {
      const { text, voiceName } = req.body;

      const base64Audio = await TextToSpeechService.textToSpeech(text, voiceName);
      res.json({ audioBase64: base64Audio });
    } catch (error: any) {
      console.error("TTS Exception:", error);
      const isQuota = error?.message?.includes("429") || error?.message?.includes("Quota exceeded") || error?.message?.includes("RESOURCE_EXHAUSTED");
      res.status(isQuota ? 429 : 500).json({
        error: "TTS Generation failed",
        details: error instanceof Error ? error.message : "Underlying voice model timeout",
        isQuota
      });
    }
  }
}
