import React, { useState, useEffect } from 'react';
import {
  Phone,
  Building2,
  Camera,
  Globe,
  Lock,
  Users,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Clock,
  ShieldAlert,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { useT } from '../i18n';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import SafetyCircleModal from '../components/SafetyCircleModal';

export const Recovery = () => {
  const { t, lang } = useT();

  // ── 1. Timing selector state ──────────────────────────────────────────────
  const [timing, setTiming] = useState('justNow');

  // ── 2. Checklist state persisted in localStorage ──────────────────────────
  const [checkedSteps, setCheckedSteps] = useState(() => {
    try {
      const saved = localStorage.getItem('tp_recovery');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tp_recovery', JSON.stringify(checkedSteps));
    } catch (e) {
      console.warn('Failed to save recovery checklist', e);
    }
  }, [checkedSteps]);

  const toggleStep = (stepNumber) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const completedCount = [1, 2, 3, 4, 5, 6].filter((num) => checkedSteps[num]).length;

  // ── 3. Evidence Form persisted in localStorage ───────────────────────────
  const [evidence, setEvidence] = useState(() => {
    try {
      const saved = localStorage.getItem('tp_evidence_form');
      return saved
        ? JSON.parse(saved)
        : { amount: '', utr: '', scammer: '', dateTime: '', description: '' };
    } catch {
      return { amount: '', utr: '', scammer: '', dateTime: '', description: '' };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tp_evidence_form', JSON.stringify(evidence));
    } catch (e) {
      console.warn('Failed to save evidence form', e);
    }
  }, [evidence]);

  const handleEvidenceChange = (field, value) => {
    setEvidence((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearEvidence = () => {
    setEvidence({ amount: '', utr: '', scammer: '', dateTime: '', description: '' });
  };

  // ── 4. Toast notifications ────────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopySummary = () => {
    const isHi = lang === 'hi';
    const lines = isHi
      ? [
          '=== साइबर अपराध / बैंक धोखाधड़ी विवरण सारांश ===',
          `• गंवाई गई राशि: ₹${evidence.amount || 'अनुपलब्ध'}`,
          `• ट्रांजेक्शन ID / UTR: ${evidence.utr || 'अनुपलब्ध'}`,
          `• संदिग्ध नंबर / UPI ID: ${evidence.scammer || 'अनुपलब्ध'}`,
          `• घटना की तारीख व समय: ${evidence.dateTime || 'अनुपलब्ध'}`,
          `• विवरण: ${evidence.description || 'अनुपलब्ध'}`,
          '• रिपोर्टिंग माध्यम: TrustPause (https://cybercrime.gov.in)',
        ]
      : [
          '=== CYBERCRIME & BANK FRAUD EVIDENCE SUMMARY ===',
          `• Amount Lost: ₹${evidence.amount || 'Not provided'}`,
          `• Transaction ID / UTR: ${evidence.utr || 'Not provided'}`,
          `• Suspect Number / UPI ID: ${evidence.scammer || 'Not provided'}`,
          `• Date & Time: ${evidence.dateTime || 'Not provided'}`,
          `• Incident Description: ${evidence.description || 'Not provided'}`,
          '• Reported via: TrustPause (https://cybercrime.gov.in)',
        ];

    navigator.clipboard?.writeText(lines.join('\n'));
    showToast(t('recovery.evidence.copied'));
  };

  const handleCopyChecklist = () => {
    const checklistText =
      lang === 'hi'
        ? [
            'सबूत चेकलिस्ट:',
            '1. चैट का पूरा स्क्रीनशॉट',
            '2. पेमेंट रसीद (UTR और तारीख/समय सहित)',
            '3. ठग का फोन नंबर और UPI ID',
            '4. बैंक मैसेज / डेबिट अलर्ट',
            '5. कोई भी वेबसाइट लिंक या QR कोड',
          ].join('\n')
        : [
            'Evidence Checklist:',
            '1. Full screenshot of chat conversation',
            '2. Payment debit receipt (with UTR, amount, and timestamp)',
            '3. Suspect phone number and UPI ID',
            '4. Bank SMS / transaction confirmation',
            '5. Any phishing links or QR codes used',
          ].join('\n');

    navigator.clipboard?.writeText(checklistText);
    showToast(t('recovery.step3.copied'));
  };

  // ── 5. Safety Circle Modal ────────────────────────────────────────────────
  const [circleOpen, setCircleOpen] = useState(false);

  const isUrgentTiming = timing === 'justNow' || timing === 'within1Hour';

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-navy text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Check className="h-4 w-4 text-brand" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="space-y-2 pt-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
          {t('recovery.headline')}
        </h2>
        <p className="text-gray-600 text-base leading-relaxed">
          {t('recovery.subheadline')}
        </p>
      </div>

      {/* When did you pay? Pill Selector */}
      <Card className="p-4 sm:p-5 bg-white space-y-3">
        <div className="flex items-center gap-2 text-navy font-semibold text-sm">
          <Clock className="h-4 w-4 text-brand" />
          <span>{t('recovery.timeQuestion')}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'justNow', label: t('recovery.time.justNow') },
            { id: 'within1Hour', label: t('recovery.time.within1Hour') },
            { id: 'today', label: t('recovery.time.today') },
            { id: 'earlier', label: t('recovery.time.earlier') },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTiming(item.id)}
              className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all min-h-[48px] ${
                timing === item.id
                  ? 'bg-navy text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Dynamic Timing Advice */}
        <div
          className={`p-3.5 rounded-xl text-sm font-medium flex items-start gap-2.5 ${
            isUrgentTiming
              ? 'bg-amber-50 border border-amber-200 text-amber-900'
              : 'bg-teal-50 border border-teal-200 text-teal-900'
          }`}
        >
          <AlertTriangle
            className={`h-5 w-5 shrink-0 mt-0.5 ${
              isUrgentTiming ? 'text-amber-600' : 'text-teal-600'
            }`}
          />
          <p className="leading-snug">
            {isUrgentTiming ? t('recovery.urgentNotice') : t('recovery.gentleNotice')}
          </p>
        </div>
      </Card>

      {/* Progress Indicator */}
      <Card className="p-4 bg-white flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm font-semibold text-navy">
          <span>
            {t('recovery.progress')
              .replace('{done}', completedCount)
              .replace('{total}', 6)}
          </span>
          <span className="text-brand font-bold">
            {Math.round((completedCount / 6) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-brand h-full rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / 6) * 100}%` }}
          />
        </div>
      </Card>

      {/* ── 6 Persistent Checklist Step Cards ───────────────────────────────── */}
      <div className="space-y-4">
        {/* Step 1: Call 1930 */}
        <Card
          className={`p-5 transition-all border-l-4 ${
            checkedSteps[1]
              ? 'border-l-safe bg-emerald-50/30 border-gray-200'
              : 'border-l-danger bg-white shadow-sm'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-danger/10 text-danger shrink-0 mt-0.5">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy leading-snug">
                    {t('recovery.step1.title')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {t('recovery.step1.desc')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleStep(1)}
                className="shrink-0 text-gray-400 hover:text-safe p-1"
                aria-label={t('recovery.markDone')}
              >
                {checkedSteps[1] ? (
                  <CheckCircle2 className="h-6 w-6 text-safe" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              {t('recovery.step1.tip')}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href="tel:1930"
                className="inline-flex items-center justify-center font-bold rounded-lg min-h-[48px] px-5 py-3 bg-danger text-white hover:bg-danger/90 text-base shadow-sm transition-colors text-center"
              >
                <Phone className="h-5 w-5 mr-2 shrink-0" />
                {t('recovery.step1.action')}
              </a>
              <button
                onClick={() => toggleStep(1)}
                className="text-xs text-gray-500 hover:text-navy py-2 text-center"
              >
                {checkedSteps[1] ? t('recovery.completed') : t('recovery.markDone')}
              </button>
            </div>
          </div>
        </Card>

        {/* Step 2: Contact Bank */}
        <Card
          className={`p-5 transition-all border-l-4 ${
            checkedSteps[2]
              ? 'border-l-safe bg-emerald-50/30 border-gray-200'
              : 'border-l-warn bg-white shadow-sm'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-warn/10 text-warn-dark shrink-0 mt-0.5">
                  <Building2 className="h-6 w-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy leading-snug">
                    {t('recovery.step2.title')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {t('recovery.step2.desc')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleStep(2)}
                className="shrink-0 text-gray-400 hover:text-safe p-1"
                aria-label={t('recovery.markDone')}
              >
                {checkedSteps[2] ? (
                  <CheckCircle2 className="h-6 w-6 text-safe" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              {t('recovery.step2.tip')}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Button
                variant="outline"
                className="w-full text-navy font-bold border-gray-300 min-h-[48px]"
                onClick={() => toggleStep(2)}
              >
                <Building2 className="h-5 w-5 mr-2 text-brand" />
                {t('recovery.step2.action')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Step 3: Preserve Evidence */}
        <Card
          className={`p-5 transition-all border-l-4 ${
            checkedSteps[3]
              ? 'border-l-safe bg-emerald-50/30 border-gray-200'
              : 'border-l-brand bg-white shadow-sm'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-brand/10 text-brand shrink-0 mt-0.5">
                  <Camera className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy leading-snug">
                    {t('recovery.step3.title')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {t('recovery.step3.desc')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleStep(3)}
                className="shrink-0 text-gray-400 hover:text-safe p-1"
                aria-label={t('recovery.markDone')}
              >
                {checkedSteps[3] ? (
                  <CheckCircle2 className="h-6 w-6 text-safe" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              {t('recovery.step3.tip')}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Button
                variant="outline"
                className="w-full font-bold min-h-[48px]"
                onClick={handleCopyChecklist}
              >
                <Copy className="h-4 w-4 mr-2" />
                {t('recovery.step3.action')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Step 4: Report on Official Portal */}
        <Card
          className={`p-5 transition-all border-l-4 ${
            checkedSteps[4]
              ? 'border-l-safe bg-emerald-50/30 border-gray-200'
              : 'border-l-indigo-500 bg-white shadow-sm'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy leading-snug">
                    {t('recovery.step4.title')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {t('recovery.step4.desc')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleStep(4)}
                className="shrink-0 text-gray-400 hover:text-safe p-1"
                aria-label={t('recovery.markDone')}
              >
                {checkedSteps[4] ? (
                  <CheckCircle2 className="h-6 w-6 text-safe" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              {t('recovery.step4.tip')}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => toggleStep(4)}
                className="inline-flex items-center justify-center font-bold rounded-lg min-h-[48px] px-5 py-3 bg-brand text-white hover:bg-brand-teal/90 text-base shadow-sm transition-colors text-center w-full"
              >
                <ExternalLink className="h-5 w-5 mr-2 shrink-0" />
                {t('recovery.step4.action')}
              </a>
            </div>
          </div>
        </Card>

        {/* Step 5: Secure Yourself */}
        <Card
          className={`p-5 transition-all border-l-4 ${
            checkedSteps[5]
              ? 'border-l-safe bg-emerald-50/30 border-gray-200'
              : 'border-l-slate-600 bg-white shadow-sm'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0 mt-0.5">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy leading-snug">
                    {t('recovery.step5.title')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {t('recovery.step5.desc')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleStep(5)}
                className="shrink-0 text-gray-400 hover:text-safe p-1"
                aria-label={t('recovery.markDone')}
              >
                {checkedSteps[5] ? (
                  <CheckCircle2 className="h-6 w-6 text-safe" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              {t('recovery.step5.tip')}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Button
                variant={checkedSteps[5] ? 'outline' : 'primary'}
                className="w-full font-bold min-h-[48px]"
                onClick={() => toggleStep(5)}
              >
                <Lock className="h-4 w-4 mr-2" />
                {t('recovery.step5.action')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Step 6: Tell a Trusted Person */}
        <Card
          className={`p-5 transition-all border-l-4 ${
            checkedSteps[6]
              ? 'border-l-safe bg-emerald-50/30 border-gray-200'
              : 'border-l-blue-600 bg-white shadow-sm'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy leading-snug">
                    {t('recovery.step6.title')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {t('recovery.step6.desc')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleStep(6)}
                className="shrink-0 text-gray-400 hover:text-safe p-1"
                aria-label={t('recovery.markDone')}
              >
                {checkedSteps[6] ? (
                  <CheckCircle2 className="h-6 w-6 text-safe" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              {t('recovery.step6.tip')}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Button
                variant="outline"
                className="w-full font-bold border-blue-200 text-blue-700 hover:bg-blue-50 min-h-[48px]"
                onClick={() => {
                  setCircleOpen(true);
                  toggleStep(6);
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                {t('recovery.step6.action')}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Evidence Summary Generator ──────────────────────────────────────── */}
      <Card className="p-5 sm:p-6 bg-white space-y-4 shadow-sm border border-gray-200">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand" />
              {t('recovery.evidence.title')}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t('recovery.evidence.desc')}
            </p>
          </div>
          <button
            onClick={handleClearEvidence}
            className="text-xs text-gray-400 hover:text-danger flex items-center gap-1 p-1 shrink-0"
            title={t('recovery.evidence.clear')}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('recovery.evidence.clear')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('recovery.evidence.amount')}
            </label>
            <input
              type="text"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand focus:border-brand"
              placeholder={t('recovery.evidence.amountPlaceholder')}
              value={evidence.amount}
              onChange={(e) => handleEvidenceChange('amount', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('recovery.evidence.utr')}
            </label>
            <input
              type="text"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand focus:border-brand"
              placeholder={t('recovery.evidence.utrPlaceholder')}
              value={evidence.utr}
              onChange={(e) => handleEvidenceChange('utr', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('recovery.evidence.scammer')}
            </label>
            <input
              type="text"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand focus:border-brand"
              placeholder={t('recovery.evidence.scammerPlaceholder')}
              value={evidence.scammer}
              onChange={(e) => handleEvidenceChange('scammer', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('recovery.evidence.dateTime')}
            </label>
            <input
              type="text"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand focus:border-brand"
              placeholder={t('recovery.evidence.dateTimePlaceholder')}
              value={evidence.dateTime}
              onChange={(e) => handleEvidenceChange('dateTime', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            {t('recovery.evidence.description')}
          </label>
          <textarea
            rows={3}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-brand focus:border-brand"
            placeholder={t('recovery.evidence.descriptionPlaceholder')}
            value={evidence.description}
            onChange={(e) => handleEvidenceChange('description', e.target.value)}
          />
        </div>

        <Button
          onClick={handleCopySummary}
          className="w-full text-base font-bold min-h-[50px] shadow-sm"
        >
          <Copy className="h-4 w-4 mr-2" />
          {t('recovery.evidence.copy')}
        </Button>
      </Card>

      {/* ── Warning Card ────────────────────────────────────────────────────── */}
      <Card className="p-4 sm:p-5 bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3">
        <ShieldAlert className="h-6 w-6 text-danger shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-danger">
            {t('recovery.warning.title')}
          </h4>
          <p className="text-xs sm:text-sm text-rose-900 leading-relaxed font-medium">
            {t('recovery.warning.text')}
          </p>
        </div>
      </Card>

      {/* ── Disclaimer ──────────────────────────────────────────────────────── */}
      <p className="text-center text-xs text-gray-400 max-w-md mx-auto pt-2 leading-relaxed">
        {t('recovery.disclaimer')}
      </p>

      {/* Safety Circle Modal */}
      <SafetyCircleModal
        open={circleOpen}
        onClose={() => setCircleOpen(false)}
        context={{
          categoryLabel: { en: 'Emergency Recovery Alert', hi: 'इमरजेंसी रिकवरी अलर्ट' },
          score: 100,
          text: evidence.description || 'Reporting fraudulent transaction dispute.',
        }}
      />
    </div>
  );
};
