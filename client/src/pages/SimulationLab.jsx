import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Lock,
  ExternalLink,
  UserCheck,
  CreditCard,
  KeyRound,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { useT } from '../i18n';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const SimulationLab = () => {
  const { t, lang } = useT();
  const navigate = useNavigate();

  // Core Vector States
  const [vectors, setVectors] = useState({
    urgency: false,     // +30
    fear: false,        // +20
    payment: false,     // +25
    credential: false,  // +20
    authority: false,   // +15
    link: false,        // +10
  });

  // Combo toggle (automatically enabled when both payment & credential are on, but user can also explicitly toggle)
  const [manualCombo, setManualCombo] = useState(null);

  // Copy notification state
  const [copied, setCopied] = useState(false);

  // Derived combo state: true if either manual override is true, or (manual is not false AND both payment & credential are on)
  const isComboActive = useMemo(() => {
    if (manualCombo !== null) return manualCombo;
    return vectors.payment && vectors.credential;
  }, [manualCombo, vectors.payment, vectors.credential]);

  // Reset manual override if vectors change
  useEffect(() => {
    if (!vectors.payment || !vectors.credential) {
      setManualCombo(null);
    }
  }, [vectors.payment, vectors.credential]);

  // Calculate scores
  const { baseScore, comboBonus, totalScore, riskLevel } = useMemo(() => {
    let base = 0;
    if (vectors.urgency) base += 30;
    if (vectors.fear) base += 20;
    if (vectors.payment) base += 25;
    if (vectors.credential) base += 20;
    if (vectors.authority) base += 15;
    if (vectors.link) base += 10;

    const combo = isComboActive ? 15 : 0;
    const total = Math.min(100, base + combo);

    let level = 'LOW';
    if (total >= 70) {
      level = 'HIGH';
    } else if (total >= 40) {
      level = 'MEDIUM';
    }

    return {
      baseScore: base,
      comboBonus: combo,
      totalScore: total,
      riskLevel: level,
    };
  }, [vectors, isComboActive]);

  // Toggle individual vector
  const toggleVector = (key) => {
    setVectors((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Reset all
  const handleReset = () => {
    setVectors({
      urgency: false,
      fear: false,
      payment: false,
      credential: false,
      authority: false,
      link: false,
    });
    setManualCombo(null);
  };

  // Preset scenarios
  const applyPreset = (preset) => {
    if (preset === 'clean') {
      handleReset();
    } else if (preset === 'account_block') {
      setVectors({
        urgency: true,
        fear: true,
        payment: true,
        credential: false,
        authority: true,
        link: true,
      });
      setManualCombo(null);
    } else if (preset === 'digital_arrest') {
      setVectors({
        urgency: true,
        fear: true,
        payment: true,
        credential: true,
        authority: true,
        link: false,
      });
      setManualCombo(null);
    } else if (preset === 'refund_qr') {
      setVectors({
        urgency: false,
        fear: false,
        payment: true,
        credential: true,
        authority: false,
        link: true,
      });
      setManualCombo(null);
    }
  };

  // Dynamically assemble simulated scam message
  const assembledMessage = useMemo(() => {
    const parts = [];

    if (lang === 'hi') {
      if (vectors.authority) {
        parts.push("प्रिय ग्राहक, यह भारतीय रिजर्व बैंक (RBI) एवं साइबर अपराध शाखा से वरिष्ठ जांच अधिकारी बोल रहे हैं।");
      }
      if (vectors.fear) {
        parts.push("तत्काल सूचना: आपके बैंक खाते में गंभीर संदिग्ध लेन-देन मिला है। आपका खाता तुरंत बंद किया जा रहा है और पुलिस में FIR दर्ज हो रही है।");
      }
      if (vectors.urgency) {
        parts.push("अंतिम चेतावनी: खाता स्थायी रूप से सील होने से बचाने के लिए आज ही तुरंत 24 घंटे के भीतर संपर्क करें।");
      }
      if (vectors.payment) {
        parts.push("खाता सत्यापन हेतु तुरंत ₹25 की रिफंडेबल सुरक्षा फीस भेजें या नीचे दिया गया QR कोड स्कैन करें।");
      }
      if (vectors.credential) {
        parts.push("पहचान की पुष्टि के लिए एसएमएस में आया 6-अंकों का OTP साझा करें और सत्यापन स्क्रीन पर अपना UPI पिन दर्ज करें।");
      }
      if (vectors.link) {
        parts.push("आधिकारिक सुरक्षा पोर्टल लिंक खोलें: http://bit.ly/bank-kyc-verify अथवा जांच के लिए सत्यापन .apk ऐप इंस्टॉल करें।");
      }
    } else {
      if (vectors.authority) {
        parts.push("Dear Customer, this is Senior Verification Officer from Reserve Bank of India / Cyber Police Cell.");
      }
      if (vectors.fear) {
        parts.push("Urgent Notice: Suspicious unauthorized activities detected on your bank account. Your account will be permanently blocked and a police FIR filed.");
      }
      if (vectors.urgency) {
        parts.push("Final Chance: You must resolve this immediately today within the next 24 hours to prevent immediate freezing.");
      }
      if (vectors.payment) {
        parts.push("To unblock your services, pay a refundable verification charge of Rs 25 or scan the official QR code.");
      }
      if (vectors.credential) {
        parts.push("Share your 6-digit verification OTP and enter your UPI PIN on the verification screen to authenticate your identity.");
      }
      if (vectors.link) {
        parts.push("Visit our security update portal at http://bit.ly/bank-kyc-auth or download the security update .apk app.");
      }
    }

    if (parts.length === 0) {
      return '';
    }

    return parts.join(' ');
  }, [vectors, lang]);

  // Copy to clipboard
  const handleCopy = async () => {
    if (!assembledMessage) return;
    try {
      await navigator.clipboard.writeText(assembledMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.warn("Copy failed:", err);
    }
  };

  // Navigate to scanner with text prefilled
  const handleTestInScanner = () => {
    if (!assembledMessage) return;
    localStorage.setItem('tp_scan_prefill', assembledMessage);
    navigate('/');
  };

  // Color mappings
  const theme = useMemo(() => {
    if (riskLevel === 'HIGH') {
      return {
        bg: 'bg-red-500',
        text: 'text-red-700',
        textDark: 'text-red-900',
        border: 'border-red-300',
        lightBg: 'bg-red-50',
        badgeBg: 'bg-red-100 text-red-800 border-red-200',
        ring: 'ring-red-400',
        shadow: 'shadow-red-200',
        label: t('simulate.level.high'),
        desc: t('simulate.level.highDesc'),
        icon: ShieldAlert,
      };
    }
    if (riskLevel === 'MEDIUM') {
      return {
        bg: 'bg-amber-500',
        text: 'text-amber-700',
        textDark: 'text-amber-900',
        border: 'border-amber-300',
        lightBg: 'bg-amber-50',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
        ring: 'ring-amber-400',
        shadow: 'shadow-amber-200',
        label: t('simulate.level.medium'),
        desc: t('simulate.level.mediumDesc'),
        icon: AlertTriangle,
      };
    }
    return {
      bg: 'bg-emerald-500',
      text: 'text-emerald-700',
      textDark: 'text-emerald-900',
      border: 'border-emerald-300',
      lightBg: 'bg-emerald-50',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      ring: 'ring-emerald-400',
      shadow: 'shadow-emerald-200',
      label: t('simulate.level.low'),
      desc: t('simulate.level.lowDesc'),
      icon: ShieldCheck,
    };
  }, [riskLevel, t]);

  const StatusIcon = theme.icon;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header Card */}
      <div className="bg-navy rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/20 text-brand-teal border border-brand/30">
              <FlaskConical className="h-3.5 w-3.5" />
              {t('simulate.badge')}
            </span>
            <button
              onClick={handleReset}
              className="text-xs text-gray-300 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-white/10"
              title={t('simulate.reset')}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t('simulate.reset')}</span>
            </button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t('simulate.title')}</h1>
          <p className="text-sm text-gray-300 leading-relaxed">
            {t('simulate.description')}
          </p>
        </div>
      </div>

      {/* Prominent Judge Tagline Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 via-sky-50 to-indigo-50 border border-teal-200/80 shadow-sm flex items-start gap-3">
        <div className="p-2 bg-brand/10 text-brand rounded-lg shrink-0 mt-0.5">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-teal-800">
            Explainable AI Principle
          </div>
          <p className="text-sm font-semibold text-navy leading-snug">
            &ldquo;{t('simulate.judgeTagline')}&rdquo;
          </p>
        </div>
      </div>

      {/* Dynamic Risk Meter Hero Card */}
      <Card className="p-5 shadow-sm border border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              {t('simulate.scoreTitle')}
            </h2>
            <p className="text-xs text-gray-500">
              Low: 0-39 &bull; Medium: 40-69 &bull; High: 70-100
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${theme.badgeBg}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            <span>{theme.label}</span>
          </div>
        </div>

        {/* Score Number and Progress Bar */}
        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-extrabold tracking-tight transition-all duration-300 ${theme.text}`}>
                {totalScore}
              </span>
              <span className="text-lg text-gray-400 font-medium">/100</span>
            </div>
            <div className="text-xs text-gray-500 font-medium flex items-center gap-2">
              <span>{t('simulate.formulaBase')}: <strong>+{baseScore}</strong></span>
              {isComboActive && (
                <span className="text-red-600 font-semibold">
                  + {t('simulate.formulaCombo')}: <strong>+15</strong>
                </span>
              )}
            </div>
          </div>

          {/* Animated Multi-Segment Progress Track */}
          <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${theme.bg}`}
              style={{ width: `${Math.max(5, totalScore)}%` }}
            />
          </div>
        </div>

        {/* Dynamic Assessment description */}
        <div className={`p-3 rounded-lg text-xs leading-relaxed border ${theme.lightBg} ${theme.border} ${theme.textDark}`}>
          {theme.desc}
        </div>

        {/* Presets Row */}
        <div className="pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500 font-medium mb-2">
            Quick Scenarios:
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => applyPreset('clean')}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              Clean (0)
            </button>
            <button
              onClick={() => applyPreset('refund_qr')}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
            >
              Refund QR (70)
            </button>
            <button
              onClick={() => applyPreset('account_block')}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 transition-colors"
            >
              Hinglish Threat (85)
            </button>
            <button
              onClick={() => applyPreset('digital_arrest')}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-red-100 hover:bg-red-200 text-red-900 border border-red-300 font-semibold transition-colors"
            >
              Digital Arrest (100)
            </button>
          </div>
        </div>
      </Card>

      {/* Interactive Vector Toggles Section */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-navy">
            {t('simulate.vectorsTitle')}
          </h2>
          <p className="text-xs text-gray-500">
            {t('simulate.vectorsSubtitle')}
          </p>
        </div>

        <div className="space-y-2.5">
          {/* 1. Urgency trigger (+30) */}
          <label
            onClick={() => toggleVector('urgency')}
            className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              vectors.urgency
                ? 'bg-red-50/70 border-red-400 shadow-sm ring-1 ring-red-400'
                : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <input
                type="checkbox"
                checked={vectors.urgency}
                onChange={() => {}}
                className="mt-1 h-4 w-4 rounded text-brand focus:ring-brand border-gray-300 pointer-events-none"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900">
                    {t('simulate.vector.urgency.title')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-mono">
                  {t('simulate.vector.urgency.examples')}
                </p>
              </div>
            </div>
            <span className="shrink-0 px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 border border-red-200">
              +30
            </span>
          </label>

          {/* 2. Fear factor (+20) */}
          <label
            onClick={() => toggleVector('fear')}
            className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              vectors.fear
                ? 'bg-red-50/70 border-red-400 shadow-sm ring-1 ring-red-400'
                : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <input
                type="checkbox"
                checked={vectors.fear}
                onChange={() => {}}
                className="mt-1 h-4 w-4 rounded text-brand focus:ring-brand border-gray-300 pointer-events-none"
              />
              <div className="space-y-0.5">
                <span className="font-semibold text-sm text-gray-900">
                  {t('simulate.vector.fear.title')}
                </span>
                <p className="text-xs text-gray-500 font-mono">
                  {t('simulate.vector.fear.examples')}
                </p>
              </div>
            </div>
            <span className="shrink-0 px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 border border-red-200">
              +20
            </span>
          </label>

          {/* 3. Payment demand (+25) */}
          <label
            onClick={() => toggleVector('payment')}
            className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              vectors.payment
                ? 'bg-amber-50/80 border-amber-400 shadow-sm ring-1 ring-amber-400'
                : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <input
                type="checkbox"
                checked={vectors.payment}
                onChange={() => {}}
                className="mt-1 h-4 w-4 rounded text-brand focus:ring-brand border-gray-300 pointer-events-none"
              />
              <div className="space-y-0.5">
                <span className="font-semibold text-sm text-gray-900">
                  {t('simulate.vector.payment.title')}
                </span>
                <p className="text-xs text-gray-500 font-mono">
                  {t('simulate.vector.payment.examples')}
                </p>
              </div>
            </div>
            <span className="shrink-0 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              +25
            </span>
          </label>

          {/* 4. Credential request (+20) */}
          <label
            onClick={() => toggleVector('credential')}
            className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              vectors.credential
                ? 'bg-amber-50/80 border-amber-400 shadow-sm ring-1 ring-amber-400'
                : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <input
                type="checkbox"
                checked={vectors.credential}
                onChange={() => {}}
                className="mt-1 h-4 w-4 rounded text-brand focus:ring-brand border-gray-300 pointer-events-none"
              />
              <div className="space-y-0.5">
                <span className="font-semibold text-sm text-gray-900">
                  {t('simulate.vector.credential.title')}
                </span>
                <p className="text-xs text-gray-500 font-mono">
                  {t('simulate.vector.credential.examples')}
                </p>
              </div>
            </div>
            <span className="shrink-0 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              +20
            </span>
          </label>

          {/* 5. Authority disguise (+15) */}
          <label
            onClick={() => toggleVector('authority')}
            className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              vectors.authority
                ? 'bg-blue-50/80 border-blue-400 shadow-sm ring-1 ring-blue-400'
                : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <input
                type="checkbox"
                checked={vectors.authority}
                onChange={() => {}}
                className="mt-1 h-4 w-4 rounded text-brand focus:ring-brand border-gray-300 pointer-events-none"
              />
              <div className="space-y-0.5">
                <span className="font-semibold text-sm text-gray-900">
                  {t('simulate.vector.authority.title')}
                </span>
                <p className="text-xs text-gray-500 font-mono">
                  {t('simulate.vector.authority.examples')}
                </p>
              </div>
            </div>
            <span className="shrink-0 px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              +15
            </span>
          </label>

          {/* 6. Unverified link / APK (+10) */}
          <label
            onClick={() => toggleVector('link')}
            className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              vectors.link
                ? 'bg-purple-50/80 border-purple-400 shadow-sm ring-1 ring-purple-400'
                : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <input
                type="checkbox"
                checked={vectors.link}
                onChange={() => {}}
                className="mt-1 h-4 w-4 rounded text-brand focus:ring-brand border-gray-300 pointer-events-none"
              />
              <div className="space-y-0.5">
                <span className="font-semibold text-sm text-gray-900">
                  {t('simulate.vector.link.title')}
                </span>
                <p className="text-xs text-gray-500 font-mono">
                  {t('simulate.vector.link.examples')}
                </p>
              </div>
            </div>
            <span className="shrink-0 px-2.5 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              +10
            </span>
          </label>

          {/* 7. Combo multiplier active (Payment + Credential) (+15) */}
          <label
            onClick={() => setManualCombo((prev) => (prev === null ? !isComboActive : !prev))}
            className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              isComboActive
                ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-500 shadow-md ring-2 ring-red-400'
                : 'bg-gray-50/80 border-dashed border-gray-300 text-gray-500 opacity-80'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <input
                type="checkbox"
                checked={isComboActive}
                onChange={() => {}}
                className="mt-1 h-4 w-4 rounded text-red-600 focus:ring-red-500 border-gray-300 pointer-events-none"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`font-semibold text-sm ${isComboActive ? 'text-red-900' : 'text-gray-700'}`}>
                    {t('simulate.vector.combo.title')}
                  </span>
                  {vectors.payment && vectors.credential && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase">
                      Auto-Triggered
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {t('simulate.vector.combo.examples')}
                </p>
              </div>
            </div>
            <span className={`shrink-0 px-2.5 py-1 text-xs font-extrabold rounded-full border ${
              isComboActive
                ? 'bg-red-600 text-white border-red-700 animate-pulse'
                : 'bg-gray-200 text-gray-600 border-gray-300'
            }`}>
              +15
            </span>
          </label>
        </div>
      </div>

      {/* Dynamically Assembled Scam Message Preview Box */}
      <Card className="p-5 shadow-sm border border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                assembledMessage ? 'bg-red-400' : 'bg-gray-300'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                assembledMessage ? 'bg-red-500' : 'bg-gray-400'
              }`} />
            </span>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              {t('simulate.preview.title')}
            </h3>
          </div>
          {assembledMessage && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
              Live Synthesis
            </span>
          )}
        </div>

        {/* Message bubble */}
        <div className="p-4 rounded-xl bg-gray-900 text-gray-100 text-sm font-sans leading-relaxed min-h-[100px] flex items-center shadow-inner relative">
          {assembledMessage ? (
            <div className="space-y-2 w-full">
              <div className="flex items-center justify-between border-b border-gray-700 pb-2 mb-2 text-xs text-gray-400">
                <span className="font-mono font-medium text-teal-400">SMS / WhatsApp Simulation</span>
                <span className="text-gray-400">Today, 2:45 PM</span>
              </div>
              <p className="font-medium text-gray-100 select-all whitespace-pre-wrap">
                {assembledMessage}
              </p>
            </div>
          ) : (
            <div className="text-center w-full py-4 text-gray-400 italic text-xs">
              {t('simulate.preview.empty')}
            </div>
          )}
        </div>

        {/* Preview Actions */}
        {assembledMessage && (
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-safe" />
                  <span className="text-safe font-semibold">{t('simulate.preview.copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>{t('simulate.preview.copy')}</span>
                </>
              )}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleTestInScanner}
              className="flex-1 min-w-[140px] bg-brand hover:bg-brand/90 text-white flex items-center justify-center gap-1.5"
            >
              <span>{t('simulate.preview.testInScanner')}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>

      {/* Educational Explainability Card */}
      <div className="p-4 rounded-xl bg-gray-100/80 border border-gray-200 text-xs text-gray-600 space-y-1.5">
        <div className="font-semibold text-gray-800 flex items-center gap-1.5">
          <Info className="h-4 w-4 text-teal-600" />
          <span>Why Deterministic Vectors + AI?</span>
        </div>
        <p className="leading-relaxed">
          Standard black-box LLMs are prone to hallucinations and non-deterministic scoring. TrustPause anchors every analysis to calibrated, quantifiable fraud vectors before applying LLM natural language understanding. This guarantees explainable, audited safety scores that users and regulators can trust.
        </p>
      </div>
    </div>
  );
};
export default SimulationLab;
