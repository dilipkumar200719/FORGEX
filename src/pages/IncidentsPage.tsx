import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Clock, Cpu, UserCheck, ArrowRight, Activity, Filter, Eye, Plus } from 'lucide-react';
import { Incident } from '../types';

interface IncidentsPageProps {
  incidents: Incident[];
  selectedIncidentId?: string;
  onSelectIncident: (inc: Incident) => void;
  onResolveIncident?: (id: string) => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  onResolveIncident,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-rose-950/90 text-rose-300 border-rose-500 animate-pulse shadow-md shadow-rose-950/50';
      case 'MITIGATING':
        return 'bg-sky-950/90 text-sky-300 border-sky-500 shadow-md shadow-sky-950/50';
      case 'VERIFIED':
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-md shadow-emerald-950/50';
      case 'RESOLVED':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'P1_CRITICAL':
        return 'text-rose-400 bg-rose-950 border-rose-600 font-bold';
      case 'P2_HIGH':
        return 'text-amber-400 bg-amber-950 border-amber-600 font-bold';
      default:
        return 'text-sky-400 bg-sky-950 border-sky-600';
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>Autonomous Incident Pipeline & Mitigation Records</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Auto-generated incidents from cross-sense contradictions, autonomous load de-ratings, and human dispatch
          </p>
        </div>
        <div className="text-xs font-mono font-bold text-rose-300 bg-rose-950/80 border border-rose-800 px-3.5 py-1.5 rounded-xl shadow-inner">
          Active Incidents: {incidents.filter((i) => i.status !== 'RESOLVED').length}
        </div>
      </div>

      {/* Incidents List Grid */}
      <div className="space-y-3">
        {incidents.map((inc) => {
          const isSelected = inc.id === selectedIncidentId;

          return (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc)}
              className={`bg-slate-900/90 border rounded-2xl p-4.5 transition-all duration-200 cursor-pointer shadow-md hover:scale-[1.005] ${
                isSelected
                  ? 'border-cyan-400 shadow-xl shadow-cyan-950/50 ring-2 ring-cyan-400/80'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-black text-cyan-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    {inc.id}
                  </span>
                  <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                    {inc.machineId}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black border ${getStatusBadge(inc.status)}`}>
                    {inc.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getPriorityBadge(inc.priority)}`}>
                    {inc.priority}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-400">
                  Triggered: <span className="text-slate-200">{new Date(inc.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-sm font-extrabold text-white mb-1">{inc.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">{inc.description}</p>

              {/* Contradiction & Mitigation Summary */}
              {inc.contradictionSummary && (
                <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-800/40 text-xs mb-3 space-y-1">
                  <div className="font-mono font-bold text-amber-300 flex items-center gap-1.5">
                    <span>⚠️ Contradiction Resolution Factor:</span>
                  </div>
                  <div className="text-slate-300 italic">{inc.contradictionSummary}</div>
                </div>
              )}

              {/* Autonomous Action & Verification Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Action: <strong className="text-white">{inc.autonomousActionTaken || 'Pending'}</strong></span>
                </div>

                <div className="flex items-center gap-3">
                  {inc.verificationResult && (
                    <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {inc.verificationResult}
                    </span>
                  )}

                  <span className="text-cyan-300 font-mono text-xs font-bold flex items-center gap-1">
                    <span>View Forensic Detail</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
