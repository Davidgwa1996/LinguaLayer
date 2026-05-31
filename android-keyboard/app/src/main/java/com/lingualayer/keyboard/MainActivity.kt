package com.lingualayer.keyboard

import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.CheckBox
import android.widget.Spinner
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val nativeSpinner = findViewById<Spinner>(R.id.nativeLangSpinner)
        val targetSpinner = findViewById<Spinner>(R.id.targetLangSpinner)
        val consentCheckbox = findViewById<CheckBox>(R.id.consentCheckbox)
        val saveButton = findViewById<Button>(R.id.btnSaveConfig)

        val languages = arrayOf("English", "Chinese", "Arabic", "French", "Spanish", "Swahili", "Hindi")
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, languages)
        
        nativeSpinner.adapter = adapter
        targetSpinner.adapter = adapter

        // Set current positions
        nativeSpinner.setSelection(0) // Default: English
        targetSpinner.setSelection(1) // Default: Chinese

        saveButton.setOnClickListener {
            val nativeLang = nativeSpinner.selectedItem.toString()
            val targetLang = targetSpinner.selectedItem.toString()
            val consent = consentCheckbox.isChecked

            // Save preferences to local shareStore
            val store = LanguagePreferenceStore(this)
            store.saveLanguages(nativeLang, targetLang)
            
            val consentManager = PrivacyConsentManager(this)
            consentManager.saveConsent(consent)

            Toast.makeText(this, "LinguaLayer configuration presets saved!", Toast.LENGTH_SHORT).show()
        }
    }
}
