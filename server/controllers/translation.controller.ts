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
        targetLanguage,
        userLanguage,
        conversationContext,
        tone,
        mode,
        preserveOriginal,
        simpleExplanation,
      });

      // Business mode safety checks or extra logs parsing
      if (mode === "business") {
        const extraPreserved = GlossaryService.verifyGlossary(sourceText, translation.translatedText);
        translation.preservedTerms = [...new Set([...translation.preservedTerms, ...extraPreserved])];
      }

      // Live safety scanner context
      const safetyResult = SafetyFilterService.scan(sourceText);
      if (safetyResult.flagged && !translation.warning) {
        translation.warning = safetyResult.reason;
        translation.sensitiveContentFlag = true;
      }

      // Populate otherTranslations for the game/simulator's multi-lingual casting
      const targetLangs = ["Chinese", "French", "Spanish", "Swahili", "Arabic", "English"];
      const otherTranslations: Record<string, string> = {};
      for (const tgt of targetLangs) {
        if (tgt.toLowerCase() !== (targetLanguage || "Chinese").toLowerCase()) {
          otherTranslations[tgt] = GeminiTranslationService.getOfflineTranslationForLang(sourceText, tgt);
        } else {
          otherTranslations[tgt] = translation.translatedText;
        }
      }
      (translation as any).otherTranslations = otherTranslations;

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
      const { audioBase64, mimeType, targetLanguage } = req.body;

      const result = await AudioTranscriptionService.translateAudio(
        audioBase64,
        mimeType,
        targetLanguage
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
