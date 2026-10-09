# TrustPause - Project Context (read this before EVERY task)
## What we are building
TrustPause is a multilingual (English + Hindi) AI payment-safety copilot for India. A user pastes a
suspicious message or uploads a
screenshot. The app: (1) explains WHY it is suspicious, (2) shows a Low/Medium/High risk score with a
probable scam category,
(3) recommends a Safety Pause action (Do not pay / Verify official source / Proceed carefully), (4) checks QR
intent (paying vs receiving),
(5) alerts a trusted person, (6) guides Emergency Recovery if money was already sent (call 1930, preserve
evidence, contact bank/app,
report on cybercrime.gov.in).
Tagline: Pause. Verify. Pay safely. Users: students, first-time UPI users, parents, seniors, gig workers.
## Stack (do not change)
- client/ : React + Vite + Tailwind CSS (official Vite plugin), react-router-dom, lucide-react, mobile-first
- server/ : Node.js + Express (ES modules), @google/genai for Gemini, NO database (stateless)
- Production: Express serves client/dist. Single deployment on Render.
- NOT allowed: FastAPI, custom ML training, login/auth, real UPI/bank integration, transaction blocking,
budgeting/loan/stock features.
## Ownership
- Member A edits only server/ and root files. Member B edits only client/ and docs/. Never edit the other
member's folder.
- Exception: Member A creates ONLY client/src/pages/Recovery.jsx and client/src/i18n/recovery.js.
## API contract (FROZEN - do not change field names)
POST /api/analyze
Request: { text?: string(max 4000), image?: base64 string (no data: prefix), mimeType?:
image/jpeg|image/png|image/webp, language?: "en"|"hi" }
Response: { id, score:0-100, level:"LOW"|"MEDIUM"|"HIGH",
recommendation:"PAUSE"|"VERIFY"|"PROCEED_CAREFULLY",
category: FAKE_KYC|REFUND_QR|UTILITY_DISCONNECT|JOB_TASK|COURIER_CUSTOMS|AUTHORITY_ARREST|LOTTERY_REWARD|R
EMOTE_ACCESS|PHISHING_LINK|INVESTMENT|NONE,
categoryLabel:{en,hi}, extractedText:string,
signals:[{type:URGENCY|PAYMENT_DEMAND|CREDENTIAL_REQUEST|IMPERSONATION|SUSPICIOUS_LINK|TOO_GOOD_TO_BE_TRUE, phrase:string, weight:number, reason:{en,hi}}],
explanation:{en,hi}, nextSteps:{en:string[],hi:string[]}, ruleScore:number, aiScore:number|null,
source:"AI+RULES"|"RULES_ONLY", disclaimer:{en,hi} }
Errors: { error: "BAD_INPUT"|"TOO_LARGE"|"IMAGE_READ_FAILED"|"RATE_LIMITED"|"SERVER_ERROR", message: string }
GET /api/health -> { ok:true, geminiConfigured:boolean }
Frontend highlights text by matching signal.phrase (case-insensitive) inside extractedText.
## Risk scoring (rule engine)
+30 URGENCY/fear (today, immediately, last chance, account blocked) | +25 PAYMENT_DEMAND (send money, pay
fee, transfer, scan QR, refund fee)
+20 CREDENTIAL_REQUEST (OTP, UPI PIN, CVV, screen share, remote-access app) | +15 IMPERSONATION (bank, KYC,
customer care, police, courier, govt)
+10 SUSPICIOUS_LINK or TOO_GOOD_TO_BE_TRUE (odd URL/UPI pattern, lottery, easy job, guaranteed returns). Each
type counted once; +15 combo bonus when PAYMENT_DEMAND and CREDENTIAL_REQUEST both match. Cap 100.
Labels: 0-29 LOW | 30-59 MEDIUM | 60-100 HIGH.
Hybrid: finalScore = round(0.6*ruleScore + 0.4*aiScore); rules-only fallback if AI fails.
## Design rules
- Mobile-first (390px), max width ~560px column on desktop. Calm, trustworthy, decisive. No flashing or
alarmist animation.
- Colors: navy #0B1F3A (header), teal #0E8F8E (primary), red #DC2626 (high), amber #F59E0B (medium), green
#16A34A (low), slate neutrals.
- Font: Inter via @fontsource/inter (no external CDN). Body text >= 16px. Tap targets >= 48px.
- Every UI string lives in client/src/i18n/*.js (one file per screen, each exporting {en,hi}, keys prefixed
by screen name; index.js merges them) - never hard-coded. Hindi = simple everyday Devanagari Hindi.
## Hard rules
- Never claim TrustPause stops fraud or guarantees safety. Show: "This is a safety recommendation, not a
guarantee."
- Never store messages on the server. Never log message content (log only level, source, latency).
- API keys only in server/.env (gitignored). Never in client code or in logs.
- A UPI PIN is only needed to SEND money, never to RECEIVE money. A QR code is only used to PAY.
- Never tell users to click links, call numbers found in the message, or share OTP/PIN.
- After every task: run the app, fix errors, and summarise the files you changed.
