package com.lingualayer.keyboard

class TranslationRepository(
    private val geminiClient: GeminiApiClient,
    private val mlKitTranslator: MLKitTranslator
) {
    interface RepositoryCallback {
        fun onComplete(translated: String)
        fun onError(err: String)
    }

    fun translateContent(
        text: String,
        source: String,
        target: String,
        onlineMode: Boolean,
        callback: RepositoryCallback
    ) {
        if (onlineMode) {
            geminiClient.translate(text, source, target, object : GeminiApiClient.TranslationCallback {
                override fun onSuccess(translatedText: String) {
                    callback.onComplete(translatedText)
                }

                override fun onFailure(error: String) {
                    // Failover gracefully to ML Kit offline engine
                    mlKitTranslator.translateOffline(text, source, target, object : MLKitTranslator.TranslationCallback {
                        override fun onSuccess(translatedText: String) {
                            callback.onComplete("[Offline Fallback] $translatedText")
                        }

                        override fun onFailure(error: String) {
                            callback.onError("Both APIs failed. Check internet.")
                        }
                    })
                }
            })
        } else {
            // Force offline only
            mlKitTranslator.translateOffline(text, source, target, object : MLKitTranslator.TranslationCallback {
                override fun onSuccess(translatedText: String) {
                    callback.onComplete(translatedText)
                }

                override fun onFailure(error: String) {
                    callback.onError(error)
                }
            })
        }
    }
}
