import React, { createContext, useContext, useState, useEffect } from 'react';

// Merge all per-screen files (skipping index.js)
const modules = import.meta.glob("./*.js", { eager: true });

const dictionary = {
  en: {},
  hi: {}
};

Object.keys(modules).forEach((path) => {
  if (path === './index.js') return;
  
  const mod = modules[path];
  const translations = mod.default || mod;

  if (translations.en) {
    Object.assign(dictionary.en, translations.en);
  }
  if (translations.hi) {
    Object.assign(dictionary.hi, translations.hi);
  }
});

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('tp_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('tp_lang', lang);
  }, [lang]);

  const t = (key) => {
    return dictionary[lang]?.[key] || key;
  };

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'hi' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useT = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useT must be used within a LanguageProvider");
  }
  return context;
};
