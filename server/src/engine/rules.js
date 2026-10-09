// server/src/engine/rules.js – TrustPause deterministic rule engine
// Read PROJECT_CONTEXT.md before every edit.
// Scoring: URGENCY+30 | PAYMENT_DEMAND+25 | CREDENTIAL_REQUEST+20 | IMPERSONATION+15
//          SUSPICIOUS_LINK/TOO_GOOD_TO_BE_TRUE share +10 (counted once) | combo bonus+15 | cap 100
// Labels: 0-29 LOW | 30-59 MEDIUM | 60-100 HIGH

// ── Exported weights (consumed by merge.js) ──────────────────────────────────
export const WEIGHTS = {
  URGENCY: 30,
  PAYMENT_DEMAND: 25,
  CREDENTIAL_REQUEST: 20,
  IMPERSONATION: 15,
  SUSPICIOUS_LINK: 10,
  TOO_GOOD_TO_BE_TRUE: 10,
};

// ── Pattern tables ───────────────────────────────────────────────────────────
// Each pattern is a case-insensitive regex.
// detectPhrases() returns the raw matched substring (trimmed, ≤60 chars).

const URGENCY_PATTERNS = [
  /\btoday\b/i,
  /\btonight\b/i,
  /\bimmediately\b/i,
  /\burgently?\b/i,
  /\bwithin\s+\d+\s+(?:hour|minute|hr|min)s?\b/i,
  /\blast\s+chance\b/i,
  /\bfinal\s+notice\b/i,
  /\bexpir(?:es?|ing|ed)\b/i,
  /\b(?:will\s+be\s+)?(?:blocked|suspended|disconnected|deactivated|closed)\b/i,
  /\baccount\s+block(?:ing|ed)?\b/i,
  /\blegal\s+action\b/i,
  /\bdigital\s+arrest\b/i,
  /\barrest\b/i,
  /\bFIR\b/,
  /\blimited\s+(?:seats?|slots?)\b/i,
  /\bhurry\b/i,
  // Hinglish
  /\bturant\b/i,
  /\babhi\b/i,
  /\baaj\s+hi\b/i,
  /\bjaldi\b/i,
  /\bkhata\s+band\b/i,
  /\bband\s+ho\s+jayega\b/i,
  /\bkat\s+jayega\b/i,
];

const PAYMENT_DEMAND_PATTERNS = [
  /\b(?:send|pay|transfer)\s+(?:Rs\.?|INR|rupees?)\s*[\d,]+/i,
  /\bpay(?:ing)?\s+(?:a\s+)?(?:fee|charge|deposit|tax|fine)\b/i,
  /\b(?:registration|processing|clearance|refund)\s+fee\b/i,
  /\bscan\s+(?:this\s+|the\s+)?QR\b/i,
  /\bsend\s+money\b/i,
  /\btransfer\s+money\b/i,
  /\bgift\s+card\b/i,
  // Hinglish
  /\bpaise\s+bhejo\b/i,
  /\bpayment\s+karo\b/i,
  /\bfees?\s+bhejo\b/i,
];

const CREDENTIAL_REQUEST_PATTERNS = [
  /\bUPI\s*PIN\b/i,         // before generic PIN to claim the phrase first
  /\bOTP\b/i,
  /\bPIN\b/i,
  /\bCVV\b/i,
  /\bcard\s+number\b/i,
  /\bpassword\b/i,
  /\bnet\s+banking\b/i,
  /\bAnyDesk\b/i,
  /\bTeamViewer\b/i,
  /\bQuickSupport\b/i,
  /\bscreen\s+share\b/i,
  /\binstall\s+(?:app|APK)\b/i,
  /\bshare\s+the\s+code\b/i,
  /\bAadhaar\s+number\b/i,
];

const IMPERSONATION_PATTERNS = [
  /\bKYC\b/i,
  /\bcustomer\s+care\b/i,
  /\bsupport\s+team\b/i,
  /\bRBI\b/i,
  /\bCBI\b/i,
  /\bpolice\b/i,
  /\bcustoms\b/i,
  /\bcourier\b/i,
  /\belectricity\s+board\b/i,
  /\bincome\s+tax\b/i,
  /\bgovernment\b/i,
  /\bTRAI\b/i,
  /\bofficer\b/i,
  /\bbank\b/i,   // broad; safe-context gate prevents false positives on genuine alerts
];

