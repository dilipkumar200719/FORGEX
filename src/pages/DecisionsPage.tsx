import React, { useState } from 'react';
import { 
  Sparkles, 
  Brain, 
  AlertOctagon, 
  CheckCircle2, 
  ShieldAlert, 
  Cpu, 
  ArrowRight, 
  BookOpen, 
  ShieldCheck,
  Clock,
  Activity,
  Layers,
  Zap,
  Filter,
  Eye,
  Mic,
  History,
  Target,
  RotateCw
} from 'lucide-react';
import { Machine, CrossSenseAnalysis, TimelineEvent } from '../types';
import { ExplainableCard } from '../components/ExplainableCard';

interface DecisionsPageProps {
  machine: Machine;
  analysis?: CrossSenseAnalysis;
  timeline?: TimelineEvent[];
  onExecuteAction: (type: any) => void;
}

export const DecisionsPage: React.FC<DecisionsPageProps> = ({
  machine,
  analysis,
  timeline = [],
  onExecuteAction,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const defaultTimeline: TimelineEvent[] = [
    {
      id: 'EVT-1',
      timestamp: Date.now() - 120000,
      machineId: machine?.id || 'PUMP-042',
      type: 'SENSOR_ANOMALY',
      title: 'Vibration Exceeds Class III Upper Envelope (>18.4 mm/s)',
      description: 'Piezoelectric sensor channel A1 detected 3.2x baseline RMS increase with 1.8kHz harmonic resonance peak.',
      badgeType: 'danger',
    },
    {
      id: 'EVT-2',
      timestamp: Date.now() - 95000,
      machineId: machine?.id || 'PUMP-042',
      type: 'VOICE_OBSERVATION',
      title: 'Technician Acoustic Report: "Machine sounds fine to me"',
      description: 'Floor inspection audio transcribed via Whisper-v3. Ingested as human acoustic modality.',
      badgeType: 'warning',
    },
    {
      id: 'EVT-3',
      timestamp: Date.now() - 80000,
      machineId: machine?.id || 'PUMP-042',
      type: 'VISION_ANALYZED',
      title: 'Optical Frame 4029: Fluid Seal Mist Spray Detected (94% confidence)',
      description: 'High-speed camera analyzed pixel flow around silicon-carbide mechanical seal cartridge.',
      badgeType: 'ai',
    },
    {
      id: 'EVT-4',
      timestamp: Date.now() - 65000,
      machineId: machine?.id || 'PUMP-042',
      type: 'CONTRADICTION_DETECTED',
      title: 'Cross-Sense Engine Flagged Human Auditory Blindspot Contradiction',
      description: 'Detected severe conflict between human voice ("NORMAL") and physical telemetry ("CRITICAL"). Auto-downgraded voice weight to 10%.',
      badgeType: 'danger',
    },
    {
      id: 'EVT-5',
      timestamp: Date.now() - 50000,
      machineId: machine?.id || 'PUMP-042',
      type: 'ROOT_CAUSE_IDENTIFIED',
      title: 'Bayesian Root Cause: Drive-End Bearing Flake & Seal Degradation (87%)',
      description: 'Multi-modal covariance match with August 2026 seizure precursor data curve.',
      badgeType: 'ai',
    },
    {
      id: 'EVT-6',
      timestamp: Date.now() - 35000,
      machineId: machine?.id || 'PUMP-042',
      type: 'ACTION_EXECUTED',
      title: 'Autonomous Closed-Loop Dispatch: VFD De-Rating to 980 RPM',
      description: 'Issued CANopen speed governor command to arrest thermal acceleration. Dispatched P1 Work Order to Marcus Vance.',
      badgeType: 'info',
    },
    {
      id: 'EVT-7',
      timestamp: Date.now() - 10000,
      machineId: machine?.id || 'PUMP-042',
      type: 'MITIGATION_VERIFIED',
      title: 'Closed-Loop Verification Confirmed: Vibration -41.8%, Temp Stabilized',
      description: '1000ms real-time verification loop confirmed operating envelope recovery. Incident closed safely.',
      badgeType: 'success',
    },
  ];

  const displayTimeline = timeline && timeline.length > 0 ? timeline : defaultTimeline;

  const filteredTimeline = displayTimeline.filter((evt) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'ANOMALIES') return evt.type === 'SENSOR_ANOMALY' || evt.type === 'VISION_ANALYZED';
    if (filterType === 'CONTRADICTIONS') return evt.type === 'CONTRADICTION_DETECTED';
    if (filterType === 'ACTIONS') return evt.type === 'ACTION_EXECUTED' || evt.type === 'INCIDENT_CREATED';
    if (filterType === 'VERIFICATIONS') return evt.type === 'MITIGATION_VERIFIED' || evt.type === 'VERIFICATION_STARTED';
    return true;
  });

  const getBadgeStyle = (badgeType: string) => {
    switch (badgeType) {
      case 'danger':
        return 'bg-rose-950/90 text-rose-300 border-rose-500';
      case 'warning':
        return 'bg-amber-950/90 text-amber-300 border-amber-500';
      case 'ai':
        return 'bg-indigo-950/90 text-indigo-300 border-indigo-500';
      case 'info':
        return 'bg-cyan-950/90 text-cyan-300 border-cyan-500';
      case 'success':
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-500';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-4 pb-12 font-sans">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            <span>AI Decision Timeline, Explainability & Transparent Auditing</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Deterministic inference traceability from raw multimodal telemetry to autonomous speed governor dispatch
          </p>
        </div>

        {/* Latency / Execution SLA Badge */}
        <div className="flex items-center gap-2 bg-slate-950/90 p-2 rounded-xl border border-slate-800 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Total Latency:</span>
          <span className="text-cyan-300 font-bold">142ms</span>
          <span className="text-[10px] text-slate-500">(Zero Cloud Reliance)</span>
        </div>
      </div>

      {/* Main Explainable AI Reasoning Artifact Card */}
      {analysis && (
        <ExplainableCard
          analysis={analysis}
          onExecuteMitigation={() => onExecuteAction('REDUCE_MACHINE_LOAD')}
        />
      )}

      {/* Decision Timeline Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold uppercase text-slate-200">
                Autonomous Chronological Decision Audit Stream
              </h3>
              <p className="text-[11px] text-slate-400">
                Live chronological sequence of events, sensor detections, and autonomous interventions
              </p>
            </div>
          </div>

          {/* Timeline Event Type Filter */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-slate-400 font-mono text-[11px] mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-cyan-400" /> Filter:
            </span>
            {['ALL', 'ANOMALIES', 'CONTRADICTIONS', 'ACTIONS', 'VERIFICATIONS'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2 py-0.5 rounded-lg font-mono text-[11px] font-bold transition-all ${
                  filterType === t
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Events Vertical Stepper */}
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-indigo-500 before:to-emerald-500">
          {filteredTimeline.map((evt, idx) => (
            <div key={evt.id || idx} className="relative group">
              {/* Timeline Marker Dot */}
              <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-cyan-400 shadow-md group-hover:scale-125 transition-transform" />

              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/90 group-hover:border-cyan-500/50 transition-colors space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getBadgeStyle(evt.badgeType)}`}>
                      {evt.type}
                    </span>
                    <strong className="text-white font-bold">{evt.title}</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-1">
                  {evt.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deep-Dive Contradiction & Human Bias Resolution Architecture */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-md">
        <h3 className="text-xs font-mono font-bold uppercase text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2.5">
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          <span>Why Cross-Sense Multi-Sensing Beats Single Human or Single Sensor Observation</span>
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
