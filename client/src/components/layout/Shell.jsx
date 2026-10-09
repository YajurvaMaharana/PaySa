import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Shield, ScanLine, QrCode, ShieldAlert, Radio, FlaskConical } from 'lucide-react';
import { useT } from '../../i18n';

export const Shell = () => {
  const { lang, toggleLang, t } = useT();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-[safe-area-inset-bottom]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-navy text-white shadow-md pt-[safe-area-inset-top]">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand" />
            <h1 className="text-xl font-bold tracking-tight">
              {t('common.appName')}
            </h1>
          </NavLink>
          
          <div className="flex items-center gap-2">
            <NavLink
              to="/simulate"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand text-white shadow-sm ring-1 ring-white/30'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`
              }
            >
              <FlaskConical className="h-3.5 w-3.5 text-teal-300" />
              <span>{t('common.nav.lab')}</span>
            </NavLink>

            <button 
              onClick={toggleLang}
              className="flex items-center bg-white/10 rounded-full p-1 text-sm font-medium transition-colors hover:bg-white/20"
            >
              <span className={`px-2 py-1 rounded-full ${lang === 'en' ? 'bg-brand text-white' : 'text-gray-300'}`}>
                EN
              </span>
              <span className={`px-2 py-1 rounded-full ${lang === 'hi' ? 'bg-brand text-white' : 'text-gray-300'}`}>
                हिंदी
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-6 pb-24">
        <Outlet />
      </main>

      {/* Fixed Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 pb-[safe-area-inset-bottom]">
        <div className="max-w-xl mx-auto flex h-16">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `flex-1 flex flex-col items-center justify-center gap-1 text-[10px] sm:text-xs font-medium transition-colors ${isActive ? 'text-brand' : 'text-gray-500 hover:text-gray-900'}`
            }
          >
            <ScanLine className="h-5 w-5 sm:h-6 sm:w-6" />
            <span>{t('common.nav.scan')}</span>
          </NavLink>
          
          <NavLink 
            to="/qr" 
            className={({ isActive }) => 
              `flex-1 flex flex-col items-center justify-center gap-1 text-[10px] sm:text-xs font-medium transition-colors ${isActive ? 'text-brand' : 'text-gray-500 hover:text-gray-900'}`
            }
          >
            <QrCode className="h-5 w-5 sm:h-6 sm:w-6" />
            <span>{t('common.nav.qrCheck')}</span>
          </NavLink>

          <NavLink 
            to="/simulate" 
            className={({ isActive }) => 
              `flex-1 flex flex-col items-center justify-center gap-1 text-[10px] sm:text-xs font-medium transition-colors ${isActive ? 'text-brand' : 'text-gray-500 hover:text-gray-900'}`
            }
          >
            <FlaskConical className="h-5 w-5 sm:h-6 sm:w-6" />
            <span>{t('common.nav.lab')}</span>
          </NavLink>
          
          <NavLink 
            to="/recovery" 
            className={({ isActive }) => 
              `flex-1 flex flex-col items-center justify-center gap-1 text-[10px] sm:text-xs font-medium transition-colors ${isActive ? 'text-brand' : 'text-gray-500 hover:text-gray-900'}`
            }
          >
            <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" />
            <span>{t('common.nav.recovery')}</span>
          </NavLink>

          <NavLink 
            to="/radar" 
            className={({ isActive }) => 
              `flex-1 flex flex-col items-center justify-center gap-1 text-[10px] sm:text-xs font-medium transition-colors ${isActive ? 'text-brand' : 'text-gray-500 hover:text-gray-900'}`
            }
          >
            <Radio className="h-5 w-5 sm:h-6 sm:w-6" />
            <span>Radar</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};
