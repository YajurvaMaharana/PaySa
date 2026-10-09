import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import { QrCode, ScanLine, ArrowRight, ShieldAlert, ShieldCheck, UploadCloud, Link as LinkIcon, CheckCircle2, Copy, HelpCircle } from 'lucide-react';
import { useT } from '../i18n';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const QrCheck = () => {
  const { t, lang } = useT();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState(null); // 'PAYING' | 'RECEIVING'
  const [qrContent, setQrContent] = useState('');
  const [pastedLink, setPastedLink] = useState('');
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const handleIntent = (chosenIntent) => {
    setIntent(chosenIntent);
    setStep(2);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          setQrContent(code.data);
          setStep(3);
        } else {
          setError(t('qr.error.noQR'));
        }
      };
      img.onerror = () => setError(t('qr.error.readFailed'));
      img.src = event.target.result;
    };
    reader.onerror = () => setError(t('qr.error.readFailed'));
    reader.readAsDataURL(file);
  };

  const handlePasteSubmit = () => {
    if (pastedLink.trim()) {
      setQrContent(pastedLink.trim());
      setStep(3);
    }
  };

  const handleNoCode = () => {
    setQrContent('NO_CODE');
    setStep(3);
  };

  const handleDemo = (type) => {
    let link = "";
    if (type === "refund") {
      link = "upi://pay?pa=scammer@upi&pn=Refund&am=4999&tn=Lottery_Prize_Refund";
    } else if (type === "shop") {
      link = "upi://pay?pa=kirana@upi&pn=Kirana Store";
    } else if (type === "fake") {
      link = "https://evil-website.com/download-app";
    }
    setQrContent(link);
    setStep(3);
  };

  const startOver = () => {
    setStep(1);
    setIntent(null);
    setQrContent('');
    setPastedLink('');
    setError(null);
  };

  // Step 3 Rendering Logic
  const renderVerdict = () => {
    // 1. RECEIVING + ANY
    if (intent === 'RECEIVING' || qrContent === 'NO_CODE') {
      return (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-danger/10 border border-danger/20 p-6 rounded-2xl flex flex-col items-center text-center space-y-4">
            <ShieldAlert className="h-16 w-16 text-danger" />
            <h2 className="text-2xl font-bold text-danger">{t('qr.step3.verdict.receiving.title')}</h2>
            <p className="text-gray-900 font-medium">{t('qr.step3.verdict.receiving.desc')}</p>
          </div>

          <Card className="p-5 space-y-3 border-l-4 border-l-danger">
            <ul className="space-y-3">
              <li className="flex gap-3 text-gray-700">
                <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-danger/10 text-danger font-bold text-sm">1</span>
                <span>{t('qr.step3.verdict.receiving.reason1')}</span>
              </li>
              <li className="flex gap-3 text-gray-700">
                <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-danger/10 text-danger font-bold text-sm">2</span>
                <span>{t('qr.step3.verdict.receiving.reason2')}</span>
              </li>
              <li className="flex gap-3 text-gray-700">
                <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-danger/10 text-danger font-bold text-sm">3</span>
                <span>{t('qr.step3.verdict.receiving.reason3')}</span>
              </li>
            </ul>
          </Card>

          <div className="space-y-3 pt-4">
            <Button variant="danger" className="w-full text-lg min-h-[56px]" onClick={() => navigate('/')}>
              {t('qr.action.backSafety')}
            </Button>
            <Button variant="outline" className="w-full text-lg min-h-[56px]" onClick={() => navigate('/recovery')}>
              {t('qr.action.reportScam')}
            </Button>
          </div>
        </div>
      );
    }

    // 2. PAYING + valid/invalid UPI link
    if (intent === 'PAYING') {
      if (qrContent.startsWith('upi://pay')) {
        // Parse params
        const urlParams = new URLSearchParams(qrContent.split('?')[1] || "");
        const payeeId = urlParams.get('pa') || "Unknown UPI ID";
        const payeeName = urlParams.get('pn') || payeeId;
        const amount = urlParams.get('am');
        const note = urlParams.get('tn') || "";

        const scamWords = ["refund", "cashback", "prize", "kyc", "fee"];
        const combinedText = `${payeeName} ${note}`.toLowerCase();
        const hasScamWords = scamWords.some(word => combinedText.includes(word));
        const hasAmount = !!amount;
        const showCaution = hasScamWords || hasAmount;

        return (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-navy p-6 rounded-2xl text-center space-y-2 text-white">
              <h2 className="text-xl font-medium text-white/80">{t('qr.step3.verdict.paying.title')}</h2>
              {amount ? (
                <p className="text-2xl font-bold">
                  {t('qr.step3.verdict.paying.summary').replace('{payee}', payeeName).replace('{amount}', amount)}
                </p>
              ) : (
                <p className="text-2xl font-bold">
                  {t('qr.step3.verdict.paying.summaryNoAmt').replace('{payee}', payeeName)}
                </p>
              )}
            </div>

            {showCaution && (
              <div className="bg-warn/10 border border-warn/30 p-4 rounded-xl flex gap-3 items-start">
                <ShieldAlert className="h-6 w-6 text-warn shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-warn-dark">
                  {t('qr.step3.verdict.paying.caution')}
                </p>
              </div>
            )}

            <Card className="p-5 space-y-4">
              <h3 className="font-bold text-navy">{t('qr.step3.verdict.paying.checklistTitle')}</h3>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 mt-0.5 text-brand focus:ring-brand accent-brand rounded border-gray-300" />
                <span className="text-gray-700">{t('qr.step3.verdict.paying.check1')}</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 mt-0.5 text-brand focus:ring-brand accent-brand rounded border-gray-300" />
                <span className="text-gray-700">{t('qr.step3.verdict.paying.check2')}</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 mt-0.5 text-brand focus:ring-brand accent-brand rounded border-gray-300" />
                <span className="text-gray-700">{t('qr.step3.verdict.paying.check3')}</span>
              </label>
            </Card>

            <p className="text-center text-sm font-bold text-danger">
              {t('qr.step3.verdict.paying.remind')}
            </p>

            <Button className="w-full text-lg min-h-[56px]" onClick={startOver}>
              {t('qr.action.startOver')}
            </Button>
          </div>
        );
      } else {
        // Invalid or non-UPI QR
        return (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-warn/10 border border-warn/30 p-6 rounded-2xl flex flex-col items-center text-center space-y-4">
              <ShieldAlert className="h-16 w-16 text-warn" />
              <h2 className="text-2xl font-bold text-warn-dark">{t('qr.step3.verdict.invalid.title')}</h2>
              <p className="text-gray-900 font-medium">{t('qr.step3.verdict.invalid.desc')}</p>
            </div>

            <Card className="p-4 border-l-4 border-l-warn bg-warn/5">
              <p className="font-bold text-warn-dark">{t('qr.step3.verdict.invalid.caution')}</p>
              <p className="text-xs text-gray-500 mt-2 break-all">{t('qr.note')}: {qrContent.substring(0, 100)}{qrContent.length > 100 ? '...' : ''}</p>
            </Card>

            <Button className="w-full text-lg min-h-[56px]" onClick={startOver}>
              {t('qr.action.startOver')}
            </Button>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header logic */}
      {step === 1 && (
        <div className="space-y-2 text-center sm:text-left pt-2 animate-in fade-in">
          <h2 className="text-2xl font-bold text-navy tracking-tight leading-tight">{t('qr.step1.title')}</h2>
          <p className="text-gray-600">{t('qr.step1.subtitle')}</p>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-2 text-center sm:text-left pt-2 animate-in fade-in">
          <h2 className="text-2xl font-bold text-navy tracking-tight leading-tight">{t('qr.step2.title')}</h2>
        </div>
      )}

      {/* Step 1: Intent */}
      {step === 1 && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4">
          <Card 
            className="p-6 border-2 border-transparent hover:border-brand cursor-pointer transition-all hover:shadow-md flex items-center justify-between"
            onClick={() => handleIntent('PAYING')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center">
                <ArrowRight className="h-6 w-6 text-brand" />
              </div>
              <h3 className="text-xl font-bold text-navy">{t('qr.step1.paying')}</h3>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-300" />
          </Card>

          <Card 
            className="p-6 border-2 border-transparent hover:border-brand cursor-pointer transition-all hover:shadow-md flex items-center justify-between"
            onClick={() => handleIntent('RECEIVING')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center">
                <QrCode className="h-6 w-6 text-brand" />
              </div>
              <h3 className="text-xl font-bold text-navy">{t('qr.step1.receiving')}</h3>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-300" />
          </Card>

          <Card className="p-5 mt-8 bg-gray-50 border-none space-y-2">
            <h4 className="font-bold text-navy flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-brand" />
              {t('qr.explainer.title')}
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t('qr.explainer.desc')}
            </p>
          </Card>
        </div>
      )}

      {/* Step 2: Provide QR */}
      {step === 2 && (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          {error && (
            <div className="bg-danger/10 text-danger p-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              {error}
            </div>
          )}

          <Card 
            className="p-8 border-2 border-dashed border-gray-200 text-center hover:bg-gray-50 hover:border-brand/50 transition-colors cursor-pointer flex flex-col items-center space-y-3"
            onClick={() => fileInputRef.current?.click()}
          >
            <ScanLine className="h-10 w-10 text-gray-400" />
            <p className="font-medium text-gray-700">{t('qr.step2.uploadText')}</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
            />
          </Card>

          <Card className="p-5 space-y-3">
            <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <LinkIcon className="h-4 w-4" /> {t('qr.step2.pasteTitle')}
            </p>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder={t('qr.step2.pastePlaceholder')} 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                value={pastedLink}
                onChange={e => setPastedLink(e.target.value)}
              />
              <Button onClick={handlePasteSubmit} disabled={!pastedLink.trim()}>{t('qr.step2.pasteBtn')}</Button>
            </div>
          </Card>

          <Button variant="outline" className="w-full text-danger border-danger/50 min-h-[56px] mt-4" onClick={handleNoCode}>
            {t('qr.step2.noCodeBtn')}
          </Button>

          {/* Demos */}
          <div className="pt-8 space-y-3">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider text-center">{t('qr.demo.title')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button variant="outline" className="text-xs" onClick={() => handleDemo('refund')}>{t('qr.demo.refund')}</Button>
              <Button variant="outline" className="text-xs" onClick={() => handleDemo('shop')}>{t('qr.demo.shop')}</Button>
              <Button variant="outline" className="text-xs" onClick={() => handleDemo('fake')}>{t('qr.demo.fake')}</Button>
            </div>
          </div>
          
          <div className="pt-4 text-center">
            <button onClick={startOver} className="text-sm font-medium text-gray-500 underline">
              {t('qr.action.startOver')}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Verdict */}
      {step === 3 && renderVerdict()}

    </div>
  );
};
