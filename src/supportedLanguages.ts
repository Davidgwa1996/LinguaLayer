export type SupportedLanguage = {
  code: string;
  name: string;
  nativeName: string;
  supportLevel: "launch" | "beta" | "future";
  textSupported: boolean;
  voicePlanned: boolean;
  businessUseRecommended: boolean;
  region: string;
  usageDomain: string[];
};

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  // Launch languages
  { code: "en", name: "English", nativeName: "English", supportLevel: "launch", textSupported: true, voicePlanned: true, businessUseRecommended: true, region: "Global", usageDomain: ["Business", "Tech", "General"] },
  { code: "zh", name: "Mandarin Chinese", nativeName: "中文", supportLevel: "launch", textSupported: true, voicePlanned: true, businessUseRecommended: true, region: "East Asia", usageDomain: ["Business", "Trade", "General"] },
  { code: "es", name: "Spanish", nativeName: "Español", supportLevel: "launch", textSupported: true, voicePlanned: true, businessUseRecommended: true, region: "Global", usageDomain: ["Business", "Travel", "General"] },
  { code: "ar", name: "Arabic", nativeName: "العربية", supportLevel: "launch", textSupported: true, voicePlanned: true, businessUseRecommended: true, region: "Middle East/North Africa", usageDomain: ["Business", "Government", "General"] },
  { code: "fr", name: "French", nativeName: "Français", supportLevel: "launch", textSupported: true, voicePlanned: true, businessUseRecommended: true, region: "Global", usageDomain: ["Diplomacy", "Business", "General"] },
  { code: "pt", name: "Portuguese", nativeName: "Português", supportLevel: "launch", textSupported: true, voicePlanned: true, businessUseRecommended: true, region: "South America/Europe", usageDomain: ["Business", "General"] },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", supportLevel: "launch", textSupported: true, voicePlanned: true, businessUseRecommended: true, region: "South Asia", usageDomain: ["Business", "General"] },
  { code: "de", name: "German", nativeName: "Deutsch", supportLevel: "launch", textSupported: true, voicePlanned: true, businessUseRecommended: true, region: "Europe", usageDomain: ["Business", "Engineering", "General"] },
  { code: "ja", name: "Japanese", nativeName: "日本語", supportLevel: "launch", textSupported: true, voicePlanned: true, businessUseRecommended: true, region: "East Asia", usageDomain: ["Business", "Tech", "General"] },
  { code: "ko", name: "Korean", nativeName: "한국어", supportLevel: "launch", textSupported: true, voicePlanned: true, businessUseRecommended: true, region: "East Asia", usageDomain: ["Business", "Tech", "General"] },
  { code: "it", name: "Italian", nativeName: "Italiano", supportLevel: "launch", textSupported: true, voicePlanned: true, businessUseRecommended: true, region: "Europe", usageDomain: ["Business", "Travel", "General"] },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", supportLevel: "launch", textSupported: true, voicePlanned: true, businessUseRecommended: true, region: "East Africa", usageDomain: ["Trade", "General"] },
  
  // Beta languages
  { code: "ru", name: "Russian", nativeName: "Русский", supportLevel: "beta", textSupported: true, voicePlanned: false, businessUseRecommended: false, region: "Eurasia", usageDomain: ["General"] },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", supportLevel: "beta", textSupported: true, voicePlanned: false, businessUseRecommended: false, region: "Eurasia", usageDomain: ["General"] },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", supportLevel: "beta", textSupported: true, voicePlanned: false, businessUseRecommended: false, region: "Southeast Asia", usageDomain: ["Trade", "General"] },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", supportLevel: "beta", textSupported: true, voicePlanned: false, businessUseRecommended: false, region: "South Asia", usageDomain: ["General"] },
  { code: "ur", name: "Urdu", nativeName: "اردو", supportLevel: "beta", textSupported: true, voicePlanned: false, businessUseRecommended: false, region: "South Asia", usageDomain: ["General"] },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", supportLevel: "beta", textSupported: true, voicePlanned: false, businessUseRecommended: false, region: "Southeast Asia", usageDomain: ["General"] }
];
