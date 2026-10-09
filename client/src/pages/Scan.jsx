import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, ClipboardPaste, X, ShieldAlert, Loader2, FileImage } from 'lucide-react';
import { useT } from '../i18n';
import { useResult } from '../state/ResultContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { analyze } from '../api';
import { compressImage } from '../utils/image';
import samples from '../data/samples.json';

export const Scan = () => {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const { setAnalysisResult } = useResult();

  const [tab, setTab] = useState('text');
  const [text, setText] = useState(() => {
    const prefill = localStorage.getItem('tp_scan_prefill');
    if (prefill) {
      localStorage.removeItem('tp_scan_prefill');
      return prefill;
    }
    return '';
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  const [isTimeout, setIsTimeout] = useState(false);

  const fileInputRef = useRef(null);
  const timeoutRef = useRef(null);
  const loadingIntervalRef = useRef(null);

  // Clear error when input changes
  useEffect(() => {
    if (error) setError(null);
  }, [text, imageFile, tab]);

  // Clean up ObjectURL
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setText(clipboardText.substring(0, 4000));
        setTab('text');
      }
    } catch (err) {
      console.warn("Failed to read clipboard:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setTab('image');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadDemo = (sampleText) => {
    setText(sampleText);
    setTab('text');
  };

  const startLoadingAnimation = () => {
    setLoadingStep(0);
    setIsTimeout(false);
    
    // Rotate text every 2.5 seconds
    loadingIntervalRef.current = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % 3);
    }, 2500);

    // Timeout after 25s
    timeoutRef.current = setTimeout(() => {
      clearInterval(loadingIntervalRef.current);
      setIsLoading(false);
      setIsTimeout(true);
    }, 25000);
  };

  const stopLoadingAnimation = () => {
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleAnalyze = async () => {
    if (!text.trim() && !imageFile) return;

    setIsLoading(true);
    setError(null);
    startLoadingAnimation();

    try {
      let base64 = null;
      let mimeType = null;

      if (tab === 'image' && imageFile) {
        try {
          const compressed = await compressImage(imageFile);
          base64 = compressed.base64;
          mimeType = compressed.mimeType;
        } catch (_imgErr) {
          const reader = new FileReader();
          const dataUrl = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
          });
          base64 = dataUrl;
          mimeType = imageFile.type || 'image/png';
        }
      }

      const result = await analyze({
        text: tab === 'text' ? text.trim() : (text.trim() || ''),
        image: base64,
        imageBase64: base64,
        mimeType: mimeType,
        language: lang
      });

      setAnalysisResult({ text, imagePreview: tab === 'image' ? imagePreview : null }, result);
      stopLoadingAnimation();
      navigate('/result');
    } catch (err) {
      stopLoadingAnimation();
      setIsLoading(false);
      // Map error to i18n or show generic
      const errorKey = err.message || 'SERVER_ERROR';
      setError(t(`scan.error.${errorKey}`) || t('scan.error.SERVER_ERROR'));
    }
  };

  const loadingTexts = [
    t('scan.loading.step1'),
    t('scan.loading.step2'),
    t('scan.loading.step3')
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-in fade-in">
        <div className="relative">
          <Loader2 className="h-16 w-16 text-brand animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-brand/50" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-navy transition-all duration-300">
            {loadingTexts[loadingStep]}
          </h3>
          <p className="text-gray-500 text-sm">
            {t('scan.privacy')}
          </p>
        </div>

        {/* Skeleton UI */}
        <Card className="w-full max-w-md p-6 space-y-4 opacity-50">
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
        </Card>
      </div>
    );
  }

  if (isTimeout) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="bg-warn/10 p-4 rounded-full">
          <ShieldAlert className="h-12 w-12 text-warn" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-navy">{t('scan.error.TIMEOUT')}</h3>
        </div>
        <Button onClick={() => setIsTimeout(false)} className="w-full sm:w-auto">
          {t('scan.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="space-y-2 text-center sm:text-left pt-2">
        <h2 className="text-2xl font-bold text-navy tracking-tight leading-tight">
          {t('scan.headline')}
        </h2>
        <p className="text-gray-600">
          {t('scan.subtitle')}
        </p>
      </div>

      <Card className="flex flex-col bg-white">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            className={`flex-1 py-3.5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'text' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setTab('text')}
          >
            {t('scan.tab.text')}
          </button>
          <button
            className={`flex-1 py-3.5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'image' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setTab('image')}
          >
            {t('scan.tab.image')}
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {tab === 'text' ? (
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  className="w-full min-h-[150px] p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand resize-none text-gray-900 placeholder:text-gray-400"
                  rows={6}
                  maxLength={4000}
                  placeholder={t('scan.textPlaceholder')}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-medium">
                  {text.length}/4000
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="ghost" className="text-sm py-1.5 min-h-0 h-auto" onClick={handlePaste}>
                  <ClipboardPaste className="h-4 w-4 mr-2" />
                  {t('scan.pasteClipboard')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {!imagePreview ? (
                <div 
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 hover:border-brand/50 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      const file = e.dataTransfer.files[0];
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                >
                  <UploadCloud className="h-10 w-10 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-600">{t('scan.dragDrop')}</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP</p>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center min-h-[200px]">
                  <img src={imagePreview} alt="Screenshot preview" className="max-h-[300px] object-contain" />
                  <button 
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
              />
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-danger/10 text-danger text-sm font-medium rounded-lg flex items-start gap-2 animate-in fade-in">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Demo Chips */}
      <div className="space-y-3 pt-2">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('scan.demo')}</p>
        <div className="flex flex-nowrap overflow-x-auto pb-2 gap-2 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {samples.map((sample) => (
            <button
              key={sample.id}
              onClick={() => loadDemo(sample.text)}
              className="shrink-0 snap-start bg-white border border-gray-200 px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:border-brand hover:text-brand transition-colors whitespace-nowrap"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 space-y-4">
        <Button 
          className="w-full text-lg shadow-sm"
          disabled={tab === 'text' ? !text.trim() : !imageFile}
          onClick={handleAnalyze}
        >
          {t('scan.analyze')}
        </Button>
        <p className="text-center text-xs text-gray-500">
          {t('scan.privacy')}
        </p>
      </div>
    </div>
  );
};
