/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from "express";
import { SettingsStoreService } from "../services/settingsStore.service.ts";

export class SettingsController {
  /**
   * Get settings profile for a user
   */
  static getSettings(req: Request, res: Response): void {
    const userId = req.params.userId || "default-user";
    const profile = SettingsStoreService.getSettings(userId);
    res.json(profile);
  }

  /**
   * Save settings profile for a user
   */
  static saveSettings(req: Request, res: Response): void {
    const userId = req.params.userId || "default-user";
    const saved = SettingsStoreService.saveSettings(userId, req.body);
    res.json(saved);
  }

  /**
   * Get contact lists mapped for a user session
   */
  static getContacts(req: Request, res: Response): void {
    const userId = req.params.userId || "default-user";
    const contacts = SettingsStoreService.getContacts(userId);
    res.json(contacts);
  }

  /**
   * Save or insert contact languages profile mapping
   */
  static saveContact(req: Request, res: Response): void {
    const userId = req.params.userId || "default-user";
    const saved = SettingsStoreService.saveContact(userId, req.body);
    res.json(saved);
  }
}
