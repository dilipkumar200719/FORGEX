import React, { useState } from 'react';
import { 
  Activity, 
  Cpu, 
  Eye, 
  Mic, 
  AlertTriangle, 
  AlertOctagon,
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
  Plus,
  Target,
  History,
  Layers,
  FileText,
  RotateCw
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
  allMachines?: Machine[];
  analysis?: CrossSenseAnalysis;
  verification?: VerificationRecord;
  incidents?: Incident[];
  timeline?: TimelineEvent[];
  onOpenVisionModal: () => void;
  onOpenVoiceModal: () => void;
  onOpenDecisionsTab: () => void;
  onSelectIncident?: (inc: Incident) => void;
  onExecuteAction: (type: any, params?: any) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  machine,
  allMachines = [],
  analysis,
  verification,
  incidents = [],
  timeline = [],
  onOpenVisionModal,
  onOpenVoiceModal,
  onOpenDecisionsTab,
  onSelectIncident,
  onExecuteAction,
}) => {
  const [showGuide, setShowGuide] = useState(false);

  const defaultTelemetry = {
    timestamp: Date.now(),
    temperature: 88.4,
    vibration: 18.4,
    current: 8.9,
    pressure: 7.6,
    rpm: 1495,
  };
  const defaultRanges = {
    temperature: [45, 75] as [number, number],
    vibration: [2.0, 7.5] as [number, number],
    current: [4.0, 8.5] as [number, number],
    pressure: [4.0, 7.0] as [number, number],
    rpm: [1400, 1550] as [number, number],
  };

  const tel = machine?.currentTelemetry || defaultTelemetry;
  const nr = {
    vibration: machine?.normalRanges?.vibration || defaultRanges.vibration,
    temperature: machine?.normalRanges?.temperature || defaultRanges.temperature,
    current: machine?.normalRanges?.current || defaultRanges.current,
    pressure: machine?.normalRanges?.pressure || defaultRanges.pressure,
    rpm: machine?.normalRanges?.rpm || defaultRanges.rpm,
  };

  const riskScore = analysis?.overallRiskScore ?? machine?.riskScore ?? 94;
  const riskLevel = analysis?.riskLevel ?? machine?.riskLevel ?? 'CRITICAL';
  const confidence = analysis?.crossSenseConfidence ?? 94.2;

  const visionEvidence = analysis?.evidences?.find((e) => e.modality === 'VISION');
  const voiceEvidence = analysis?.evidences?.find((e) => e.modality === 'VOICE');
  const historyEvidence = analysis?.evidences?.find((e) => e.modality === 'HISTORY');

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-950/90 text-rose-300 border-rose-500 shadow-lg shadow-rose-950/60 animate-pulse';
      case 'HIGH':
        return 'bg-amber-950/90 text-amber-300 border-amber-500 shadow-md shadow-amber-950/50';
      case 'MEDIUM':
        return 'bg-yellow-950/90 text-yellow-300 border-yellow-500';
      default:
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-rose-950/90 text-rose-300 border-rose-500 animate-pulse';
      case 'WARNING':
        return 'bg-amber-950/90 text-amber-300 border-amber-500 shadow-md shadow-amber-950';
      case 'MITIGATION_ACTIVE':
        return 'bg-cyan-950/90 text-cyan-300 border-cyan-500 shadow-md shadow-cyan-950 animate-pulse';
      case 'NORMAL':
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-md shadow-emerald-950';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div id="command-center-view" className="space-y-4 pb-12 font-sans">
      {/* 1. TOP MISSION CONTROL BAR: LIVE MACHINE STATE, RISK SCORE, CROSS-SENSE CONFIDENCE */}
      <div className="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-4.5 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Live Machine Identity & Status */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="relative">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-500/40 text-cyan-400 shadow-inner">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-black tracking-wider text-cyan-300 bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-800">
                  {machine?.id || 'PUMP-042'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-black border ${getStatusBadge(machine?.status || 'CRITICAL')}`}>
                  ● LIVE STATE: {machine?.status || 'CRITICAL'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  📍 {machine?.location || 'Sector 4 - Power & Thermal Utilities'}
                </span>
              </div>
              <h1 className="text-xl font-black text-white mt-1 tracking-tight flex items-center gap-2">
                <span>{machine?.name || 'Primary Boiler Feed Water Pump'}</span>
              </h1>
            </div>
          </div>

          {/* Right: Key Performance Indicators (Risk Score + Cross-Sense Confidence + Health) */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Health Score */}
            <div className="bg-slate-950/90 px-3.5 py-2 rounded-xl border border-slate-800/80 shadow-inner text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Health Score</span>
              <span className={`text-base font-mono font-black ${(machine?.healthScore || 42) < 50 ? 'text-rose-400' : (machine?.healthScore || 42) < 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {machine?.healthScore || 42}%
              </span>
            </div>

            {/* Cross-Sense Multi-Modal Confidence */}
            <div 
              onClick={onOpenDecisionsTab}
              className="bg-slate-950/90 px-3.5 py-2 rounded-xl border border-cyan-900/60 shadow-inner text-right cursor-pointer hover:border-cyan-500/80 transition-all group"
            >
              <div className="flex items-center justify-end gap-1 text-[10px] font-mono text-cyan-400 uppercase font-bold">
                <Sparkles className="w-3 h-3 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>Cross-Sense Confidence</span>
              </div>
              <span className="text-lg font-mono font-black text-cyan-300">
                {confidence}%
              </span>
            </div>

            {/* Prominent Risk Score */}
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 ${getRiskBadge(riskLevel)}`}>
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <span className="text-[10px] font-mono uppercase block font-black leading-tight">Composite Risk</span>
                <span className="text-xl font-mono font-black tracking-tight leading-none">
                  {riskScore}<span className="text-xs font-normal opacity-80">/100</span>
                </span>
              </div>
            </div>

            {/* Quick Guide Toggle */}
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-all"
              title="Toggle Testing Guide"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>

      {/* EXPANDABLE QUICK START GUIDE */}
      {showGuide && (
        <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-500/40 rounded-2xl p-4 text-xs text-slate-200 space-y-2 shadow-xl animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-extrabold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>How To Test FORGE X (Quick Instructions)</span>
            </span>
            <span className="text-[11px] text-cyan-300 font-mono">Real-time Multimodal Integration</span>
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

      {/* QUICK REAL ACTION LAUNCHER TOOLBAR */}
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

      {/* 2. CONTRADICTIONS: PROMINENT CONTRADICTION ALERT BANNER */}
      {analysis && (
        <ContradictionBanner
          contradiction={analysis.contradiction}
          analysis={analysis}
          onOpenDecisions={onOpenDecisionsTab}
        />
      )}

      {/* 3. SENSOR TELEMETRY: 5 REAL-TIME SENSORY GAUGES */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Real-Time Sensor Telemetry (1000ms Loop)</span>
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            Operating Envelope Bounds Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <TelemetryGauge
            label="Vibration"
            value={tel.vibration}
            unit="mm/s"
            min={0}
            max={24}
            normalMin={nr.vibration?.[0] ?? 2.0}
            normalMax={nr.vibration?.[1] ?? 7.5}
            type="vibration"
          />
          <TelemetryGauge
            label="Temperature"
            value={tel.temperature}
            unit="°C"
            min={20}
            max={120}
            normalMin={nr.temperature?.[0] ?? 45}
            normalMax={nr.temperature?.[1] ?? 75}
            type="temperature"
          />
          <TelemetryGauge
            label="Power Current"
            value={tel.current}
            unit="A"
            min={0}
            max={15}
            normalMin={nr.current?.[0] ?? 4.0}
            normalMax={nr.current?.[1] ?? 8.5}
            type="current"
          />
          <TelemetryGauge
            label="Line Pressure"
            value={tel.pressure}
            unit="bar"
            min={0}
            max={12}
            normalMin={nr.pressure?.[0] ?? 4.0}
            normalMax={nr.pressure?.[1] ?? 7.0}
            type="pressure"
          />
          <TelemetryGauge
            label="Shaft Speed"
            value={tel.rpm}
            unit="RPM"
            min={500}
            max={2000}
            normalMin={nr.rpm?.[0] ?? 1400}
            normalMax={nr.rpm?.[1] ?? 1550}
            type="rpm"
          />
        </div>
      </div>

      {/* 4. MULTI-MODAL EVIDENCE TRIO: VISION EVIDENCE, VOICE EVIDENCE, HISTORICAL EVIDENCE */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Multi-Modal Evidence Stream & Human-Machine Fusion</span>
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            Click cards to inspect or override
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* A. Vision Evidence Card */}
          <div 
            onClick={onOpenVisionModal}
            className="bg-slate-900/90 border border-indigo-500/40 hover:border-indigo-400 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-md hover:scale-[1.01] flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-700/60 shadow-inner">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-black text-white block">VISION EVIDENCE</span>
                    <span className="text-[10px] text-indigo-300 font-medium">Camera Frame 4029</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/90 border border-rose-500 text-rose-200 animate-pulse">
                  CRITICAL
                </span>
              </div>

              <div className="bg-slate-950/90 rounded-xl p-2.5 border border-slate-800 mb-2.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Mechanical Seal:</span>
                  <span className="text-rose-400 font-bold font-mono">Fluid Leak Spray</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Shaft Oscillation:</span>
                  <span className="text-amber-300 font-bold font-mono">2.4mm Runout</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Optical Confidence:</span>
                  <span className="text-cyan-300 font-bold font-mono">94% match</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 italic leading-relaxed">
                "{visionEvidence?.headline || 'High-frequency slurry mist spray detected around Drive-End mechanical seal flange.'}"
              </p>
            </div>

            <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-300 font-mono font-bold mt-2">
              <span>Inspect Optical Stream</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* B. Voice Evidence Card */}
          <div 
            onClick={onOpenVoiceModal}
            className="bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-md hover:scale-[1.01] flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-700/60 shadow-inner">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-black text-white block">VOICE EVIDENCE</span>
                    <span className="text-[10px] text-amber-300 font-medium">Floor Tech Transcript</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/90 border border-emerald-500 text-emerald-200">
                  NORMAL (FALSE NEGATIVE)
                </span>
              </div>

              <div className="bg-slate-950/90 rounded-xl p-2.5 border border-slate-800 mb-2.5 space-y-1.5 text-xs">
                <div className="text-slate-200 italic font-semibold">
                  "{voiceEvidence?.sourceData?.transcript || 'The machine sounds fine to me, normal operating hum.'}"
                </div>
                <div className="text-[10px] font-mono text-amber-400/90 pt-1 border-t border-slate-900">
                  Acoustic Range: 20Hz - 15kHz (Blind to 40kHz ultrasound)
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Human technician acoustic perception is physically limited to sonic bandwidth. Contradiction flagged against IoT telemetry.
              </p>
            </div>

            <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-300 font-mono font-bold mt-2">
              <span>Record Voice Correction</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* C. Historical Evidence Card */}
          <div 
            onClick={onOpenDecisionsTab}
            className="bg-slate-900/90 border border-emerald-500/40 hover:border-emerald-400 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-md hover:scale-[1.01] flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-700/60 shadow-inner">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-black text-white block">HISTORICAL PRECURSORS</span>
                    <span className="text-[10px] text-emerald-300 font-medium">ML Incident Database</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/90 border border-emerald-500 text-emerald-200">
                  94.2% MATCH
                </span>
              </div>

              <div className="bg-slate-950/90 rounded-xl p-2.5 border border-slate-800 mb-2.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Signature Match:</span>
                  <span className="text-emerald-300 font-bold font-mono">Aug 2026 Bearing Flake</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Degradation Curve:</span>
                  <span className="text-rose-400 font-bold font-mono">Stage 3 Raceway Wear</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Time-to-Catastrophic:</span>
                  <span className="text-amber-400 font-bold font-mono">4.2 Operating Hours</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 italic leading-relaxed">
                "{historyEvidence?.headline || 'Precursor pattern 94.2% identical to catastrophic impeller bearing seizure on Pump-02.'}"
              </p>
            </div>

            <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-300 font-mono font-bold mt-2">
              <span>View Precursor Model</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. ROOT CAUSE DIAGNOSTICS & AUTONOMOUS ACTIONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7-Cols: Bayesian Root Cause Candidate Ranking */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-mono font-bold uppercase text-slate-200">
                Ranked Root Cause Candidates (Bayesian ML Engine)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              5 Probable Causes
            </span>
          </div>

          <div className="space-y-2.5">
            {(analysis?.rootCauses || [
              { id: 'RC-01', cause: 'Drive-End Bearing Race Degradation & Micro-Spalling', probability: 87, severity: 'CRITICAL', suggestedAction: 'Throttle RPM to 980, inspect grease channel', symptoms: ['18.4 mm/s vibration', '88.4°C temp'] },
              { id: 'RC-02', cause: 'Mechanical Seal Integrity Loss & Fluid Ingress', probability: 78, severity: 'HIGH', suggestedAction: 'Replace primary silicon-carbide seal ring', symptoms: ['Optical spray detection', 'Pressure drop'] },
              { id: 'RC-03', cause: 'Shaft Angular & Parallel Misalignment', probability: 61, severity: 'MEDIUM', suggestedAction: 'Laser alignment calibration during downtime', symptoms: ['2x harmonic vibration peak'] },
              { id: 'RC-04', cause: 'High-Temperature Lubricant Starvation', probability: 43, severity: 'MEDIUM', suggestedAction: 'Autonomous purge cycle & thermal relief valve', symptoms: ['Thermal acceleration >0.8°C/min'] },
              { id: 'RC-05', cause: 'VFD Inverter Harmonic Resonance Fluctuation', probability: 18, severity: 'LOW', suggestedAction: 'Recalibrate VFD switching frequency', symptoms: ['Current ripple 8.9A'] },
            ]).map((rc, idx) => (
              <div
                key={rc.id || idx}
                className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/90 hover:border-indigo-500/50 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      #{idx + 1}
                    </span>
                    <strong className="text-white font-extrabold">{rc.cause}</strong>
                  </div>
                  <span className="font-mono font-black text-cyan-300 text-sm">
                    {rc.probability}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${rc.probability > 75 ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-cyan-500 to-indigo-500'}`}
                    style={{ width: `${rc.probability}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="truncate">🎯 <em>Action: {rc.suggestedAction}</em></span>
                  <span className="font-mono text-[10px] text-slate-500 shrink-0">Severity: {rc.severity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5-Cols: Autonomous Actions & Control Console */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-3.5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-mono font-bold uppercase text-slate-200">
                  Autonomous Actions & Safety Dispatch
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Closed-Loop Active
              </span>
            </div>

            <div className="space-y-2 mt-3">
              {/* Active Action Item 1: Load De-Rating */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-cyan-800/60 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>VFD Load De-Rating (1495 → 980 RPM)</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-700">
                    EXECUTED
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Reduced angular velocity and dynamic mechanical load by 34.5% to prevent thermal runaway.
                </p>
              </div>

              {/* Active Action Item 2: Incident Ticketing */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-800/60 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>P1 Work Order Dispatched</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-700">
                    DISPATCHED
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Assigned to Senior Reliability Specialist (Marcus Vance). Contradiction evidence package attached.
                </p>
              </div>

              {/* Active Action Item 3: 1000ms Real-Time Verification Loop */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-800/60 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-emerald-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Telemetry Stabilization Loop</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700">
                    MONITORING
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Tracking vibration decay (-41.8%) and temperature stabilization over 60-second window.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Manual Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
              Autonomous Override Controls:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onExecuteAction('REDUCE_MACHINE_LOAD', { targetRpm: 980 })}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950/50 transition-all hover:scale-105"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Throttle Load</span>
              </button>

              <button
                onClick={() => onExecuteAction('PURGE_LINE')}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/50 transition-all hover:scale-105"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Purge Line</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. TIME-SERIES CHART & CLOSED-LOOP VERIFICATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7-Cols: Live Interactive Time-Series Telemetry Chart */}
        <div className="lg:col-span-7">
          <TelemetryChart
            history={machine?.telemetryHistory || []}
            normalRanges={nr}
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
