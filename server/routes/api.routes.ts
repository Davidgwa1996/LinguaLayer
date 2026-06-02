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
let simulationMessages: any[] = [];
let simulationLanguages = {
  langA: "English (United States)",
  langB: "Chinese (Mandarin/Simplified)"
};

// --- In-Memory Boardroom Storage (Up to 5+ simultaneous people speaking different languages) ---
interface BoardroomUser {
  id: string;
  username: string;
  preferredLanguage: string;
  joinedAt: number;
}

interface BoardroomMessage {
  id: string;
  senderName: string;
  originalText: string;
  originalLanguage: string;
  timestamp: string;
  simpleExplanation?: string;
}

let boardroomUsers: BoardroomUser[] = [];
let boardroomMessages: BoardroomMessage[] = [];

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

router.get("/simulation/languages", (req, res) => {
  res.json(simulationLanguages);
});

router.post("/simulation/languages", (req, res) => {
  const { langA, langB } = req.body;
  if (langA) simulationLanguages.langA = langA;
  if (langB) simulationLanguages.langB = langB;
  res.json(simulationLanguages);
});

// --- Multilingual Boardroom Endpoints ---
router.get("/boardroom/users", (req, res) => {
  res.json(boardroomUsers);
});

router.post("/boardroom/users", (req, res) => {
  const { username, preferredLanguage } = req.body;
  if (!username) {
    res.status(400).json({ error: "Username is required" });
    return;
  }
  
  // Look for existing user with match name
  let user = boardroomUsers.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
  if (user) {
    user.preferredLanguage = preferredLanguage;
  } else {
    user = {
      id: "u_" + Math.random().toString(36).substring(2, 9),
      username: username.trim(),
      preferredLanguage,
      joinedAt: Date.now()
    };
    boardroomUsers.push(user);
  }
  res.json(user);
});

router.post("/boardroom/leave", (req, res) => {
  const { username } = req.body;
  if (username) {
    boardroomUsers = boardroomUsers.filter(u => u.username.toLowerCase() !== username.trim().toLowerCase());
  }
  res.json({ success: true, users: boardroomUsers });
});

router.get("/boardroom/messages", (req, res) => {
  res.json(boardroomMessages);
});

router.post("/boardroom/messages", (req, res) => {
  const { senderName, originalText, originalLanguage, simpleExplanation } = req.body;
  if (!senderName || !originalText || !originalLanguage) {
    res.status(400).json({ error: "Missing sender, message, or language context" });
    return;
  }

  const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const newMsg: BoardroomMessage = {
    id: "br_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    senderName,
    originalText,
    originalLanguage,
    timestamp: timeString,
    simpleExplanation
  };

  boardroomMessages.push(newMsg);
  res.json(newMsg);
});

router.post("/boardroom/clear", (req, res) => {
  boardroomMessages = [];
  res.json({ success: true, messages: [] });
});

// --- Translation APIs ---
router.post("/translate", validate(TranslateSchema), TranslationController.translate);
router.post("/translate-batch", TranslationController.translateBatch);
router.post("/detect-language", validate(DetectLanguageSchema), TranslationController.detectLanguage);
router.post("/translate-audio", validate(TranslateAudioSchema), TranslationController.translateAudio);
router.post("/tts", validate(TTSSchema), TranslationController.textToSpeech);

// --- User Profile Settings & Contact Matching APIs ---
router.get("/settings/:userId", SettingsController.getSettings);
router.post("/settings/:userId", validate(SaveSettingsSchema), SettingsController.saveSettings);

router.get("/contacts/:userId", SettingsController.getContacts);
router.post("/contacts/:userId", validate(SaveContactSchema), SettingsController.saveContact);

export default router;
