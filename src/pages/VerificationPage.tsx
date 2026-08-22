import React from 'react';
import { ShieldCheck, CheckCircle2, TrendingDown, ArrowDownRight, RefreshCw, Activity, Thermometer, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';
import { VerificationRecord, Machine } from '../types';
import { VerificationPanel } from '../components/VerificationPanel';

interface VerificationPageProps {
  machine: Machine;
  verification?: VerificationRecord;
  onTriggerVerification: () => void;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({
  machine,
  verification,
  onTriggerVerification,
}) => {
  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Closed-Loop Verification & Mitigation Efficacy Proof</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Autonomous post-action telemetry sliding window to physically prove vibration & thermal stabilization
          </p>
        </div>

        <button
          onClick={onTriggerVerification}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Execute Verification Sweep</span>
        </button>
      </div>

      {/* Main Verification Panel */}
      <VerificationPanel
        record={verification}
        onTriggerVerification={onTriggerVerification}
      />

      {/* Deep-Dive Verification Logic Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-md">
        <h3 className="text-xs font-mono font-bold uppercase text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2.5">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>How Closed-Loop Autonomous Verification Prevents False Alarms & Secondary Damage</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-sky-800/50 space-y-1.5 shadow-inner">
            <span className="font-mono font-bold text-sky-300 uppercase text-xs">
              1. Sliding Window Pre/Post Baseline
            </span>
            <p className="text-slate-300 leading-relaxed">
              FORGE X captures a high-resolution 30-second pre-intervention telemetry baseline (18.4 mm/s RMS vibration, 88.2°C temperature).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-800/50 space-y-1.5 shadow-inner">
            <span className="font-mono font-bold text-indigo-300 uppercase text-xs">
              2. Real-Time Dynamic De-Rating
            </span>
            <p className="text-slate-300 leading-relaxed">
              The platform executes a load de-rating command to 980 RPM via industrial PLC/Modbus, relieving hydrodynamic strain.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-800/50 space-y-1.5 shadow-inner">
            <span className="font-mono font-bold text-emerald-300 uppercase text-xs">
              3. Deterministic Delta Proof
            </span>
            <p className="text-slate-300 leading-relaxed">
              After 15 seconds, post-telemetry confirms a <strong className="text-emerald-300">-42%</strong> vibration drop and <strong className="text-emerald-300">-24%</strong> thermal drop, marking the incident mathematically VERIFIED.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
