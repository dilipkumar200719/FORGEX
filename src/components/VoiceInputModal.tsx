import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Sparkles, Volume2, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { analyzeVoice } from '../services/api';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineId: string;
  onVoiceSubmitted?: (result: any) => void;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  machineId,
  onVoiceSubmitted,
}) => {
  const [transcript, setTranscript] = useState('The machine sounds normal.');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [recognitionSupported, setRecognitionSupported] = useState(true);

  // Preset Observations
  const presets = [
    { label: 'Normal Check (Demo Conflict)', text: 'The machine sounds normal.' },
    { label: 'Acoustic Whine', text: 'Hearing high-pitched whine from drive-end bearing casing.' },
    { label: 'Severe Knocking', text: 'Audible loud knocking and structural vibration.' },
    { label: 'Fluid Cavitation Sound', text: 'Sounds like gravel running through pump impeller.' },
  ];

  useEffect(() => {
    // Check SpeechRecognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionSupported(false);
    }
  }, []);

  const handleStartRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in this browser. Please use keyboard or presets.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setTranscript(spoken);
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzeVoice(transcript, machineId, 'Technician Field Terminal');
      if (res.success) {
        setAnalysisResult(res.result);
        onVoiceSubmitted?.(res.result);
      }
    } catch (err) {
      console.error('Voice submission error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 text-slate-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Voice Modality Ingestion</h3>
              <p className="text-xs text-slate-400">
                Log spoken acoustic observations for {machineId}
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

        {/* Input Area */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
            <span>Technician Spoken Statement:</span>
            {isRecording && (
              <span className="text-rose-400 text-[11px] flex items-center gap-1 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                Listening...
              </span>
            )}
          </label>

          <div className="relative">
            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="e.g. 'The machine sounds normal.' or speak into your microphone..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleStartRecording}
              className={`absolute right-2 bottom-3 p-2 rounded-md transition-all ${
                isRecording
                  ? 'bg-rose-600 text-white animate-bounce'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-amber-300'
              }`}
              title="Record Voice"
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1.5">
            Quick Ingestion Presets:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {presets.map((preset, i) => (
              <button
                key={i}
                onClick={() => setTranscript(preset.text)}
                className={`text-left p-2 rounded border text-xs transition-all ${
                  transcript === preset.text
                    ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-[11px]">{preset.label}</div>
                <div className="text-[10px] text-slate-400 italic truncate mt-0.5">"{preset.text}"</div>
              </button>
            ))}
          </div>
        </div>

        {/* AI Analysis Result Preview */}
        {analysisResult && (
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-400">Acoustic Sentiment:</span>
              <span className={`px-2 py-0.2 rounded font-bold ${analysisResult.sentiment === 'NORMAL' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                {analysisResult.sentiment}
              </span>
            </div>
            <div className="text-slate-300">
              <span className="font-semibold text-slate-400">Interpretation: </span>
              {analysisResult.technicianAssessment}
            </div>
            <div className="text-[11px] text-amber-300/90 font-mono bg-amber-950/30 p-1.5 rounded border border-amber-900/50">
              Bias Flag: {analysisResult.potentialHumanBiasNote}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !transcript.trim()}
            className="px-4 py-1.5 rounded text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-900/30 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Ingesting to Fusion Engine...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Ingest Observation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
