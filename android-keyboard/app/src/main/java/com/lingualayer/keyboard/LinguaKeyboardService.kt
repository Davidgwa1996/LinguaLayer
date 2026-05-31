package com.lingualayer.keyboard

import android.inputmethodservice.InputMethodService
import android.view.View
import android.widget.Button
import android.widget.TextView
import android.widget.Toast

class LinguaKeyboardService : InputMethodService() {

    private lateinit var activeLanguageText: TextView
    private lateinit var btnVoiceInput: Button
    private lateinit var btnQuickTranslate: Button

    private lateinit var preferenceStore: LanguagePreferenceStore
    private lateinit var repository: TranslationRepository

    override fun onCreate() {
        super.onCreate()
        preferenceStore = LanguagePreferenceStore(this)
        
        val api = GeminiApiClient()
        val mlKit = MLKitTranslator()
        repository = TranslationRepository(api, mlKit)
    }

    override fun onCreateInputView(): View {
        // Inflate the custom keyboard UI canvas
        val view = layoutInflater.inflate(R.layout.keyboard_view, null)

        activeLanguageText = view.findViewById(R.id.activeLanguageText)
        btnVoiceInput = view.findViewById(R.id.btnVoiceInput)
        btnQuickTranslate = view.findViewById(R.id.btnQuickTranslate)

        // Load active options languages
        val source = preferenceStore.getNativeLanguage()
        val target = preferenceStore.getTargetLanguage()
        activeLanguageText.text = "Translate: $source ➔ $target"

        // Setup triggers
        btnQuickTranslate.setOnClickListener {
            // Obtain current typed context inside active client (WhatsApp etc)
            val connection = currentInputConnection
            if (connection != null) {
                // Fetch last 100 characters typed
                val textBeforeCursor = connection.getTextBeforeCursor(100, 0)?.toString() ?: ""
                if (textBeforeCursor.trim().isNotEmpty()) {
                    btnQuickTranslate.text = "..."
                    repository.translateContent(
                        textBeforeCursor,
                        source,
                        target,
                        onlineMode = true,
                        callback = object : TranslationRepository.RepositoryCallback {
                            override fun onComplete(translated: String) {
                                // Delete original input text
                                connection.deleteSurroundingText(textBeforeCursor.length, 0)
                                // Insert translated text into active text bar directly
                                connection.commitText(translated, 1)
                                btnQuickTranslate.text = "Translate ✨"
                            }

                            override fun onError(err: String) {
                                Toast.makeText(applicationContext, "Fail: $err", Toast.LENGTH_SHORT).show()
                                btnQuickTranslate.text = "Translate ✨"
                            }
                        }
                    )
                } else {
                    Toast.makeText(this, "Type something first to translate!", Toast.LENGTH_SHORT).show()
                }
            }
        }

        btnVoiceInput.setOnClickListener {
            val voiceManager = VoiceInputManager(this)
            btnVoiceInput.text = "聆听..."
            voiceManager.startListening(object : VoiceInputManager.VoiceCallback {
                override fun onSpeechCaptured(text: String) {
                    val connection = currentInputConnection
                    connection?.commitText(text, 1)
                    btnVoiceInput.text = "🎙️ Mic"
                }

                override fun onError(error: String) {
                    Toast.makeText(applicationContext, error, Toast.LENGTH_SHORT).show()
                    btnVoiceInput.text = "🎙️ Mic"
                }
            })
        }

        return view
    }
}
