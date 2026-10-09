import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Users, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

export const ScamTwins = ({ scamTwins, categoryLabel }) => {
  const [expanded, setExpanded] = useState(false);

  if (!scamTwins || scamTwins.length === 0) return null;

  const topMatch = scamTwins[0];

  // Helper to highlight matched tactics
  const renderHighlightedSnippet = (snippet, tactics) => {
    if (!tactics || tactics.length === 0) return snippet;
    
    // Sort tactics by length descending so longer phrases match first
    const sortedTactics = [...tactics].sort((a, b) => b.length - a.length);
    
    let highlightedText = snippet;
    sortedTactics.forEach(tactic => {
      // Very basic case-insensitive replacement adding a span
      const regex = new RegExp(`(${tactic})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<span class="bg-warn/30 text-warn-dark font-semibold px-0.5 rounded">$1</span>');
    });

    return <div dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  return (
    <Card className="mt-4 border border-gray-200 overflow-hidden shadow-sm">
      <div 
        className="p-4 bg-gray-50 flex flex-col cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-navy">
            <Users className="w-5 h-5 text-brand" />
            <h3 className="font-bold text-sm">Known Scam Twins Found</h3>
          </div>
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
        <p className="text-xs text-gray-600 mt-2">
          We found similar <span className="font-bold text-navy">{categoryLabel}</span> messages. Closest match: <span className="font-bold text-danger">{topMatch.similarityPercent}% similarity</span>.
        </p>
      </div>

      {expanded && (
        <div className="p-4 space-y-4 bg-white border-t border-gray-100 animate-in slide-in-from-top-2">
          {scamTwins.map((twin, idx) => (
            <div key={idx} className="border-l-2 border-brand pl-3 py-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Match {idx + 1} • {twin.similarityPercent}%
                </span>
                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase">
                  {twin.category.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-sm text-gray-800 italic leading-relaxed">
                "{renderHighlightedSnippet(twin.redactedSnippet, twin.tacticsMatched)}"
              </p>
            </div>
          ))}

          <div className="flex items-start gap-2 bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100 mt-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
            <p className="text-xs font-medium">
              Scammers reuse identical message scripts across thousands of targets. Seeing a known script confirms this is a mass fraud campaign.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};
