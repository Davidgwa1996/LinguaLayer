/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  id?: "dave" | "peter" | string;
  name?: string;
  userId?: string;
  preferredLanguage: string;
  languageCode?: string;
  simpleModeEnabled?: boolean;
  voiceModeEnabled?: boolean;
  privacyHistoryConsent?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactLanguageProfile {
  id?: string;
  contactId?: string;
  contactName?: string;
  name?: string; // backwards compatibility
  preferredLanguage: string;
  languageCode: string;
  tonePreference?: 'neutral' | 'friendly' | 'formal' | 'business' | 'simple' | 'respectful' | 'casual';
  autoTranslate?: boolean;
  lastUsedAt?: string;
}

export interface Conversation {
  id?: string;
  participantIds: string[];
  createdAt: string;
  updatedAt: string;
  mode?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  originalText: string;
  originalLanguage: string;
  originalLanguageCode: string;
  originalLanguageName?: string;
  senderLanguageCode?: string;
  senderLanguageName?: string;
  roomId?: string;
  createdAt: string;
  type?: 'text' | 'voice';
  voiceUrl?: string;
  voicePath?: string;
  voiceDurationMs?: number;
  transcript?: string;
  pinned?: boolean;
  reactions?: Record<string, string[]>;
  readBy?: string[];
  translations: Record<string, {
    targetLanguage: string;
    targetLanguageCode: string;
    translatedText: string;
    confidence?: number;
    warning?: string | null;
    ambiguity?: string | null;
    status?: "pending" | "ready" | "failed";
  }>;
}

export interface TranslationRequest {
  sourceText: string;
  sourceLanguage: string;
  sourceLanguageCode?: string;
  targetLanguage: string;
  targetLanguageCode?: string;
  receiverId?: string;
  userLanguage?: string;
  tone?: 'neutral' | 'friendly' | 'formal' | 'business' | 'simple' | 'respectful' | 'casual';
  mode?: 'normal' | 'business' | 'simple';
  preserveOriginal?: boolean;
  simpleExplanation?: boolean;
  conversationContext?: { speaker: string; language: string; text: string }[];
}

export interface BatchTranslationRequestItem {
  id: string; // Message ID or temporary ID
  sourceText: string;
  sourceLanguageCode: string;
  sourceLanguage?: string;
  targetLanguageCode: string;
  targetLanguage?: string;
}

export interface BatchTranslationRequest {
  items: BatchTranslationRequestItem[];
  mode?: "normal" | "simple";
}

export interface BatchTranslationResponse {
  results: Array<{
    id: string;
    translatedText: string;
    confidence: number;
    targetLanguageCode: string;
    warning?: string | null;
    ambiguity?: string | null;
  }>;
}

export interface TranslationResponse {
  detectedSourceLanguage: string;
  detectedSourceLanguageCode: string;
  targetLanguage: string;
  targetLanguageCode: string;
  translatedText: string;
  confidence: number;
  warning: string | null;
  simpleExplanation?: string;
  preservedTerms?: string[];
  sensitiveContentFlag?: boolean;
  detectedLanguage?: string;
  toneUsed?: string;
  ambiguity?: string | null;
}

export interface AudioTranslationResponse {
  detectedLanguage: string;
  transcript: string;
  targetLanguage: string;
  translatedText: string;
  emotionDetected: string;
  confidence: number;
  warning: string | null;
  audioOutputUrl: string | null;
}

export interface BoardroomUser {
  id: string;
  username: string;
  preferredLanguage: string;
  joinedAt: number;
}

export interface BoardroomMessage {
  id: string;
  senderName: string;
  originalText: string;
  originalLanguage: string;
  timestamp: string;
  simpleExplanation?: string;
}
