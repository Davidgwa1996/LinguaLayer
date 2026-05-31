package com.lingualayer.keyboard

import android.content.Context
import android.content.SharedPreferences

class LanguagePreferenceStore(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("lingualayer_prefs", Context.MODE_PRIVATE)

    fun saveLanguages(native: String, target: String) {
        prefs.edit().apply {
            putString("native", native)
            putString("target", target)
            apply()
        }
    }

    fun getNativeLanguage(): String {
        return prefs.getString("native", "English") ?: "English"
    }

    fun getTargetLanguage(): String {
        return prefs.getString("target", "Chinese") ?: "Chinese"
    }
}
