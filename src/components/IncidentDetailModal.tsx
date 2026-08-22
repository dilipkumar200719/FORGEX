import React, { useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  Clock, 
  Activity, 
  Zap, 
  Plus, 
  FileText,
  AlertOctagon
} from 'lucide-react';
import { Incident, IncidentStatus } from '../types';
import { updateIncident } from '../services/api';

interface IncidentDetailModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onIncidentUpdated?: (updated: Incident) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  isOpen,
  onClose,
  onIncidentUpdated,
}) => {
  const [newNote, setNewNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !incident) return null;

  const statuses: IncidentStatus[] = ['OPEN', 'INVESTIGATING', 'MITIGATION_ACTIVE', 'VERIFIED', 'RESOLVED'];

  const handleStatusChange = async (status: IncidentStatus) => {
    setIsUpdating(true);
    try {
      const res = await updateIncident(incident.id, { status });
      if (res.success && res.incident) {
        onIncidentUpdated?.(res.incident);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsUpdating(true);
    try {
      const res = await updateIncident(incident.id, { note: newNote });
      if (res.success && res.incident) {
        onIncidentUpdated?.(res.incident);
        setNewNote('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'OPEN':
        return 'bg-rose-950 text-rose-300 border-rose-600';
      case 'INVESTIGATING':
        return 'bg-amber-950 text-amber-300 border-amber-600';
      case 'MITIGATION_ACTIVE':
        return 'bg-cyan-950 text-cyan-300 border-cyan-600';
      case 'VERIFIED':
        return 'bg-emerald-950 text-emerald-300 border-emerald-600';
      case 'RESOLVED':
        return 'bg-slate-800 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-5 text-slate-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-cyan-400">{incident.id}</span>
              <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold border ${getStatusColor(incident.status)}`}>
                {incident.status}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {incident.machineId} • {incident.machineName}
              </span>
            </div>
            <h3 className="text-base font-bold text-white">{incident.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Transition Control Bar */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1.5 font-semibold">
            Transition Incident State:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {statuses.map((st) => (
              <button
                key={st}
                disabled={isUpdating || incident.status === st}
                onClick={() => handleStatusChange(st)}
                className={`px-2.5 py-1 rounded text-xs font-semibold font-mono transition-all ${
                  incident.status === st
                    ? 'bg-slate-800 text-cyan-300 ring-1 ring-cyan-500 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Core Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Probable Root Cause</span>
            <span className="font-bold text-rose-400 text-sm">{incident.rootCause}</span>
            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
              Confidence: {incident.rootCauseProbability}%
            </span>
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Assigned Reliability Lead</span>
            <span className="font-bold text-slate-200 flex items-center gap-1 mt-0.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              {incident.assignedTechnician}
            </span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Pager Alert Confirmed</span>
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Contradiction Detected</span>
            <span className={`font-bold mt-0.5 flex items-center gap-1 ${incident.contradictionDetected ? 'text-amber-400' : 'text-slate-400'}`}>
              {incident.contradictionDetected ? <AlertOctagon className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              {incident.contradictionDetected ? 'YES (Human Bias Overridden)' : 'NO'}
            </span>
          </div>
        </div>

        {/* Evidence Summary */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block mb-1.5">
            Cross-Sense Ingested Evidence:
          </span>
          <ul className="space-y-1 text-xs text-slate-300">
            {incident.evidenceSummary?.map((ev, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{ev}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Autonomous Actions Log */}
        {incident.actionsTaken?.length > 0 && (
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block">
              Autonomous Mitigations Executed ({incident.actionsTaken.length}):
            </span>
            <div className="space-y-1.5">
              {incident.actionsTaken.map((act) => (
                <div key={act.id} className="p-2 rounded bg-slate-900 border border-slate-800/80 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200">{act.title}</div>
                    <div className="text-[11px] text-slate-400">{act.description}</div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {act.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Engineering Notes & Add Note */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block">
            Engineering Audit Trail & Notes:
          </span>
          <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
            {incident.notes?.map((n, i) => (
              <div key={i} className="p-2 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300">
                {n}
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add technician comment or inspection finding..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim() || isUpdating}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 flex items-center gap-1 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Note</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
