import React from 'react';
import { Sparkles, Check, AlertTriangle, ShieldCheck, ArrowRight, Brain, Zap, Target } from 'lucide-react';
import { CrossSenseAnalysis, RootCauseCandidate } from '../types';

interface ExplainableCardProps {
  analysis: CrossSenseAnalysis;
  onExecuteMitigation?: () => void;
}

export const ExplainableCard: React.FC<ExplainableCardProps> = ({
  analysis,
  onExecuteMitigation,
}) => {
  const { explainability, rootCauses, crossSenseConfidence, overallRiskScore, riskLevel } = analysis;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-rose-300 bg-rose-950/90 border-rose-500 shadow-md shadow-rose-950/60 animate-pulse';
      case 'HIGH':
        return 'text-amber-300 bg-amber-950/90 border-amber-500 shadow-md shadow-amber-950/60';
      case 'MEDIUM':
        return 'text-yellow-300 bg-yellow-950/90 border-yellow-500 shadow-md shadow-yellow-950/60';
      default:
        return 'text-emerald-300 bg-emerald-950/90 border-emerald-500 shadow-md shadow-emerald-950/60';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-slate-100 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/30 border border-indigo-400/50 text-indigo-300 shadow-md">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-black tracking-wider text-cyan-300 uppercase bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                EXPLAINABLE AI REASONING CHAIN
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-black border ${getRiskColor(riskLevel)}`}>
                Risk: {overallRiskScore}/100 ({riskLevel})
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white mt-1">
              Transparent Decision Trail & Deterministic Safety Logic
            </h3>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-2.5 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 shadow-inner">
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Cross-Sense Confidence</span>
            <span className="text-lg font-mono font-black text-cyan-300">{crossSenseConfidence}%</span>
          </div>
          <Sparkles className="w-5 h-5 text-cyan-400" />
        </div>
      </div>

      {/* 1. WHAT HAPPENED */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 shadow-inner">
        <span className="text-xs font-mono font-bold text-sky-400 uppercase flex items-center gap-1.5 mb-1.5">
          <span className="p-1 rounded bg-sky-950 text-sky-400 border border-sky-800">1</span>
          <span>Situation Assessment (What Happened?)</span>
        </span>
        <p className="text-xs font-medium text-slate-200 leading-relaxed pl-1">
          {explainability.whatHappened}
        </p>
      </div>

      {/* 2 & 3. WHY FORGE X BELIEVES THIS (Affirmative vs Contradictory) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Supporting Physical Evidence */}
        <div className="bg-slate-950/80 border border-emerald-800/60 rounded-xl p-3.5 shadow-inner">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5 mb-2">
            <span className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">2</span>
            <span>Affirmative Physical Evidence ({explainability.whyForgeXBelievesThis.length} Signals)</span>
          </span>
          <div className="space-y-2 pl-1">
            {explainability.whyForgeXBelievesThis.map((item, idx) => (
              <div key={idx} className="text-xs text-slate-200 flex items-start gap-2 bg-emerald-950/20 p-2 rounded-lg border border-emerald-900/40">
                <span className="text-emerald-400 font-black text-sm">✓</span>
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contradictory / Human Bias Context */}
        <div className="bg-slate-950/80 border border-amber-800/60 rounded-xl p-3.5 shadow-inner">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5 mb-2">
            <span className="p-1 rounded bg-amber-950 text-amber-400 border border-amber-800">3</span>
            <span>Contradictory / Human Bias Factor</span>
          </span>
          {explainability.contradictorySignals.length > 0 ? (
            <div className="space-y-2 pl-1">
              {explainability.contradictorySignals.map((item, idx) => (
                <div key={idx} className="text-xs text-amber-200 flex items-start gap-2 bg-amber-950/40 p-2 rounded-lg border border-amber-700/60">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No contradictory signals detected. Unanimous sensory alignment.</p>
          )}
          <div className="text-[11px] text-slate-300 mt-2.5 p-2 rounded bg-slate-900 border border-slate-800 font-mono">
            <strong className="text-cyan-300">Confidence Logic: </strong>{explainability.confidenceRationale}
          </div>
        </div>
      </div>

      {/* 4. ROOT CAUSE CANDIDATES */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 shadow-inner">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-mono font-bold text-indigo-400 uppercase flex items-center gap-1.5">
            <span className="p-1 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">4</span>
            <Target className="w-4 h-4 text-indigo-400" />
            <span>Probable Root Cause Candidates (Ranked by ML)</span>
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {rootCauses.map((rc) => (
            <div
              key={rc.id}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-indigo-500/50 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-white">{rc.cause}</span>
                  <span className="font-mono font-black text-cyan-300 text-sm">{rc.probability}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all"
                    style={{ width: `${rc.probability}%` }}
                  ></div>
                </div>
                <div className="text-[11px] text-slate-300 leading-snug">{rc.suggestsAction || rc.suggestedAction}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. AUTONOMOUS ACTION MANDATE */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-sky-950/70 via-slate-950 to-indigo-950/70 p-4 rounded-xl border border-sky-700/60 shadow-lg">
        <div>
          <span className="text-[11px] font-mono text-cyan-300 uppercase block font-bold">5. Autonomous Mitigation Mandate</span>
          <span className="text-sm font-extrabold text-white mt-0.5 block">{analysis.recommendedAction}</span>
        </div>

        {onExecuteMitigation && riskLevel === 'CRITICAL' && (
          <button
            onClick={onExecuteMitigation}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-cyan-950/60 transition-all hover:scale-105"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Execute Mitigation & Start Verification</span>
          </button>
        )}
      </div>
    </div>
  );
};
