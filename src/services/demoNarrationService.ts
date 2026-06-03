export interface NarrationTiming {
  text: string;
  startTime: number;
  duration: number;
  pacing: "cinematic" | "upbeat" | "measured" | "emotive_pause";
}

export const DEMO_NARRATION_SCRIPT: NarrationTiming[] = [
  { text: "First, enable LinguaLayer in your phone settings and choose your communication language.", startTime: 0, duration: 10, pacing: "measured" },
  { text: "Now people can message normally. Each device displays the conversation in the language its user understands.", startTime: 10, duration: 13, pacing: "upbeat" },
  { text: "LinguaLayer is designed as a universal language layer across messaging, social, email, and communities.", startTime: 23, duration: 9, pacing: "cinematic" },
  { text: "LinguaLayer AI. One layer. Every language. Write naturally. Read naturally. Connect globally.", startTime: 32, duration: 8, pacing: "emotive_pause" },
];

export function getCinematicSynthesisConfig() {
  return {
    voiceType: "premium-expressive-journey",
    pitch: "lowered_cinematic",
    speed: "0.85x", 
    emotionalTone: "authoritative_warm_and_inspiring",
    pacingStrategy: "dynamic_pauses_for_impact"
  };
}
