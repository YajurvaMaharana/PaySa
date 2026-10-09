import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, AlertTriangle, ChevronRight, Copy, ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import { useT } from '../i18n';
import { useResult } from '../state/ResultContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BottomSheet } from '../components/ui/BottomSheet';
import SafetyCircleModal from '../components/SafetyCircleModal';

const SIGNAL_COLORS = {
  URGENCY: 'bg-orange-100 text-orange-800 border-orange-200',
  PAYMENT_DEMAND: 'bg-red-100 text-red-800 border-red-200',
  CREDENTIAL_REQUEST: 'bg-purple-100 text-purple-800 border-purple-200',
  IMPERSONATION: 'bg-blue-100 text-blue-800 border-blue-200',
  SUSPICIOUS_LINK: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  TOO_GOOD_TO_BE_TRUE: 'bg-pink-100 text-pink-800 border-pink-200',
};

const Gauge = ({ score, level }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const { t } = useT();
  
  const radius = 80;
  const strokeWidth = 16;
  const circumference = Math.PI * radius;
  
  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setAnimatedScore(score);
      return;
    }

    const duration = 900;
    const start = performance.now();
    
    const animate = (time) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      setAnimatedScore(Math.round(ease * score));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [score]);

  const dashoffset = circumference - (animatedScore / 100) * circumference;
  
  const colors = {
    HIGH: 'text-danger',
    MEDIUM: 'text-warn',
    LOW: 'text-safe'
  };

  return (
    <div className="relative flex flex-col items-center justify-center pt-4">
      <svg className="w-48 h-24 overflow-visible" viewBox="0 0 200 100">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Foreground animated arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          className={`transition-all duration-75 ${colors[level]}`}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
        />
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className="text-4xl font-bold text-navy tracking-tighter">{animatedScore}</span>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('result.gauge.score')}</span>
      </div>
    </div>
  );
};

const HighlightedText = ({ text, signals }) => {
  if (!signals || signals.length === 0 || !text) {
    return <p className="text-gray-700 whitespace-pre-wrap">{text}</p>;
  }

  // Create an array of non-overlapping highlight ranges
  const ranges = [];
  signals.forEach(signal => {
    if (!signal.phrase) return;
    const lowerText = text.toLowerCase();
    const lowerPhrase = signal.phrase.toLowerCase();
    let startIndex = 0;
    
    while ((startIndex = lowerText.indexOf(lowerPhrase, startIndex)) > -1) {
      // Check for overlap
      const overlaps = ranges.some(r => 
        (startIndex >= r.start && startIndex < r.end) || 
        (startIndex + lowerPhrase.length > r.start && startIndex + lowerPhrase.length <= r.end)
      );
      
      if (!overlaps) {
        ranges.push({
          start: startIndex,
          end: startIndex + lowerPhrase.length,
          type: signal.type
        });
      }
      startIndex += lowerPhrase.length;
    }
  });

  ranges.sort((a, b) => a.start - b.start);

  const elements = [];
  let currentIndex = 0;

  ranges.forEach((range, idx) => {
    if (range.start > currentIndex) {
      elements.push(<span key={`text-${idx}`}>{text.substring(currentIndex, range.start)}</span>);
    }
    const colorClass = SIGNAL_COLORS[range.type] || 'bg-gray-200 text-gray-800 border-gray-300';
    elements.push(
      <mark 
        key={`mark-${idx}`} 
        className={`px-1 rounded border-b-2 font-medium ${colorClass}`}
      >
        {text.substring(range.start, range.end)}
      </mark>
    );
    currentIndex = range.end;
  });

  if (currentIndex < text.length) {
    elements.push(<span key="text-end">{text.substring(currentIndex)}</span>);
  }

  return <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{elements}</p>;
};

