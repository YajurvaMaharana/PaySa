// scratch: print score table for all 8 samples
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { analyzeRules, scoreToLevel } from "../src/engine/rules.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const samples = JSON.parse(readFileSync(join(__dirname, "../data/samples.json"), "utf8"));

console.log("| id  | label              | ruleScore | level  | category          | safeContext |");
console.log("|-----|--------------------|-----------|--------|-------------------|-------------|");
for (const s of samples) {
  const { ruleScore, category, safeContext, signals } = analyzeRules(s.text);
  const level = scoreToLevel(ruleScore);
  const sigStr = signals.map(sg => `${sg.type}(${sg.weight})`).join(", ");
  console.log(`| ${s.id} | ${s.label.padEnd(18)} | ${String(ruleScore).padStart(9)} | ${level.padEnd(6)} | ${category.padEnd(17)} | ${String(safeContext).padEnd(11)} |`);
  console.log(`|     | signals: ${sigStr}`);
}
