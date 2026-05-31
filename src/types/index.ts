/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  userId: string;
  preferredLanguage: string;
  simpleMode: boolean;
  privacyHistoryConsent: boolean;
}

export interface ContactLanguageProfile {
  contactId: string;
  name: string;
  preferredLanguage: string;
  tonePreference: 'neutral' | 'friendly' | 'formal' | 'business' | 'simple' | 'respectful' | 'casual';
  autoTranslate: boolean;
}

export interface ConversationMessage {
  id: string;
  sender: 'A' | 'B';
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: string;
  simpleExplanation?: string;
  preservedTerms?: string[];
  warning?: string | null;
  otherTranslations?: Record<string, string>;
}

export interface TranslationRequest {
  sourceText: string;
  sourceLanguage: string; // "auto" or language name
  targetLanguage: string;
  userLanguage: string;
  conversationContext?: { speaker: string; language: string; text: string }[];
  tone?: 'neutral' | 'friendly' | 'formal' | 'business' | 'simple' | 'respectful' | 'casual';
  mode?: 'normal' | 'business' | 'simple';
  preserveOriginal?: boolean;
  simpleExplanation?: boolean;
}

export interface TranslationResponse {
  detectedLanguage: string;
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string;
  simpleExplanation?: string;
  toneUsed: string;
  preservedTerms: string[];
  confidence: number;
  warning: string | null;
  sensitiveContentFlag: boolean;
  otherTranslations?: Record<string, string>;
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
