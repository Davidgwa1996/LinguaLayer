package com.lingualayer.keyboard

import com.google.mlkit.nl.translate.TranslateLanguage
import com.google.mlkit.nl.translate.Translation
import com.google.mlkit.nl.translate.TranslatorOptions

class MLKitTranslator {

    interface TranslationCallback {
        fun onSuccess(translatedText: String)
        fun onFailure(error: String)
    }

    fun translateOffline(
        text: String,
        sourceLanguage: String,
        targetLanguage: String,
        callback: TranslationCallback
    ) {
        // Map common languages to ML Kit codes
        val sourceCode = mapLanguageToCode(sourceLanguage)
        val targetCode = mapLanguageToCode(targetLanguage)

        val options = TranslatorOptions.Builder()
            .setSourceLanguage(sourceCode)
            .setTargetLanguage(targetCode)
            .build()
        
        val translator = Translation.getClient(options)
        
        translator.downloadModelIfNeeded()
            .addOnSuccessListener {
                translator.translate(text)
                    .addOnSuccessListener { translated ->
                        callback.onSuccess(translated)
                    }
                    .addOnFailureListener { exception ->
                        callback.onFailure(exception.message ?: "ML Kit translate fail")
                    }
            }
            .addOnFailureListener { exception ->
                callback.onFailure("Failed downloading ML Kit dictionary: ${exception.message}")
            }
    }

    private fun mapLanguageToCode(language: String): String {
        return when (language.lowercase()) {
            "english" -> TranslateLanguage.ENGLISH
            "chinese" -> TranslateLanguage.CHINESE
            "spanish" -> TranslateLanguage.SPANISH
            "french" -> TranslateLanguage.FRENCH
            "arabic" -> TranslateLanguage.ARABIC
            else -> TranslateLanguage.ENGLISH
        }
    }
}
