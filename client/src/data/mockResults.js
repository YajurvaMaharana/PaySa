export const mockResults = [
  {
    id: "mock-high",
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
        phrase: "Earn Rs 3000-5000 daily",
        weight: 40,
        reason: {
          en: "Promises unrealistically high daily income for very little work.",
          hi: "बहुत कम काम के लिए बहुत ज़्यादा रोज़ की कमाई का वादा कर रहा है।"
        }
      },
      {
        type: "URGENCY",
        phrase: "start now",
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
    },
    scamDna: {
      fingerprint: {
        category: "JOB_TASK",
        language: "english",
        urgency: 0.94,
        fear: 0.1,
        payment_demand: 0.8,
        authority_impersonation: 0.0,
        credential_harvesting: 0.0,
        contains_link: false,
        channel: "sms",
        risk_score: 85
      },
      dnaHash: "DNA-JOBT-94U-0A-80P",
      campaignClusterMatch: "This message resembles 22 anonymized task/job scam examples."
    }
  },
  {
    id: "mock-medium",
    score: 55,
    level: "MEDIUM",
    recommendation: "VERIFY",
    category: "AUTHORITY_ARREST",
    categoryLabel: {
      en: "Impersonation / Authority Scam",
      hi: "फ़र्ज़ी पहचान / पुलिस का डर"
    },
    extractedText: "Notice: There is a fine pending on your account. Please pay Rs 500 clearance fee at the earliest to avoid penalty.",
    signals: [
      {
        type: "PAYMENT_DEMAND",
        phrase: "pay Rs 500 clearance fee",
        weight: 25,
        reason: {
          en: "Asking for a small fee out of nowhere.",
          hi: "अचानक एक छोटी सी फीस की माँग की जा रही है।"
        }
      },
      {
        type: "IMPERSONATION",
        phrase: "Notice: There is a fine pending",
        weight: 15,
        reason: {
          en: "Pretends to be from an official authority issuing a fine.",
          hi: "किसी सरकारी विभाग से जुर्माना होने का दिखावा कर रहा है।"
        }
      }
    ],
    explanation: {
      en: "The sender claims you have a pending fine and demands a clearance fee. Scammers use this tactic to collect small payments from many people.",
      hi: "मैसेज भेजने वाला कह रहा है कि आप पर जुर्माना बाकी है और उसे भरने के लिए फीस माँग रहा है। ठग कई लोगों से छोटे-छोटे पैसे ऐंठने के लिए यह तरीका अपनाते हैं।"
    },
    nextSteps: {
      en: [
        "Check your official accounts directly, not through links in the message.",
        "Do not pay the fee requested."
      ],
      hi: [
        "मैसेज में दिए गए लिंक के बजाय सीधे अपने आधिकारिक अकाउंट की जाँच करें।",
        "माँगी गई फीस न भरें।"
      ]
    },
    ruleScore: 40,
    aiScore: 55,
    source: "AI+RULES",
    disclaimer: {
      en: "This is an AI recommendation. Always exercise caution.",
      hi: "यह AI की सलाह है। हमेशा सावधानी बरतें।"
    },
    scamDna: {
      fingerprint: {
        category: "AUTHORITY_ARREST",
        language: "english",
        urgency: 0.3,
        fear: 0.88,
        payment_demand: 0.95,
        authority_impersonation: 0.92,
        credential_harvesting: 0.0,
        contains_link: false,
        channel: "sms",
        risk_score: 55
      },
      dnaHash: "DNA-AUTH-30U-92A-95P",
      campaignClusterMatch: "This message resembles 14 anonymized fake-fine scam examples."
    }
  },
  {
    id: "mock-low",
    score: 15,
    level: "LOW",
    recommendation: "PROCEED_CAREFULLY",
    category: "NONE",
    categoryLabel: {
      en: "General Message",
      hi: "सामान्य मैसेज"
    },
    extractedText: "Hi Rahul, are we still meeting for coffee at 5 PM today?",
    signals: [],
    explanation: {
      en: "This message looks like a normal conversation. We couldn't find any common scam patterns like demands for money, suspicious links, or extreme urgency.",
      hi: "यह मैसेज एक सामान्य बातचीत जैसा लग रहा है। हमें इसमें पैसे माँगने, संदिग्ध लिंक या बहुत जल्दबाज़ी जैसे किसी आम फ्रॉड के संकेत नहीं मिले।"
    },
    nextSteps: {
      en: [
        "If you know the sender, you can proceed normally.",
        "If the number is unknown, be careful sharing personal information."
      ],
      hi: [
        "अगर आप भेजने वाले को जानते हैं, तो आप सामान्य रूप से बात कर सकते हैं।",
        "अगर नंबर अनजान है, तो निजी जानकारी शेयर करने से बचें।"
      ]
    },
    ruleScore: 10,
    aiScore: 15,
    source: "AI+RULES",
    disclaimer: {
      en: "This is an AI recommendation. Always exercise caution.",
      hi: "यह AI की सलाह है। हमेशा सावधानी बरतें।"
    }
  }
];
