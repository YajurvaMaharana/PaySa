import React from 'react';
import { Shield, Activity, TrendingUp, TrendingDown, MessageSquare, AlertTriangle, Radio } from 'lucide-react';
import { Card } from '../components/ui/Card';

const radarData = {
  categories: [
    { name: "Fake KYC", change: "+42%", trend: "up", volume: "High" },
    { name: "Digital Arrest", change: "+65%", trend: "up", volume: "Critical" },
    { name: "Courier/Customs", change: "+18%", trend: "up", volume: "Medium" },
    { name: "Electricity Bill", change: "-12%", trend: "down", volume: "Low" }
  ],
  languages: [
    { name: "Hinglish", share: "54%", color: "bg-purple-500" },
    { name: "English", share: "31%", color: "bg-blue-500" },
    { name: "Hindi", share: "15%", color: "bg-orange-500" }
  ],
  channels: [
    { name: "WhatsApp", share: "62%", color: "bg-emerald-500" },
    { name: "SMS", share: "24%", color: "bg-blue-400" },
    { name: "Telegram", share: "14%", color: "bg-sky-400" }
  ]
};

export const Radar = () => {
  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4">
      {/* Header Block */}
      <div className="-mx-4 -mt-6 p-5 pb-6 bg-slate-900 text-white shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <Radio className="h-6 w-6 text-brand animate-pulse" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Scam Evolution Radar</h2>
        </div>
        <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">
          Anonymized Simulated Demonstration Data
        </p>
      </div>

      {/* Insight Callout */}
      <div className="bg-brand/10 border border-brand/20 p-4 rounded-xl flex items-start gap-3">
        <AlertTriangle className="h-6 w-6 shrink-0 text-brand mt-0.5" />
        <p className="text-sm font-semibold text-slate-800 leading-snug">
          <span className="text-brand uppercase tracking-wider text-xs block mb-1">Weekly Insight</span>
          Courier & Customs-fee scam cluster rose 42% this week. Scammers shifting heavily to Hinglish urgency hooks.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 border-l-4 border-l-danger bg-white shadow-sm flex items-start gap-3">
          <Activity className="h-8 w-8 text-danger shrink-0 bg-danger/10 p-1.5 rounded-lg" />
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fastest Growing</p>
            <p className="text-lg font-bold text-navy">Digital Arrest</p>
            <p className="text-sm font-semibold text-danger flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> +65% this week
            </p>
          </div>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-warn bg-white shadow-sm flex items-start gap-3">
          <MessageSquare className="h-8 w-8 text-warn-dark shrink-0 bg-warn/10 p-1.5 rounded-lg" />
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dominant Channel</p>
            <p className="text-lg font-bold text-navy">WhatsApp</p>
            <p className="text-sm font-medium text-gray-600">62% of detected volume</p>
          </div>
        </Card>
      </div>

      {/* Category Timeline / Trends */}
      <Card className="p-5 shadow-sm bg-white">
        <h3 className="font-bold text-navy mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-400" />
          Category Volume Shifts
        </h3>
        <div className="space-y-4">
          {radarData.categories.map((cat, idx) => (
            <div key={idx} className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-3 last:pb-0">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800">{cat.name}</span>
                <span className="text-xs text-gray-400">{cat.volume} Volume</span>
              </div>
              <div className={`flex items-center gap-1 font-bold px-2 py-1 rounded-md ${
                cat.trend === 'up' ? 'bg-danger/10 text-danger' : 'bg-safe/10 text-safe-dark'
              }`}>
                {cat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {cat.change}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Distribution Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5 shadow-sm bg-white">
          <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-3">Language Mix</h3>
          <div className="space-y-3">
            {radarData.languages.map((lang, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{lang.name}</span>
                  <span className="font-bold text-gray-900">{lang.share}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${lang.color}`} style={{ width: lang.share }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 shadow-sm bg-white">
          <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-3">Vector Mix</h3>
          <div className="space-y-3">
            {radarData.channels.map((ch, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{ch.name}</span>
                  <span className="font-bold text-gray-900">{ch.share}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${ch.color}`} style={{ width: ch.share }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
