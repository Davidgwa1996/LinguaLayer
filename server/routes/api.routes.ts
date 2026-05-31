/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from "express";
import { TranslationController } from "../controllers/translation.controller.ts";
import { SettingsController } from "../controllers/settings.controller.ts";
import {
  validate,
  TranslateSchema,
  DetectLanguageSchema,
  TranslateAudioSchema,
  TTSSchema,
  SaveSettingsSchema,
  SaveContactSchema,
} from "../middleware/validation.middleware.ts";

const router = Router();

// --- In-Memory Simulation Storage (Supports simultaneous laptop/mobile testing) ---
let simulationMessages: any[] = [
  {
    id: "m0",
    sender: "A",
    originalText: "I want to buy some high quality building supplies.",
    translatedText: "我想购买一些高质量的建筑材料。",
    sourceLanguage: "English (United States)",
    targetLanguage: "Chinese (Mandarin/Simplified)",
    timestamp: "11:30 AM",
    simpleExplanation: "The person is looking to buy building tools."
  },
  {
    id: "m1",
    sender: "B",
    originalText: "我们可以送货上门吗？",
    translatedText: "Can we deliver to your doorstep?",
    sourceLanguage: "Chinese (Mandarin/Simplified)",
    targetLanguage: "English (United States)",
    timestamp: "11:31 AM",
    simpleExplanation: "They are asking about shipping arrangements."
  }
];

router.get("/simulation/messages", (req, res) => {
  res.json(simulationMessages);
});

router.post("/simulation/messages", (req, res) => {
  const newMsg = req.body;
  // Prevent duplicate ID insertion
  if (!simulationMessages.some(m => m.id === newMsg.id)) {
    simulationMessages.push(newMsg);
  }
  res.json(newMsg);
});

router.post("/simulation/clear", (req, res) => {
  simulationMessages = [];
  res.json({ success: true, messages: [] });
});

// --- Translation APIs ---
router.post("/translate", validate(TranslateSchema), TranslationController.translate);
router.post("/detect-language", validate(DetectLanguageSchema), TranslationController.detectLanguage);
router.post("/translate-audio", validate(TranslateAudioSchema), TranslationController.translateAudio);
router.post("/tts", validate(TTSSchema), TranslationController.textToSpeech);

// --- User Profile Settings & Contact Matching APIs ---
router.get("/settings/:userId", SettingsController.getSettings);
router.post("/settings/:userId", validate(SaveSettingsSchema), SettingsController.saveSettings);

router.get("/contacts/:userId", SettingsController.getContacts);
router.post("/contacts/:userId", validate(SaveContactSchema), SettingsController.saveContact);

export default router;
