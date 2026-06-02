/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

/**
 * Validates request body, query, or params against a Zod schema.
 */
export const validate = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: error.issues.map((err) => ({
            field: err.path.slice(1).join("."), // removes 'body' prefix
            message: err.message,
          })),
        });
        return;
      }
      res.status(500).json({ error: "Internal server error during validation" });
    }
  };
};

// --- Schemas ---

export const TranslateSchema = z.object({
  body: z.object({
    sourceText: z.string().min(1, "sourceText parameter is required and cannot be empty."),
    sourceLanguage: z.string(),
    sourceLanguageCode: z.string().optional(),
    targetLanguage: z.string().optional(),
    targetLanguageCode: z.string().optional(),
    receiverId: z.string().optional(),
    conversationContext: z
      .array(
        z.object({
          speaker: z.string(),
          language: z.string(),
          text: z.string(),
        })
      )
      .optional(),
    tone: z
      .enum(["neutral", "friendly", "formal", "business", "simple", "respectful", "casual"])
      .optional(),
    mode: z.enum(["normal", "business", "simple"]).optional(),
  }),
});

export const DetectLanguageSchema = z.object({
  body: z.object({
    text: z.string().min(1, "text is required for language detection."),
  }),
});

export const TranslateAudioSchema = z.object({
  body: z.object({
    audioBase64: z.string().min(1, "audioBase64 payload is required."),
    mimeType: z.string().optional().default("audio/webm"),
    targetLanguage: z.string().optional().default("English"),
    localTranscript: z.string().optional(),
  }),
});

export const TTSSchema = z.object({
  body: z.object({
    text: z.string().min(1, "text is required for speech synthesis."),
    voiceName: z
      .enum(["Puck", "Charon", "Kore", "Fenrir", "Zephyr"])
      .optional()
      .default("Kore"),
  }),
});

export const SaveSettingsSchema = z.object({
  body: z.object({
    userId: z.string().optional(),
    preferredLanguage: z.string().min(1, "preferredLanguage is required"),
    simpleMode: z.boolean(),
    privacyHistoryConsent: z.boolean(),
  }),
});

export const SaveContactSchema = z.object({
  body: z.object({
    contactId: z.string().min(1, "contactId is required"),
    name: z.string().min(1, "name is required"),
    preferredLanguage: z.string().min(1, "preferredLanguage is required"),
    tonePreference: z.enum([
      "neutral",
      "friendly",
      "formal",
      "business",
      "simple",
      "respectful",
      "casual",
    ]),
    autoTranslate: z.boolean(),
  }),
});
