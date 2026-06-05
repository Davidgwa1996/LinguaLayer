# Android Readiness Checklist

This document details the expected future Android integration for LinguaLayer, proving that the web refactor has paved the way for an SDK.

## Backend Contracts
Android clients will consume the JSON-neutral schemas defined in \`src/types/index.ts\`. The existing Firestore realtime behavior will be mirrored using the standard \`com.google.firebase:firebase-firestore\` Android library.

## Client Interface
The \`LinguaLayerAndroidClient\` will implement an interface analogous to:
\`\`\`kotlin
interface LinguaLayerAndroidClient {
    suspend fun createSession(input: CreateSessionInput): Session
    suspend fun joinSession(input: JoinSessionInput): Participant
    suspend fun setPreferredLanguage(languageCode: String)
    suspend fun sendMessage(input: SendMessageInput): MessageDeliveryResult
    fun observeMessages(): Flow<DisplayMessage>
    suspend fun leaveSession()
    suspend fun endSession()
}
\`\`\`

## Tech Stack
The Android build will utilize:
- Kotlin
- Jetpack Compose
- Android Architecture Components (ViewModel, StateFlow)
- Retrofit (for server-side AI API paths)
- Firebase Auth / Firestore SDKs

No Kotlin code is currently mixed inside this web mono-repo, adhering to clean boundaries.
