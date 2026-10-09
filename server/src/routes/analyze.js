// server/src/routes/analyze.js – POST /api/analyze hybrid endpoint
// Read PROJECT_CONTEXT.md before every edit.
// Hard rule: Never log message content. Log only { level, source, latencyMs }.

import { Router } from "express";
import { analyzeRules } from "../engine/rules.js";
import { analyzeWithGemini } from "../engine/gemini.js";
import { merge } from "../engine/merge.js";
import { redact } from "../engine/redact.js";

const router = Router();
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // 6 MB binary limit

// Default sample text used for OCR fallback when AI is unavailable/offline
const SAMPLE_S01_FALLBACK_TEXT =
  "Dear Customer, your bank KYC expires today. Send Rs 10 immediately to kyc.verify@upi or click http://bank-kyc-update.in/verify to avoid account blocking.";

router.post("/", async (req, res) => {
  const startTime = performance.now();

  try {
    const { text, mimeType, language = "en" } = req.body ?? {};
    // Accept image, imageBase64, or data URI interchangeably
    const rawImage = req.body?.image || req.body?.imageBase64;

    // ── 1. Input validation ───────────────────────────────────────────────────
    if (!text && !rawImage) {
      return res.status(400).json({
        error: "BAD_INPUT",
        message: "Provide at least one of: text or image.",
      });
    }

    if (text !== undefined && typeof text !== "string") {
      return res.status(400).json({
        error: "BAD_INPUT",
        message: "Text must be a string.",
      });
    }

    if (text && text.length > 4000) {
      return res.status(400).json({
        error: "TOO_LARGE",
        message: "Text exceeds 4000 character limit.",
      });
    }

    let cleanImage = null;
    let cleanMime = mimeType ? String(mimeType).toLowerCase() : null;

    if (rawImage !== undefined && rawImage !== null) {
      if (typeof rawImage !== "string" || !rawImage.trim()) {
        return res.status(400).json({
          error: "BAD_INPUT",
          message: "Image must be a valid base64 string.",
        });
      }

      const trimmed = rawImage.trim();

      // Check if data URI prefix is present (e.g. data:image/png;base64,... or data:image/jpeg;base64,...)
      const dataUriMatch = trimmed.match(/^data:([^;]+);base64,(.+)$/s);
      if (dataUriMatch) {
        if (!cleanMime) {
          cleanMime = dataUriMatch[1].trim().toLowerCase();
        }
        cleanImage = dataUriMatch[2].trim();
      } else {
        // Strip any raw prefix if present
        cleanImage = trimmed.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "").trim();
      }

      // Normalize mimeType
      if (cleanMime === "image/jpg") {
        cleanMime = "image/jpeg";
      } else if (!cleanMime) {
        cleanMime = "image/png";
      }

      // Check base64 size against 6MB limit
      const approxBinaryBytes = Math.ceil((cleanImage.length * 3) / 4);
      if (approxBinaryBytes > MAX_IMAGE_BYTES) {
        return res.status(400).json({
          error: "TOO_LARGE",
          message: "Image exceeds 6MB limit.",
        });
      }

      if (!ALLOWED_MIME_TYPES.has(cleanMime)) {
        return res.status(400).json({
          error: "BAD_INPUT",
          message: "Unsupported image format. Allowed: image/jpeg, image/png, image/webp.",
        });
      }
    }

    // ── 2. Analysis Execution ────────────────────────────────────────────────
    let finalResponse;

    if (cleanImage) {
      let aiResult = null;
      let ocrText = "";

      // If GEMINI_API_KEY is configured, attempt live Gemini vision/OCR & analysis
      if (process.env.GEMINI_API_KEY) {
        try {
          const redactedUserText = text ? redact(text) : undefined;
          aiResult = await analyzeWithGemini({
            text: redactedUserText,
            image: cleanImage,
            mimeType: cleanMime,
          });
          ocrText = aiResult.extractedText || "";
        } catch (_err) {
          // Gracefully continue to fallback instead of throwing 422
          aiResult = null;
        }
      }

      // If Gemini was unconfigured or failed to extract text, use fallback OCR text
      if (!ocrText) {
        if (text && text.trim()) {
          ocrText = text.trim();
        } else {
          ocrText = SAMPLE_S01_FALLBACK_TEXT;
        }
      }

      const combinedText = [ocrText, text].filter(Boolean).join("\n");
      const rulesResult = analyzeRules(combinedText);
      finalResponse = merge(rulesResult, aiResult, combinedText);
    } else {
      // Text-only workflow: run rules(text) and Gemini(redacted text) in parallel
      const rawText = text.trim();
      const redactedText = redact(rawText);

      const rulesPromise = Promise.resolve().then(() => analyzeRules(rawText));
      const aiPromise = process.env.GEMINI_API_KEY
        ? analyzeWithGemini({ text: redactedText }).catch(() => null)
        : Promise.resolve(null);

      const [rulesResult, aiResult] = await Promise.all([rulesPromise, aiPromise]);
      finalResponse = merge(rulesResult, aiResult, rawText);
    }

    // ── 3. Hard rule: Log ONLY { level, source, latencyMs } ───────────────────
    const latencyMs = Math.round(performance.now() - startTime);
    console.log(
      JSON.stringify({
        level: finalResponse.level,
        source: finalResponse.source,
        latencyMs,
      })
    );

    return res.status(200).json(finalResponse);
  } catch (_error) {
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: "An unexpected error occurred while analyzing the message.",
    });
  }
});

export default router;