export const Result = () => {
  const { resultData, clearResult } = useResult();
  const navigate = useNavigate();
  const { t, lang } = useT();

  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [trustedModalOpen, setTrustedModalOpen] = useState(false);
  const [didNotPay, setDidNotPay] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!resultData) {
      navigate('/');
    }
  }, [resultData, navigate]);

  if (!resultData) return null;

  const result = resultData.analysisResult;
  const level = result.level; // HIGH, MEDIUM, LOW

  const headerColors = {
    HIGH: 'bg-danger text-white',
    MEDIUM: 'bg-warn text-white',
    LOW: 'bg-safe text-white'
  };

  const HeaderIcon = level === 'HIGH' ? ShieldAlert : (level === 'MEDIUM' ? AlertTriangle : ShieldCheck);

  const copyWarning = () => {
    const summary = `${t('result.header.' + level)}\nScore: ${result.score}/100\n${result.explanation[lang]}\n\nPaySa AI Copilot`;
    navigator.clipboard.writeText(summary);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const handleScanAnother = () => {
    clearResult();
    navigate('/');
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in slide-in-from-bottom-4">
      {/* Header Block */}
      <div className={`-mx-4 -mt-6 p-5 pb-8 ${headerColors[level]} shadow-sm`}>
        <div className="flex flex-col items-center text-center space-y-2">
          <HeaderIcon className="h-10 w-10 opacity-90" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
            {t(`result.header.${level}`)}
          </h2>
        </div>
      </div>

      <Card className="relative -mt-8 bg-white shadow-md p-5 flex flex-col items-center border-t-0 rounded-t-3xl rounded-b-xl">
        <Gauge score={result.score} level={level} />
        
        <div className="mt-4 text-center">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold uppercase tracking-widest ${
            level === 'HIGH' ? 'bg-danger/10 text-danger' : 
            (level === 'MEDIUM' ? 'bg-warn/10 text-warn-dark' : 'bg-safe/10 text-safe')
          }`}>
            {level}
          </span>
          <p className="mt-2 text-navy font-semibold text-lg">{result.categoryLabel[lang]}</p>
        </div>

        <p className="mt-4 text-xs text-gray-400 font-medium">
          {result.source === 'RULES_ONLY' 
            ? t('result.scoreNote.offline').replace('{ruleScore}', result.ruleScore).replace('{score}', result.score)
            : t('result.scoreNote.hybrid').replace('{ruleScore}', result.ruleScore).replace('{aiScore}', result.aiScore).replace('{score}', result.score)}
        </p>
      </Card>

      {/* Primary Actions */}
      <div className="space-y-3">
        {level === 'HIGH' && (
          didNotPay ? (
            <div className="bg-safe/10 border border-safe/20 text-safe-dark p-4 rounded-xl flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 shrink-0 mt-0.5 text-safe" />
              <p className="font-medium text-safe-dark">{t('result.confirm.doNotPay')}</p>
            </div>
          ) : (
            <Button variant="danger" className="w-full min-h-[56px] text-lg font-bold shadow-sm" onClick={() => setDidNotPay(true)}>
              {t('result.action.doNotPay')}
            </Button>
          )
        )}
        
        <Button 
          variant={level === 'MEDIUM' ? 'primary' : 'outline'} 
          className={`w-full min-h-[56px] text-lg ${level === 'MEDIUM' ? 'font-bold shadow-sm' : 'font-semibold'}`}
          onClick={() => setVerifyModalOpen(true)}
        >
          {t('result.action.verifyOfficial')}
        </Button>

        <Button variant="outline" className="w-full min-h-[56px] text-lg font-semibold" onClick={() => setTrustedModalOpen(true)}>
          {t('result.action.tellTrusted')}
        </Button>

        {level === 'LOW' && (
          <Button variant="primary" className="w-full min-h-[56px] text-lg font-bold shadow-sm">
            {t('result.action.proceedCarefully')}
          </Button>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-6 pt-4">
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-navy flex items-center gap-2">
            <span className="w-1.5 h-6 bg-brand rounded-full"></span>
            {t('result.section.explanation')}
          </h3>
          <Card className="p-4 bg-gray-50 border-none">
            <p className="text-gray-700 leading-relaxed font-medium">{result.explanation[lang]}</p>
          </Card>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-navy flex items-center gap-2">
            <span className="w-1.5 h-6 bg-brand rounded-full"></span>
            {t('result.section.whatToDo')}
          </h3>
          <ul className="space-y-2">
            {result.nextSteps[lang].map((step, idx) => (
              <li key={idx} className="flex gap-3 text-gray-700">
                <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-brand/10 text-brand font-bold text-sm">
                  {idx + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ul>
        </section>

        {result.extractedText && (
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand rounded-full"></span>
              {t('result.section.whyWorried')}
            </h3>
            <Card className="p-4 border border-gray-200 shadow-inner bg-white">
              <HighlightedText text={result.extractedText} signals={result.signals} />
            </Card>
            
            {result.signals.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {[...new Set(result.signals.map(s => s.type))].map(type => (
                  <div key={type} className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <span className={`w-3 h-3 rounded-sm ${SIGNAL_COLORS[type].split(' ')[0]}`}></span>
                    {t(`result.legend.${type}`) || type}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-navy flex items-center gap-2">
            <span className="w-1.5 h-6 bg-brand rounded-full"></span>
            {result.signals.length > 0 
              ? t('result.section.dangerSigns').replace('{count}', result.signals.length)
              : t('result.section.noDangerSigns')}
          </h3>
          
          <div className="space-y-3">
            {result.signals.map((signal, idx) => (
              <Card key={idx} className="p-4 border-l-4 overflow-hidden" style={{ borderLeftColor: 'currentColor' }}>
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${SIGNAL_COLORS[signal.type].split(' ')[0]}`}></div>
                <div className="ml-2 space-y-2">
                  <p className="font-semibold text-gray-900">&ldquo;{signal.phrase}&rdquo;</p>
                  <p className="text-sm text-gray-600">{signal.reason[lang]}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* Recovery Sticky Button (for HIGH/MEDIUM) */}
      {(level === 'HIGH' || level === 'MEDIUM') && (
        <div className="sticky bottom-[72px] z-30 pt-4 pb-2 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent">
          <Button 
            variant="outline" 
            className="w-full border-danger text-danger hover:bg-danger/5 min-h-[56px] font-bold"
            onClick={() => navigate('/recovery')}
          >
            {t('result.action.startRecovery')}
          </Button>
        </div>
      )}

      {/* Footer Actions */}
      <div className="pt-6 space-y-4">
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1 bg-white border border-gray-200" onClick={copyWarning}>
            <Copy className="h-4 w-4 mr-2" />
            {t('result.action.copyWarning')}
          </Button>
          <Button variant="ghost" className="flex-1 bg-white border border-gray-200" onClick={handleScanAnother}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('result.action.scanAnother')}
          </Button>
        </div>

        <p className="text-center text-xs text-gray-400 max-w-sm mx-auto">
          {result.disclaimer[lang]}
        </p>
      </div>

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-navy text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50 animate-in fade-in slide-in-from-top-4">
          {t('result.toast.copied')}
        </div>
      )}

      {/* Modals */}
      <BottomSheet isOpen={verifyModalOpen} onClose={() => setVerifyModalOpen(false)} title={t('result.modal.verify.title')}>
        <div className="space-y-4 pt-2">
          <p className="font-medium text-gray-800">{t('result.modal.verify.step1')}</p>
          <p className="font-medium text-gray-800">{t('result.modal.verify.step2')}</p>
          <p className="font-medium text-danger">{t('result.modal.verify.step3')}</p>
          <Button className="w-full mt-4" onClick={() => setVerifyModalOpen(false)}>Close</Button>
        </div>
      </BottomSheet>

      <SafetyCircleModal 
        open={trustedModalOpen} 
        onClose={() => setTrustedModalOpen(false)} 
        context={{
          categoryLabel: result.categoryLabel,
          score: result.score,
          text: result.extractedText || resultData.text
        }} 
      />
    </div>
  );
};
