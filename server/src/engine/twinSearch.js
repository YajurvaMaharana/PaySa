import fs from 'fs';
import path from 'path';

// Load samples synchronously for simplicity (or pass them in)
let samples = [];
try {
  const dataPath = path.resolve('data/samples.json');
  if (fs.existsSync(dataPath)) {
    samples = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }
  
  const edgeCasesPath = path.resolve('data/edge-cases.json');
  if (fs.existsSync(edgeCasesPath)) {
    const edgeCases = JSON.parse(fs.readFileSync(edgeCasesPath, 'utf8'));
    samples = [...samples, ...edgeCases];
  }
} catch (err) {
  console.error("Failed to load scam samples for twin search", err);
}

// Tokenize and count words
const tokenize = (text) => {
  const words = (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const counts = {};
  for (const word of words) {
    if (word.length > 2) { // ignore short stop words
      counts[word] = (counts[word] || 0) + 1;
    }
  }
  return counts;
};

// Compute cosine similarity between two word count maps
const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  const allWords = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);

  for (const word of allWords) {
    const a = vecA[word] || 0;
    const b = vecB[word] || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const maskPII = (text) => {
  if (!text) return "";
  let masked = text.replace(/(?:\+91|91|0)?[6-9]\d{9}/g, '[PHONE REDACTED]');
  masked = masked.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL REDACTED]');
  masked = masked.replace(/http[s]?:\/\/[^\s]+/g, '[LINK REDACTED]');
  masked = masked.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z]+(\.com|\.in)?/gi, '[UPI ID REDACTED]');
  return masked;
};

export const findScamTwins = (inputText, topK = 3) => {
  if (!inputText || samples.length === 0) return [];

  const inputVec = tokenize(inputText);
  if (Object.keys(inputVec).length === 0) return [];

  const results = samples.map(sample => {
    const sampleVec = tokenize(sample.text);
    const similarity = cosineSimilarity(inputVec, sampleVec);
    
    // Find overlapping tactics/phrases
    const matchedWords = Object.keys(inputVec).filter(w => sampleVec[w]);

    return {
      id: sample.id || Math.random().toString(),
      category: sample.expectedCategory || sample.label || 'UNKNOWN',
      similarityPercent: Math.round(similarity * 100),
      redactedSnippet: maskPII(sample.text),
      tacticsMatched: matchedWords.slice(0, 5) // Top overlapping keywords
    };
  });

  results.sort((a, b) => b.similarityPercent - a.similarityPercent);

  // Return top matches above a threshold (e.g. 15%)
  return results.filter(r => r.similarityPercent >= 15).slice(0, topK);
};
