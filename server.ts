/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";

// Load environment config files
dotenv.config();
if (!process.env.GEMINI_API_KEY) {
  dotenv.config({ path: ".env.example" });
}

import { createServer as createViteServer } from "vite";
import { privacyMiddleware } from "./server/middleware/privacy.middleware.ts";
import apiRoutes from "./server/routes/api.routes.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic Middlewares
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(privacyMiddleware);

  // 1. Health check routing
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "LinguaLayer AI Universal Engine",
      apiKeyConfigured: !!process.env.GEMINI_API_KEY,
      apiKeyValidFormat: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.startsWith("AIzaSy") : false,
    });
  });

  // Centralized Segmented Routes (translation, speech, and settings/contacts storage routing)
  app.use("/api", apiRoutes);

  // Serve static assets and Vite server
  if (process.env.NODE_ENV !== "production") {
    console.log("Mounting Vite Server in Handoff/Dev mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production build from dist folder...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[LinguaLayer AI Server] Online on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Fail to start Express-Vite backend integration:", err);
});
