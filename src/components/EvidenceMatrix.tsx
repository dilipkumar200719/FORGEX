import React from 'react';
import { Activity, Eye, Mic, History, Wrench, CheckCircle2, AlertTriangle, AlertOctagon, Info, Sparkles } from 'lucide-react';
import { ModalityEvidence } from '../types';

interface EvidenceMatrixProps {
  evidences: ModalityEvidence[];
  onInspectModality?: (modality: string) => void;
}

export const EvidenceMatrix: React.FC<EvidenceMatrixProps> = ({
  evidences,
  onInspectModality,
}) => {
  const getModalityConfig = (mod: string) => {
    switch (mod) {
      case 'SENSOR':
        return {
          icon: Activity,
          color: 'text-sky-400',
          badgeBg: 'bg-sky-950/80 border-sky-600/70 text-sky-300',
          cardGlow: 'hover:border-sky-500/60 bg-gradient-to-b from-sky-950/20 to-slate-900',
          title: 'IoT Telemetry Sensors',
        };
      case 'VISION':
        return {
          icon: Eye,
          color: 'text-indigo-400',
          badgeBg: 'bg-indigo-950/80 border-indigo-600/70 text-indigo-300',
          cardGlow: 'hover:border-indigo-500/60 bg-gradient-to-b from-indigo-950/20 to-slate-900',
          title: 'Optical / Thermal Vision',
        };
      case 'VOICE':
        return {
          icon: Mic,
          color: 'text-amber-400',
          badgeBg: 'bg-amber-950/80 border-amber-600/70 text-amber-300',
          cardGlow: 'hover:border-amber-500/60 bg-gradient-to-b from-amber-950/20 to-slate-900',
          title: 'Human Voice Logs',
        };
      case 'HISTORY':
        return {
          icon: History,
          color: 'text-emerald-400',
          badgeBg: 'bg-emerald-950/80 border-emerald-600/70 text-emerald-300',
          cardGlow: 'hover:border-emerald-500/60 bg-gradient-to-b from-emerald-950/20 to-slate-900',
          title: 'ML Precursor Models',
        };
      case 'MAINTENANCE':
        return {
          icon: Wrench,
          color: 'text-rose-400',
          badgeBg: 'bg-rose-950/80 border-rose-600/70 text-rose-300',
          cardGlow: 'hover:border-rose-500/60 bg-gradient-to-b from-rose-950/20 to-slate-900',
          title: 'Maintenance History',
        };
      default:
        return {
          icon: Info,
          color: 'text-slate-400',
          badgeBg: 'bg-slate-800 border-slate-700 text-slate-300',
          cardGlow: 'hover:border-slate-700 bg-slate-900',
          title: mod,
        };
    }
  };

  const getStatusBadge = (state: string) => {
    switch (state) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/90 border border-rose-500 text-rose-200 flex items-center gap-1 shadow-sm animate-pulse">
            <AlertOctagon className="w-3 h-3 text-rose-400" />
            CRITICAL
          </span>
        );
      case 'ABNORMAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/90 border border-amber-500 text-amber-200 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            ABNORMAL
          </span>
        );
      case 'NORMAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/90 border border-emerald-500 text-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            NORMAL
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 border border-slate-700 text-slate-300">
            {state}
          </span>
        );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2">
          <span>Cross-Sense 5-Modality Evidence Matrix</span>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-700/80">
            Real-Time Fusion Active
          </span>
        </h3>
        <span className="text-[11px] text-slate-400">
          Click any modality card to inspect or test overrides
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {evidences.map((ev) => {
          const cfg = getModalityConfig(ev.modality);
          const Icon = cfg.icon;
          const isCritical = ev.state === 'CRITICAL';
          const isAbnormal = ev.state === 'ABNORMAL';

          let borderClass = 'border-slate-800';
          if (isCritical) borderClass = 'border-rose-500/80 ring-1 ring-rose-500/40 shadow-lg shadow-rose-950/40';
          else if (isAbnormal) borderClass = 'border-amber-500/80 ring-1 ring-amber-500/40 shadow-md shadow-amber-950/40';

          return (
            <div
              key={ev.modality}
              onClick={() => onInspectModality?.(ev.modality)}
              className={`rounded-xl p-3.5 flex flex-col justify-between transition-all duration-200 cursor-pointer border ${borderClass} ${cfg.cardGlow} shadow-sm group hover:scale-[1.02]`}
            >
              {/* Top Header */}
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`p-1.5 rounded-lg bg-slate-950 border border-slate-800 ${cfg.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-black text-white block leading-tight">{ev.modality}</span>
                      <span className="text-[9px] text-slate-400 block">{cfg.title}</span>
                    </div>
                  </div>
                  {getStatusBadge(ev.state)}
                </div>

                <h4 className="text-xs font-bold text-slate-100 line-clamp-2 my-2 leading-snug group-hover:text-cyan-300 transition-colors">
                  {ev.headline}
                </h4>

                <div className="space-y-1 my-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  {ev.details.slice(0, 2).map((det, i) => (
                    <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1 leading-snug">
                      <span className={`font-mono text-[10px] mt-0.5 ${cfg.color}`}>▸</span>
                      <span className="line-clamp-2">{det}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Weight & Confidence */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Weight: <strong className="text-white">{(ev.weight * 100).toFixed(0)}%</strong></span>
                <span className="text-cyan-300 font-bold bg-cyan-950/70 px-1.5 py-0.2 rounded border border-cyan-800">
                  Conf: {ev.confidence}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
