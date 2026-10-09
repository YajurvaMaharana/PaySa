import React from 'react';
import { Card } from '../components/ui/Card';
import { useT } from '../i18n';

export const Scan = () => {
  const { t } = useT();
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-navy">{t('common.nav.scan')}</h2>
      <Card className="p-6">
        <p className="text-gray-600">Scan page placeholder.</p>
      </Card>
    </div>
  );
};
