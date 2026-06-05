# Web SDK Quickstart

While the underlying structure mirrors an SDK approach, to get started conceptually:

1. Import the client
\`\`\`typescript
import { createLinguaLayerClient } from './core/LinguaLayerClient';
\`\`\`

2. Initialize
\`\`\`typescript
const client = createLinguaLayerClient();
\`\`\`

3. Bind Session Management
\`\`\`typescript
// Create
const session = await client.createSession();
// Join
await client.joinSession({ sessionId: session.id, preferredLanguage: 'fr', displayName: 'Jacques' });
\`\`\`

4. Subscribe to the Delivery Feed
\`\`\`typescript
const unsubscribe = client.subscribeToMessages((msg) => {
   console.log("New Message:", msg);
});
\`\`\`

5. Dispatch Messages
\`\`\`typescript
await client.sendMessage({ text: "Bonjour!" });
\`\`\`

## Events
You can manually tap into \`client.subscribeToSession()\` to watch properties shift across the lifespan (e.g., status changes, active typers). Clean up references utilizing the \`unsubscribe()\` function returned by subscribers.
