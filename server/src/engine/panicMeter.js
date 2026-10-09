const VOCABULARY = {
  urgency: [
    'today', 'now', 'immediately', 'last chance', 'urgent', 
    'abhi', 'jaldi', 'turant', '24 hours', 'action required', 'without delay'
  ],
  fear: [
    'blocked', 'suspended', 'penalty', 'legal action', 'account freeze', 
    'arrest', 'fir', 'police', 'kat jayega', 'fine', 'terminate'
  ],
  authority: [
    'bank', 'kyc', 'rbi', 'police', 'cbi', 'courier', 'customs', 
    'electricity board', 'customer care', 'manager', 'officer', 'department'
  ],
  paymentPressure: [
    'send', 'pay', 'transfer', 'scan qr', 'upi pin', 'fee', 
    'deposit', 'charge', 'paise bhejo', 'payment', 'clearance'
  ],
  greed: [
    'reward', 'lottery', 'cashback', 'prize', 'guaranteed profit', 
    'earn', 'double your money', 'free', 'bonus', 'winner'
  ]
};

export const calculatePanicTactics = (text, signals = []) => {
  const lowerText = (text || "").toLowerCase();
  
  const result = {
    tactics: {
      urgency: { score: 0, matches: [] },
      fear: { score: 0, matches: [] },
      authority: { score: 0, matches: [] },
      paymentPressure: { score: 0, matches: [] },
      greed: { score: 0, matches: [] }
    },
    dominantTactic: "None",
    overallPanicLevel: "LOW"
  };

  // Helper to extract matches based on vocabulary
  Object.keys(VOCABULARY).forEach(tacticKey => {
    const vocab = VOCABULARY[tacticKey];
    vocab.forEach(phrase => {
      // Basic regex to find whole words/phrases
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        result.tactics[tacticKey].matches.push(phrase);
      }
    });
    
    // De-duplicate matches
    result.tactics[tacticKey].matches = [...new Set(result.tactics[tacticKey].matches)];
  });

  // Supplement with signals
  signals.forEach(signal => {
    if (!signal.type) return;
    const type = signal.type;
    const phrase = signal.phrase || "";
    
    // Map signal types to panic tactics
    if (type === "URGENCY") {
      result.tactics.urgency.matches.push(phrase.toLowerCase());
    } else if (type === "PAYMENT_DEMAND" || type === "CREDENTIAL_REQUEST") {
      result.tactics.paymentPressure.matches.push(phrase.toLowerCase());
    } else if (type === "IMPERSONATION") {
      result.tactics.authority.matches.push(phrase.toLowerCase());
      result.tactics.fear.matches.push(phrase.toLowerCase()); // often related
    } else if (type === "TOO_GOOD_TO_BE_TRUE") {
      result.tactics.greed.matches.push(phrase.toLowerCase());
    }
  });

  // Calculate scores and determine dominant tactic
  let maxScore = -1;
  let dominant = "None";
  let totalScore = 0;

  Object.keys(result.tactics).forEach(tacticKey => {
    // De-duplicate again
    result.tactics[tacticKey].matches = [...new Set(result.tactics[tacticKey].matches)];
    
    const matchCount = result.tactics[tacticKey].matches.length;
    // Normalize count into 0-100 (e.g., 1 match = 35%, 2 matches = 65%, >=3 matches = 100%)
    let score = 0;
    if (matchCount === 1) score = 35;
    else if (matchCount === 2) score = 65;
    else if (matchCount >= 3) score = 100;
    
    result.tactics[tacticKey].score = score;
    totalScore += score;

    if (score > maxScore && score > 0) {
      maxScore = score;
      dominant = tacticKey;
    }
  });

  result.dominantTactic = dominant;

  // Determine overall panic level based on total accumulated score
  // max possible totalScore is 500
  if (totalScore >= 150 || maxScore >= 65) {
    result.overallPanicLevel = "CRITICAL";
  } else if (totalScore >= 50 || maxScore >= 35) {
    result.overallPanicLevel = "ELEVATED";
  } else {
    result.overallPanicLevel = "LOW";
  }

  return result;
};
