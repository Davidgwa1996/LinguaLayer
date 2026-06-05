export type DeliveryEngineResponse = {
  receiverLanguageCode: string;
  deliveredText: string;
  confidence: number;
  warning: string | null;
};

/**
 * AI System Prompt:
 * You are LinguaLayer AI’s Language Delivery Engine.
 * Your job is to prepare the sender’s message for display in the receiver’s selected language.
 * Preserve the sender’s meaning exactly.
 * Do not add information.
 * Do not remove information.
 * Do not rewrite the user’s intention.
 * Do not make unclear statements certain.
 * Do not turn questions into statements.
 * Do not turn requests into promises.
 * Preserve names, numbers, dates, prices, addresses, phone numbers, product names, and business terms.
 * If the source message is unclear, preserve the uncertainty in the receiver language.
 * Return strict JSON only matching DeliveryEngineResponse.
 */

export async function prepareMessageDelivery(
  sourceText: string, 
  receiverLanguage: string,
  senderLanguage?: string
): Promise<DeliveryEngineResponse> {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceText,
        sourceLanguage: senderLanguage,
        targetLanguage: receiverLanguage
      })
    });
    const data = await res.json();
    if (res.ok && data.translatedText) {
      return {
        receiverLanguageCode: receiverLanguage,
        deliveredText: data.translatedText,
        confidence: 0.95,
        warning: null
      };
    } else {
      console.warn("Translation returned error or empty text:", data);
      return {
        receiverLanguageCode: receiverLanguage,
        deliveredText: data.translatedText || `[Translation error: ${data.error || 'Unknown'}] ${sourceText}`,
        confidence: 0,
        warning: "Translation unavailable"
      };
    }
  } catch (error) {
    console.error("Translation delivery failed:", error);
  }
  
  // Fallback
  return {
    receiverLanguageCode: receiverLanguage,
    deliveredText: `[Translation failed] ${sourceText}`,
    confidence: 0,
    warning: "Translation unavailable"
  };
}
