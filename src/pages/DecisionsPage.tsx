import React from 'react';
import { Sparkles, Brain, AlertOctagon, CheckCircle2, ShieldAlert, Cpu, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';
import { Machine, CrossSenseAnalysis } from '../types';
import { ExplainableCard } from '../components/ExplainableCard';

interface DecisionsPageProps {
  machine: Machine;
  analysis?: CrossSenseAnalysis;
  onExecuteAction: (type: any) => void;
}

export const DecisionsPage: React.FC<DecisionsPageProps> = ({
  machine,
  analysis,
  onExecuteAction,
}) => {
  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Explainable AI & Autonomous Decision Transparency</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Transparent evidence chains, contradiction resolution, and deterministic autonomous decisions
          </p>
        </div>
      </div>

      {/* Main Explainability Artifact Card */}
      {analysis && (
        <ExplainableCard
          analysis={analysis}
          onExecuteMitigation={() => onExecuteAction('REDUCE_MACHINE_LOAD')}
        />
      )}

      {/* Deep-Dive Contradiction & Human Bias Resolution Architecture */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-md">
        <h3 className="text-xs font-mono font-bold uppercase text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2.5">
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          <span>Why Multi-Sensing Beats Single Human or Single Sensor Observation</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-800/50 space-y-1.5 shadow-inner">
            <span className="font-mono font-bold text-amber-300 uppercase text-xs flex items-center gap-1.5">
              <span>1. Human Perceptual Blindspot</span>
            </span>
            <p className="text-slate-300 leading-relaxed">
              Technicians rely on external acoustics and tactile sensation. Incipient bearing flaking and raceway micro-spalling generate high-frequency energy (20kHz-100kHz) that is completely inaudible to human ears until catastrophic explosion.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-sky-800/50 space-y-1.5 shadow-inner">
            <span className="font-mono font-bold text-sky-300 uppercase text-xs flex items-center gap-1.5">
              <span>2. Multimodal Convergence</span>
            </span>
            <p className="text-slate-300 leading-relaxed">
              While human voice indicates "NORMAL", piezoelectric accelerometers measure 18.4 mm/s RMS vibration, optical cameras detect fluid seal spray, and historical ML models find a 94% match to catastrophic bearing failure precursors.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-800/50 space-y-1.5 shadow-inner">
            <span className="font-mono font-bold text-emerald-300 uppercase text-xs flex items-center gap-1.5">
              <span>3. Autonomous Safe Intervention</span>
            </span>
            <p className="text-slate-300 leading-relaxed">
              Rather than waiting for manual email threads, FORGE X executes a load de-rating command to 980 RPM within 3.2s, mitigating thermal runaway while simultaneously dispatching a priority P1 technician work order.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
