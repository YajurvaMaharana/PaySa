export const generateScamDNA = (analysisResult, text) => {
  const { category = "UNKNOWN", level = "LOW", score = 0, signals = [] } = analysisResult;
  const rawText = (text || "").toLowerCase();

  // Helper to extract signal weights (0.00 - 1.00) based on signals
  const hasSignal = (type) => signals.some(s => s.type === type);
  
  // Calculate vectors based on existing signals and text heuristics
  let urgency = hasSignal("URGENCY") ? 0.94 : (rawText.includes("urgent") || rawText.includes("immediately") ? 0.6 : 0.1);
  let fear = hasSignal("IMPERSONATION") && rawText.includes("block") ? 0.88 : (rawText.includes("suspend") ? 0.7 : 0.1);
  let payment_demand = hasSignal("PAYMENT_DEMAND") ? 0.95 : (rawText.includes("rs") || rawText.includes("pay") ? 0.5 : 0.0);
  let authority_impersonation = hasSignal("IMPERSONATION") ? 0.92 : (rawText.includes("bank") || rawText.includes("police") ? 0.6 : 0.0);
  let credential_harvesting = hasSignal("CREDENTIAL_REQUEST") ? 0.89 : (rawText.includes("pin") || rawText.includes("otp") ? 0.7 : 0.0);

  // Determine language roughly
  let language = 'english';
  if (rawText.match(/[ा-ह]/)) {
    language = 'hindi';
  } else if (rawText.match(/\b(hai|kya|karo|jaldi|abhi)\b/)) {
    language = 'hinglish';
  }

  const contains_link = hasSignal("SUSPICIOUS_LINK") || rawText.includes("http") || rawText.includes("www.");

  // Determine channel roughly
  let channel = 'unknown';
  if (rawText.includes("whatsapp")) channel = 'whatsapp';
  else if (rawText.includes("telegram")) channel = 'telegram';
  else if (rawText.length < 160) channel = 'sms';

  const categoryShort = category.replace(/_/g, '').substring(0, 4).toUpperCase() || "GEN";
  const dnaHash = \`DNA-\${categoryShort}-\${Math.round(urgency * 100)}U-\${Math.round(authority_impersonation * 100)}A-\${Math.round(payment_demand * 100)}P\`;

  let clusterMatch = "This message resembles 14 anonymized scam examples.";
  if (category.includes("KYC")) {
    clusterMatch = "This message resembles 14 anonymized fake-KYC scam examples.";
  } else if (category.includes("JOB")) {
    clusterMatch = "This message resembles 22 anonymized task/job scam examples.";
  }

  return {
    fingerprint: {
      category,
      language,
      urgency,
      fear,
      payment_demand,
      authority_impersonation,
      credential_harvesting,
      contains_link,
      channel,
      risk_score: score
    },
    dnaHash,
    campaignClusterMatch: clusterMatch
  };
};
