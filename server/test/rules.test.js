// server/test/rules.test.js – Unit tests for the rule engine
// Runner: node --test test/
// Assertions: level (0-29→LOW, 30-59→MEDIUM, 60-100→HIGH) and category per sample.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { analyzeRules } from "../src/engine/rules.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const samples = JSON.parse(
  readFileSync(join(__dirname, "../data/samples.json"), "utf8")
);

/** Map a numeric ruleScore to a level label matching the API contract. */
function scoreToLevel(score) {
  if (score <= 29) return "LOW";
  if (score <= 59) return "MEDIUM";
  return "HIGH";
}

for (const s of samples) {
  test(`${s.id} – ${s.label} → level=${s.expectedLevel}, cat=${s.expectedCategory}`, () => {
    const { ruleScore, category, signals } = analyzeRules(s.text);
    const actualLevel = scoreToLevel(ruleScore);

    // ── Level assertion (PRIMARY: must always pass) ──────────────────────
    assert.strictEqual(
      actualLevel,
      s.expectedLevel,
      `ruleScore=${ruleScore} → level=${actualLevel}, expected ${s.expectedLevel}\n` +
        `signals: ${JSON.stringify(signals.map((sig) => `${sig.type}(${sig.phrase})`))}`
    );

    // ── Category assertion ────────────────────────────────────────────────
    assert.strictEqual(
      category,
      s.expectedCategory,
      `category=${category}, expected ${s.expectedCategory}`
    );
  });
}
