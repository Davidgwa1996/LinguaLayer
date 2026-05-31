/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, ContactLanguageProfile } from "../../src/types/index.ts";

// Simple in-memory fallback databases
const settingsStore: Record<string, UserProfile> = {
  "default-user": {
    userId: "default-user",
    preferredLanguage: "English",
    simpleMode: false,
    privacyHistoryConsent: false
  }
};

const contactsStore: Record<string, ContactLanguageProfile[]> = {
  "default-user": [
    {
      contactId: "c1",
      name: "Jean (French)",
      preferredLanguage: "French",
      tonePreference: "friendly",
      autoTranslate: true
    },
    {
      contactId: "c2",
      name: "Mei (Chinese)",
      preferredLanguage: "Chinese",
      tonePreference: "business",
      autoTranslate: true
    },
    {
      contactId: "c3",
      name: "Omar (Arabic)",
      preferredLanguage: "Arabic",
      tonePreference: "respectful",
      autoTranslate: true
    }
  ]
};

export class SettingsStoreService {
  static getSettings(userId: string): UserProfile {
    if (!settingsStore[userId]) {
      settingsStore[userId] = {
        userId,
        preferredLanguage: "English",
        simpleMode: false,
        privacyHistoryConsent: false
      };
    }
    return settingsStore[userId];
  }

  static saveSettings(userId: string, profile: Partial<UserProfile>): UserProfile {
    const current = this.getSettings(userId);
    settingsStore[userId] = { ...current, ...profile };
    return settingsStore[userId];
  }

  static getContacts(userId: string): ContactLanguageProfile[] {
    return contactsStore[userId] || [];
  }

  static saveContact(userId: string, contact: ContactLanguageProfile): ContactLanguageProfile {
    if (!contactsStore[userId]) {
      contactsStore[userId] = [];
    }
    
    const index = contactsStore[userId].findIndex(c => c.contactId === contact.contactId);
    if (index >= 0) {
      contactsStore[userId][index] = contact;
    } else {
      contactsStore[userId].push(contact);
    }
    return contact;
  }
}
