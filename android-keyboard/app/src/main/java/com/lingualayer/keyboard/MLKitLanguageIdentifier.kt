package com.lingualayer.keyboard

import com.google.mlkit.nlp.languageid.LanguageIdentification

class MLKitLanguageIdentifier {

    interface IdentificationCallback {
        fun onIdentified(languageCode: String)
        fun onFailure()
    }

    fun identifyLanguage(text: String, callback: IdentificationCallback) {
        val languageIdentifier = LanguageIdentification.getClient()
        languageIdentifier.identifyLanguage(text)
            .addOnSuccessListener { languageCode ->
                if (languageCode == "und") {
                    callback.onFailure()
                } else {
                    callback.onIdentified(languageCode)
                }
            }
            .addOnFailureListener {
                callback.onFailure()
            }
    }
}
