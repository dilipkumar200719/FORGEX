import React from 'react';
import { 
  Sparkles, 
  Layers, 
  AlertOctagon, 
  ShieldCheck, 
  Activity, 
  Eye, 
  Mic, 
  History, 
  Wrench,
  X,
  ArrowRight,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface QuickExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunDemo?: () => void;
}

export const QuickExplainerModal: React.FC<QuickExplainerModalProps> = ({
  isOpen,
  onClose,
  onRunDemo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 dark:bg-slate-900 border border-slate-700/80 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">How FORGE X Protects Industrial Plants</h2>
              <p className="text-xs text-cyan-400 font-medium">Simple 3-Step Multimodal AI Safety Architecture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Core Steps */}
        <div className="space-y-3.5">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/60 to-slate-900 border border-sky-600/40 flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-sky-500/20 text-sky-400 font-black font-mono text-sm shrink-0 border border-sky-500/30">
              01
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-sky-200 flex items-center gap-1.5">
                <span>5 Sensory Signals Synced in Real Time</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Traditional plants only use a single sensor alarm. FORGE X fuses <strong className="text-sky-300">IoT Telemetry</strong>, <strong className="text-indigo-300">Thermal/Optical Cameras</strong>, <strong className="text-amber-300">Technician Voice Notes</strong>, <strong className="text-emerald-300">ML Precursors</strong>, and <strong className="text-rose-300">Maintenance Records</strong>.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-600/40 flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 font-black font-mono text-sm shrink-0 border border-amber-500/30">
              02
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-200 flex items-center gap-1.5">
                <span>Resolves Human Cognitive Blindspots</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                If a technician walks by and reports <em className="text-amber-300">"Sounds totally normal to me"</em>, but high-frequency sensors detect hidden bearing flaking (18.4 mm/s vibration) + camera sees micro-seal leaks, FORGE X recognizes the contradiction and prevents a catastrophic explosion.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-600/40 flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-black font-mono text-sm shrink-0 border border-emerald-500/30">
              03
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-emerald-200 flex items-center gap-1.5">
                <span>Autonomous Mitigation & Verified Proof</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The platform immediately throttles motor RPM by 35% in under 3.2s, issues a P1 work order, and continuously evaluates post-action data to prove physical vibration dropped by <strong className="text-emerald-300">42%</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* 5 Modality Color Badges */}
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
          <span className="text-[11px] font-mono uppercase text-slate-400 block font-bold">
            Color-Coded Sensory Modalities:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 font-medium">
              <Activity className="w-3.5 h-3.5 mx-auto mb-1 text-cyan-400" />
              <span>IoT Telemetry</span>
            </div>
            <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-medium">
              <Eye className="w-3.5 h-3.5 mx-auto mb-1 text-indigo-400" />
              <span>AI Vision</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-700/60 text-amber-300 font-medium">
              <Mic className="w-3.5 h-3.5 mx-auto mb-1 text-amber-400" />
              <span>Voice Notes</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-medium">
              <History className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-400" />
              <span>Historical ML</span>
            </div>
            <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-700/60 text-rose-300 font-medium">
              <Wrench className="w-3.5 h-3.5 mx-auto mb-1 text-rose-400" />
              <span>Maintenance</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Got It, Take Me to HUD
          </button>

          {onRunDemo && (
            <button
              onClick={() => {
                onClose();
                onRunDemo();
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white shadow-lg shadow-cyan-900/40 flex items-center gap-1.5 transition-all"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Run 60s Live Test Scenario</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
