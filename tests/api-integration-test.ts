/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GeminiTranslationService } from "../server/services/geminiTranslation.service.ts";
import { GlossaryService } from "../server/services/glossary.service.ts";
import { SafetyFilterService } from "../server/services/safetyFilter.service.ts";
import { SettingsStoreService } from "../server/services/settingsStore.service.ts";
import { AudioTranscriptionService } from "../server/services/audioTranscription.service.ts";
import { TextToSpeechService } from "../server/services/textToSpeech.service.ts";

/**
 * LinguaLayer AI Automated Test Harness for Stage 3
 */
async function runIntegrationTests() {
  console.log("=================================================");
  console.log("   LinguaLayer AI API & Service Integration Tests");
  console.log("=================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] - ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] - ${testName}`);
      if (detail) console.error(`   Detail: ${detail}`);
      failed++;
    }
  }

  // --- Test 1: Safety Filter Triggering on High Stakes Text ---
  try {
    const textNormal = "Hello my friend, let's meet up today for some tea.";
    const scanNormal = SafetyFilterService.scan(textNormal);
    assert(!scanNormal.flagged, "Safety Filter: should not flag everyday casual requests");

    const textEmergency = "We need an emergency doctor, please send an ambulance to hospital!";
    const scanEmergency = SafetyFilterService.scan(textEmergency);
    assert(scanEmergency.flagged, "Safety Filter: should flag high-stakes medical/emergency context");
    assert(
      !!scanEmergency.reason?.includes("doctor"),
      "Safety Filter: reasons mention specific key terms matches"
    );
  } catch (err: any) {
    assert(false, "Safety Filter Exception", err.message);
  }

  // --- Test 2: Business Glossary Terms Conservation ---
  try {
    const originalText = "Your final order receipt with invoice ID-4422 under package pkg-987 totals 120.50 USD.";
    const translatedText = "您的最终订单收据，发票 ID-4422 在包装包 pkg-987 下共计 120.50 美元。";

    const preserved = GlossaryService.verifyGlossary(originalText, translatedText);
    
    assert(preserved.includes("120.50"), "Business Glossary: preserves and identifies numeric balances");
    assert(preserved.includes("ID-4422"), "Business Glossary: preserves and identifies tracking and invoice IDs");
    assert(preserved.includes("pkg-987"), "Business Glossary: preserves package alphanumeric definitions");
  } catch (err: any) {
    assert(false, "Glossary Service Exception", err.message);
  }

  // --- Test 3: Settings Store Management ---
  try {
    const testUserId = "user-test-999";
    const initialSettings = SettingsStoreService.getSettings(testUserId);
    assert(initialSettings.preferredLanguage === "English", "Settings: defaults to English for new profiles");

    SettingsStoreService.saveSettings(testUserId, {
      preferredLanguage: "Spanish",
      simpleMode: true,
    });
    const updatedSettings = SettingsStoreService.getSettings(testUserId);
    assert(updatedSettings.preferredLanguage === "Spanish", "Settings: updates values properly");
    assert(updatedSettings.simpleMode === true, "Settings: keeps boolean attributes updated");
  } catch (err: any) {
    assert(false, "Settings Store Exception", err.message);
  }

  // --- Test 4: Contacts Association Store ---
  try {
    const testUserId = "user-test-999";
    const initialContactsList = SettingsStoreService.getContacts(testUserId);
    assert(initialContactsList.length === 0, "Contacts: default lists are empty for new profiles");

    const sampleProfile = {
      contactId: "c_test_01",
      name: "Gillian Alcaraz",
      preferredLanguage: "Portuguese",
      tonePreference: "friendly" as const,
      autoTranslate: true,
    };

    SettingsStoreService.saveContact(testUserId, sampleProfile);
    const updatedContactsList = SettingsStoreService.getContacts(testUserId);
    assert(updatedContactsList.length === 1, "Contacts: saves contact structure successfully");
    assert(updatedContactsList[0].name === "Gillian Alcaraz", "Contacts: retrieves contact detail parameters");
  } catch (err: any) {
    assert(false, "Contacts Service Exception", err.message);
  }

  // --- Test 5: Gemini Translation Service Fail-Safe (API Key check) ---
  try {
    const translationResult = await GeminiTranslationService.translateText({
      sourceText: "This is a quick verification run.",
      sourceLanguage: "auto",
      targetLanguage: "Swahili",
      userLanguage: "English",
    });

    assert(!!translationResult, "Gemini Translation Interface: completes processing requests");
    if (!process.env.GEMINI_API_KEY) {
      assert(
        translationResult.translatedText.includes("[Mock Translation"),
        "Gemini Translation Fallback: provides structured mock translations smoothly when API keys are absent"
      );
    } else {
      assert(
        !translationResult.translatedText.includes("[Mock Translation"),
        "Gemini Translation Model: completes real translation utilizing configured secrets"
      );
    }
  } catch (err: any) {
    assert(false, "Translation Service execution failed", err.message);
  }

  // --- Test 6: Audio Transcription Service & Fallback ---
  try {
    const mockAudioBase64 = "UklGRu3+AABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YfX+AAAA";
    const result = await AudioTranscriptionService.translateAudio(
      mockAudioBase64,
      "audio/webm",
      "Spanish"
    );

    assert(!!result, "Audio Transcription Service: executes successfully");
    if (!process.env.GEMINI_API_KEY) {
      assert(
        result.translatedText.includes("[Mock Translation"),
        "Audio Transcription Fallback: successfully returns mock translation in absence of API keys"
      );
    } else {
      assert(
        result.confidence > 0,
        "Audio Transcription Model: live model processed audio block successfully"
      );
    }
  } catch (err: any) {
    assert(false, "Audio Transcription Service exception", err.message);
  }

  // --- Test 7: Text to Speech Service Fallback/Execution ---
  try {
    if (!process.env.GEMINI_API_KEY) {
      // Expect error if key missing
      let threw = false;
      try {
        await TextToSpeechService.textToSpeech("Test speech", "Kore");
      } catch (e) {
        threw = true;
      }
      assert(threw, "TextToSpeech Service: throws clean error when API key is missing");
    } else {
      const audioData = await TextToSpeechService.textToSpeech("Test word speech synthesis verification.", "Kore");
      assert(!!audioData && audioData.length > 5, "TextToSpeech Service: synthesizes high fidelity audio base64 stream");
    }
  } catch (err: any) {
    assert(false, "Text to Speech Service exception", err.message);
  }

  console.log("\n=================================================");
  console.log(`   Test Execution Summary: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runIntegrationTests();
