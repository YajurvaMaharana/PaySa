import React, { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, CheckCircle2, UserPlus, Phone, Loader2, Send } from 'lucide-react';
import { useT } from '../i18n';
import { BottomSheet } from './ui/BottomSheet';
import { Button } from './ui/Button';

export default function SafetyCircleModal({ open, onClose, context }) {
  const { t, lang } = useT();

  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [includeText, setIncludeText] = useState(false);

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      // Load contacts from localStorage
      try {
        const stored = localStorage.getItem('tp_contacts');
        if (stored) {
          const parsed = JSON.parse(stored);
          setContacts(parsed);
          if (parsed.length > 0 && !selectedContactId) {
            setSelectedContactId(parsed[0].id);
          }
        } else {
          // Seed with demo contacts
          const seed = [
            { id: '1', name: t('circle.contact.mom'), phone: '9876543210', isDemo: true },
            { id: '2', name: t('circle.contact.rahul'), phone: '9876543211', isDemo: true }
          ];
          localStorage.setItem('tp_contacts', JSON.stringify(seed));
          setContacts(seed);
          setSelectedContactId(seed[0].id);
        }
      } catch (err) {
        console.error('Failed to load contacts', err);
      }
      
      // Reset states
      setIsSending(false);
      setIsSuccess(false);
      setIncludeText(false);
    }
  }, [open, t, selectedContactId]);

  const saveContacts = (newContacts) => {
    setContacts(newContacts);
    localStorage.setItem('tp_contacts', JSON.stringify(newContacts));
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(newPhone)) {
      setPhoneError(t('circle.invalidPhone'));
      return;
    }
    const newContact = {
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone,
      isDemo: false
    };
    const updated = [...contacts, newContact];
    saveContacts(updated);
    setSelectedContactId(newContact.id);
    setNewName('');
    setNewPhone('');
    setPhoneError('');
  };

  const handleDelete = (id) => {
    const updated = contacts.filter(c => c.id !== id);
    saveContacts(updated);
    if (selectedContactId === id) {
      setSelectedContactId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const getAlertText = () => {
    let baseText = '';
    if (context && context.categoryLabel && context.score) {
      baseText = t('circle.alertTemplate')
        .replace('{categoryLabel}', context.categoryLabel[lang])
        .replace('{score}', context.score);
    } else {
      baseText = t('circle.genericAlert');
    }

    if (includeText && context && context.text) {
      baseText += `\n\n"${context.text}"`;
    }
    return baseText;
  };

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  const handleDemoSend = () => {
    if (!selectedContact) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);
    }, 1500);
  };

  const handleWhatsApp = () => {
    if (!selectedContact) return;
    const text = encodeURIComponent(getAlertText());
    window.open(`https://wa.me/91${selectedContact.phone}?text=${text}`, '_blank');
  };

  const handleSMS = () => {
    if (!selectedContact) return;
    const text = encodeURIComponent(getAlertText());
    window.location.href = `sms:+91${selectedContact.phone}?body=${text}`;
  };

  return (
    <BottomSheet isOpen={open} onClose={onClose} title={t('circle.title')}>
      <div className="space-y-6 pt-2 pb-4 max-h-[80vh] overflow-y-auto hide-scrollbar">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-safe/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-safe" />
            </div>
            <p className="text-xl font-bold text-navy text-center">
              {t('circle.success').replace('{name}', selectedContact?.name)}
            </p>
            <Button className="w-full mt-4" onClick={onClose}>{t('circle.close')}</Button>
          </div>
        ) : (
          <>
            <p className="text-gray-600">{t('circle.subtitle')}</p>

            <div className="space-y-3">
              {contacts.map(c => (
                <label 
                  key={c.id} 
                  className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${
                    selectedContactId === c.id ? 'border-brand bg-brand/5' : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="contact" 
                    className="w-5 h-5 text-brand focus:ring-brand accent-brand shrink-0"
                    checked={selectedContactId === c.id}
                    onChange={() => setSelectedContactId(c.id)}
                  />
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-gray-900 font-medium truncate">{c.name}</p>
                    <p className="text-gray-500 text-sm">{c.phone}</p>
                  </div>
                  {!c.isDemo && (
                    <button 
                      type="button" 
                      onClick={(e) => { e.preventDefault(); handleDelete(c.id); }}
                      className="p-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-full transition-colors ml-2 shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </label>
              ))}
            </div>

            <form onSubmit={handleAddContact} className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4" /> {t('circle.addContact')}
              </p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder={t('circle.namePlaceholder')} 
                  className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                />
                <input 
                  type="tel" 
                  placeholder={t('circle.phonePlaceholder')} 
                  className="flex-[1.5] bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                  value={newPhone}
                  onChange={e => {
                    setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                    setPhoneError('');
                  }}
                  required
                />
              </div>
              {phoneError && <p className="text-xs text-danger font-medium">{phoneError}</p>}
              <Button type="submit" variant="outline" className="w-full text-sm py-2 h-auto" disabled={!newName || newPhone.length < 10}>
                {t('circle.addBtn')}
              </Button>
            </form>

            <div className="bg-warn/10 border border-warn/20 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-5 h-5 text-warn mt-0.5 shrink-0" />
                <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap">
                  {getAlertText()}
                </p>
              </div>
              
              {context && context.text && (
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand accent-brand"
                    checked={includeText}
                    onChange={(e) => setIncludeText(e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">{t('circle.includeTextToggle')}</span>
                </label>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <Button 
                className="w-full h-14 text-lg shadow-sm" 
                disabled={!selectedContact || isSending}
                onClick={handleDemoSend}
              >
                {isSending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                {t('circle.sendDemo')}
              </Button>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-[2] h-12 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300" onClick={handleWhatsApp} disabled={!selectedContact}>
                  {t('circle.sendWhatsApp')}
                </Button>
                <Button variant="outline" className="flex-1 h-12 text-sm" onClick={handleSMS} disabled={!selectedContact}>
                  {t('circle.sendSMS')}
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500 font-medium">
                {t('circle.demoExplainer')}
              </p>
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
