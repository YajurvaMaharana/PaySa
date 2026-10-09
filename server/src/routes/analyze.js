// server/src/routes/analyze.js – POST /api/analyze (hardcoded mock for scaffold)
import { Router } from "express";
import { randomUUID } from "node:crypto";

const router = Router();

router.post("/", (req, res) => {
  const { text, image, language = "en" } = req.body ?? {};

  // Basic input validation
  if (!text && !image) {
    return res.status(400).json({
      error: "BAD_INPUT",
      message: "Provide at least one of: text or image.",
    });
  }
  if (text && text.length > 4000) {
    return res.status(400).json({
      error: "TOO_LARGE",
      message: "Text exceeds 4000 character limit.",
    });
  }

  // ── HARDCODED mock: HIGH-risk FAKE_KYC example ───────────────────────────
  const mock = {
    id: randomUUID(),
    score: 88,
    level: "HIGH",
    recommendation: "PAUSE",
    category: "FAKE_KYC",
    categoryLabel: {
      en: "Fake KYC Update",
      hi: "नकली KYC अपडेट",
    },
    extractedText:
      text ||
      "Your account will be blocked today. Complete KYC immediately by paying ₹1 fee and sharing your OTP to verify.",
    signals: [
      {
        type: "URGENCY",
        phrase: "blocked today",
        weight: 30,
        reason: {
          en: "Creates artificial urgency with a deadline to pressure immediate action.",
          hi: "तुरंत कार्रवाई के लिए दबाव बनाने हेतु कृत्रिम तात्कालिकता पैदा की गई है।",
        },
      },
      {
        type: "PAYMENT_DEMAND",
        phrase: "paying ₹1 fee",
        weight: 25,
        reason: {
          en: "Requests a small payment as a pretext to capture payment details.",
          hi: "भुगतान विवरण प्राप्त करने के बहाने एक छोटी राशि मांगी जा रही है।",
        },
      },
      {
        type: "IMPERSONATION",
        phrase: "KYC",
        weight: 15,
        reason: {
          en: "Impersonates official bank/regulatory KYC process to appear legitimate.",
          hi: "वैध दिखने के लिए आधिकारिक बैंक/नियामक KYC प्रक्रिया का रूप धारण किया गया है।",
        },
      },
    ],
    explanation: {
      en: "This message is a classic Fake KYC scam. It uses fear of account blocking, demands a small payment to steal your card/UPI details, and impersonates an official KYC process. Legitimate banks never ask you to pay a fee or share an OTP to complete KYC.",
      hi: "यह संदेश एक क्लासिक नकली KYC घोटाला है। यह खाता ब्लॉक होने के डर का उपयोग करता है, आपके कार्ड/UPI विवरण चुराने के लिए एक छोटी राशि मांगता है, और आधिकारिक KYC प्रक्रिया का रूप धारण करता है। असली बैंक कभी भी KYC पूरा करने के लिए शुल्क या OTP नहीं मांगते।",
    },
    nextSteps: {
      en: [
        "Do NOT pay any amount or share OTP/PIN.",
        "Call your bank's official helpline (number on the back of your card).",
        "Report the number/message to cybercrime.gov.in.",
        "Block the sender's number.",
      ],
      hi: [
        "कोई भी राशि न दें और OTP/PIN साझा न करें।",
        "अपने बैंक के आधिकारिक हेल्पलाइन नंबर पर कॉल करें (कार्ड के पीछे का नंबर)।",
        "नंबर/संदेश की सूचना cybercrime.gov.in पर दें।",
        "प्रेषक का नंबर ब्लॉक करें।",
      ],
    },
    ruleScore: 88,
    aiScore: null,
    source: "AI+RULES",
    disclaimer: {
      en: "This is a safety recommendation, not a guarantee. TrustPause does not stop fraud.",
      hi: "यह एक सुरक्षा सुझाव है, गारंटी नहीं। TrustPause धोखाधड़ी नहीं रोकता।",
    },
  };
  // ── Log only metadata, never message content (hard rule) ─────────────────
  console.log(`[analyze] level=${mock.level} source=${mock.source} score=${mock.score}`);

  return res.json(mock);
});

export default router;
