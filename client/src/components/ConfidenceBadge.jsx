import React, { useState } from 'react';
import { Sparkles, Info } from 'lucide-react';

export const ConfidenceBadge = ({ confidence, message }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Parse confidence to percentage
  const percent = Math.round((confidence || 0.85) * 100);

  return (
    <div className="relative inline-flex items-center">
      <div 
        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-[10px] font-bold tracking-wider uppercase cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        <Sparkles className="w-3 h-3" />
        <span>{percent}% Confidence</span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full mt-2 right-0 sm:left-1/2 sm:-translate-x-1/2 w-64 p-3 bg-slate-900/95 backdrop-blur-sm text-white text-xs rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-1 border border-slate-700/50">
          <div className="flex items-start gap-2 mb-1.5">
            <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            <p className="font-bold text-white uppercase tracking-wider">{message || "AI Analysis"}</p>
          </div>
          <p className="text-slate-300 leading-relaxed">
            This score indicates our AI and rule engine's certainty. While highly accurate, AI can make mistakes. Always verify independently.
          </p>
        </div>
      )}
    </div>
  );
};
