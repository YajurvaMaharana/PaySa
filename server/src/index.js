// server/src/index.js – TrustPause Express entry point
// Read PROJECT_CONTEXT.md before every edit.
// Hard rule: Never log message content or API keys. Global error handler must not leak stack traces.

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

// ── Trust Proxy (Render & reverse proxy support) ─────────────────────────────
app.set("trust proxy", 1);

// ── CORS (dev only) ──────────────────────────────────────────────────────────
if (!IS_PROD) {
  app.use(cors());
}

// ── Body parser (8 MB limit) ─────────────────────────────────────────────────
app.use(express.json({ limit: "8mb" }));

// ── Rate limiter (30 requests/minute per IP) ─────────────────────────────────
app.use(
  "/api/analyze",
  rateLimit({
    windowMs: 60_000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) =>
      res.status(429).json({
        error: "RATE_LIMITED",
        message: "Too many requests. Please wait a minute before trying again.",
      }),
  })
);

// ── API routes ───────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, geminiConfigured: Boolean(process.env.GEMINI_API_KEY) });
});

app.use("/api/analyze", analyzeRouter);

// 404 handler for unknown /api/* endpoints
app.all("/api/*", (_req, res) => {
  res.status(404).json({ error: "NOT_FOUND", message: "API endpoint not found." });
});

// ── Production / Built SPA Static Files & SPA Fallback ───────────────────────
const distPath = join(__dirname, "../../client/dist");
if (IS_PROD || existsSync(distPath)) {
  app.use(express.static(distPath));
  // Serve index.html for all non-API GET requests (supports /result, /qr, /recovery)
  app.get("*", (_req, res) => {
    res.sendFile(join(distPath, "index.html"));
  });
}

// ── Global error handler (no stack traces, no leaked message data) ───────────
app.use((err, _req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "BAD_INPUT",
      message: "Malformed JSON payload.",
    });
  }

  if (err.status === 413 || err.type === "entity.too.large") {
    return res.status(400).json({
      error: "TOO_LARGE",
      message: "Request payload too large.",
    });
  }

  return res.status(err.status || 500).json({
    error: "SERVER_ERROR",
    message: "An unexpected error occurred. Please try again.",
  });
});

// ── Start ────────────────────────────────────────────────────────────────────
createServer(app).listen(PORT, () => {
  console.log(`[TrustPause] server listening on http://localhost:${PORT}`);
  console.log(`[TrustPause] geminiConfigured=${Boolean(process.env.GEMINI_API_KEY)}`);
});
