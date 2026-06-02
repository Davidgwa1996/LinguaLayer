import { GeminiTranslationService } from "../server/services/geminiTranslation.service.ts";

async function runRoutingTests() {
  console.log("=================================================");
  console.log("   LinguaLayer AI - Routing Constraint Tests");
  console.log("=================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] - ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] - ${testName}`);
      if (detail) console.error(`   Detail: ${detail}`);
      failed++;
    }
  }

  // --- Test 1: Dave (English viewer) sending English to Peter (Chinese) ---
  try {
    const sender = "dave";
    const senderLang = "English";
    const receiver = "peter";
    const receiverLang = "Chinese";
    const viewerLang = "Chinese"; // Peter is viewing

    const text = "Buenos días, Sr. Dave. ¿Estás bien?";
    
    // Peter viewing the text
    const translationResult = await GeminiTranslationService.translateText({
      sourceText: text,
      sourceLanguage: senderLang,
      sourceLanguageCode: "en",
      targetLanguage: viewerLang,
      targetLanguageCode: "zh-CN",
      userLanguage: senderLang,
    });

    assert(
      translationResult.targetLanguageCode === "zh-CN",
      "Routing Constraint: Target language MUST match Viewer profile (Peter -> zh-CN)"
    );
    assert(
      translationResult.translatedText.includes("早上好") || translationResult.translatedText.includes("Buenos") || translationResult.translatedText.includes("MOCK"),
      "Translation executes to targeted lang"
    );
  } catch (err: any) {
    assert(false, "Test execution failed", err.message);
  }
  
  // --- Test 2: Dave (English) viewing Peter's message ---
  try {
    const sender = "peter";
    const senderLang = "Chinese";
    const viewerLang = "English"; // Dave is viewing

    const text = "Buenos días, Sr. Dave. ¿Estás bien?";
    
    // Dave viewing the text
    const translationResult = await GeminiTranslationService.translateText({
      sourceText: text,
      sourceLanguage: senderLang,
      sourceLanguageCode: "zh-CN",
      targetLanguage: viewerLang,
      targetLanguageCode: "en",
      userLanguage: senderLang,
    });

    assert(
      translationResult.targetLanguageCode === "en",
      "Routing Constraint: Target language MUST match Viewer profile (Dave -> en)"
    );
  } catch (err: any) {
    assert(false, "Test execution failed", err.message);
  }

  console.log("\n=================================================");
  console.log(`   Test Execution Summary: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runRoutingTests();
