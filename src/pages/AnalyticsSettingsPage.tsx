import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Save, 
  RefreshCw, 
  Activity, 
  Eye, 
  Mic, 
  History, 
  Wrench, 
  ShieldCheck, 
  Database, 
  Check, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Zap
} from 'lucide-react';
import { SystemWeights } from '../types';
import { updateWeights } from '../services/api';

const defaultSystemWeights: SystemWeights = {
  sensorWeight: 0.30,
  visionWeight: 0.25,
  voiceWeight: 0.10,
  historyWeight: 0.20,
  maintenanceWeight: 0.15,
};

interface AnalyticsSettingsPageProps {
  systemWeights?: SystemWeights;
  onUpdateWeights: (weights: SystemWeights) => void;
}

export const AnalyticsSettingsPage: React.FC<AnalyticsSettingsPageProps> = ({
  systemWeights = defaultSystemWeights,
  onUpdateWeights,
}) => {
  const [weights, setWeights] = useState<SystemWeights>(() => ({
    ...defaultSystemWeights,
    ...(systemWeights || {}),
  }));
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (systemWeights) {
      setWeights((prev) => ({
        ...defaultSystemWeights,
        ...(prev || {}),
        ...systemWeights,
      }));
    }
  }, [systemWeights]);

  const handleChange = (key: keyof SystemWeights, val: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: val,
    }));
    setIsSaved(false);
  };

  const handleSave = async () => {
    await updateWeights(weights);
    onUpdateWeights(weights);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const sum = (
    (weights?.sensorWeight ?? 0.30) +
    (weights?.visionWeight ?? 0.25) +
    (weights?.voiceWeight ?? 0.10) +
    (weights?.historyWeight ?? 0.20) +
    (weights?.maintenanceWeight ?? 0.15)
  ).toFixed(2);

  return (
    <div className="space-y-4 pb-12 font-sans">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-400" />
            <span>Enterprise Reliability Analytics & Cross-Sense Platform Tuning</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Calibrate multimodal sensory weights, PLC safety thresholds, and monitor fleet-wide contradiction resolution metrics
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-teal-950/50 transition-all"
        >
          {isSaved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Settings Saved!' : 'Save System Configuration'}</span>
        </button>
      </div>

      {/* Enterprise Fleet Analytics Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Catastrophic Outages Averted</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-300">14 Assets</div>
          <div className="text-[11px] text-emerald-400/80 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +100% vs manual inspections
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Human Auditory Blindspots Caught</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-300">38 Events</div>
          <div className="text-[11px] text-amber-400/80 font-medium flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Overcame "Sounds fine" false negatives
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Mean Time To Mitigation (MTTM)</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-300">3.2 Seconds</div>
          <div className="text-[11px] text-cyan-400/80 font-medium">
            Autonomous VFD load de-rating
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Cross-Sense Fusion Accuracy</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black font-mono text-indigo-300">99.4%</div>
          <div className="text-[11px] text-indigo-400/80 font-medium">
            Multi-modal verification match
          </div>
        </div>
      </div>

      {/* 2-Column Grid for Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Modality Weights */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-200">
              Sensory Modality Confidence Weights
            </h3>
            <span className="text-xs font-mono font-bold text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
              Total Weight: {sum}
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Sensor */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-sky-800/40">
              <div className="flex justify-between mb-1">
                <span className="font-bold text-sky-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  IoT Vibration / Temp Sensor Weight
                </span>
                <span className="font-mono text-sky-300 font-black">{((weights?.sensorWeight ?? 0.30) * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={0.6}
                step={0.05}
                value={weights?.sensorWeight ?? 0.30}
                onChange={(e) => handleChange('sensorWeight', parseFloat(e.target.value))}
                className="w-full accent-sky-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Vision */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-indigo-800/40">
              <div className="flex justify-between mb-1">
                <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  Optical Camera & Fluid Seal Weight
                </span>
                <span className="font-mono text-indigo-300 font-black">{((weights?.visionWeight ?? 0.25) * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={0.6}
                step={0.05}
                value={weights?.visionWeight ?? 0.25}
                onChange={(e) => handleChange('visionWeight', parseFloat(e.target.value))}
                className="w-full accent-indigo-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Voice */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-800/40">
              <div className="flex justify-between mb-1">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-amber-400" />
                  Human Technician Voice Weight
                </span>
                <span className="font-mono text-amber-300 font-black">{((weights?.voiceWeight ?? 0.10) * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.4}
                step={0.05}
                value={weights?.voiceWeight ?? 0.10}
                onChange={(e) => handleChange('voiceWeight', parseFloat(e.target.value))}
                className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* History */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-800/40">
              <div className="flex justify-between mb-1">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-emerald-400" />
                  Historical Precursor ML Weight
                </span>
                <span className="font-mono text-emerald-300 font-black">{((weights?.historyWeight ?? 0.20) * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.4}
                step={0.05}
                value={weights?.historyWeight ?? 0.20}
                onChange={(e) => handleChange('historyWeight', parseFloat(e.target.value))}
                className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Maintenance */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-800/40">
              <div className="flex justify-between mb-1">
                <span className="font-bold text-rose-300 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-rose-400" />
                  Maintenance Cycle & Wear Logs Weight
                </span>
                <span className="font-mono text-rose-300 font-black">{((weights?.maintenanceWeight ?? 0.15) * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.4}
                step={0.05}
                value={weights?.maintenanceWeight ?? 0.15}
                onChange={(e) => handleChange('maintenanceWeight', parseFloat(e.target.value))}
                className="w-full accent-rose-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Autonomous Safety Thresholds */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-200 border-b border-slate-800 pb-2.5">
            Autonomous Safety Interlock Thresholds
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-slate-300 font-bold block mb-1">Vibration Immediate De-Rate Trigger:</span>
              <span className="text-sky-300 font-mono font-black text-sm">14.0 mm/s (Auto throttle to 980 RPM)</span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-slate-300 font-bold block mb-1">Bearing Thermal Runaway Cutoff:</span>
              <span className="text-rose-400 font-mono font-black text-sm">95.0 °C (Immediate E-Stop trip)</span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-slate-300 font-bold block mb-1">Contradiction Confidence Threshold:</span>
              <span className="text-amber-400 font-mono font-black text-sm">85.0% (Overrides human voice false negative)</span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-slate-300 font-bold block mb-1">Sliding Window Verification Duration:</span>
              <span className="text-emerald-400 font-mono font-black text-sm">15 Seconds (Requires ≥ 30% reduction)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
