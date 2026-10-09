// server/src/engine/fallback.js – Static bilingual templates and rules-only fallback
// Read PROJECT_CONTEXT.md before every edit.
// Hard rule: Never claim TrustPause stops fraud or guarantees safety.
// Next steps must always emphasize: UPI PIN is only for sending money, never for receiving;
// never share OTP/PIN; verify via official channels; if money sent, call 1930.

import { randomUUID } from "node:crypto";

export const SIGNAL_REASONS = {
  URGENCY: {
    en: "Creates artificial urgency or fear (e.g. account blocking) to force you into acting quickly without thinking.",
    hi: "जल्दबाजी या खाता बंद होने का डर दिखाकर बिना सोचे-समझे तुरंत कदम उठाने का दबाव बनाया जा रहा है।",
  },
  PAYMENT_DEMAND: {
    en: "Demands an upfront payment, fee, money transfer, or QR scan under false pretenses.",
    hi: "किसी झूठे बहाने से पहले पैसे भेजने, शुल्क भरने या QR कोड स्कैन करने की मांग की जा रही है।",
  },
  CREDENTIAL_REQUEST: {
    en: "Asks for sensitive credentials (OTP, UPI PIN, passwords) or remote-access screen sharing.",
    hi: "OTP, UPI PIN, पासवर्ड जैसी गोपनीय जानकारी या स्क्रीन शेयरिंग ऐप डाउनलोड करने को कहा जा रहा है।",
  },
  IMPERSONATION: {
    en: "Impersonates an official authority, bank, police, courier, or customer support team.",
    hi: "बैंक, पुलिस, कूरियर या ग्राहक सेवा जैसी किसी आधिकारिक संस्था का फर्जी रूप धारण किया गया है।",
  },
  SUSPICIOUS_LINK: {
    en: "Contains an unverified shortened link, non-secure URL, or unknown UPI ID.",
    hi: "संदिग्ध या छोटा किया गया लिंक, असुरक्षित URL या अनजान UPI ID दिया गया है।",
  },
  TOO_GOOD_TO_BE_TRUE: {
    en: "Promises unrealistic earnings, guaranteed returns, or lottery/prize winnings.",
    hi: "घर बैठे आसान कमाई, गारंटीड मुनाफे या लॉटरी/ईनाम जीतने का अवास्तविक लालच दिया गया है।",
  },
};

export const CATEGORY_LABELS = {
  FAKE_KYC: {
    en: "Fake KYC Update",
    hi: "नकली KYC अपडेट",
  },
  REFUND_QR: {
    en: "Refund / QR Code Scam",
    hi: "रिफंड / QR कोड धोखाधड़ी",
  },
  UTILITY_DISCONNECT: {
    en: "Utility Disconnection Threat",
    hi: "बिजली / सेवा बंद होने की धमकी",
  },
  JOB_TASK: {
    en: "Part-time Job / Task Scam",
    hi: "पार्ट-टाइम नौकरी / टास्क फ्रॉड",
  },
  COURIER_CUSTOMS: {
    en: "Parcel / Customs Clearance Scam",
    hi: "पार्सल / कस्टम शुल्क फ्रॉड",
  },
  AUTHORITY_ARREST: {
    en: "Digital Arrest / Fake Police Call",
    hi: "डिजिटल अरेस्ट / फर्जी पुलिस धमकी",
  },
  LOTTERY_REWARD: {
    en: "Lottery / Prize Reward Scam",
    hi: "लॉटरी / ईनाम का झांसा",
  },
  REMOTE_ACCESS: {
    en: "Remote Access / Screen Share Scam",
    hi: "रिमोट एक्सेस / स्क्रीन शेयरिंग फ्रॉड",
  },
  PHISHING_LINK: {
    en: "Phishing / Malicious Link",
    hi: "फिशिंग / संदिग्ध लिंक",
  },
  INVESTMENT: {
    en: "High-Return Investment Scam",
    hi: "फर्जी निवेश योजना",
  },
  NONE: {
    en: "Safe / Informational Message",
    hi: "सुरक्षित / सामान्य सूचना",
  },
};

export const EXPLANATIONS = {
  HIGH: {
    en: "This message exhibits strong indicators of a financial scam. It uses psychological pressure or false claims to trick you into transferring money or compromising your account.",
    hi: "इस संदेश में वित्तीय धोखाधड़ी के गंभीर संकेत हैं। यह आपको डराकर या लालच देकर पैसे ट्रांसफर कराने अथवा खाता विवरण चुराने की कोशिश कर रहा है।",
  },
  MEDIUM: {
    en: "This message contains potentially risky elements such as urgency or suspicious links. Proceed with caution and do not make payments without official verification.",
    hi: "इस संदेश में कुछ संदिग्ध संकेत (जैसे जल्दबाजी या अज्ञात लिंक) मिले हैं। बिना आधिकारिक पुष्टि के कोई भी भुगतान या कदम न उठाएं।",
  },
  LOW: {
    en: "No typical scam indicators were detected. This appears to be a legitimate notification or normal communication, but always remain vigilant.",
    hi: "धोखाधड़ी का कोई सामान्य संकेत नहीं मिला। यह एक सामान्य या आधिकारिक सूचना प्रतीत होती है, फिर भी हमेशा सतर्क रहें।",
  },
};

