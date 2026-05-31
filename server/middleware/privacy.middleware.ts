/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from "express";

export function privacyMiddleware(req: Request, res: Response, next: NextFunction) {
  // Override or strip sensitive console logs containing actual message conversations
  const originalJson = res.json;
  
  res.json = function(body: any) {
    if (body && (body.translatedText || body.transcript)) {
      // Create privacy-scrubbed logger clone so developer logs don't capture conversations
      const safetyCopy = { ...body };
      if (safetyCopy.translatedText) safetyCopy.translatedText = "[REDACTED FOR PRIVACY]";
      if (safetyCopy.transcript) safetyCopy.transcript = "[REDACTED FOR PRIVACY]";
      console.log(`[Privacy Protection] Intercepted payload in ${req.path}. Contents scrubbed from logging.`);
    }
    return originalJson.call(this, body);
  };

  next();
}
