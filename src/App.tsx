import React, { useState, useEffect } from 'react';
import { 
  fetchMachines, 
  fetchIncidents, 
  fetchTimeline, 
  fetchAnalytics, 
  subscribeToTelemetryStream,
  startSimulation,
  stopSimulation,
  runDemoScenario as apiRunDemoScenario,
  stopDemoScenario as apiStopDemoScenario,
  executeAction
} from './services/api';
import { Machine, Incident, TimelineEvent, CrossSenseAnalysis, SystemWeights, VerificationRecord } from './types';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { DemoScenarioRunner } from './components/DemoScenarioRunner';
import { VoiceInputModal } from './components/VoiceInputModal';
import { VisionInspectionModal } from './components/VisionInspectionModal';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { QuickExplainerModal } from './components/QuickExplainerModal';

// Pages
import { CommandCenter } from './pages/CommandCenter';
import { MachinesPage } from './pages/MachinesPage';
import { CrossSenseLab } from './pages/CrossSenseLab';
import { DecisionsPage } from './pages/DecisionsPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { VerificationPage } from './pages/VerificationPage';
import { AnalyticsSettingsPage } from './pages/AnalyticsSettingsPage';

function AppContent() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('command');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string>('PUMP-042');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [systemWeights, setSystemWeights] = useState<SystemWeights>({
    sensorWeight: 0.30,
    visionWeight: 0.25,
    voiceWeight: 0.10,
    historyWeight: 0.20,
    maintenanceWeight: 0.15,
  });
  const [analyses, setAnalyses] = useState<Record<string, CrossSenseAnalysis>>({});
  const [verifications, setVerifications] = useState<Record<string, VerificationRecord>>({});
  
  // Demo & Sim State
  const [demoRunning, setDemoRunning] = useState<boolean>(false);
  const [demoStepIndex, setDemoStepIndex] = useState<number>(0);
  const [isSimulatingFailure, setIsSimulatingFailure] = useState<boolean>(false);

  // Modals
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);
  const [visionModalOpen, setVisionModalOpen] = useState<boolean>(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [explainerOpen, setExplainerOpen] = useState<boolean>(false);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [mList, incList, tList, aData] = await Promise.all([
          fetchMachines(),
          fetchIncidents(),
          fetchTimeline(),
          fetchAnalytics(),
        ]);

        if (mList && mList.length > 0) setMachines(mList);
        if (incList) setIncidents(incList);
        if (tList) setTimeline(tList);
        if (aData) {
          if (aData.systemWeights) setSystemWeights(aData.systemWeights);
          if (aData.latestAnalysis) setAnalyses(aData.latestAnalysis);
          if (aData.verifications) setVerifications(aData.verifications);
        }
      } catch (err) {
        console.error('Initial data load error:', err);
      }
    }
    loadData();
  }, []);

  // Subscribe to live SSE Stream
  useEffect(() => {
    const cleanup = subscribeToTelemetryStream({
      onInit: (data) => {
        if (data.machines) setMachines(data.machines);
        if (data.incidents) setIncidents(data.incidents);
        if (data.timeline) setTimeline(data.timeline);
        if (data.systemWeights) setSystemWeights(data.systemWeights);
        if (data.latestAnalysis) setAnalyses(data.latestAnalysis);
        if (data.verifications) setVerifications(data.verifications);
        if (data.simulationMode !== undefined) setIsSimulatingFailure(data.simulationMode);
        if (data.demoScenario) {
          setDemoRunning(data.demoScenario.isRunning);
          setDemoStepIndex(data.demoScenario.stepIndex);
        }
      },
      onTelemetry: (tickData) => {
        if (tickData.machines) {
          setMachines(tickData.machines);
        }
        if (tickData.latestAnalysis) {
          setAnalyses(tickData.latestAnalysis);
        }
        if (tickData.verifications) {
          setVerifications(tickData.verifications);
        }
        if (tickData.timeline) {
          setTimeline(tickData.timeline);
        }
        if (tickData.incidents) {
          setIncidents(tickData.incidents);
        }
        if (tickData.demoScenario) {
          setDemoRunning(tickData.demoScenario.isRunning);
          setDemoStepIndex(tickData.demoScenario.stepIndex);
        }
      },
      onStateChange: (data) => {
        if (data.machines) setMachines(data.machines);
        if (data.incidents) setIncidents(data.incidents);
        if (data.timeline) setTimeline(data.timeline);
        if (data.systemWeights) setSystemWeights(data.systemWeights);
        if (data.latestAnalysis) setAnalyses(data.latestAnalysis);
        if (data.verifications) setVerifications(data.verifications);
        if (data.simulationMode !== undefined) setIsSimulatingFailure(data.simulationMode);
        if (data.demoScenario) {
          setDemoRunning(data.demoScenario.isRunning);
          setDemoStepIndex(data.demoScenario.stepIndex);
        }
      },
    });

    return () => {
      cleanup();
    };
  }, []);

  // Handlers
  const handleToggleFailureSim = async () => {
    if (isSimulatingFailure) {
      await stopSimulation(selectedMachineId);
      setIsSimulatingFailure(false);
    } else {
      await startSimulation(selectedMachineId);
      setIsSimulatingFailure(true);
    }
  };

  const handleRunDemo = async () => {
    setDemoRunning(true);
    setDemoStepIndex(0);
    setActiveTab('command');
    await apiRunDemoScenario(selectedMachineId);
  };

  const handleStopDemo = async () => {
    setDemoRunning(false);
    await apiStopDemoScenario();
  };

  const handleExecuteAction = async (actionType: any, params?: any) => {
    try {
      const res = await executeAction(actionType, selectedMachineId, params);
      if (res.success && res.incident) {
        setSelectedIncident(res.incident);
      }
    } catch (err) {
      console.error('Execute action error:', err);
    }
  };

  const currentMachine = machines.find((m) => m.id === selectedMachineId) || machines[0] || {
    id: 'PUMP-042',
    name: 'Primary Slurry Feed Pump',
    location: 'Sector 4 - Wet Processing',
    status: 'NORMAL',
    healthScore: 92,
    riskScore: 28,
    riskLevel: 'LOW',
    currentTelemetry: { timestamp: Date.now(), temperature: 62.4, vibration: 5.6, current: 6.4, pressure: 5.2, rpm: 1480 },
    normalRanges: { temperature: [45, 75], vibration: [2.0, 7.5], current: [4.0, 8.5], pressure: [4.0, 7.0], rpm: [1400, 1550] },
    telemetryHistory: [],
    maintenanceHistory: [],
    historicalIncidents: [],
  };

  const currentAnalysis = analyses[currentMachine.id];
  const currentVerification = verifications[currentMachine.id];

  // Theme-specific root container styling
  const rootBgClass = theme === 'light' 
    ? 'bg-slate-100 text-slate-900' 
    : theme === 'midnight' 
    ? 'bg-[#060814] text-slate-100' 
    : 'bg-slate-950 text-slate-100';

  return (
    <div id="forge-x-root" className={`min-h-screen ${rootBgClass} flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-300`}>
      {/* Top Mission Control Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedMachineId={selectedMachineId}
        setSelectedMachineId={setSelectedMachineId}
        machines={machines}
        demoRunning={demoRunning}
        onRunDemo={handleRunDemo}
        onStopDemo={handleStopDemo}
        isSimulatingFailure={isSimulatingFailure}
        onToggleFailureSim={handleToggleFailureSim}
        onOpenExplainer={() => setExplainerOpen(true)}
      />

      {/* 8-Stage Demo Scenario Tracker Bar */}
      <DemoScenarioRunner
        isRunning={demoRunning}
        currentStepIndex={demoStepIndex}
        onStopDemo={handleStopDemo}
        onRestartDemo={handleRunDemo}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 pt-4">
        {activeTab === 'command' && (
          <CommandCenter
            machine={currentMachine}
            allMachines={machines}
            analysis={currentAnalysis}
            verification={currentVerification}
            incidents={incidents}
            timeline={timeline}
            onOpenVisionModal={() => setVisionModalOpen(true)}
            onOpenVoiceModal={() => setVoiceModalOpen(true)}
            onOpenDecisionsTab={() => setActiveTab('decisions')}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            onExecuteAction={handleExecuteAction}
          />
        )}

        {activeTab === 'machines' && (
          <MachinesPage
            machines={machines}
            selectedMachineId={selectedMachineId}
            onSelectMachine={(id) => {
              setSelectedMachineId(id);
              setActiveTab('command');
            }}
            onSimulateFailure={(id) => {
              setSelectedMachineId(id);
              startSimulation(id);
              setIsSimulatingFailure(true);
              setActiveTab('command');
            }}
          />
        )}

        {activeTab === 'crosssense' && (
          <CrossSenseLab
            machine={currentMachine}
            systemWeights={systemWeights}
            analysis={currentAnalysis}
            onAnalysisUpdated={(newAnalysis) => {
              setAnalyses((prev) => ({ ...prev, [currentMachine.id]: newAnalysis }));
            }}
          />
        )}

        {activeTab === 'decisions' && (
          <DecisionsPage
            machine={currentMachine}
            analysis={currentAnalysis}
            onExecuteAction={handleExecuteAction}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentsPage
            incidents={incidents}
            selectedIncidentId={selectedIncident?.id}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
          />
        )}

        {activeTab === 'verification' && (
          <VerificationPage
            machine={currentMachine}
            verification={currentVerification}
            onTriggerVerification={() => handleExecuteAction('START_VERIFICATION')}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsSettingsPage
            systemWeights={systemWeights}
            onUpdateWeights={(newWeights) => setSystemWeights(newWeights)}
          />
        )}
      </main>

      {/* Quick Explainer How It Works Modal */}
      <QuickExplainerModal
        isOpen={explainerOpen}
        onClose={() => setExplainerOpen(false)}
        onRunDemo={handleRunDemo}
      />

      {/* Voice Modality Ingestion Modal */}
      <VoiceInputModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        machineId={selectedMachineId}
        onVoiceSubmitted={() => {
          setVoiceModalOpen(false);
        }}
      />

      {/* Multimodal AI Vision Inspection Modal */}
      <VisionInspectionModal
        isOpen={visionModalOpen}
        onClose={() => setVisionModalOpen(false)}
        machineId={selectedMachineId}
        onVisionSubmitted={() => {
          setVisionModalOpen(false);
        }}
      />

      {/* Incident Detail & Status Transition Modal */}
      <IncidentDetailModal
        incident={selectedIncident}
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onIncidentUpdated={(updated) => {
          setIncidents((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
          setSelectedIncident(updated);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
