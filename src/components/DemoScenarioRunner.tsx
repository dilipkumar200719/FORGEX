import React from 'react';
import { 
  Activity, 
  Eye, 
  Mic, 
  AlertOctagon, 
  Cpu, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react';

interface DemoScenarioRunnerProps {
  isRunning: boolean;
  currentStepIndex: number;
  onStopDemo: () => void;
  onRestartDemo: () => void;
}

export const DemoScenarioRunner: React.FC<DemoScenarioRunnerProps> = ({
  isRunning,
  currentStepIndex,
  onStopDemo,
  onRestartDemo,
}) => {
  const steps = [
    {
      title: '1. Baseline Perception',
      subtitle: 'Nominal 60°C, 5.6 mm/s',
      icon: Activity,
      color: 'text-sky-400',
      activeBorder: 'border-sky-400 bg-sky-950/80 shadow-sky-950',
      desc: 'Sensors stream healthy telemetry on PUMP-042.',
    },
    {
      title: '2. Telemetry Anomaly',
      subtitle: 'Vibration drifts to 18.4 mm/s',
      icon: Zap,
      color: 'text-amber-400',
      activeBorder: 'border-amber-400 bg-amber-950/80 shadow-amber-950',
      desc: 'Bearing friction induces high vibration.',
    },
    {
      title: '3. Vision Inspection',
      subtitle: 'Camera spots seal spray',
      icon: Eye,
      color: 'text-indigo-400',
      activeBorder: 'border-indigo-400 bg-indigo-950/80 shadow-indigo-950',
      desc: 'Optical camera detects fluid seal spray & wobble.',
    },
    {
      title: '4. Voice Observation',
      subtitle: 'Technician: "Sounds normal"',
      icon: Mic,
      color: 'text-orange-400',
      activeBorder: 'border-orange-400 bg-orange-950/80 shadow-orange-950',
      desc: 'Technician voice claims machine is nominal.',
    },
    {
      title: '5. Contradiction Detected',
      subtitle: 'Confidence: 94.2%',
      icon: AlertOctagon,
      color: 'text-rose-400',
      activeBorder: 'border-rose-400 bg-rose-950/80 shadow-rose-950',
      desc: 'Voice (NORMAL) vs Sensors+Vision+ML (CRITICAL).',
    },
    {
      title: '6. Autonomous Mitigation',
      subtitle: 'Throttled to 980 RPM',
      icon: Cpu,
      color: 'text-cyan-400',
      activeBorder: 'border-cyan-400 bg-cyan-950/80 shadow-cyan-950',
      desc: 'Incident created, technician dispatched, speed throttled.',
    },
    {
      title: '7. Verification Loop',
      subtitle: 'Sliding window buffer',
      icon: Clock,
      color: 'text-purple-400',
      activeBorder: 'border-purple-400 bg-purple-950/80 shadow-purple-950',
      desc: 'Sliding window delta verifies vibration reduction.',
    },
    {
      title: '8. Mitigation Verified',
      subtitle: '18.4 → 10.7 mm/s (-42%)',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      activeBorder: 'border-emerald-400 bg-emerald-950/80 shadow-emerald-950',
      desc: 'Risk drops 94 → 39. Incident marked VERIFIED.',
    },
  ];

  if (!isRunning && currentStepIndex === 0) {
    return null;
  }

  const currentStep = steps[currentStepIndex] || steps[steps.length - 1];

  return (
    <div id="demo-scenario-tracker" className="bg-slate-900/95 border-b border-cyan-500/30 p-3 text-slate-100 shadow-2xl backdrop-blur">
      <div className="max-w-7xl mx-auto">
        {/* Header summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-mono font-black tracking-wider text-cyan-300 uppercase">
              {isRunning ? '60s Failure Scenario in Progress' : 'Scenario Completed'}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-xs text-white font-bold">
              Step {currentStepIndex + 1} of {steps.length}: <span className="text-cyan-300 font-extrabold">{currentStep.title}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-300 font-medium hidden sm:inline">
              {currentStep.desc}
            </span>
            <button
              onClick={onRestartDemo}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
            >
              Restart
            </button>
            <button
              onClick={onStopDemo}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-rose-950 text-rose-300 border border-slate-700 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* 8-Step Timeline Horizontal Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            let cardBg = 'bg-slate-950/80 border-slate-800 text-slate-400';
            if (isCurrent) {
              cardBg = `${step.activeBorder} text-white shadow-lg animate-pulse ring-2 ring-cyan-400`;
            } else if (isCompleted) {
              cardBg = 'bg-slate-900/90 border-emerald-500/50 text-emerald-200';
            }

            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${cardBg}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-4 h-4 ${isCurrent ? step.color : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="text-[10px] font-mono font-bold">#{idx + 1}</span>
                  </div>
                  {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                  {isCurrent && <span className="text-[9px] px-1.5 py-0.2 bg-cyan-500/30 text-cyan-200 rounded font-mono font-bold">ACTIVE</span>}
                </div>
                <div className="text-[11px] font-extrabold leading-tight truncate text-white">{step.title}</div>
                <div className="text-[10px] text-slate-300 truncate mt-0.5">{step.subtitle}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