// Ordered so that the most distinctive pattern gets the weight slot when both SL and TGTBT fire
const SUSPICIOUS_LINK_PATTERNS = [
  /http:\/\/\S+/i,                                                     // non-https link
  /\bbit\.ly\/\S+/i,
  /\btinyurl\.com\/\S+/i,
  /\bcutt\.ly\/\S+/i,
  /\bt\.me\/\S+/i,                                                     // Telegram
  /[\w.+-]+@(?:upi|oksbi|okicici|okhdfcbank|paytm|ybl|apl|ibl)\b/i,  // UPI IDs
  /\S+\.apk\b/i,                                                       // APK download
  /[\w-]*(?:kyc|bank|secure|verify|update|refund)[\w-]+\.\w{2,}/i,   // suspicious domains
];

const TGTBT_PATTERNS = [
  /\bearn\s+(?:Rs\.?|INR|rupees?)?\s*[\d,]+\s+per\s+day\b/i,
  /\bliking\s+videos?\b/i,
  /\b(?:like|rate)\s+videos?\s+for\s+(?:money|income)\b/i,
  /\blucky\s+draw\b/i,
  /\blottery\b/i,
  /\b(?:won|win(?:ning)?)\b/i,
  /\bprize\b/i,
  /\bguaranteed\s+returns?\b/i,
  /\bdouble\s+your\s+money\b/i,
  /\beasy\s+work\s+from\s+home\b/i,
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Run each pattern against text; collect up to `max` distinct matched phrases.
 * Returns the raw matched substring, trimmed, capped at 60 chars.
 */
function detectPhrases(text, patterns, max = 2) {
  const found = [];
  for (const re of patterns) {
    if (found.length >= max) break;
    const m = text.match(re);
    if (m) {
      const phrase = m[0].trim().slice(0, 60);
      if (!found.includes(phrase)) found.push(phrase);
    }
  }
  return found;
}

/** Derive level label from a numeric score. */
export function scoreToLevel(score) {
  if (score <= 29) return "LOW";
  if (score <= 59) return "MEDIUM";
  return "HIGH";
}

// ── Safe-context guards ──────────────────────────────────────────────────────
// Fires when the message is a genuine bank alert or explicit "don't share" notice
// AND has no payment demand, suspicious link, or urgency.

const SAFE_WARNING_RE =
  /\b(?:do\s+not|don't|never)\s+share\s+(?:your\s+)?(?:otp|code|pin)\b/i;

const DEBIT_CREDIT_RE =
  /\b(?:debited|credited|spent|withdrawn)\b.{0,80}\b(?:a\/c|account|card)\b/is;

// ── Category detection (first match wins, in spec order) ─────────────────────
function detectCategory(text, signals) {
  if (/\b(?:police|CBI|digital\s+arrest|arrest)\b/i.test(text))
    return "AUTHORITY_ARREST";

  if (/\b(?:AnyDesk|TeamViewer|screen\s+share|install\s+(?:app|APK))\b/i.test(text))
    return "REMOTE_ACCESS";

  if (
    /\bscan\s+(?:this\s+|the\s+)?QR\b/i.test(text) &&
    /\b(?:refund|receive|PIN)\b/i.test(text)
  )
    return "REFUND_QR";

  if (/\bKYC\b/i.test(text)) return "FAKE_KYC";

  if (
    /\b(?:electricity|power|gas|water)\b/i.test(text) &&
    /\b(?:bill|disconnect(?:ed|ion|ing)?)\b/i.test(text)
  )
    return "UTILITY_DISCONNECT";

  if (/\b(?:parcel|courier|customs|package)\b/i.test(text))
    return "COURIER_CUSTOMS";

  if (
    /\b(?:job|earn|per\s+day|task)\b/i.test(text) ||
    /\bregistration\s+fee\b/i.test(text)
  )
    return "JOB_TASK";

  if (/\b(?:won|lottery|prize|lucky\s+draw)\b/i.test(text))
    return "LOTTERY_REWARD";

  if (/\b(?:invest|returns|trading|crypto)\b/i.test(text))
    return "INVESTMENT";

  if (signals.some((s) => s.type === "SUSPICIOUS_LINK"))
    return "PHISHING_LINK";

  return "NONE";
}

// ── Main export ──────────────────────────────────────────────────────────────
/**
 * analyzeRules(text) → { ruleScore, signals, category, safeContext }
 *
 * signals: [{ type, phrase, weight }]
 *   – Each type contributes its weight ONCE (up to 2 phrases collected per type).
 *   – SUSPICIOUS_LINK and TOO_GOOD_TO_BE_TRUE share a single +10; if both fire,
 *     the second type's signal(s) carry weight 0.
 *   – +15 combo bonus when PAYMENT_DEMAND + CREDENTIAL_REQUEST both match.
 *   – Capped at 100.
 * safeContext: true caps ruleScore at 15 and forces category NONE.
 */
export function analyzeRules(text) {
  // ── 1. Detect phrases per type ───────────────────────────────────────────
  const urgencyPhrases     = detectPhrases(text, URGENCY_PATTERNS);
  const paymentPhrases     = detectPhrases(text, PAYMENT_DEMAND_PATTERNS);
  const credentialPhrases  = detectPhrases(text, CREDENTIAL_REQUEST_PATTERNS);
  const impersonatePhrases = detectPhrases(text, IMPERSONATION_PATTERNS);
  const linkPhrases        = detectPhrases(text, SUSPICIOUS_LINK_PATTERNS);
  const tgtbtPhrases       = detectPhrases(text, TGTBT_PATTERNS);

  // ── 2. Build signals array & base score ──────────────────────────────────
  const signals = [];
  let ruleScore = 0;

  if (urgencyPhrases.length > 0) {
    ruleScore += WEIGHTS.URGENCY;
    urgencyPhrases.forEach((phrase, i) =>
      signals.push({ type: "URGENCY", phrase, weight: i === 0 ? WEIGHTS.URGENCY : 0 })
    );
  }

  if (paymentPhrases.length > 0) {
    ruleScore += WEIGHTS.PAYMENT_DEMAND;
    paymentPhrases.forEach((phrase, i) =>
      signals.push({ type: "PAYMENT_DEMAND", phrase, weight: i === 0 ? WEIGHTS.PAYMENT_DEMAND : 0 })
    );
  }

  if (credentialPhrases.length > 0) {
    ruleScore += WEIGHTS.CREDENTIAL_REQUEST;
    credentialPhrases.forEach((phrase, i) =>
      signals.push({ type: "CREDENTIAL_REQUEST", phrase, weight: i === 0 ? WEIGHTS.CREDENTIAL_REQUEST : 0 })
    );
  }

  if (impersonatePhrases.length > 0) {
    ruleScore += WEIGHTS.IMPERSONATION;
    impersonatePhrases.forEach((phrase, i) =>
      signals.push({ type: "IMPERSONATION", phrase, weight: i === 0 ? WEIGHTS.IMPERSONATION : 0 })
    );
  }

  // SUSPICIOUS_LINK and TOO_GOOD_TO_BE_TRUE share a single +10
  const linkMatched  = linkPhrases.length > 0;
  const tgtbtMatched = tgtbtPhrases.length > 0;
  if (linkMatched || tgtbtMatched) {
    ruleScore += 10; // added exactly once
    if (linkMatched) {
      // SL wins the weight slot
      linkPhrases.forEach((phrase, i) =>
        signals.push({ type: "SUSPICIOUS_LINK", phrase, weight: i === 0 ? WEIGHTS.SUSPICIOUS_LINK : 0 })
      );
    }
    if (tgtbtMatched) {
      // If SL also fired, TGTBT gets 0; otherwise TGTBT holds the +10
      const w0 = linkMatched ? 0 : WEIGHTS.TOO_GOOD_TO_BE_TRUE;
      tgtbtPhrases.forEach((phrase, i) =>
        signals.push({ type: "TOO_GOOD_TO_BE_TRUE", phrase, weight: i === 0 ? w0 : 0 })
      );
    }
  }

  // ── 3. Combo bonus ────────────────────────────────────────────────────────
  if (paymentPhrases.length > 0 && credentialPhrases.length > 0) {
    ruleScore += 15;
  }

  // ── 4. Cap at 100 ─────────────────────────────────────────────────────────
  ruleScore = Math.min(ruleScore, 100);

  // ── 5. Safe-context gate ──────────────────────────────────────────────────
  // Genuine bank debit alerts and "never share OTP" messages must not be flagged.
  const hasSafeWarning = SAFE_WARNING_RE.test(text);
  const hasDebitAlert  = DEBIT_CREDIT_RE.test(text);
  const safeContext =
    (hasSafeWarning || hasDebitAlert) &&
    paymentPhrases.length === 0 &&
    linkPhrases.length === 0 &&
    urgencyPhrases.length === 0;

  if (safeContext) {
    ruleScore = Math.min(ruleScore, 15);
  }

  // ── 6. Category ───────────────────────────────────────────────────────────
  const category = safeContext ? "NONE" : detectCategory(text, signals);

  return { ruleScore, signals, category, safeContext };
}
