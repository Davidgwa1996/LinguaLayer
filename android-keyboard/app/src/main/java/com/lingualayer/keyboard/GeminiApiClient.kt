package com.lingualayer.keyboard

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

class GeminiApiClient {
    private val client = OkHttpClient()
    private val mediaType = "application/json; charset=utf-8".toMediaType()
    
    // Fallback to local sandbox backend server
    private val backendUrl = "http://10.0.2.2:3000/api/translate" 

    interface TranslationCallback {
        fun onSuccess(translatedText: String)
        fun onFailure(error: String)
    }

    fun translate(
        text: String,
        sourceLang: String,
        targetLang: String,
        callback: TranslationCallback
    ) {
        val jsonPayload = JSONObject().apply {
            put("sourceText", text)
            put("sourceLanguage", sourceLang)
            put("targetLanguage", targetLang)
            put("userLanguage", sourceLang)
        }

        val requestBody = jsonPayload.toString().toRequestBody(mediaType)
        val request = Request.Builder()
            .url(backendUrl)
            .post(requestBody)
            .build()

        client.newCall(request).enqueue(object : okhttp3.Callback {
            override fun onFailure(call: okhttp3.Call, e: IOException) {
                callback.onFailure(e.message ?: "Network error connections.")
            }

            override fun onResponse(call: okhttp3.Call, response: okhttp3.Response) {
                if (!response.isSuccessful) {
                    callback.onFailure("Server error: ${response.code}")
                    return
                }

                try {
                    val bodyString = response.body?.string() ?: ""
                    val jsonObj = JSONObject(bodyString)
                    val translatedText = jsonObj.getString("translatedText")
                    callback.onSuccess(translatedText)
                } catch (e: Exception) {
                    callback.onFailure("Failed to parse json: ${e.message}")
                }
            }
        })
    }
}
