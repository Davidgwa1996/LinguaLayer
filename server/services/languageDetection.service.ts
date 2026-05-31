/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GeminiTranslationService } from "./geminiTranslation.service.ts";

export class LanguageDetectionService {
  static async detect(text: string): Promise<string> {
    return GeminiTranslationService.detectLanguage(text);
  }
}
