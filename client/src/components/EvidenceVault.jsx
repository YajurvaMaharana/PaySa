import React, { useState, useEffect } from 'react';
import { FileText, Copy, ShieldCheck, EyeOff, RotateCcw, Phone, Landmark, Camera } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export const EvidenceVault = ({ lang = 'en' }) => {
  const [evidence, setEvidence] = useState(() => {
    try {
      const saved = localStorage.getItem('tp_evidence_vault');
      return saved ? JSON.parse(saved) : { amount: '', scammer: '', utr: '', dateTime: '', platform: '', notes: '' };
    } catch {
      return { amount: '', scammer: '', utr: '', dateTime: '', platform: '', notes: '' };
    }
  });

  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('tp_evidence_vault', JSON.stringify(evidence));
    } catch (e) {
      console.warn('Failed to save evidence vault', e);
    }
  }, [evidence]);

  const handleChange = (field, value) => {
    setEvidence(prev => ({ ...prev, [field]: value }));
  };

  const clearForm = () => {
    setEvidence({ amount: '', scammer: '', utr: '', dateTime: '', platform: '', notes: '' });
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to mask PII for the preview
  const redactPII = (text) => {
    if (!text) return '';
    
    // Mask email/UPI: a***@upi
    let masked = text.replace(/([a-zA-Z0-9])[a-zA-Z0-9._%+-]*(@[a-zA-Z0-9.-]+)/g, '$1***$2');
    // Mask phone numbers: 98****1234
    masked = masked.replace(/(\d{2})\d{4,6}(\d{2,4})/g, '$1****$2');
    
    return masked;
  };

  const handleCopyBriefing = () => {
    const isHi = lang === 'hi';
    const lines = isHi
      ? [
          '=== 1930 साइबर अपराध शिकायत सारांश ===',
          `• गंवाई गई राशि: ₹${evidence.amount || 'अनुपलब्ध'}`,
          `• ट्रांजेक्शन ID / UTR: ${evidence.utr || 'अनुपलब्ध'}`,
          `• संदिग्ध का विवरण (UPI/खाता/नंबर): ${evidence.scammer || 'अनुपलब्ध'}`,
          `• घटना की तारीख व समय: ${evidence.dateTime || 'अनुपलब्ध'}`,
          `• पेमेंट प्लेटफॉर्म: ${evidence.platform || 'अनुपलब्ध'}`,
          `• विवरण/नोट्स: ${evidence.notes || 'अनुपलब्ध'}`,
          '• रिपोर्टिंग माध्यम: TrustPause (https://cybercrime.gov.in)',
        ]
      : [
          '=== 1930 CYBERCRIME COMPLAINT BRIEFING ===',
          `• Amount Lost: ₹${evidence.amount || 'Not provided'}`,
          `• Transaction ID / UTR: ${evidence.utr || 'Not provided'}`,
          `• Suspect Details (UPI/Bank/Phone): ${evidence.scammer || 'Not provided'}`,
          `• Date & Time: ${evidence.dateTime || 'Not provided'}`,
          `• Payment Platform: ${evidence.platform || 'Not provided'}`,
          `• Notes/Description: ${evidence.notes || 'Not provided'}`,
          '• Generated via: TrustPause (https://cybercrime.gov.in)',
        ];

    navigator.clipboard?.writeText(lines.join('\n'));
    showToast(isHi ? 'शिकायत सारांश कॉपी किया गया!' : 'Incident briefing copied to clipboard!');
  };

  const t = (key) => {
    const dict = {
      'en': {
        title: 'Recovery Evidence Vault',
        desc: 'Organize your details before calling 1930 or your bank. Your data never leaves this device.',
        immediateAction: 'Immediate Action Checklist',
        step1: 'Dial 1930 immediately',
        step2: 'Freeze UPI/Bank account',
        step3: 'Save complete evidence',
        amount: 'Amount Lost (INR)',
        amountPlace: 'e.g. 5000',
        scammer: 'Scammer UPI / Phone / Bank',
        scammerPlace: 'e.g. 9876543210 or scam@upi',
        utr: 'Transaction ID / UTR',
        utrPlace: 'e.g. 312345678901',
        datetime: 'Date & Time',
        datetimePlace: 'e.g. 12 Oct, 2:30 PM',
        platform: 'Payment Platform',
        platformPlace: 'e.g. PhonePe, GPay, NEFT',
        notes: 'Brief Notes',
        notesPlace: 'What exactly happened?',
        previewTitle: 'Auto-Redaction Preview (Privacy Safe)',
        copyBtn: 'Copy Official Incident Summary',
        clear: 'Clear'
      },
      'hi': {
        title: 'सबूत वॉल्ट (Evidence Vault)',
        desc: '1930 या बैंक को कॉल करने से पहले अपना विवरण यहाँ दर्ज करें। आपका डेटा सुरक्षित है।',
        immediateAction: 'तुरंत करने योग्य कार्य',
        step1: 'तुरंत 1930 डायल करें',
        step2: 'UPI/बैंक खाता फ्रीज कराएं',
        step3: 'चैट और सबूत सेव करें',
        amount: 'गंवाई गई राशि (INR)',
        amountPlace: 'जैसे 5000',
        scammer: 'ठग का UPI / फोन / बैंक',
        scammerPlace: 'जैसे 9876543210 या scam@upi',
        utr: 'ट्रांजेक्शन ID / UTR',
        utrPlace: 'जैसे 312345678901',
        datetime: 'तारीख व समय',
        datetimePlace: 'जैसे 12 Oct, 2:30 PM',
        platform: 'पेमेंट प्लेटफॉर्म',
        platformPlace: 'जैसे PhonePe, GPay, NEFT',
        notes: 'संक्षिप्त विवरण',
        notesPlace: 'क्या हुआ था?',
        previewTitle: 'ऑटो-रिडक्शन प्रीव्यू (सुरक्षित)',
        copyBtn: 'आधिकारिक शिकायत सारांश कॉपी करें',
        clear: 'हटाएं'
      }
    };
    return dict[lang]?.[key] || dict['en'][key];
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-navy text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <ShieldCheck className="h-4 w-4 text-brand" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Immediate Action Checklist Card */}
      <Card className="p-4 sm:p-5 bg-danger/5 border border-danger/20 shadow-sm">
        <h3 className="font-bold text-danger flex items-center gap-2 mb-3">
          <Phone className="h-5 w-5" />
          {t('immediateAction')}
        </h3>
        <ul className="space-y-3">
          <li className="flex items-center gap-3">
            <div className="bg-danger text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</div>
            <a href="tel:1930" className="text-danger-dark font-bold hover:underline flex-1">{t('step1')}</a>
          </li>
          <li className="flex items-center gap-3">
            <div className="bg-danger text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</div>
            <span className="text-gray-800 font-medium flex-1 flex items-center gap-2">
               {t('step2')} <Landmark className="w-4 h-4 text-gray-400" />
            </span>
          </li>
          <li className="flex items-center gap-3">
            <div className="bg-danger text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</div>
            <span className="text-gray-800 font-medium flex-1 flex items-center gap-2">
              {t('step3')} <Camera className="w-4 h-4 text-gray-400" />
            </span>
          </li>
        </ul>
      </Card>

      {/* Vault Form Card */}
      <Card className="p-5 sm:p-6 bg-white shadow-sm border border-gray-200">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand" />
              {t('title')}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t('desc')}
            </p>
          </div>
          <button
            onClick={clearForm}
            className="text-xs text-gray-400 hover:text-danger flex items-center gap-1 p-1 shrink-0"
            title={t('clear')}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('clear')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('amount')}</label>
            <input
              type="text"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand"
              placeholder={t('amountPlace')}
              value={evidence.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('scammer')}</label>
            <input
              type="text"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand"
              placeholder={t('scammerPlace')}
              value={evidence.scammer}
              onChange={(e) => handleChange('scammer', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('utr')}</label>
            <input
              type="text"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand"
              placeholder={t('utrPlace')}
              value={evidence.utr}
              onChange={(e) => handleChange('utr', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('datetime')}</label>
            <input
              type="text"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand"
              placeholder={t('datetimePlace')}
              value={evidence.dateTime}
              onChange={(e) => handleChange('dateTime', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('platform')}</label>
            <input
              type="text"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand"
              placeholder={t('platformPlace')}
              value={evidence.platform}
              onChange={(e) => handleChange('platform', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('notes')}</label>
            <textarea
              rows={2}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-brand"
              placeholder={t('notesPlace')}
              value={evidence.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </div>
        </div>

        {/* Auto-Redaction Preview Box */}
        {(evidence.scammer || evidence.utr || evidence.amount) && (
          <div className="mt-4 p-3 bg-slate-900 rounded-xl shadow-inner border border-slate-800">
            <p className="text-[10px] uppercase font-bold text-brand tracking-wider flex items-center gap-1 mb-2">
              <EyeOff className="w-3 h-3" /> {t('previewTitle')}
            </p>
            <div className="text-xs text-slate-300 font-mono space-y-1">
              <p>Amount: <span className="text-white">₹{evidence.amount || '---'}</span></p>
              <p>Suspect: <span className="text-white">{redactPII(evidence.scammer) || '---'}</span></p>
              <p>UTR: <span className="text-white">{redactPII(evidence.utr) || '---'}</span></p>
            </div>
          </div>
        )}

        <Button
          onClick={handleCopyBriefing}
          className="w-full text-base font-bold min-h-[50px] shadow-sm mt-4"
        >
          <Copy className="h-4 w-4 mr-2" />
          {t('copyBtn')}
        </Button>
      </Card>
    </div>
  );
};
