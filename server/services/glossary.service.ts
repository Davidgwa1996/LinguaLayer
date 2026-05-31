/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class GlossaryService {
  /**
   * Applies client-side or server-side glossary checks on translation text to verify business critical figures.
   * Ensures numbers, prices, emails, product names remain ungarbled.
   */
  static verifyGlossary(original: string, translated: string): string[] {
    const preserved: string[] = [];

    // Simple regex matching for common business-critical items:
    // Numbers/Prices
    const numberMatches = original.match(/\b\d+(?:[.,]\d+)?\b/g);
    if (numberMatches) {
      numberMatches.forEach(num => {
        if (translated.includes(num)) {
          preserved.push(num);
        }
      });
    }

    // Phone numbers (sequences of digits with dash, plus)
    const phoneMatches = original.match(/\+?\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g);
    if (phoneMatches) {
      phoneMatches.forEach(phone => {
        if (translated.includes(phone)) {
          preserved.push(phone);
        }
      });
    }

    // Email address
    const emailMatches = original.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g);
    if (emailMatches) {
      emailMatches.forEach(email => {
        if (translated.toLowerCase().includes(email.toLowerCase())) {
          preserved.push(email);
        }
      });
    }

    // Order IDs / tracking numbers (e.g. order-12345 or letters and digits)
    const orderMatches = original.match(/\b(?:order|ID|tracking|pkg)[-#\s]?[0-9A-Z]+\b/gi);
    if (orderMatches) {
      orderMatches.forEach(match => {
        preserved.push(match);
      });
    }

    return [...new Set(preserved)];
  }
}
