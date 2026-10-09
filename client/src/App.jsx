import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n';
import { ResultProvider } from './state/ResultContext';
import { Shell } from './components/layout/Shell';

// Pages
import { Scan } from './pages/Scan';
import { Result } from './pages/Result';
import { QrCheck } from './pages/QrCheck';
import { Recovery } from './pages/Recovery';

export default function App() {
  return (
    <LanguageProvider>
      <ResultProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Shell />}>
              <Route index element={<Scan />} />
              <Route path="result" element={<Result />} />
              <Route path="qr" element={<QrCheck />} />
              <Route path="recovery" element={<Recovery />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ResultProvider>
    </LanguageProvider>
  );
}
