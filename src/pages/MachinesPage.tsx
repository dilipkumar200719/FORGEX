import React from 'react';
import { Cpu, Activity, Zap, Thermometer, AlertTriangle, CheckCircle2, ArrowRight, Gauge, RotateCw } from 'lucide-react';
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

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <span>Digital Twin Industrial Fleet Management</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            4 Real-time monitored rotating & hydraulic assets with continuous cross-sense telemetry
          </p>
        </div>
        <div className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-3.5 py-1.5 rounded-xl shadow-inner">
          Active Fleet Twins: {machines.length}
        </div>
      </div>

      {/* 4 Machine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {machines.map((m) => {
          const isSelected = m.id === selectedMachineId;
          const tel = m.currentTelemetry;

          return (
            <div
              key={m.id}
              onClick={() => onSelectMachine(m.id)}
              className={`bg-slate-900/90 border rounded-2xl p-4.5 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-md hover:scale-[1.01] ${
                isSelected
                  ? 'border-cyan-400 shadow-xl shadow-cyan-950/50 ring-2 ring-cyan-400/80 bg-gradient-to-b from-cyan-950/20 to-slate-900'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {m.id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black border ${getRiskBadge(m.riskLevel)}`}>
                        {m.riskLevel} RISK ({m.riskScore}/100)
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-white mt-1">{m.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">📍 {m.location}</p>
                  </div>

                  <div className="text-right bg-slate-950 p-2.5 rounded-xl border border-slate-800 shadow-inner">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Health Score</span>
                    <span className={`text-xl font-mono font-black ${m.healthScore < 50 ? 'text-rose-400' : m.healthScore < 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {m.healthScore}%
                    </span>
                  </div>
                </div>

                {/* Live Telemetry Quad Box with rich colors */}
                <div className="grid grid-cols-4 gap-2 bg-slate-950/90 p-3 rounded-xl border border-slate-800 mb-3 text-center shadow-inner">
                  <div className="p-1 rounded bg-slate-900/60 border border-sky-800/40">
                    <span className="text-[10px] font-mono text-sky-400 uppercase block font-bold">Vibration</span>
                    <span className={`text-xs font-mono font-black ${tel.vibration > m.normalRanges.vibration[1] ? 'text-rose-400' : 'text-white'}`}>
                      {tel.vibration.toFixed(1)} <span className="text-[9px] font-normal text-slate-400">mm/s</span>
                    </span>
                  </div>
                  <div className="p-1 rounded bg-slate-900/60 border border-rose-800/40">
                    <span className="text-[10px] font-mono text-rose-400 uppercase block font-bold">Temp</span>
                    <span className={`text-xs font-mono font-black ${tel.temperature > m.normalRanges.temperature[1] ? 'text-rose-400' : 'text-white'}`}>
                      {tel.temperature.toFixed(1)} <span className="text-[9px] font-normal text-slate-400">°C</span>
                    </span>
                  </div>
                  <div className="p-1 rounded bg-slate-900/60 border border-amber-800/40">
                    <span className="text-[10px] font-mono text-amber-400 uppercase block font-bold">Current</span>
                    <span className="text-xs font-mono font-black text-white">
                      {tel.current.toFixed(1)} <span className="text-[9px] font-normal text-slate-400">A</span>
                    </span>
                  </div>
                  <div className="p-1 rounded bg-slate-900/60 border border-emerald-800/40">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase block font-bold">Speed</span>
                    <span className="text-xs font-mono font-black text-white">
                      {tel.rpm.toFixed(0)} <span className="text-[9px] font-normal text-slate-400">RPM</span>
                    </span>
                  </div>
                </div>

                {/* Historical Maintenance & Sensor Info */}
                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Maintenance:</span>
                    <span className="text-white font-medium">{m.maintenanceHistory[0]?.type || 'Scheduled Inspection'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recorded Failure Precursors:</span>
                    <span className="text-cyan-300 font-bold font-mono">{m.historicalIncidents.length} incidents logged</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between mt-3">
                <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                  <span>Open Machine HUD</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSimulateFailure(m.id);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900 text-amber-300 text-xs font-bold border border-amber-600/70 transition-colors shadow-sm"
                >
                  ⚡ Simulate Anomaly
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
