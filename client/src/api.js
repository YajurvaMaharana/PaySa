const MOCK_RESULT = {
  id: "mock-1234",
  score: 85,
  level: "HIGH",
  recommendation: "PAUSE",
  category: "JOB_TASK",
  categoryLabel: {
    en: "Fake Job / Task Fraud",
    hi: "फर्जी नौकरी / टास्क फ्रॉड"
  },
  extractedText: "Part-time job offer! Earn Rs 3000-5000 daily working from home just by liking YouTube videos. Message us to start now.",
  signals: [
    {
      type: "TOO_GOOD_TO_BE_TRUE",
      phrase: "Earn Rs 3000-5000 daily working from home",
      weight: 40,
      reason: {
        en: "Promises unrealistically high daily income for very little work.",
        hi: "बहुत कम काम के लिए बहुत ज़्यादा रोज़ की कमाई का वादा कर रहा है।"
      }
    },
    {
      type: "URGENCY",
      phrase: "Message us to start now",
      weight: 30,
      reason: {
        en: "Pressures you to act immediately without thinking.",
        hi: "बिना सोचे-समझे तुरंत काम करने का दबाव बना रहा है।"
      }
    }
  ],
  explanation: {
    en: "This is a classic 'Task Fraud' scam. Scammers promise easy money for simple tasks like liking videos. They usually pay a small amount first to build trust, then demand a 'security deposit' or 'VIP fee' which they steal.",
    hi: "यह एक 'टास्क फ्रॉड' (नौकरी का झाँसा) है। ठग आसान काम जैसे वीडियो लाइक करने के बदले पैसे देने का वादा करते हैं। भरोसा जीतने के लिए वे पहले थोड़े पैसे देते हैं, फिर 'सिक्योरिटी फीस' माँगते हैं और पैसे लेकर गायब हो जाते हैं।"
  },
  nextSteps: {
    en: [
      "Do not reply to this message.",
      "Block the sender immediately.",
      "Never pay a fee to get a job."
    ],
    hi: [
      "इस मैसेज का जवाब न दें।",
      "भेजने वाले को तुरंत ब्लॉक करें।",
      "नौकरी पाने के लिए कभी भी पैसे न दें।"
    ]
  },
  ruleScore: 70,
  aiScore: 85,
  source: "AI+RULES",
  disclaimer: {
    en: "This is an AI recommendation. Always exercise caution.",
    hi: "यह AI की सलाह है। हमेशा सावधानी बरतें।"
  }
};

export const analyze = async ({ text, image, mimeType, language }) => {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_RESULT), 1200);
    });
  }

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, image, mimeType, language })
    });

    const data = await response.json();

    if (!response.ok) {
      // Data should contain an 'error' code like "BAD_INPUT", etc.
      throw new Error(data.error || "SERVER_ERROR");
    }

    return data;
  } catch (error) {
    // If it's a known string error from our backend or fetch failed
    if (["BAD_INPUT", "TOO_LARGE", "IMAGE_READ_FAILED", "RATE_LIMITED", "SERVER_ERROR"].includes(error.message)) {
      throw error;
    }
    // Fallback for network issues
    throw new Error("SERVER_ERROR");
  }
};
