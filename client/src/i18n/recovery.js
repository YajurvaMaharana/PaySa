// client/src/i18n/recovery.js – Bilingual strings for Emergency Recovery page
// Tone: calm, steady, step-by-step. Never promise that money will be recovered.

export default {
  en: {
    "recovery.headline": "Act fast. You have options.",
    "recovery.subheadline": "Follow these steps one by one. Staying calm and moving quickly makes all the difference.",
    "recovery.timeQuestion": "When did you pay?",
    "recovery.time.justNow": "Just now",
    "recovery.time.within1Hour": "Within 1 hour",
    "recovery.time.today": "Today",
    "recovery.time.earlier": "Earlier",
    "recovery.urgentNotice": "Reporting quickly gives the best chance. Start with step 1 right away.",
    "recovery.gentleNotice": "Every official step matters, even if some time has passed. Work through the steps below.",
    "recovery.progress": "{done} of {total} steps completed",
    "recovery.markDone": "Mark as completed",
    "recovery.completed": "Completed",

    // Step 1
    "recovery.step1.title": "1. Call national cyber helpline 1930",
    "recovery.step1.desc": "Dial 1930 immediately to report the fraud to the Indian Cyber Crime Coordination Centre (I4C). They can attempt to freeze the recipient's bank or UPI account before the funds are withdrawn.",
    "recovery.step1.tip": "Tip: Keep your transaction ID/UTR and the scammer's number or UPI ID ready before calling.",
    "recovery.step1.action": "Call 1930 Now",

    // Step 2
    "recovery.step2.title": "2. Contact your bank or payment app",
    "recovery.step2.desc": "Call the customer helpline number printed on the back of your debit card or inside your official banking app. Ask them to block compromised cards/UPI and immediately register a fraudulent transaction dispute.",
    "recovery.step2.tip": "Tip: Never search for customer care numbers on Google. Only use the number on your physical card or inside your official app.",
    "recovery.step2.action": "Call Bank Helpline",

    // Step 3
    "recovery.step3.title": "3. Preserve all evidence",
    "recovery.step3.desc": "Take clear screenshots of everything: chat messages, payment receipts, scammer's phone number, UPI ID, profile, and website links. Do NOT delete the chat or uninstall any apps.",
    "recovery.step3.tip": "Tip: Note down the exact date, time, and 12-digit UTR number for each debit.",
    "recovery.step3.action": "Copy Evidence Checklist",
    "recovery.step3.copied": "Checklist copied to clipboard!",

    // Step 4
    "recovery.step4.title": "4. Report on the official cybercrime portal",
    "recovery.step4.desc": "Register a formal complaint on the National Cyber Crime Reporting Portal (cybercrime.gov.in). You will receive an official acknowledgment number needed for bank dispute resolution and police investigation.",
    "recovery.step4.tip": "Tip: Attach the evidence screenshots and paste the formatted summary generated below.",
    "recovery.step4.action": "Open cybercrime.gov.in",

    // Step 5
    "recovery.step5.title": "5. Secure your accounts & devices",
    "recovery.step5.desc": "Stop replying to the scammer. Change your UPI PIN, ATM PIN, and net banking password immediately. Remove any remote-access app (like AnyDesk or QuickSupport) that you were asked to download.",
    "recovery.step5.tip": "Tip: Check your other bank accounts linked to the same phone number for suspicious activity.",
    "recovery.step5.action": "Mark Device & Accounts Secured",

    // Step 6
    "recovery.step6.title": "6. Tell a trusted person",
    "recovery.step6.desc": "Scams thrive on silence and shame. Informing a trusted family member or friend helps you stay supported and prevents scammers from isolating or pressuring you further.",
    "recovery.step6.tip": "Tip: Alert your Safety Circle contacts so they are aware and can assist you.",
    "recovery.step6.action": "Open Safety Circle",

    // Evidence Summary Generator
    "recovery.evidence.title": "Evidence Summary Generator",
    "recovery.evidence.desc": "Fill in the details below once to generate a clean, formatted text block you can copy and paste directly into cybercrime.gov.in or email to your bank's fraud desk.",
    "recovery.evidence.amount": "Amount lost (₹)",
    "recovery.evidence.amountPlaceholder": "e.g. 15000",
    "recovery.evidence.utr": "Transaction ID / UTR",
    "recovery.evidence.utrPlaceholder": "12-digit UTR or reference number",
    "recovery.evidence.scammer": "Scammer phone number / UPI ID",
    "recovery.evidence.scammerPlaceholder": "e.g. 9876543210 or fraud@upi",
    "recovery.evidence.dateTime": "Date & Time of incident",
    "recovery.evidence.dateTimePlaceholder": "e.g. 09-Oct-2026, 2:30 PM",
    "recovery.evidence.description": "Brief description of the scam",
    "recovery.evidence.descriptionPlaceholder": "e.g. Received a fake KYC threat asking to scan a QR code to avoid account blocking...",
    "recovery.evidence.copy": "Copy Summary for Bank / Portal",
    "recovery.evidence.copied": "Summary copied to clipboard!",
    "recovery.evidence.clear": "Clear Form",

    // Warning & Disclaimer
    "recovery.warning.title": "Beware of 'Recovery Agent' Scams",
    "recovery.warning.text": "Anyone who contacts you claiming they can 'hack back' your lost money or recover your funds for an upfront fee is a scammer. Legitimate recovery only occurs through official banking and law enforcement procedures.",
    "recovery.disclaimer": "TrustPause guides you to official channels. We cannot reverse payments or file cases for you."
  },
  hi: {
    "recovery.headline": "तुरंत कदम उठाएँ। आपके पास विकल्प हैं।",
    "recovery.subheadline": "एक-एक करके इन कदमों का पालन करें। शांत रहकर तुरंत कार्रवाई करना सबसे महत्वपूर्ण है।",
    "recovery.timeQuestion": "आपने पैसे कब भेजे?",
    "recovery.time.justNow": "अभी-अभी",
    "recovery.time.within1Hour": "1 घंटे के अंदर",
    "recovery.time.today": "आज",
    "recovery.time.earlier": "पहले",
    "recovery.urgentNotice": "जितनी जल्दी रिपोर्ट करेंगे, सफलता की संभावना उतनी बेहतर होगी। तुरंत पहले कदम से शुरू करें।",
    "recovery.gentleNotice": "समय बीत जाने के बाद भी हर आधिकारिक कदम महत्वपूर्ण है। नीचे दिए गए कदमों का पालन करें।",
    "recovery.progress": "{total} में से {done} कदम पूरे हुए",
    "recovery.markDone": "पूर्ण चिह्नित करें",
    "recovery.completed": "पूर्ण हुआ",

    // Step 1
    "recovery.step1.title": "1. राष्ट्रीय साइबर हेल्पलाइन 1930 पर कॉल करें",
    "recovery.step1.desc": "भारतीय साइबर अपराध समन्वय केंद्र (I4C) को सूचित करने के लिए तुरंत 1930 डायल करें। वे पैसे निकाले जाने से पहले ठग के बैंक या UPI खाते को फ्रीज करने का प्रयास कर सकते हैं।",
    "recovery.step1.tip": "सलाह: कॉल करने से पहले अपना UTR/ट्रांजेक्शन ID और ठग का नंबर या UPI ID पास रखें।",
    "recovery.step1.action": "अभी 1930 पर कॉल करें",

    // Step 2
    "recovery.step2.title": "2. अपने बैंक या पेमेंट ऐप से संपर्क करें",
    "recovery.step2.desc": "अपने डेबिट कार्ड के पीछे छपे या आधिकारिक बैंकिंग ऐप में मौजूद हेल्पलाइन नंबर पर कॉल करें। अपने कार्ड/UPI को ब्लॉक करवाएँ और धोखाधड़ी वाले लेनदेन का विवाद दर्ज कराएँ।",
    "recovery.step2.tip": "सलाह: गूगल पर बैंक कस्टमर केयर नंबर कभी न खोजें। केवल कार्ड पर छपे या आधिकारिक ऐप में दिए नंबर का उपयोग करें।",
    "recovery.step2.action": "बैंक हेल्पलाइन पर कॉल करें",

    // Step 3
    "recovery.step3.title": "3. सारे सबूत सुरक्षित रखें",
    "recovery.step3.desc": "सभी चीज़ों के साफ स्क्रीनशॉट लें: चैट, पेमेंट रसीद, ठग का फोन नंबर, UPI ID, प्रोफाइल और वेबसाइट लिंक। चैट डिलीट न करें और कोई ऐप अनइंस्टॉल न करें।",
    "recovery.step3.tip": "सलाह: हर लेनदेन की सही तारीख, समय और 12 अंकों का UTR नंबर लिख लें।",
    "recovery.step3.action": "सबूत चेकलिस्ट कॉपी करें",
    "recovery.step3.copied": "चेकलिस्ट क्लिपबोर्ड पर कॉपी हो गई!",

    // Step 4
    "recovery.step4.title": "4. आधिकारिक साइबर क्राइम पोर्टल पर शिकायत दर्ज करें",
    "recovery.step4.desc": "राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल (cybercrime.gov.in) पर औपचारिक शिकायत दर्ज करें। आपको एक पावती नंबर (acknowledgment number) मिलेगा जो बैंक और पुलिस कार्रवाई के लिए आवश्यक है।",
    "recovery.step4.tip": "सलाह: स्क्रीनशॉट और नीचे तैयार किया गया सबूत सारांश साथ में अपलोड करें।",
    "recovery.step4.action": "cybercrime.gov.in खोलें",

    // Step 5
    "recovery.step5.title": "5. अपने खाते और फोन सुरक्षित करें",
    "recovery.step5.desc": "ठग को जवाब देना तुरंत बंद करें। अपना UPI PIN, ATM PIN और नेट बैंकिंग पासवर्ड तुरंत बदलें। कोई भी रिमोट स्क्रीन-शेयरिंग ऐप (जैसे AnyDesk या QuickSupport) तुरंत डिलीट करें।",
    "recovery.step5.tip": "सलाह: उसी मोबाइल नंबर से जुड़े अपने अन्य बैंक खातों की भी जांच करें।",
    "recovery.step5.action": "खाते सुरक्षित चिह्नित करें",

    // Step 6
    "recovery.step6.title": "6. किसी भरोसेमंद व्यक्ति को बताएँ",
    "recovery.step6.desc": "धोखाधड़ी तब बढ़ती है जब हम झिझक या डर के कारण चुप रहते हैं। परिवार के किसी सदस्य या दोस्त को बताने से आपको संबल मिलता है और ठग आपको और परेशान नहीं कर पाते।",
    "recovery.step6.tip": "सलाह: अपने सेफ़्टी सर्कल संपर्कों को सतर्क करें ताकि वे आपकी मदद कर सकें।",
    "recovery.step6.action": "सेफ़्टी सर्कल खोलें",

    // Evidence Summary Generator
    "recovery.evidence.title": "सबूत सारांश जनरेटर",
    "recovery.evidence.desc": "नीचे दिए गए विवरण भरें ताकि बैंक या cybercrime.gov.in पोर्टल में सीधे पेस्ट करने के लिए एक सही फॉर्मेट वाला टेक्स्ट तैयार हो सके।",
    "recovery.evidence.amount": "गंवाई गई राशि (₹)",
    "recovery.evidence.amountPlaceholder": "उदा. 15000",
    "recovery.evidence.utr": "ट्रांजेक्शन ID / UTR",
    "recovery.evidence.utrPlaceholder": "12 अंकों का UTR या रेफरेंस नंबर",
    "recovery.evidence.scammer": "ठग का फोन नंबर / UPI ID",
    "recovery.evidence.scammerPlaceholder": "उदा. 9876543210 या scam@upi",
    "recovery.evidence.dateTime": "घटना की तारीख और समय",
    "recovery.evidence.dateTimePlaceholder": "उदा. 09-अक्टूबर-2026, दोपहर 2:30",
    "recovery.evidence.description": "धोखाधड़ी का संक्षिप्त विवरण",
    "recovery.evidence.descriptionPlaceholder": "उदा. फर्जी KYC मैसेज आया जिसमें खाता ब्लॉक होने का डर दिखाकर QR कोड स्कैन कराया गया...",
    "recovery.evidence.copy": "बैंक / पोर्टल के लिए सारांश कॉपी करें",
    "recovery.evidence.copied": "सारांश क्लिपबोर्ड पर कॉपी हो गया!",
    "recovery.evidence.clear": "फॉर्म साफ करें",

    // Warning & Disclaimer
    "recovery.warning.title": "'रिकवरी एजेंट' के फर्जीवाड़े से सावधान रहें",
    "recovery.warning.text": "कोई भी व्यक्ति जो पैसे वापस कराने का दावा करके अग्रिम फीस मांगता है, वह भी एक ठग है। असली कार्रवाई केवल आधिकारिक पुलिस और बैंकिंग प्रक्रियाओं के माध्यम से ही होती है।",
    "recovery.disclaimer": "TrustPause केवल आधिकारिक माध्यमों तक आपका मार्गदर्शन करता है। हम भुगतान वापस नहीं कर सकते और न ही आपकी ओर से केस दर्ज कर सकते हैं।"
  }
};
