/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, ContactLanguageProfile } from "../types/index.ts";

export class LocalSettingsService {
  private static SETTINGS_KEY = "lingualayer_user_settings";
  private static CONTACTS_KEY = "lingualayer_contacts";

  static getLocalSettings(): UserProfile {
    try {
      const data = localStorage.getItem(this.SETTINGS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Storage reading error, using defaults:", e);
    }
    return {
      userId: "default-user",
      preferredLanguage: "English",
      languageCode: "en",
      simpleModeEnabled: false,
      privacyHistoryConsent: false
    };
  }

  static saveLocalSettings(profile: Partial<UserProfile>): UserProfile {
    const current = this.getLocalSettings();
    const updated = { ...current, ...profile };
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Local storage saving error:", e);
    }
    return updated;
  }
}