export const NEXT_STEPS = {
  PAUSE: {
    en: [
      "Do NOT send any money, scan any QR code, or enter your UPI PIN.",
      "Remember: A UPI PIN is only needed to SEND money, never to receive money.",
      "Verify independently using the official app or call the helpline on the back of your bank card.",
      "If money was already sent, call 1930 immediately and register a complaint at cybercrime.gov.in.",
    ],
    hi: [
      "कोई भी पैसे न भेजें, QR कोड स्कैन न करें और UPI PIN बिल्कुल न डालें।",
      "याद रखें: UPI PIN केवल पैसे भेजने के लिए होता है, पैसे प्राप्त करने के लिए कभी नहीं।",
      "आधिकारिक ऐप से जांच करें या अपने बैंक कार्ड के पीछे लिखे नंबर पर कॉल करें।",
      "यदि पैसे कट चुके हैं, तो तुरंत 1930 पर कॉल करें और cybercrime.gov.in पर शिकायत दर्ज करें।",
    ],
  },
  VERIFY: {
    en: [
      "Do not click links or call phone numbers mentioned inside this message.",
      "Remember: A UPI PIN is only needed to SEND money, never to receive money.",
      "Log into your official banking or service app directly to check your actual account status.",
      "If anything feels suspicious or money was sent, call 1930 immediately.",
    ],
    hi: [
      "इस संदेश में दिए गए लिंक पर क्लिक न करें और न ही दिए गए फोन नंबर पर कॉल करें।",
      "याद रखें: UPI PIN केवल पैसे भेजने के लिए होता है, पैसे प्राप्त करने के लिए कभी नहीं।",
      "अपने खाते की सही स्थिति देखने के लिए सीधे आधिकारिक ऐप में लॉगिन करें।",
      "यदि कुछ भी संदिग्ध लगे या पैसे भेज दिए हैं, तो तुरंत 1930 पर कॉल करें।",
    ],
  },
  PROCEED_CAREFULLY: {
    en: [
      "Never share your OTP, UPI PIN, or banking passwords with anyone.",
      "Remember: A UPI PIN is only needed to SEND money, never to receive money.",
      "Always verify the recipient's details carefully before approving any transaction.",
      "If in doubt or if an unauthorized transaction occurs, immediately call 1930.",
    ],
    hi: [
      "अपना OTP, UPI PIN या बैंक पासवर्ड कभी किसी के साथ साझा न करें।",
      "याद रखें: UPI PIN केवल पैसे भेजने के लिए होता है, पैसे प्राप्त करने के लिए कभी नहीं।",
      "कोई भी भुगतान करने से पहले प्राप्तकर्ता के विवरण की अच्छी तरह जांच करें।",
      "संदेह होने पर या अनधिकृत लेनदेन होने पर तुरंत 1930 पर संपर्क करें।",
    ],
  },
};

export const DISCLAIMER = {
  en: "This is a safety recommendation, not a guarantee. TrustPause does not stop fraud.",
  hi: "यह एक सुरक्षा सुझाव है, गारंटी नहीं। TrustPause धोखाधड़ी नहीं रोकता।",
};

/**
 * Build a complete fallback response from rule engine results when AI is unavailable.
 *
 * @param {{ ruleScore: number, signals: Array<{type: string, phrase: string, weight: number}>, category: string, safeContext: boolean }} ruleResult
 * @param {string} [extractedText=""]
 * @returns {object} API contract compliant response
 */
export function buildFallbackResponse(ruleResult, extractedText = "") {
  const score = ruleResult.ruleScore;
  const level = score < 30 ? "LOW" : score < 60 ? "MEDIUM" : "HIGH";
  const recommendation =
    level === "HIGH" ? "PAUSE" : level === "MEDIUM" ? "VERIFY" : "PROCEED_CAREFULLY";

  const category = ruleResult.category || "NONE";
  const categoryLabel = CATEGORY_LABELS[category] || CATEGORY_LABELS.NONE;

  // Enrich rule signals with reasons
  const signals = (ruleResult.signals || []).map((sig) => ({
    type: sig.type,
    phrase: sig.phrase,
    weight: sig.weight,
    reason: SIGNAL_REASONS[sig.type] || {
      en: "Potential scam indicator detected in the text.",
      hi: "संदेश में संभावित धोखाधड़ी का संकेत मिला।",
    },
  }));

  return {
    id: randomUUID(),
    score,
    level,
    recommendation,
    category,
    categoryLabel,
    extractedText: extractedText || "",
    signals,
    explanation: EXPLANATIONS[level],
    nextSteps: NEXT_STEPS[recommendation],
    ruleScore: score,
    aiScore: null,
    source: "RULES_ONLY",
    disclaimer: DISCLAIMER,
  };
}
