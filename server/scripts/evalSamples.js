// server/scripts/evalSamples.js – Evaluate pipeline on benchmark samples
// Read PROJECT_CONTEXT.md before every edit.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

import { analyzeRules, scoreToLevel } from "../src/engine/rules.js";
import { analyzeWithGemini } from "../src/engine/gemini.js";
import { merge } from "../src/engine/merge.js";
import { redact } from "../src/engine/redact.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from server/.env if available
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const samplesPath = path.resolve(__dirname, "../data/samples.json");
const edgeCasesPath = path.resolve(__dirname, "../data/edge-cases.json");

const samples = JSON.parse(fs.readFileSync(samplesPath, "utf8"));
const edgeCases = fs.existsSync(edgeCasesPath)
  ? JSON.parse(fs.readFileSync(edgeCasesPath, "utf8"))
  : [];

const allSamples = [...samples, ...edgeCases];

async function runPipeline(sample) {
  const t0 = performance.now();
  const rawText = sample.text.trim();
  const redactedText = redact(rawText);

  const rulesPromise = Promise.resolve().then(() => analyzeRules(rawText));
  const aiPromise = process.env.GEMINI_API_KEY
    ? analyzeWithGemini({ text: redactedText }).catch((err) => {
        // Fallback to rules-only on AI error
        return null;
      })
    : Promise.resolve(null);

  const [rulesResult, aiResult] = await Promise.all([rulesPromise, aiPromise]);
  const finalResponse = merge(rulesResult, aiResult, rawText);
  const latencyMs = Math.round(performance.now() - t0);

  const ruleLevel = scoreToLevel(rulesResult.ruleScore);
  const finalLevel = finalResponse.level;

  return {
    id: sample.id,
    label: sample.label,
    expectedLevel: sample.expectedLevel,
    ruleLevel,
    finalLevel,
    score: finalResponse.score,
    source: finalResponse.source,
    latencyMs,
  };
}

async function main() {
  console.log(`Evaluating ${allSamples.length} samples through full TrustPause pipeline...\n`);

  const results = [];
  let severeFailures = 0;
  let correctMatches = 0;

  // Column formatting
  const headers = [
    "id",
    "label",
    "expectedLevel",
    "ruleLevel",
    "finalLevel",
    "score",
    "source",
    "latencyMs",
  ];

  const colWidths = {
    id: 4,
    label: 28,
    expectedLevel: 13,
    ruleLevel: 9,
    finalLevel: 10,
    score: 5,
    source: 10,
    latencyMs: 9,
  };

  const pad = (str, len) => String(str).padEnd(len);

  const headerLine = headers.map((h) => pad(h, colWidths[h])).join(" | ");
  const sepLine = headers.map((h) => "-".repeat(colWidths[h])).join("-+-");

  console.log(headerLine);
  console.log(sepLine);

  for (const sample of allSamples) {
    const res = await runPipeline(sample);
    results.push(res);

    const matchesExpected = res.finalLevel === res.expectedLevel;
    if (matchesExpected) {
      correctMatches++;
    }

    // Exit code 1 if any HIGH sample is below HIGH or any LOW sample is above LOW
    if (res.expectedLevel === "HIGH" && res.finalLevel !== "HIGH") {
      severeFailures++;
    } else if (res.expectedLevel === "LOW" && res.finalLevel !== "LOW") {
      severeFailures++;
    }

    const line = [
      pad(res.id, colWidths.id),
      pad(res.label, colWidths.label),
      pad(res.expectedLevel, colWidths.expectedLevel),
      pad(res.ruleLevel, colWidths.ruleLevel),
      pad(res.finalLevel, colWidths.finalLevel),
      pad(res.score, colWidths.score),
      pad(res.source, colWidths.source),
      pad(`${res.latencyMs}ms`, colWidths.latencyMs),
    ].join(" | ");
    console.log(line);
  }

  const accuracy = ((correctMatches / allSamples.length) * 100).toFixed(1);
  console.log(sepLine);
  console.log(
    `Total: ${allSamples.length} | Matched: ${correctMatches} | Severe Failures: ${severeFailures} | Accuracy: ${accuracy}%\n`
  );

  if (severeFailures > 0) {
    console.error(`Evaluation FAILED: ${severeFailures} severe failure(s) detected.`);
    process.exit(1);
  } else {
    console.log("Evaluation PASSED: all samples met safety requirements.");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Evaluation script crashed:", err);
  process.exit(1);
});
