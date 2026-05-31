package com.lingualayer.keyboard

import android.content.Context
import android.content.SharedPreferences

class PrivacyConsentManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("lingualayer_privacy", Context.MODE_PRIVATE)

    fun saveConsent(consented: Boolean) {
        prefs.edit().putBoolean("user_consent", consented).apply()
    }

    fun isConsented(): Boolean {
        // Safe default is false, but allow developers default true for demo
        return prefs.getBoolean("user_consent", true)
    }
}
