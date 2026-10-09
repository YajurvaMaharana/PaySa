// server/src/engine/merge.js – Hybrid score & signal merger
// Read PROJECT_CONTEXT.md before every edit.

import { randomUUID } from "node:crypto";
import { WEIGHTS } from "./rules.js";
import {
  SIGNAL_REASONS,
  CATEGORY_LABELS,
  EXPLANATIONS,
  NEXT_STEPS,
  DISCLAIMER,
} from "./fallback.js";

/**
 * Merge deterministic rule results and Gemini AI results according to the hybrid rules.
 *
 * @param {{ ruleScore: number, signals: Array<{type: string, phrase: string, weight: number}>, category: string, safeContext: boolean }} rules
 * @param {{
 *   extractedText?: string,
 *   aiScore?: number,
 *   category?: string,
 *   isLikelyLegitimate?: boolean,
 *   signals?: Array<{ type: string, phrase: string, reason_en?: string, reason_hi?: string }>,
 *   explanation_en?: string,
 *   explanation_hi?: string,
 *   nextSteps_en?: string[],
 *   nextSteps_hi?: string[]
 * } | null} ai
 * @param {string} [fallbackText=""]
 * @returns {object} API contract compliant response
 */
export function merge(rules, ai, fallbackText = "") {
  // ── 1. Calculate final score & source ─────────────────────────────────────
  let finalScore;
  let source;
  let aiScore = null;

  if (ai && typeof ai.aiScore === "number") {
    aiScore = ai.aiScore;
    source = "AI+RULES";
    finalScore = Math.round(0.6 * rules.ruleScore + 0.4 * aiScore);

    // If rules found serious danger (rule >= 60), AI cannot downgrade below 60
    if (rules.ruleScore >= 60 && finalScore < 60) {
      finalScore = 60;
    }

    // If AI recognizes legitimate message and rules didn't detect strong signals
    if (ai.isLikelyLegitimate && rules.ruleScore < 30) {
      finalScore = Math.min(finalScore, 20);
    }

    // If AI detects very high scam probability (>= 85) that rules missed (< 30)
    if (aiScore >= 85 && rules.ruleScore < 30) {
      finalScore = Math.max(finalScore, 40);
    }

    // If AI detects high scam probability (>= 80) and rules also found scam signals (>= 35)
    if (aiScore >= 80 && rules.ruleScore >= 35) {
      finalScore = Math.max(finalScore, 65);
    }

    finalScore = Math.min(100, Math.max(0, finalScore));
  } else {
    finalScore = rules.ruleScore;
    source = "RULES_ONLY";
  }

  // ── 2. Derive level & recommendation ───────────────────────────────────────
  const level = finalScore < 30 ? "LOW" : finalScore < 60 ? "MEDIUM" : "HIGH";
  const recommendation =
    level === "HIGH" ? "PAUSE" : level === "MEDIUM" ? "VERIFY" : "PROCEED_CAREFULLY";

  // ── 3. Category selection ──────────────────────────────────────────────────
  // AI category if not NONE else rules category
  const category =
    ai && ai.category && ai.category !== "NONE"
      ? ai.category
      : rules.category || "NONE";
  const categoryLabel = CATEGORY_LABELS[category] || CATEGORY_LABELS.NONE;

  // ── 4. Signals: union of rule and AI signals, de-duplicated by type ────────
  const ruleSignals = Array.isArray(rules.signals) ? rules.signals : [];
  const aiSignals = ai && Array.isArray(ai.signals) ? ai.signals : [];

  const ruleSignalByType = new Map();
  for (const sig of ruleSignals) {
    if (!ruleSignalByType.has(sig.type)) {
      ruleSignalByType.set(sig.type, sig);
    }
  }

  const aiSignalByType = new Map();
  for (const sig of aiSignals) {
    if (!aiSignalByType.has(sig.type)) {
      aiSignalByType.set(sig.type, sig);
    }
  }

  // Union of signal types preserving order
  const allTypes = [];
  const seenTypes = new Set();
  for (const sig of ruleSignals) {
    if (!seenTypes.has(sig.type)) {
      seenTypes.add(sig.type);
      allTypes.push(sig.type);
    }
  }
  for (const sig of aiSignals) {
    if (!seenTypes.has(sig.type)) {
      seenTypes.add(sig.type);
      allTypes.push(sig.type);
    }
  }

  // Construct deduplicated signals
  let hasLinkOrTgtbtCounted = false;
  const mergedSignals = [];

  for (const type of allTypes) {
    const ruleSig = ruleSignalByType.get(type);
    const aiSig = aiSignalByType.get(type);

    const phrase =
      (ruleSig && ruleSig.phrase) ||
      (aiSig && aiSig.phrase) ||
      type;

    // Weight allocation: SUSPICIOUS_LINK and TOO_GOOD_TO_BE_TRUE share single +10
    let weight = WEIGHTS[type] ?? 0;
    if (type === "SUSPICIOUS_LINK" || type === "TOO_GOOD_TO_BE_TRUE") {
      if (hasLinkOrTgtbtCounted) {
        weight = 0;
      } else {
        weight = 10;
        hasLinkOrTgtbtCounted = true;
      }
    }

    // Reason: from AI if available, else static template
    let reason;
    if (aiSig && aiSig.reason_en && aiSig.reason_hi) {
      reason = { en: aiSig.reason_en, hi: aiSig.reason_hi };
    } else {
      reason = SIGNAL_REASONS[type] || {
        en: "Potential scam indicator detected in the message.",
        hi: "संदेश में संभावित धोखाधड़ी का संकेत मिला।",
      };
    }

    mergedSignals.push({
      type,
      phrase: phrase.slice(0, 60),
      weight,
      reason,
    });
  }

  // ── 5. Explanation & Next Steps ───────────────────────────────────────────
  let explanation;
  if (ai && ai.explanation_en && ai.explanation_hi) {
    explanation = {
      en: ai.explanation_en,
      hi: ai.explanation_hi,
    };
  } else {
    explanation = EXPLANATIONS[level];
  }

  let nextSteps;
  if (
    ai &&
    Array.isArray(ai.nextSteps_en) &&
    ai.nextSteps_en.length > 0 &&
    Array.isArray(ai.nextSteps_hi) &&
    ai.nextSteps_hi.length > 0
  ) {
    nextSteps = {
      en: ai.nextSteps_en,
      hi: ai.nextSteps_hi,
    };
  } else {
    nextSteps = NEXT_STEPS[recommendation];
  }

  const extractedText =
    (ai && ai.extractedText) || fallbackText || "";

  // ── 6. Confidence Scoring ────────────────────────────────────────────────
  // Mocking confidence for now: 0.92 for AI+Rules, 0.85 for Rules-only fallback
  const confidence = source === "AI+RULES" ? 0.92 : 0.85;
  
  let confidenceMessage = "";
  if (finalScore >= 60 && confidence >= 0.85) {
    confidenceMessage = "CONFIRMED HIGH RISK: Severe threat detected.";
  } else if ((finalScore >= 30 && finalScore < 60) || (confidence >= 0.60 && confidence < 0.85)) {
    confidenceMessage = "POTENTIAL RISK: Verify through official sources before acting.";
  } else {
    confidenceMessage = "UNCERTAIN ANALYSIS: Do not share credentials. Verify independently.";
  }

  return {
    id: randomUUID(),
    score: finalScore,
    level,
    recommendation,
    category,
    categoryLabel,
    extractedText,
    signals: mergedSignals,
    explanation,
    nextSteps,
    ruleScore: rules.ruleScore,
    aiScore,
    source,
    confidence,
    confidenceMessage,
    disclaimer: DISCLAIMER,
  };
}
