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

router.post("/", async (req, res) => {
  const startTime = performance.now();

  try {
    const { text, image, mimeType } = req.body ?? {};

    // ── 1. Input validation ───────────────────────────────────────────────────
    if (!text && !image) {
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
    let cleanMime = "image/png";

    if (image !== undefined) {
      if (typeof image !== "string" || !image.trim()) {
        return res.status(400).json({
          error: "BAD_INPUT",
          message: "Image must be a valid base64 string.",
        });
      }

      // Strip optional data: URI prefix if present
      cleanImage = image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "").trim();

      // Check base64 size against 6MB limit
      const approxBinaryBytes = Math.ceil((cleanImage.length * 3) / 4);
      if (approxBinaryBytes > MAX_IMAGE_BYTES) {
        return res.status(400).json({
          error: "TOO_LARGE",
          message: "Image exceeds 6MB limit.",
        });
      }

      if (mimeType) {
        if (!ALLOWED_MIME_TYPES.has(mimeType)) {
          return res.status(400).json({
            error: "BAD_INPUT",
            message: "Unsupported image format. Allowed: image/jpeg, image/png, image/webp.",
          });
        }
        cleanMime = mimeType;
      }
    }

    // ── 2. Analysis Execution ────────────────────────────────────────────────
    let finalResponse;

    if (cleanImage) {
      // Image workflow: Call Gemini first (it OCRs), then run rules on extractedText
      if (!process.env.GEMINI_API_KEY) {
        return res.status(422).json({
          error: "IMAGE_READ_FAILED",
          message: "We couldn't read this screenshot. Please paste the text instead.",
        });
      }

      let aiResult;
      try {
        const redactedUserText = text ? redact(text) : undefined;
        aiResult = await analyzeWithGemini({
          text: redactedUserText,
          image: cleanImage,
          mimeType: cleanMime,
        });
      } catch (_err) {
        return res.status(422).json({
          error: "IMAGE_READ_FAILED",
          message: "We couldn't read this screenshot. Please paste the text instead.",
        });
      }

      const ocrText = aiResult.extractedText || "";
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

    return res.json(finalResponse);
  } catch (_error) {
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: "An unexpected error occurred while analyzing the message.",
    });
  }
});

export default router;
