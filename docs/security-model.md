# Security Model

This document outlines the security architecture for LinguaLayer.

## Authentication Boundary
- Users must authenticate via Firebase Auth (Google Provider) to create sessions.
- Guest users (non-authenticated) may only join sessions using a valid session link/ID.
- The Pilot Agent requires explicit operator-level Google Authentication.

## Authorization & Roles
- **Owner Permissions**: The individual creating a room (Room Owner) holds ultimate rights to \`status = 'ended'\`, mutating typers, and broadcasting system states.
- **Participant Permissions**: Read-only for the session attributes, write-only strictly appending to the \`/messages\` subcollection. They cannot mutate root room metadata.
- **Role Escalation**: Mitigated by strict Firestore rules asserting \`request.auth.uid == resource.data.ownerId\`.

## Firebase App Check
A fundamental part of blocking untrusted traffic. Implemented with `initializeAppCheck` using the ReCaptchaV3Provider across all web clients. The backend verifies the App Check token automatically before database actions.

## Secret Management
- **API Keys**: \`process.env.GEMINI_API_KEY\` strictly remains server-side in node.js. **NEVER** embedded into the Vite React client bundle.
- **Firebase Keys**: Basic config variables (projectId, etc) are client-safe by design, guarded largely by AppCheck and Firestore Rules.
