/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContactLanguageProfile } from "../types/index.ts";
import { FirestoreService } from "./firestoreService.ts";

export class ContactManagementService {
  static async getContacts(): Promise<ContactLanguageProfile[]> {
    return await FirestoreService.getContacts();
  }

  static async getContact(contactId: string): Promise<ContactLanguageProfile | null> {
    return await FirestoreService.getContact(contactId);
  }

  static async saveContact(contactId: string, contact: ContactLanguageProfile): Promise<void> {
    await FirestoreService.saveContact(contactId, contact);
  }
}
