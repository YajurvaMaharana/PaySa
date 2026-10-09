// server/test/engine.test.js – Unit tests for redact, merge, and fallback
import { test } from "node:test";
import assert from "node:assert/strict";
import { redact } from "../src/engine/redact.js";
import { merge } from "../src/engine/merge.js";
import { buildFallbackResponse } from "../src/engine/fallback.js";

test("redact: replaces phone and 9+ digit runs but preserves URLs and UPI IDs", () => {
  const input =
    "Contact +91 9876543210 or 9876501234. Card 1234-5678-9012-3456. Account 987654321012. Pay to kyc.verify@upi or visit http://bank-kyc-update.in/verify and t.me/jobs";
  const output = redact(input);

  assert.ok(!output.includes("9876543210"));
  assert.ok(!output.includes("9876501234"));
  assert.ok(!output.includes("1234-5678-9012-3456"));
  assert.ok(!output.includes("987654321012"));

  // Preserved
  assert.ok(output.includes("kyc.verify@upi"));
  assert.ok(output.includes("http://bank-kyc-update.in/verify"));
  assert.ok(output.includes("t.me/jobs"));
  assert.ok(output.includes("[NUMBER]"));
});

test("merge: rules-only fallback when AI is null", () => {
  const rules = {
    ruleScore: 70,
    signals: [{ type: "URGENCY", phrase: "urgent", weight: 30 }],
    category: "FAKE_KYC",
    safeContext: false,
  };

  const res = merge(rules, null, "urgent test message");
  assert.strictEqual(res.score, 70);
  assert.strictEqual(res.level, "HIGH");
  assert.strictEqual(res.recommendation, "PAUSE");
  assert.strictEqual(res.source, "RULES_ONLY");
  assert.strictEqual(res.aiScore, null);
  assert.strictEqual(res.category, "FAKE_KYC");
  assert.strictEqual(res.signals.length, 1);
  assert.ok(res.signals[0].reason.en);
  assert.ok(res.signals[0].reason.hi);
});

test("merge: hybrid formula with safety clamps", () => {
  // 1. rule >= 60 and final < 60 -> clamp to 60
  const highRule = {
    ruleScore: 65,
    signals: [{ type: "PAYMENT_DEMAND", phrase: "pay Rs 500", weight: 25 }],
    category: "JOB_TASK",
    safeContext: false,
  };
  const lowAi = {
    aiScore: 10,
    category: "NONE",
    isLikelyLegitimate: false,
    signals: [],
  };
  // 0.6*65 + 0.4*10 = 39 + 4 = 43 -> clamped to 60
  const res1 = merge(highRule, lowAi);
  assert.strictEqual(res1.score, 60);
  assert.strictEqual(res1.source, "AI+RULES");

  // 2. ai.isLikelyLegitimate and rule < 30 -> clamp to max 20
  const legitimateRule = {
    ruleScore: 25,
    signals: [],
    category: "NONE",
    safeContext: false,
  };
  const legitAi = {
    aiScore: 30,
    category: "NONE",
    isLikelyLegitimate: true,
    signals: [],
  };
  // 0.6*25 + 0.4*30 = 27 -> clamped to 20
  const res2 = merge(legitimateRule, legitAi);
  assert.strictEqual(res2.score, 20);

  // 3. aiScore >= 85 and rule < 30 -> clamp to min 40
  const sneakyRule = {
    ruleScore: 10,
    signals: [],
    category: "NONE",
    safeContext: false,
  };
  const sharpAi = {
    aiScore: 90,
    category: "INVESTMENT",
    isLikelyLegitimate: false,
    signals: [],
  };
  // 0.6*10 + 0.4*90 = 42 (>= 40)
  const res3 = merge(sneakyRule, sharpAi);
  assert.strictEqual(res3.score, 42);
  assert.strictEqual(res3.category, "INVESTMENT");
});

test("fallback: buildFallbackResponse creates complete contract structure", () => {
  const rules = {
    ruleScore: 15,
    signals: [{ type: "CREDENTIAL_REQUEST", phrase: "OTP", weight: 20 }],
    category: "NONE",
    safeContext: true,
  };
  const res = buildFallbackResponse(rules, "test OTP message");
  assert.strictEqual(res.score, 15);
  assert.strictEqual(res.level, "LOW");
  assert.strictEqual(res.recommendation, "PROCEED_CAREFULLY");
  assert.strictEqual(res.source, "RULES_ONLY");
  assert.ok(res.disclaimer.en);
  assert.ok(res.disclaimer.hi);
  assert.ok(Array.isArray(res.nextSteps.en));
  assert.ok(Array.isArray(res.nextSteps.hi));
});
