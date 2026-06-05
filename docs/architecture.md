# LinguaLayer Architecture

## Current Architecture
The application is a full-stack React frontend powered by Vite, with a Node.js/Express server and Firebase Firestore managing real-time data flow. 

## Service Boundaries
1. **LinguaLayer Core (`src/core/LinguaLayerClient.ts`)**: Encapsulates Firebase logic and API calls. Provides a clean OOP interface for React clients.
2. **Delivery Engine (`server.ts`)**: The backend translation layer utilizing Gemini AI (or fallback endpoints). It ensures precise meaning retention and format preservation.
3. **Pilot Customer & Agent**: Dedicated React views for a private support portal, reusing the identical LinguaLayerCore wrapper rather than replicating chat behaviors.
4. **Android Client (Future)**: Will connect via the identical structured message models and REST/WebSocket facades provided by the server constraints.
