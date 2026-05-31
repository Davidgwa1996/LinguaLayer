/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class SafetyFilterService {
  /**
   * Scans text to trigger warnings if translation handles high-stakes contents
   * such as medical, legal, financial, immigration or emergencies.
   */
  static scan(text: string): { flagged: boolean; reason: string | null } {
    const textLower = text.toLowerCase();
    
    const highStakesKeywords = [
      "medical", "doctor", "hospital", "prescription", "surgery",
      "legal", "lawyer", "attorney", "court", "sue",
      "financial", "bank", "credit card", "loan", "investment",
      "immigration", "visa", "passport", "deportation", "border",
      "emergency", "911", "police", "ambulance", "contract", "agreement"
    ];

    const match = highStakesKeywords.find(kw => textLower.includes(kw));

    if (match) {
      return {
        flagged: true,
        reason: `This message mentions high-stakes terms ("${match}"). AI translation may require certified human review for authoritative contexts.`
      };
    }

    return { flagged: false, reason: null };
  }
}
