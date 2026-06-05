# API Contract

## Versioned Paths
All backend commands must hit \`/api/v1/*\` (for strict routing) or \`/api/translate\` (AI Delivery engine routes).

### Health
- \`GET /api/v1/health\`
  - Responds \`200 OK\`
  - Provides a timestamp metric.

### Session Management (Express wrapper)
- \`POST /api/v1/sessions\` => create session 
- \`POST /api/v1/sessions/:id/join\` => joins participant 
- \`POST /api/v1/sessions/:id/leave\` => cleanly departs

_Note: Presently these node endpoints are stubs mapped to client-side real-time Firestore pipelines to honor the existing behavior, but provide the shell for pure REST usage in future SDKs._

## Expected Error Codes
- \`400 Bad Request\`: Invalid body configurations.
- \`401 Unauthorized\`: Failed App Check or session missing.
- \`429 Too Many Requests\`: Throttled by \`express-rate-limit\`.
- \`500 Internal Error\`: Gemini translation faults gracefully retreating mapped fallbacks.
