// server/scripts/test_curl.mjs – Test POST /api/analyze with curl/fetch for s01, s02, s07, s08
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const samples = JSON.parse(
  readFileSync(join(__dirname, "../data/samples.json"), "utf8")
);

const targetIds = ["s01", "s02", "s07", "s08"];
const targetSamples = samples.filter((s) => targetIds.includes(s.id));

console.log("Testing POST http://localhost:8787/api/analyze with sample messages:\n");

for (const sample of targetSamples) {
  const res = await fetch("http://localhost:8787/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: sample.text }),
  });

  const data = await res.json();
  console.log(`[${sample.id}] ${sample.label}`);
  console.log(`  score: ${data.score}`);
  console.log(`  level: ${data.level}`);
  console.log(`  recommendation: ${data.recommendation}`);
  console.log(`  category: ${data.category} (${data.categoryLabel?.en})`);
  console.log(`  source: ${data.source}`);
  console.log(`  ruleScore: ${data.ruleScore}, aiScore: ${data.aiScore}`);
  console.log(`  signals count: ${data.signals?.length}`);
  console.log(`  signals: ${data.signals?.map((s) => `${s.type}: "${s.phrase}" (${s.weight})`).join(", ")}`);
  console.log("--------------------------------------------------");
}
