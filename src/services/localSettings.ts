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
      simpleMode: false,
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

  static getLocalContacts(): ContactLanguageProfile[] {
    try {
      const data = localStorage.getItem(this.CONTACTS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Storage reading error for contacts:", e);
    }
    // Return sample contacts list matching backend
    const defaultContacts: ContactLanguageProfile[] = [
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
      },
      {
        contactId: "c4",
        name: "John (Spanish)",
        preferredLanguage: "Spanish",
        tonePreference: "casual",
        autoTranslate: true
      }
    ];
    this.saveLocalContacts(defaultContacts);
    return defaultContacts;
  }

  static saveLocalContacts(contacts: ContactLanguageProfile[]): void {
    try {
      localStorage.setItem(this.CONTACTS_KEY, JSON.stringify(contacts));
    } catch (e) {
      console.error("Local storage contacts save failure:", e);
    }
  }

  static saveLocalContact(contact: ContactLanguageProfile): ContactLanguageProfile[] {
    const list = this.getLocalContacts();
    const index = list.findIndex(c => c.contactId === contact.contactId);
    if (index >= 0) {
      list[index] = contact;
    } else {
      list.push(contact);
    }
    this.saveLocalContacts(list);
    return list;
  }
}
