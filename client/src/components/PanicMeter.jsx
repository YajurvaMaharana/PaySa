import React from 'react';
import { useT } from '../i18n';
import { Card } from './ui/Card';

export const PanicMeter = ({ panicMeter }) => {
  const { t } = useT();

  if (!panicMeter || !panicMeter.tactics) return null;

  const { tactics, overallPanicLevel } = panicMeter;

  const getLevelColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'bg-danger text-white border-danger';
      case 'ELEVATED': return 'bg-warn text-warn-dark border-warn';
      case 'LOW': return 'bg-safe text-safe-dark border-safe';
      default: return 'bg-gray-200 text-gray-800 border-gray-300';
    }
  };

  const getBarColor = (score) => {
    if (score > 70) return 'bg-danger';
    if (score >= 40) return 'bg-warn';
    return 'bg-safe';
  };

  const tacticKeys = [
    'urgency',
    'fear',
    'authority',
    'paymentPressure',
    'greed'
  ];

  return (
    <Card className="p-5 mt-4 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold tracking-tight text-navy">
          {t('panic.title')}
        </h3>
        <span className={`text-xs font-bold px-2 py-1 rounded border ${getLevelColor(overallPanicLevel)} uppercase tracking-wider`}>
          {t(`panic.level.${overallPanicLevel}`)}
        </span>
      </div>

      <div className="space-y-4">
        {tacticKeys.map((key) => {
          const tactic = tactics[key];
          if (!tactic) return null;
          
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-700">{t(`panic.tactic.${key}`)}</span>
                <span className="text-gray-900">{tactic.score}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${getBarColor(tactic.score)}`}
                  style={{ width: `${tactic.score}%` }}
                />
              </div>
              {/* Optional: Show matches as small pills if > 0 */}
              {tactic.matches && tactic.matches.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {tactic.matches.map((m, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                      "{m}"
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
