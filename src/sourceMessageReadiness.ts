export type SourceMessageReadinessResult = {
  isReady: boolean;
  level: "good" | "needs_attention" | "unclear";
  warnings: string[];
  suggestions: string[];
};

export function checkSourceMessageReadiness(text: string): SourceMessageReadinessResult {
  const trimmed = text.trim();
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let level: "good" | "needs_attention" | "unclear" = "good";
  let isReady = true;

  if (trimmed.length === 0) {
    return {
      isReady: false,
      level: "unclear",
      warnings: ["Message is empty."],
      suggestions: ["Please write a clear message before sending."]
    };
  }

  // Simple heuristics for demo purposes
  if (trimmed.length < 15 && (trimmed.includes("maybe") || trimmed.includes("if ok"))) {
    level = "needs_attention";
    warnings.push("Your message may be unclear.");
    suggestions.push("Consider writing who should send it and what should be sent.");
  } else if (trimmed.length < 5) {
    level = "needs_attention";
    warnings.push("Your message may be unclear.");
    suggestions.push("Using complete sentences helps ensure accurate delivery.");
  }

  // Check for excessive abbreviation (simulated via regex for demo)
  if (/\b(u|r|c|plz|thx|msg)\b/i.test(trimmed) && trimmed.length < 20) {
    level = "needs_attention";
    warnings.push("Avoid unclear abbreviations in professional contexts.");
    suggestions.push("Write exactly what you mean.");
  }

  // Check for unclear numbers
  if (/\d+/.test(trimmed) && !/(pm|am|dollars|euros|units|people|days|hours)/i.test(trimmed) && trimmed.length < 15) {
    level = "needs_attention";
    warnings.push("Please check that numbers, prices, or dates are clear before sending.");
    suggestions.push("Specify the context for the numbers (e.g., time, price, quantity).");
  }

  return {
    isReady,
    level,
    warnings,
    suggestions
  };
}
