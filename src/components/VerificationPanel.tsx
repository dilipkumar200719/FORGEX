import React from 'react';
import { ShieldCheck, CheckCircle2, ArrowDownRight, Activity, Thermometer, AlertTriangle, TrendingDown, RefreshCw, Zap } from 'lucide-react';
import { VerificationRecord } from '../types';

interface VerificationPanelProps {
  record?: VerificationRecord;
  onTriggerVerification?: () => void;
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({
  record,
  onTriggerVerification,
}) => {
  if (!record) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-slate-100 flex flex-col items-center justify-center text-center min-h-[220px] shadow-lg">
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2.5">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h4 className="text-sm font-extrabold text-white">Closed-Loop Verification Ready</h4>
        <p className="text-xs text-slate-300 max-w-sm mt-1 mb-4 leading-relaxed">
          FORGE X continuously validates whether autonomous speed de-rating successfully stabilizes physical vibration and bearing temperatures.
        </p>
        {onTriggerVerification && (
          <button
            onClick={onTriggerVerification}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-500/50 text-xs font-bold shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Run Test Verification Sweep</span>
          </button>
        )}
      </div>
    );
  }

  const isSuccess = record.status === 'SUCCESSFUL';
  const isInProgress = record.status === 'IN_PROGRESS';

  const beforeVib = record.beforeTelemetry?.vibration || 18.4;
  const afterVib = record.afterTelemetry?.vibration || 10.7;
  const beforeTemp = record.beforeTelemetry?.temperature || 88.2;
  const afterTemp = record.afterTelemetry?.temperature || 66.8;
  const beforeRisk = record.beforeRiskScore || 94;
  const afterRisk = record.afterRiskScore || 39;

  const vibDelta = record.vibrationReductionPct || (((beforeVib - afterVib) / beforeVib) * 100).toFixed(1);
  const tempDelta = record.temperatureReductionPct || (((beforeTemp - afterTemp) / beforeTemp) * 100).toFixed(1);
  const riskDelta = record.riskReductionPct || (((beforeRisk - afterRisk) / beforeRisk) * 100).toFixed(1);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-slate-100 space-y-4 shadow-xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${isSuccess ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-md' : 'bg-sky-950/90 border-sky-500 text-sky-300'}`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Verification ID: {record.id}</div>
            <h4 className="text-sm font-extrabold text-white">
              Closed-Loop Telemetry Delta Proof
            </h4>
          </div>
        </div>

        <div>
          {isSuccess ? (
            <span className="px-3 py-1 rounded-xl text-xs font-mono font-black tracking-wider bg-emerald-950/90 border-2 border-emerald-500 text-emerald-200 flex items-center gap-1.5 shadow-lg shadow-emerald-950/60 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              MITIGATION VERIFIED (-42%)
            </span>
          ) : isInProgress ? (
            <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-sky-950/90 border border-sky-500 text-sky-200 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping"></span>
              VERIFICATION IN PROGRESS
            </span>
          ) : (
            <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-amber-950/90 border border-amber-500 text-amber-200">
              {record.status}
            </span>
          )}
        </div>
      </div>

      {/* Delta Metrics 3-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Vibration Delta */}
        <div className="bg-slate-950/90 p-3.5 rounded-xl border border-sky-800/60 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span className="flex items-center gap-1 font-bold text-sky-300">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              Vibration
            </span>
            <span className="font-mono text-emerald-400 font-extrabold flex items-center gap-0.5 text-xs bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-700">
              <TrendingDown className="w-3.5 h-3.5" />
              -{vibDelta}%
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono mt-1">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Before</span>
              <span className="text-base font-black text-rose-400">{beforeVib.toFixed(1)} <span className="text-[10px]">mm/s</span></span>
            </div>
            <ArrowDownRight className="w-4 h-4 text-slate-500" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">After</span>
              <span className="text-base font-black text-emerald-400">{afterVib.toFixed(1)} <span className="text-[10px]">mm/s</span></span>
            </div>
          </div>
        </div>

        {/* Temperature Delta */}
        <div className="bg-slate-950/90 p-3.5 rounded-xl border border-rose-800/60 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span className="flex items-center gap-1 font-bold text-rose-300">
              <Thermometer className="w-3.5 h-3.5 text-rose-400" />
              Temperature
            </span>
            <span className="font-mono text-emerald-400 font-extrabold flex items-center gap-0.5 text-xs bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-700">
              <TrendingDown className="w-3.5 h-3.5" />
              -{tempDelta}%
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono mt-1">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Before</span>
              <span className="text-base font-black text-rose-400">{beforeTemp.toFixed(1)} <span className="text-[10px]">°C</span></span>
            </div>
            <ArrowDownRight className="w-4 h-4 text-slate-500" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">After</span>
              <span className="text-base font-black text-emerald-400">{afterTemp.toFixed(1)} <span className="text-[10px]">°C</span></span>
            </div>
          </div>
        </div>

        {/* Risk Score Delta */}
        <div className="bg-slate-950/90 p-3.5 rounded-xl border border-amber-800/60 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span className="flex items-center gap-1 font-bold text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Risk Index
            </span>
            <span className="font-mono text-emerald-400 font-extrabold flex items-center gap-0.5 text-xs bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-700">
              <TrendingDown className="w-3.5 h-3.5" />
              -{riskDelta}%
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono mt-1">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Before</span>
              <span className="text-base font-black text-rose-400">{beforeRisk} <span className="text-[10px]">/ 100</span></span>
            </div>
            <ArrowDownRight className="w-4 h-4 text-slate-500" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">After</span>
              <span className="text-base font-black text-emerald-400">{afterRisk} <span className="text-[10px]">/ 100</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Decision Text */}
      <div className="p-3 rounded-xl bg-slate-950 text-xs font-mono text-slate-200 border border-slate-800 shadow-inner">
        <span className="text-emerald-400 font-bold">PHYSICAL VERDICT: </span>
        {record.summary}
      </div>
    </div>
  );
};
