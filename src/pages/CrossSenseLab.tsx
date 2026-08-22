import React, { useState } from 'react';
import { 
  Layers, 
  Sliders, 
  Sparkles, 
  RefreshCw, 
  Eye, 
  Mic, 
  Activity, 
  History, 
  Wrench, 
  AlertOctagon, 
  CheckCircle2, 
  Zap, 
  RotateCcw,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import { Machine, SystemWeights, CrossSenseAnalysis } from '../types';
import { runCrossSenseAnalysis, updateWeights } from '../services/api';
import { EvidenceMatrix } from '../components/EvidenceMatrix';
import { ContradictionBanner } from '../components/ContradictionBanner';

interface CrossSenseLabProps {
  machine: Machine;
  systemWeights: SystemWeights;
  analysis?: CrossSenseAnalysis;
  onAnalysisUpdated?: (analysis: CrossSenseAnalysis) => void;
}

export const CrossSenseLab: React.FC<CrossSenseLabProps> = ({
  machine,
  systemWeights,
  analysis,
  onAnalysisUpdated,
}) => {
  const [weights, setWeights] = useState<SystemWeights>(systemWeights);
  const [voiceOverride, setVoiceOverride] = useState<string>('The machine sounds normal.');
  const [visionAnomaly, setVisionAnomaly] = useState<boolean>(true);
  const [sensorAnomaly, setSensorAnomaly] = useState<boolean>(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [liveAnalysis, setLiveAnalysis] = useState<CrossSenseAnalysis | undefined>(analysis);

  const handleSliderChange = (key: keyof SystemWeights, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyPreset = (preset: 'default' | 'technicianBias' | 'cameraFirst' | 'sensorHeavy') => {
    if (preset === 'default') {
      setWeights({
        sensorWeight: 0.30,
        visionWeight: 0.25,
        voiceWeight: 0.10,
        historyWeight: 0.20,
        maintenanceWeight: 0.15,
      });
      setVoiceOverride('The machine sounds normal.');
      setVisionAnomaly(true);
      setSensorAnomaly(true);
    } else if (preset === 'technicianBias') {
      setWeights({
        sensorWeight: 0.35,
        visionWeight: 0.25,
        voiceWeight: 0.10,
        historyWeight: 0.20,
        maintenanceWeight: 0.10,
      });
      setVoiceOverride('Sounds completely silent and healthy to me.');
      setVisionAnomaly(true);
      setSensorAnomaly(true);
    } else if (preset === 'cameraFirst') {
      setWeights({
        sensorWeight: 0.20,
        visionWeight: 0.40,
        voiceWeight: 0.10,
        historyWeight: 0.15,
        maintenanceWeight: 0.15,
      });
      setVoiceOverride('Running nominal.');
      setVisionAnomaly(true);
      setSensorAnomaly(false);
    } else if (preset === 'sensorHeavy') {
      setWeights({
        sensorWeight: 0.50,
        visionWeight: 0.15,
        voiceWeight: 0.05,
        historyWeight: 0.20,
        maintenanceWeight: 0.10,
      });
      setVoiceOverride('Normal.');
      setVisionAnomaly(false);
      setSensorAnomaly(true);
    }
  };

  const handleRecompute = async () => {
    setIsCalculating(true);
    try {
      await updateWeights(weights);
      const res = await runCrossSenseAnalysis(machine.id, {
        voiceTranscript: voiceOverride,
        visionAnomaly,
        sensorAnomaly,
      }, weights);

      if (res.success && res.analysis) {
        setLiveAnalysis(res.analysis);
        onAnalysisUpdated?.(res.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCalculating(false);
    }
  };

  const currentAnalysis = liveAnalysis || analysis;

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-fuchsia-400" />
            <span>Cross-Sense Multimodal Fusion Lab & Testbench</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Interactively simulate sensory weightings, human auditory bias, and multimodal contradiction resolution
          </p>
        </div>

        <button
          onClick={handleRecompute}
          disabled={isCalculating}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/50 disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
          <span>Recompute Fusion Matrix</span>
        </button>
      </div>

      {/* Preset Buttons Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-bold">
          <Bookmark className="w-4 h-4 text-cyan-400" />
          <span>Quick Test Presets:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => applyPreset('default')}
            className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 font-medium transition-colors"
          >
            Balanced Baseline
          </button>
          <button
            onClick={() => applyPreset('technicianBias')}
            className="px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-700/60 font-bold transition-colors"
          >
            ⚠️ Human Bias Conflict (Technician "Normal")
          </button>
          <button
            onClick={() => applyPreset('cameraFirst')}
            className="px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 font-bold transition-colors"
          >
            👁️ Vision Heavy (Optical Leak Catch)
          </button>
          <button
            onClick={() => applyPreset('sensorHeavy')}
            className="px-3 py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-700/60 font-bold transition-colors"
          >
            📡 High-Frequency IoT Piezo Sensor
          </button>
        </div>
      </div>

      {/* 2-Column Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 5-cols: Modality Sliders & Scenario Injection */}
        <div className="lg:col-span-5 space-y-4">
          {/* Modality Weights Tuning */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold uppercase text-slate-200 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <span>Sensory Weight Calibration</span>
              </span>
              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                Sum: {(weights.sensorWeight + weights.visionWeight + weights.voiceWeight + weights.historyWeight + weights.maintenanceWeight).toFixed(2)}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* IoT Sensor Weight */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-sky-700/40">
                <div className="flex justify-between mb-1">
                  <span className="text-sky-300 font-bold flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-sky-400" />
                    IoT Telemetry Sensors
                  </span>
                  <span className="font-mono text-sky-300 font-black">{(weights.sensorWeight * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.6}
                  step={0.05}
                  value={weights.sensorWeight}
                  onChange={(e) => handleSliderChange('sensorWeight', parseFloat(e.target.value))}
                  className="w-full accent-sky-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Vision Weight */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-indigo-700/40">
                <div className="flex justify-between mb-1">
                  <span className="text-indigo-300 font-bold flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    Optical / Thermal Vision
                  </span>
                  <span className="font-mono text-indigo-300 font-black">{(weights.visionWeight * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.6}
                  step={0.05}
                  value={weights.visionWeight}
                  onChange={(e) => handleSliderChange('visionWeight', parseFloat(e.target.value))}
                  className="w-full accent-indigo-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Voice Weight */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-700/40">
                <div className="flex justify-between mb-1">
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5 text-amber-400" />
                    Human Voice Reports
                  </span>
                  <span className="font-mono text-amber-300 font-black">{(weights.voiceWeight * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.4}
                  step={0.05}
                  value={weights.voiceWeight}
                  onChange={(e) => handleSliderChange('voiceWeight', parseFloat(e.target.value))}
                  className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* History Weight */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-700/40">
                <div className="flex justify-between mb-1">
                  <span className="text-emerald-300 font-bold flex items-center gap-1">
                    <History className="w-3.5 h-3.5 text-emerald-400" />
                    ML Precursor History
                  </span>
                  <span className="font-mono text-emerald-300 font-black">{(weights.historyWeight * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.4}
                  step={0.05}
                  value={weights.historyWeight}
                  onChange={(e) => handleSliderChange('historyWeight', parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Maintenance Weight */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-700/40">
                <div className="flex justify-between mb-1">
                  <span className="text-rose-300 font-bold flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-rose-400" />
                    Maintenance Life Cycle Logs
                  </span>
                  <span className="font-mono text-rose-300 font-black">{(weights.maintenanceWeight * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.4}
                  step={0.05}
                  value={weights.maintenanceWeight}
                  onChange={(e) => handleSliderChange('maintenanceWeight', parseFloat(e.target.value))}
                  className="w-full accent-rose-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Test Signal Injection Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-md">
            <span className="text-xs font-mono font-bold uppercase text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Simulated Input Injections</span>
            </span>

            <div className="space-y-2 text-xs">
              <label className="block text-slate-300 font-bold">Technician Voice Observation Transcript:</label>
              <textarea
                value={voiceOverride}
                onChange={(e) => setVoiceOverride(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={visionAnomaly}
                  onChange={(e) => setVisionAnomaly(e.target.checked)}
                  className="accent-indigo-500 h-4 w-4 rounded"
                />
                <span>Camera Optical Leak Anomaly</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={sensorAnomaly}
                  onChange={(e) => setSensorAnomaly(e.target.checked)}
                  className="accent-sky-500 h-4 w-4 rounded"
                />
                <span>Piezo Vibration Anomaly</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right 7-cols: Real-time Live Fusion Matrix Results */}
        <div className="lg:col-span-7 space-y-4">
          {currentAnalysis && (
            <>
              <ContradictionBanner
                contradiction={currentAnalysis.contradiction}
                analysis={currentAnalysis}
              />

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-mono font-bold text-white uppercase">
                    Computed Multimodal Evidence Matrix
                  </h3>
                  <span className="text-xs font-mono text-cyan-300 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    Confidence: {currentAnalysis.crossSenseConfidence}%
                  </span>
                </div>
                <EvidenceMatrix evidences={currentAnalysis.evidences} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
