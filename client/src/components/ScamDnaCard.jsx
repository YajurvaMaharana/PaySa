import React from 'react';
import { Card } from './ui/Card';
import { Fingerprint, Network, ShieldCheck, Activity } from 'lucide-react';

export const ScamDnaCard = ({ scamDna }) => {
  if (!scamDna) return null;

  const { fingerprint, dnaHash, campaignClusterMatch } = scamDna;

  const VectorBar = ({ label, value }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-mono text-gray-500">
        <span>{label}</span>
        <span>{value.toFixed(2)}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-brand rounded-full transition-all duration-1000"
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <Card className="mt-6 bg-slate-900 border-slate-800 overflow-hidden shadow-lg relative">
      {/* Background decoration */}
      <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none">
        <Fingerprint className="w-40 h-40 text-brand" />
      </div>

      <div className="p-5 space-y-5 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-brand" />
            <h3 className="font-bold text-slate-200 tracking-wide uppercase text-sm">
              ScamScript DNA
            </h3>
          </div>
          <div className="bg-slate-800 text-brand text-[10px] font-mono px-2 py-1 rounded border border-slate-700">
            {dnaHash}
          </div>
        </div>

        {/* Vectors Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <VectorBar label="URGENCY" value={fingerprint.urgency} />
          <VectorBar label="FEAR" value={fingerprint.fear} />
          <VectorBar label="PAY_DEMAND" value={fingerprint.payment_demand} />
          <VectorBar label="AUTHORITY" value={fingerprint.authority_impersonation} />
        </div>

        {/* Cluster Match Pill */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 flex items-start gap-3">
          <Network className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-300">ScamScript DNA Match: 89%</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {campaignClusterMatch}
            </p>
          </div>
        </div>

        {/* Punchline */}
        <div className="flex items-start gap-2 pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 uppercase tracking-wide font-medium leading-tight">
            We turn individual scam messages into reusable fraud intelligence.
          </p>
        </div>
      </div>
    </Card>
  );
};
