// server/src/index.js – TrustPause Express entry point
import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { existsSync } from "node:fs";

import analyzeRouter from "./routes/analyze.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8787;
const IS_PROD = process.env.NODE_ENV === "production";

// ── CORS (dev only) ──────────────────────────────────────────────────────────
if (!IS_PROD) {
  app.use(cors());
}

// ── Body parser (8 MB limit) ─────────────────────────────────────────────────
app.use(express.json({ limit: "8mb" }));

// ── Rate limiter ─────────────────────────────────────────────────────────────
app.use(
  "/api/analyze",
  rateLimit({
    windowMs: 60_000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) =>
      res.status(429).json({ error: "RATE_LIMITED", message: "Too many requests. Please wait a minute." }),
  })
);

// ── API routes ───────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, geminiConfigured: Boolean(process.env.GEMINI_API_KEY) });
});

app.use("/api/analyze", analyzeRouter);

// ── Production: serve client/dist SPA ───────────────────────────────────────
if (IS_PROD) {
  const distPath = join(__dirname, "../../client/dist");
  if (existsSync(distPath)) {
    app.use(express.static(distPath));
    // SPA fallback – /api/* must NOT fall through here
    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(join(distPath, "index.html"));
    });
  }
}

// ── Start ────────────────────────────────────────────────────────────────────
createServer(app).listen(PORT, () => {
  console.log(`[TrustPause] server listening on http://localhost:${PORT}`);
  console.log(`[TrustPause] geminiConfigured=${Boolean(process.env.GEMINI_API_KEY)}`);
});
