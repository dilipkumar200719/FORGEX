import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  UserCheck, 
  ArrowRight, 
  Activity, 
  Filter, 
  Eye, 
  Plus,
  Search,
  Zap,
  TrendingDown,
  FileText,
  Check
} from 'lucide-react';
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
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMachine, setNewMachine] = useState('PUMP-042');
  const [newSeverity, setNewSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('CRITICAL');
  const [localIncidents, setLocalIncidents] = useState<Incident[]>(incidents);

  // Sync if props update
  React.useEffect(() => {
    setLocalIncidents(incidents);
  }, [incidents]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-rose-950/90 text-rose-300 border-rose-500 animate-pulse shadow-md shadow-rose-950/50';
      case 'INVESTIGATING':
        return 'bg-amber-950/90 text-amber-300 border-amber-500 shadow-md shadow-amber-950/50';
      case 'MITIGATION_ACTIVE':
      case 'MITIGATING':
        return 'bg-cyan-950/90 text-cyan-300 border-cyan-500 shadow-md shadow-cyan-950/50 animate-pulse';
      case 'VERIFIED':
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-md shadow-emerald-950/50';
      case 'RESOLVED':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getSeverityBadge = (s: string) => {
    switch (s) {
      case 'CRITICAL':
      case 'P1_CRITICAL':
        return 'text-rose-300 bg-rose-950/90 border-rose-500 font-bold';
      case 'HIGH':
      case 'P2_HIGH':
        return 'text-amber-300 bg-amber-950/90 border-amber-500 font-bold';
      case 'MEDIUM':
      case 'P3_MEDIUM':
        return 'text-yellow-300 bg-yellow-950/90 border-yellow-500';
      default:
        return 'text-sky-300 bg-sky-950/90 border-sky-500';
    }
  };

  const handleUpdateStatus = (id: string, newStatus: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id ? { ...inc, status: newStatus, updatedAt: Date.now() } : inc
      )
    );
    if (newStatus === 'RESOLVED') {
      onResolveIncident?.(id);
    }
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: Incident = {
      id: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      machineId: newMachine,
      machineName: newMachine === 'PUMP-042' ? 'Primary Boiler Feed Water Pump' : `${newMachine} Industrial Asset`,
      title: newTitle,
      severity: newSeverity,
      status: 'OPEN',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      rootCause: 'Operator flagged vibration and anomalous thermal signature',
      rootCauseProbability: 88,
      confidenceScore: 92,
      contradictionDetected: true,
      assignedTechnician: 'Marcus Vance (Senior Reliability Specialist)',
      evidenceSummary: ['High frequency acoustic surge', 'Thermal elevation >80°C'],
      actionsTaken: [
        {
          id: `ACT-${Date.now()}`,
          machineId: newMachine,
          timestamp: Date.now(),
          type: 'CREATE_INCIDENT',
          title: 'Manual Incident Initiated',
          description: newTitle,
          status: 'COMPLETED',
        },
      ],
    };

    setLocalIncidents([created, ...localIncidents]);
    setNewTitle('');
    setIsCreating(false);
    onSelectIncident(created);
  };

  const filtered = localIncidents.filter((inc) => {
    const matchesStatus = filterStatus === 'ALL' || inc.status === filterStatus;
    const matchesSeverity = filterSeverity === 'ALL' || inc.severity === filterSeverity || (inc as any).priority === filterSeverity;
    const matchesSearch =
      !searchQuery.trim() ||
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.machineId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSeverity && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-12 font-sans">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>Autonomous Incident Pipeline & Closed-Loop Mitigation</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Auto-generated incidents from cross-sense contradictions, autonomous load de-ratings, and human dispatch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono font-bold text-rose-300 bg-rose-950/80 border border-rose-800 px-3.5 py-1.5 rounded-xl shadow-inner">
            Active Incidents: {localIncidents.filter((i) => i.status !== 'RESOLVED').length}
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-950/50 transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Incident</span>
          </button>
        </div>
      </div>

      {/* Create New Incident Form Drawer */}
      {isCreating && (
        <form
          onSubmit={handleCreateIncident}
          className="bg-slate-900/95 border border-rose-500/50 rounded-2xl p-4 text-xs text-slate-200 space-y-3 shadow-2xl animate-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-extrabold text-sm text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-400" />
              <span>Log Manual Incident Report</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Dispatches to Cross-Sense Engine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Target Asset Machine:</label>
              <select
                value={newMachine}
                onChange={(e) => setNewMachine(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="PUMP-04">PUMP-04 (Heavy Slurry Slag Pump)</option>
                <option value="MILL-01">MILL-01 (Vertical Raw Material Mill)</option>
                <option value="FAN-02">FAN-02 (Kiln Induced Draft Exhaust Fan)</option>
                <option value="COMP-03">COMP-03 (High-Pressure Recip Compressor)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Severity Level:</label>
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="CRITICAL">P1 - CRITICAL (Immediate Interlock)</option>
                <option value="HIGH">P2 - HIGH (Load De-Rating Required)</option>
                <option value="MEDIUM">P3 - MEDIUM (Inspection Scheduled)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Incident Title / Symptom:</label>
              <input
                type="text"
                placeholder="e.g., Severe raceway chatter under peak slurry load"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-extrabold hover:from-rose-500 hover:to-amber-500 shadow-md shadow-rose-950 transition-all"
            >
              Submit & Trigger Analysis
            </button>
          </div>
        </form>
      )}

      {/* Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-400 font-bold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filter Status:</span>
          </span>
          {['ALL', 'OPEN', 'MITIGATION_ACTIVE', 'VERIFIED', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                filterStatus === st
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search incidents by ID, asset, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-64"
          />
        </div>
      </div>

      {/* Incidents List Grid */}
      <div className="space-y-3">
        {filtered.map((inc) => {
          const isSelected = inc.id === selectedIncidentId;
          const severityVal = inc.severity || (inc as any).priority || 'CRITICAL';

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
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getSeverityBadge(severityVal)}`}>
                    {severityVal}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-400">
                  Triggered: <span className="text-slate-200">{new Date(inc.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-sm font-extrabold text-white mb-1">{inc.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {inc.rootCause || (inc as any).description || 'Contradictory sensory signature with high vibration and bearing thermal runaway.'}
              </p>

              {/* Contradiction & Mitigation Summary */}
              {inc.contradictionDetected && (
                <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-800/40 text-xs mb-3 space-y-1">
                  <div className="font-mono font-bold text-amber-300 flex items-center gap-1.5">
                    <span>⚠️ Contradiction Resolution Factor:</span>
                  </div>
                  <div className="text-slate-300 italic">
                    Technician reported nominal noise on floor, but 40kHz ultrasonic sensor and optical seal spray detect critical failure.
                  </div>
                </div>
              )}

              {/* Actions & Lifecycle Status Stepper */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  <span>Assignee: <strong className="text-white">{inc.assignedTechnician || 'Marcus Vance'}</strong></span>
                </div>

                {/* Quick Status Update Buttons */}
                <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                  {inc.status === 'OPEN' && (
                    <button
                      onClick={(e) => handleUpdateStatus(inc.id, 'MITIGATION_ACTIVE', e)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-700 hover:bg-cyan-900 font-bold transition-all text-xs flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Throttle & Mitigate</span>
                    </button>
                  )}

                  {inc.status === 'MITIGATION_ACTIVE' && (
                    <button
                      onClick={(e) => handleUpdateStatus(inc.id, 'VERIFIED', e)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700 hover:bg-emerald-900 font-bold transition-all text-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verify Delta</span>
                    </button>
                  )}

                  {inc.status !== 'RESOLVED' && (
                    <button
                      onClick={(e) => handleUpdateStatus(inc.id, 'RESOLVED', e)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 font-bold transition-all text-xs flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Close Incident</span>
                    </button>
                  )}

                  <span className="text-cyan-300 font-mono text-xs font-bold flex items-center gap-1 pl-1">
                    <span>Forensic Details</span>
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
