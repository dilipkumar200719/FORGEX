import React, { useState } from 'react';
import { 
  Activity, 
  Cpu, 
  Eye, 
  Mic, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Zap, 
  TrendingDown, 
  Radio,
  Sliders,
  Sparkles,
  ArrowRight,
  ChevronRight,
  HelpCircle,
  PlayCircle,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Machine, CrossSenseAnalysis, VerificationRecord, Incident, TimelineEvent } from '../types';
import { TelemetryGauge } from '../components/TelemetryGauge';
import { TelemetryChart } from '../components/TelemetryChart';
import { ContradictionBanner } from '../components/ContradictionBanner';
import { EvidenceMatrix } from '../components/EvidenceMatrix';
import { ExplainableCard } from '../components/ExplainableCard';
import { VerificationPanel } from '../components/VerificationPanel';

interface CommandCenterProps {
  machine: Machine;
  allMachines: Machine[];
  analysis?: CrossSenseAnalysis;
  verification?: VerificationRecord;
  incidents: Incident[];
  timeline: TimelineEvent[];
  onOpenVisionModal: () => void;
  onOpenVoiceModal: () => void;
  onOpenDecisionsTab: () => void;
  onSelectIncident: (inc: Incident) => void;
  onExecuteAction: (type: any, params?: any) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  machine,
  allMachines,
  analysis,
  verification,
  incidents,
  timeline,
  onOpenVisionModal,
  onOpenVoiceModal,
  onOpenDecisionsTab,
  onSelectIncident,
  onExecuteAction,
}) => {
  const [showGuide, setShowGuide] = useState(false);
  const tel = machine.currentTelemetry;
  const nr = machine.normalRanges;
  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-rose-950/90 text-rose-300 border-rose-500 shadow-md shadow-rose-950 animate-pulse';
      case 'WARNING':
        return 'bg-amber-950/90 text-amber-300 border-amber-500 shadow-md shadow-amber-950';
      case 'MITIGATION_ACTIVE':
        return 'bg-sky-950/90 text-sky-300 border-sky-500 shadow-md shadow-sky-950 animate-pulse';
      case 'NORMAL':
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-md shadow-emerald-950';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div id="command-center-view" className="space-y-4 pb-12">
      {/* Top Asset Identity & Fleet Health Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 border border-sky-400/40 text-white shadow-lg shadow-sky-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-black text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {machine.id}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-black border ${getStatusBadge(machine.status)}`}>
                {machine.status}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                📍 {machine.location}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-white mt-1">{machine.name}</h1>
          </div>
        </div>

        {/* Fleet KPI Quick Bar & Guide Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center shadow-inner">
            <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Asset Health</span>
            <span className={`text-lg font-mono font-black ${machine.healthScore < 50 ? 'text-rose-400' : machine.healthScore < 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {machine.healthScore}%
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center shadow-inner">
            <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Risk Index</span>
            <span className={`text-lg font-mono font-black ${machine.riskScore > 70 ? 'text-rose-400' : machine.riskScore > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {machine.riskScore}/100
            </span>
          </div>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>{showGuide ? 'Hide Guide' : 'Quick Guide'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Friendly Quick Guide */}
      {showGuide && (
        <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-500/40 rounded-2xl p-4 text-xs text-slate-200 space-y-2 shadow-xl animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-extrabold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>How To Test FORGE X (Quick Instructions)</span>
            </span>
            <span className="text-[11px] text-cyan-300 font-mono">No complex setup required</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <strong className="text-sky-300 block mb-1">1. Test the Contradiction:</strong>
              Click <span className="text-amber-300 font-bold">"Record Voice"</span> below and say <em>"Machine sounds fine to me"</em> while an anomaly is active. Watch the AI detect the human auditory blindspot.
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <strong className="text-indigo-300 block mb-1">2. Run AI Camera Scan:</strong>
              Click <span className="text-indigo-300 font-bold">"Camera Inspection"</span> to analyze live visual frames with Gemini for seal spray and wobble.
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <strong className="text-emerald-300 block mb-1">3. Observe Autonomous Fix:</strong>
              Click <span className="text-emerald-300 font-bold">"Throttle Load"</span> to watch real-time RPM reduction from 1480 → 980 RPM and vibration drop from 18.4 → 10.7 mm/s.
            </div>
          </div>
        </div>
      )}

      {/* QUICK INTERACTIVE ACTION TOOLBAR */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-md">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 font-bold">
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            Interactive Test Hub
          </span>
          <span className="text-slate-400 hidden sm:inline">Try any modality:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Voice Input Trigger */}
          <button
            id="btn-trigger-voice-modal"
            onClick={onOpenVoiceModal}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-950/50 transition-all hover:scale-105"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>🎙️ Record Voice Note</span>
          </button>

          {/* Camera Inspection Trigger */}
          <button
            id="btn-trigger-vision-modal"
            onClick={onOpenVisionModal}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-950/50 transition-all hover:scale-105"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>📷 AI Camera Scan</span>
          </button>

          {/* De-rate Speed Action */}
          <button
            id="btn-trigger-derate-load"
            onClick={() => onExecuteAction('REDUCE_MACHINE_LOAD', { targetRpm: 980 })}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-950/50 transition-all hover:scale-105"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ Throttle Motor Load</span>
          </button>
        </div>
      </div>

      {/* Contradiction Alert Banner (Shown when contradiction is present or agreement is nominal) */}
      {analysis && (
        <ContradictionBanner
          contradiction={analysis.contradiction}
          analysis={analysis}
          onOpenDecisions={onOpenDecisionsTab}
        />
      )}

      {/* 5-GAUGE REAL-TIME SENSORY TELEMETRY ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <TelemetryGauge
          label="Vibration"
          value={tel.vibration}
          unit="mm/s"
          min={0}
          max={24}
          normalMin={nr.vibration[0]}
          normalMax={nr.vibration[1]}
          type="vibration"
        />
        <TelemetryGauge
          label="Temperature"
          value={tel.temperature}
          unit="°C"
          min={20}
          max={120}
          normalMin={nr.temperature[0]}
          normalMax={nr.temperature[1]}
          type="temperature"
        />
        <TelemetryGauge
          label="Power Current"
          value={tel.current}
          unit="A"
          min={0}
          max={15}
          normalMin={nr.current[0]}
          normalMax={nr.current[1]}
          type="current"
        />
        <TelemetryGauge
          label="Line Pressure"
          value={tel.pressure}
          unit="bar"
          min={0}
          max={12}
          normalMin={nr.pressure[0]}
          normalMax={nr.pressure[1]}
          type="pressure"
        />
        <TelemetryGauge
          label="Shaft Speed"
          value={tel.rpm}
          unit="RPM"
          min={500}
          max={2000}
          normalMin={nr.rpm[0]}
          normalMax={nr.rpm[1]}
          type="rpm"
        />
      </div>

      {/* 5-MODALITY EVIDENCE FUSION MATRIX */}
      {analysis && (
        <EvidenceMatrix
          evidences={analysis.evidences}
          onInspectModality={(mod) => {
            if (mod === 'VOICE') onOpenVoiceModal();
            else if (mod === 'VISION') onOpenVisionModal();
            else onOpenDecisionsTab();
          }}
        />
      )}

      {/* 2-COLUMN BOTTOM GRID: LIVE TIME-SERIES CHART & CLOSED-LOOP VERIFICATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7-Cols: Live Interactive Time-Series Telemetry Chart */}
        <div className="lg:col-span-7">
          <TelemetryChart
            history={machine.telemetryHistory}
            normalRanges={machine.normalRanges}
          />
        </div>

        {/* Right 5-Cols: Closed-Loop Verification Panel */}
        <div className="lg:col-span-5">
          <VerificationPanel
            record={verification}
            onTriggerVerification={() => onExecuteAction('START_VERIFICATION')}
          />
        </div>
      </div>
    </div>
  );
};
