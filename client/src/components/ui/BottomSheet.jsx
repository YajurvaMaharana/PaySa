import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export const BottomSheet = ({ isOpen, onClose, title, children }) => {
  const sheetRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus trapping
      const focusableElements = sheetRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sheet / Modal */}
      <div 
        ref={sheetRef}
        className="relative bg-white w-full max-w-xl sm:rounded-2xl rounded-t-2xl sm:mb-8 shadow-xl transform transition-all flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="px-4 py-4 sm:px-6 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-lg font-semibold text-navy" id="modal-title">
            {title}
          </h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand rounded-full p-1"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
