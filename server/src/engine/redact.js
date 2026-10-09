// server/src/engine/redact.js – Message content redactor
// Read PROJECT_CONTEXT.md before every edit.
// Hard rule: Never log message content. Redact PII before sending to AI or logging.
// Replaces phone numbers (+91 / 10-digit) and digit runs of 9+ digits (account/Aadhaar/card)
// with "[NUMBER]" while keeping URLs and UPI IDs intact.

const URL_REGEX =
  /(?:https?:\/\/\S+|www\.\S+|bit\.ly\/\S+|tinyurl\.com\/\S+|cutt\.ly\/\S+|t\.me\/\S+)/gi;

const UPI_REGEX =
  /[\w.+-]+@(?:upi|oksbi|okicici|okhdfcbank|paytm|ybl|apl|ibl|[a-zA-Z]{2,})\b/gi;

/**
 * Redact sensitive numeric PII (phone numbers, card numbers, Aadhaar, account numbers)
 * while preserving URLs and UPI IDs.
 *
 * @param {string} text
 * @returns {string}
 */
export function redact(text) {
  if (!text || typeof text !== "string") {
    return text || "";
  }

  // 1. Temporarily replace URLs and UPI IDs with safe placeholders
  const preservedTokens = [];
  const placeholderPrefix = "___TP_PRESERVED_TOKEN_";
  const placeholderSuffix = "___";

  let workingText = text.replace(URL_REGEX, (match) => {
    const idx = preservedTokens.length;
    preservedTokens.push(match);
    return `${placeholderPrefix}${idx}${placeholderSuffix}`;
  });

  workingText = workingText.replace(UPI_REGEX, (match) => {
    const idx = preservedTokens.length;
    preservedTokens.push(match);
    return `${placeholderPrefix}${idx}${placeholderSuffix}`;
  });

  // 2. Redact Aadhaar and 16-digit card patterns (space or hyphen separated: 4-4-4 or 4-4-4-4)
  workingText = workingText.replace(
    /\b\d{4}[\s-]\d{4}[\s-]\d{4}(?:[\s-]\d{4})?\b/g,
    "[NUMBER]"
  );

  // 3. Redact Indian mobile numbers (+91 / 91 / 0 prefix + 10 digits, or 5-5 split)
  workingText = workingText.replace(
    /(?:\+91[\s-]?)?\b[6-9]\d{4}[\s-]?\d{5}\b/g,
    "[NUMBER]"
  );
  workingText = workingText.replace(
    /(?:\+91[\s-]?)?\b\d{10}\b/g,
    "[NUMBER]"
  );

  // 4. Redact any remaining digit run of 9+ digits (account numbers, Aadhaar, etc.)
  workingText = workingText.replace(/\b\d{9,}\b/g, "[NUMBER]");

  // 5. Restore preserved URLs and UPI IDs
  workingText = workingText.replace(
    new RegExp(`${placeholderPrefix}(\\d+)${placeholderSuffix}`, "g"),
    (_, index) => preservedTokens[Number(index)] ?? ""
  );

  return workingText;
}
