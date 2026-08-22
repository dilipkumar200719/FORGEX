import React, { useState } from 'react';
import { Eye, Upload, X, Sparkles, CheckCircle2, AlertTriangle, Image as ImageIcon, Camera } from 'lucide-react';
import { analyzeVision } from '../services/api';

interface VisionInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineId: string;
  onVisionSubmitted?: (result: any) => void;
}

export const VisionInspectionModal: React.FC<VisionInspectionModalProps> = ({
  isOpen,
  onClose,
  machineId,
  onVisionSubmitted,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('leak');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Preset mock snapshots (encoded SVG visuals for ultra-crisp demo rendering)
  const presets = [
    {
      id: 'leak',
      name: 'Bearing Housing Fluid Leak & Runout',
      desc: 'Visible oil mist and high-amplitude mechanical oscillation',
      badge: 'ABNORMAL',
      svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250" fill="%230f172a"><rect width="400" height="250" fill="%23090d16"/><circle cx="200" cy="125" r="70" fill="%231e293b" stroke="%23f43f5e" stroke-width="4" stroke-dasharray="8 4"/><circle cx="200" cy="125" r="35" fill="%23334155" stroke="%2306b6d4" stroke-width="3"/><path d="M 200 125 L 260 170" stroke="%23f43f5e" stroke-width="3"/><circle cx="260" cy="170" r="14" fill="%23e11d48" opacity="0.6"/><text x="14" y="30" fill="%23f43f5e" font-family="monospace" font-weight="bold" font-size="14">CAM-04 FLANGE SECTOR: FLUID SEEPAGE DETECTED</text><text x="14" y="230" fill="%2306b6d4" font-family="monospace" font-size="12">VIB-HARMONIC AMPLITUDE: 18.4 mm/s</text></svg>`,
    },
    {
      id: 'misalign',
      name: 'Coupling Hub Angular Misalignment',
      desc: 'Radial gap delta and optical motion blur at coupling sleeve',
      badge: 'HIGH STRESS',
      svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250" fill="%230f172a"><rect width="400" height="250" fill="%23090d16"/><rect x="100" y="80" width="80" height="90" fill="%231e293b" stroke="%23eab308" stroke-width="3"/><rect x="220" y="85" width="80" height="90" fill="%231e293b" stroke="%23eab308" stroke-width="3"/><line x1="180" y1="125" x2="220" y2="130" stroke="%23ef4444" stroke-width="4"/><text x="14" y="30" fill="%23eab308" font-family="monospace" font-weight="bold" font-size="14">OPTICAL RUNOUT: SHAFT ANGULAR OFFSET 1.8°</text><text x="14" y="230" fill="%2364748b" font-family="monospace" font-size="12">LASER ALIGNMENT DRIFT DETECTED</text></svg>`,
    },
    {
      id: 'nominal',
      name: 'Nominal Clean Bearing Assembly',
      desc: 'Surface intact, zero thermal discoloration or seal leakage',
      badge: 'NORMAL',
      svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250" fill="%230f172a"><rect width="400" height="250" fill="%23090d16"/><circle cx="200" cy="125" r="70" fill="%231e293b" stroke="%2310b981" stroke-width="3"/><circle cx="200" cy="125" r="30" fill="%23334155" stroke="%2310b981" stroke-width="2"/><text x="14" y="30" fill="%2310b981" font-family="monospace" font-weight="bold" font-size="14">CAM-04 OPTICAL STATUS: CLEAN / DRY / STABLE</text><text x="14" y="230" fill="%2310b981" font-family="monospace" font-size="12">ZERO RUNOUT TOLERANCE COMPLIANT</text></svg>`,
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomImage(reader.result as string);
        setSelectedPreset('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const activeImage =
    selectedPreset === 'custom' && customImage
      ? customImage
      : presets.find((p) => p.id === selectedPreset)?.svg || presets[0].svg;

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      // Send base64 payload
      const base64Data = activeImage.split(',')[1] || activeImage;
      const res = await analyzeVision(base64Data, machineId, 'image/jpeg');
      if (res.success) {
        setAnalysisResult(res.result);
        onVisionSubmitted?.(res.result);
      }
    } catch (err) {
      console.error('Vision analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-5 text-slate-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Multimodal AI Vision Inspector</h3>
              <p className="text-xs text-slate-400">
                Inspect physical casing, leakages, and optical vibration on {machineId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector */}
        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1.5">
            Select Industrial Camera Feed / Preset:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedPreset(preset.id);
                  setCustomImage(null);
                }}
                className={`text-left p-2.5 rounded-lg border text-xs transition-all flex flex-col justify-between ${
                  selectedPreset === preset.id
                    ? 'bg-indigo-950/70 border-indigo-500 text-indigo-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[11px] text-white">{preset.name}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded font-mono bg-slate-900 border border-slate-700">
                    {preset.badge}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">{preset.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Upload Affordance */}
        <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800 text-xs">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            Or upload inspection photograph:
          </span>
          <label className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold cursor-pointer border border-slate-700">
            Choose File
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Image Preview Canvas */}
        <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black flex items-center justify-center min-h-[180px]">
          <img
            src={activeImage}
            alt="Inspection Frame"
            className="w-full h-auto max-h-[240px] object-contain"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] font-mono text-cyan-400 border border-cyan-500/30">
            FRAME: LIVE CAM-04 (60 FPS)
          </div>
        </div>

        {/* Analysis Results Display */}
        {analysisResult && (
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-400">Physical Condition:</span>
              <span className={`px-2 py-0.2 rounded font-bold ${analysisResult.hasAnomaly ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                {analysisResult.condition}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Leakage</span>
                <span className={analysisResult.leakageDetected ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {analysisResult.leakageDetected ? 'DETECTED' : 'NONE'}
                </span>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Oscillation</span>
                <span className={analysisResult.vibrationObserved ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {analysisResult.vibrationObserved ? 'OBSERVED' : 'STABLE'}
                </span>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Confidence</span>
                <span className="text-cyan-400 font-bold">{analysisResult.confidence}%</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Corrosion</span>
                <span className="text-slate-300">{analysisResult.corrosionDetected ? 'YES' : 'NO'}</span>
              </div>
            </div>

            <p className="text-slate-300 font-medium">
              <span className="font-semibold text-slate-400">Gemini Vision Verdict: </span>
              {analysisResult.summary}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="px-4 py-1.5 rounded text-xs font-bold bg-gradient-to-r from-indigo-500 to-cyan-600 hover:from-indigo-400 hover:to-cyan-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-900/30 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Running Multimodal Vision Inference...</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Run Vision Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
