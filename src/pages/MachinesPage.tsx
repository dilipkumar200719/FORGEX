import React, { useState } from 'react';
import { 
  Cpu, 
  Activity, 
  Zap, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Gauge, 
  RotateCw,
  Layers,
  Wrench,
  Radio,
  Sliders,
  Sparkles,
  Download,
  Flame,
  ShieldCheck,
  TrendingDown,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Machine } from '../types';

interface MachinesPageProps {
  machines: Machine[];
  selectedMachineId: string;
  onSelectMachine: (id: string) => void;
  onSimulateFailure: (id: string) => void;
}

export const MachinesPage: React.FC<MachinesPageProps> = ({
  machines,
  selectedMachineId,
  onSelectMachine,
  onSimulateFailure,
}) => {
  const [selectedSubsystem, setSelectedSubsystem] = useState<'bearing' | 'seal' | 'motor' | 'impeller' | 'vfd'>('bearing');
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationDone, setCalibrationDone] = useState(false);

  const selectedMachine = machines.find((m) => m.id === selectedMachineId) || machines[0] || {
    id: 'PUMP-042',
    name: 'Primary Boiler Feed Water Pump',
    type: 'Centrifugal Multi-Stage Pump',
    location: 'Sector 4 - Power & Thermal Utilities',
    status: 'NORMAL',
    healthScore: 96,
    riskScore: 12,
    riskLevel: 'LOW',
    currentTelemetry: {
      timestamp: Date.now(),
      temperature: 64.2,
      vibration: 5.6,
      current: 6.4,
      pressure: 6.1,
      rpm: 1475,
    },
    normalRanges: {
      temperature: [60, 70],
      vibration: [4, 8],
      current: [5, 8],
      pressure: [5, 7],
      rpm: [1400, 1500],
    },
    lastMaintenance: '2026-07-28 (Quarterly Bearing Flush)',
    nextMaintenance: '2026-09-15 (Impeller Laser Alignment)',
    mitigationHistory: [],
  };

  const tel = selectedMachine.currentTelemetry || {
    vibration: 18.4,
    temperature: 88.4,
    current: 8.9,
    pressure: 7.6,
    rpm: 1495,
    timestamp: Date.now(),
  };

  const nr = selectedMachine.normalRanges || {
    vibration: [2.0, 7.5],
    temperature: [45, 75],
    current: [4.0, 8.5],
    pressure: [4.0, 7.0],
    rpm: [1400, 1550],
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-950/90 border-rose-500 text-rose-200 animate-pulse shadow-sm shadow-rose-950';
      case 'HIGH':
        return 'bg-amber-950/90 border-amber-500 text-amber-200 shadow-sm shadow-amber-950';
      case 'MEDIUM':
        return 'bg-yellow-950/90 border-yellow-500 text-yellow-200';
      default:
        return 'bg-emerald-950/90 border-emerald-500 text-emerald-200';
    }
  };

  const handleCalibrateBaseline = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      setCalibrationDone(true);
      setTimeout(() => setCalibrationDone(false), 3000);
    }, 1200);
  };

  // Subsystems definition
  const subsystems = [
    {
      id: 'bearing',
      name: 'Drive-End Bearing Housing (SKF 22318)',
      health: 38,
      status: 'CRITICAL ANOMALY',
      sensor: 'Tri-Axial Piezoelectric Accel + 40kHz Ultrasonic',
      reading: `${tel.vibration.toFixed(1)} mm/s RMS (Limit: ${nr.vibration[1]} mm/s)`,
      details: 'Stage 3 inner-raceway spalling signature with high-frequency harmonic energy peak at 1.8 kHz.',
      severity: 'CRITICAL',
    },
    {
      id: 'seal',
      name: 'Mechanical Cartridge Seal Flange',
      health: 49,
      status: 'FLUID SPRAY DETECTED',
      sensor: 'High-Speed Optical Camera + IR Thermography',
      reading: 'Slurry Mist Spray (94% optical match)',
      details: 'Silicon-carbide primary face deflection causing intermittent slurry vaporization under 7.6 bar pressure.',
      severity: 'HIGH',
    },
    {
      id: 'motor',
      name: 'Stator Motor Windings (120 kW)',
      health: 82,
      status: 'NOMINAL LOAD',
      sensor: 'Hall-Effect Current Transducer (L1-L3)',
      reading: `${tel.current.toFixed(1)} A (Nominal: 4.0 - 8.5 A)`,
      details: 'Current harmonics balanced within IEEE 519 standards; thermal dissipation within Class H insulation limits.',
      severity: 'NORMAL',
    },
    {
      id: 'impeller',
      name: 'Hard-Alloy Impeller & Volute',
      health: 74,
      status: 'MILD CAVITATION',
      sensor: 'Dynamic Hydro-Acoustic Pressure Sensor',
      reading: `${tel.pressure.toFixed(1)} bar head`,
      details: 'Discharge pressure pulsing at 12Hz, consistent with slurry density variations.',
      severity: 'MEDIUM',
    },
    {
      id: 'vfd',
      name: 'Variable Frequency Inverter (VFD)',
      health: 95,
      status: 'READY FOR DISPATCH',
      sensor: 'CANopen PLC Digital Bus',
      reading: `${tel.rpm.toFixed(0)} RPM commanded`,
      details: 'Dynamic torque governor responsive to load de-rating commands down to 600 RPM.',
      severity: 'NORMAL',
    },
  ];

  return (
    <div className="space-y-4 pb-12 font-sans">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <span>Digital Twin Industrial Machine Detail & Subsystem Telemetry</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Component-level physical health decomposition, spectral analysis, and envelope calibration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCalibrateBaseline}
            disabled={isCalibrating}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-inner"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCalibrating ? 'animate-spin' : ''}`} />
            <span>{isCalibrating ? 'Calibrating...' : calibrationDone ? 'Baseline Calibrated! ✓' : 'Calibrate Baseline'}</span>
          </button>

          <button
            onClick={() => onSimulateFailure(selectedMachine.id)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-950/50 transition-all hover:scale-105"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Failure Scenario</span>
          </button>
        </div>
      </div>

      {/* Fleet Asset Quick Switcher Horizontal Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {machines.map((m) => {
          const isSelected = m.id === selectedMachine.id;
          return (
            <div
              key={m.id}
              onClick={() => onSelectMachine(m.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900 border-cyan-400 ring-2 ring-cyan-400/80 shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono font-bold text-cyan-300">{m.id}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${getRiskBadge(m.riskLevel)}`}>
                  {m.riskLevel}
                </span>
              </div>
              <div className="font-bold text-white text-xs truncate">{m.name}</div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>Health: <strong className="text-white">{m.healthScore}%</strong></span>
                <span>Risk: <strong className="text-white">{m.riskScore}/100</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep-Dive Machine Detail Dual-Column Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7-Cols: Subsystems Breakdown & Digital Twin View */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-mono font-bold uppercase text-slate-200">
                Subsystem Component Health & Telemetry Sensors
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Select subsystem to inspect
            </span>
          </div>

          <div className="space-y-2.5">
            {subsystems.map((sub) => {
              const isSelected = selectedSubsystem === sub.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubsystem(sub.id as any)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-950 border-cyan-500 ring-1 ring-cyan-500/50 shadow-md'
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${sub.severity === 'CRITICAL' ? 'bg-rose-500 animate-ping' : sub.severity === 'HIGH' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <strong className="text-white font-extrabold">{sub.name}</strong>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${sub.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-600' : sub.severity === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-600' : 'bg-emerald-950 text-emerald-300 border border-emerald-600'}`}>
                      Health: {sub.health}% ({sub.status})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1.5 text-slate-300">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Sensor Channel:</span>
                      <span className="text-cyan-300 font-mono text-[11px]">{sub.sensor}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Live Reading:</span>
                      <span className="text-white font-mono text-[11px] font-bold">{sub.reading}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800 text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg leading-relaxed animate-in fade-in">
                      <strong className="text-cyan-300 font-mono">Forensic Assessment: </strong>
                      {sub.details}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5-Cols: Machine Operating Envelopes & Threshold Config */}
        <div className="lg:col-span-5 space-y-4">
          {/* Operating Envelopes Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                  <Sliders className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-mono font-bold uppercase text-slate-200">
                  Safe Operating Envelope Limits
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                PLC Bound Rule
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-300 font-medium">Vibration Threshold:</span>
                <span className="font-mono text-cyan-300 font-bold">2.0 - 7.5 mm/s (Alarm: &gt;14 mm/s)</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-300 font-medium">Stator Temperature:</span>
                <span className="font-mono text-cyan-300 font-bold">45.0 - 75.0 °C (Alarm: &gt;85 °C)</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-300 font-medium">Motor Current Draw:</span>
                <span className="font-mono text-cyan-300 font-bold">4.0 - 8.5 A (Trip: &gt;12 A)</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-300 font-medium">Line Discharge Pressure:</span>
                <span className="font-mono text-cyan-300 font-bold">4.0 - 7.0 bar</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-300 font-medium">Shaft Operating RPM:</span>
                <span className="font-mono text-cyan-300 font-bold">1400 - 1550 RPM (De-rate: 980 RPM)</span>
              </div>
            </div>
          </div>

          {/* Maintenance & Precursor History Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Wrench className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-mono font-bold uppercase text-slate-200">
                  Asset Maintenance & Service Log
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Live Twin Sync
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Last Service Date:</span>
                  <span className="text-white font-mono font-bold">{selectedMachine.lastMaintenance}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Next Scheduled Overhaul:</span>
                  <span className="text-amber-300 font-mono font-bold">{selectedMachine.nextMaintenance}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Lubricant Viscosity Index:</span>
                  <span className="text-rose-400 font-mono font-bold">ISO VG 220 (Degraded -22%)</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400">
                🛡️ <em>Digital Twin Asset Signature: SHA256-4b9e28f1 (Synced across edge nodes)</em>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
