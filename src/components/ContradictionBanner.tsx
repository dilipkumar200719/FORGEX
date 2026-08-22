import React from 'react';
import { AlertOctagon, ShieldAlert, Sparkles, Mic, Activity, Eye, History, ArrowRight, CheckCircle2, UserCheck, Cpu } from 'lucide-react';
import { Contradiction, CrossSenseAnalysis } from '../types';

interface ContradictionBannerProps {
  contradiction: Contradiction;
  analysis?: CrossSenseAnalysis;
  onOpenDecisions?: () => void;
}

export const ContradictionBanner: React.FC<ContradictionBannerProps> = ({
  contradiction,
  analysis,
  onOpenDecisions,
}) => {
  if (!contradiction.detected) {
    return (
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-emerald-300">Modality Consensus Optimal: </span>
            <span className="text-slate-300">All 5 sensory streams (Sensors, Vision, Voice, History, Maintenance) agree on machine state.</span>
          </div>
        </div>
        <span className="text-xs font-mono text-emerald-300 font-bold bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-700/60">
          Confidence: {analysis?.crossSenseConfidence || 96.5}%
        </span>
      </div>
    );
  }

  return (
    <div id="contradiction-alert-banner" className="bg-gradient-to-r from-rose-950/95 via-slate-900/95 to-amber-950/90 border-2 border-rose-500 rounded-2xl p-4.5 text-slate-100 shadow-2xl shadow-rose-950/60 space-y-3.5">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500 text-rose-300 animate-pulse shadow-md">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black uppercase tracking-wider text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-600">
                CRITICAL CONTRADICTION DETECTED
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-600">
                Severity: {contradiction.severity}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white mt-1">
              Human Observation Conflict: Technician Voice says "NORMAL" vs AI Machine Consensus "CRITICAL"
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-300 uppercase">Cross-Sense AI Confidence</div>
            <div className="text-xl font-mono font-black text-cyan-300">
              {analysis?.crossSenseConfidence || 94.2}%
            </div>
          </div>
          {onOpenDecisions && (
            <button
              onClick={onOpenDecisions}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-950/50 transition-all hover:scale-105"
            >
              <span>See AI Reasoning</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Comparison Split Box: Human vs Machine */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Human Voice Modality */}
        <div className="p-3.5 rounded-xl bg-slate-950/90 border border-amber-600/50 shadow-inner flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Mic className="w-4 h-4" />
                </div>
                <span className="font-mono font-extrabold text-amber-300 uppercase text-xs">
                  Human Voice Modality
                </span>
              </div>
              <span className="text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-md border border-emerald-600 font-bold font-mono text-[10px]">
                REPORTED: NORMAL
              </span>
            </div>

            <p className="text-slate-100 font-bold text-sm italic bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 my-2">
              "{contradiction.humanObservation}"
            </p>
          </div>

          <div className="text-[11px] text-slate-300 bg-amber-950/30 p-2 rounded-lg border border-amber-900/40 mt-2">
            <strong className="text-amber-300">Why the human missed it:</strong> Unassisted human ears only detect 20Hz-20kHz. Early bearing micro-flaking generates ultrasonic 40kHz energy that is completely inaudible to human ears until catastrophic explosion.
          </div>
        </div>

        {/* Machine Modalities (Sensor + Vision + History) */}
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500 shadow-inner flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="font-mono font-extrabold text-rose-300 uppercase text-xs">
                  Physical Consensus (Sensors + Vision + ML)
                </span>
              </div>
              <span className="text-rose-200 bg-rose-900/90 px-2 py-0.5 rounded-md border border-rose-500 font-bold font-mono text-[10px] animate-pulse">
                CRITICAL ANOMALY
              </span>
            </div>

            <p className="text-slate-100 font-semibold text-xs leading-relaxed bg-slate-950/80 p-2.5 rounded-lg border border-rose-900/60 my-2">
              {contradiction.summary}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] font-mono mt-2">
            <span className="px-2 py-1 rounded-md bg-slate-900 text-sky-300 border border-sky-600 font-bold">
              📡 Sensors: 18.4 mm/s Vib
            </span>
            <span className="px-2 py-1 rounded-md bg-slate-900 text-indigo-300 border border-indigo-600 font-bold">
              👁️ Vision: Seal Leak Spray
            </span>
            <span className="px-2 py-1 rounded-md bg-slate-900 text-emerald-300 border border-emerald-600 font-bold">
              🧠 ML: 94% Failure Match
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
