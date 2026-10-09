import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import SafetyCircleModal from '../components/SafetyCircleModal';

export const Recovery = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-navy">Recovery</h2>
      <p className="text-gray-600">Recovery placeholder.</p>
      <Button onClick={() => setModalOpen(true)}>Tell a Trusted Person</Button>

      <SafetyCircleModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </div>
  );
};
