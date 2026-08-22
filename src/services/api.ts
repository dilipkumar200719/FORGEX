import { Machine, Incident, TimelineEvent, CrossSenseAnalysis, SystemWeights, VerificationRecord, AutonomousAction } from '../types';

export async function fetchMachines(): Promise<Machine[]> {
  const res = await fetch('/api/machines');
  const data = await res.json();
  return data.machines || [];
}

export async function fetchMachineDetail(id: string): Promise<{ machine: Machine; analysis: CrossSenseAnalysis; verification?: VerificationRecord }> {
  const res = await fetch(`/api/machines/${id}`);
  const data = await res.json();
  return data;
}

export async function startSimulation(machineId: string = 'PUMP-042') {
  const res = await fetch('/api/simulation/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ machineId }),
  });
  return res.json();
}

export async function stopSimulation(machineId: string = 'PUMP-042') {
  const res = await fetch('/api/simulation/stop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ machineId }),
  });
  return res.json();
}

export async function runDemoScenario(machineId: string = 'PUMP-042') {
  const res = await fetch('/api/simulation/demo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ machineId }),
  });
  return res.json();
}

export async function stopDemoScenario() {
  const res = await fetch('/api/simulation/demo-stop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function analyzeVision(imageBase64: string, machineId: string = 'PUMP-042', mimeType: string = 'image/jpeg') {
  const res = await fetch('/api/vision/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, machineId, mimeType }),
  });
  return res.json();
}

export async function analyzeVoice(transcript: string, machineId: string = 'PUMP-042', source?: string) {
  const res = await fetch('/api/voice/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, machineId, source }),
  });
  return res.json();
}

export async function runCrossSenseAnalysis(machineId: string = 'PUMP-042', overrides?: any, weights?: SystemWeights) {
  const res = await fetch('/api/crosssense/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ machineId, overrides, weights }),
  });
  return res.json();
}

export async function fetchIncidents(): Promise<Incident[]> {
  const res = await fetch('/api/incidents');
  const data = await res.json();
  return data.incidents || [];
}

export async function updateIncident(id: string, updates: { status?: string; assignedTechnician?: string; note?: string }) {
  const res = await fetch(`/api/incidents/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function executeAction(actionType: AutonomousAction['type'], machineId: string, params?: Record<string, any>) {
  const res = await fetch('/api/actions/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actionType, machineId, params }),
  });
  return res.json();
}

export async function fetchTimeline(): Promise<TimelineEvent[]> {
  const res = await fetch('/api/events');
  const data = await res.json();
  return data.events || [];
}

export async function fetchAnalytics() {
  const res = await fetch('/api/analytics');
  return res.json();
}

export async function updateWeights(weights: SystemWeights) {
  const res = await fetch('/api/weights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weights }),
  });
  return res.json();
}

export function subscribeToTelemetryStream(callbacks: {
  onTelemetry?: (data: any) => void;
  onStateChange?: (data: any) => void;
  onInit?: (data: any) => void;
}) {
  const es = new EventSource('/api/stream');

  es.addEventListener('init', (e) => {
    try {
      const parsed = JSON.parse(e.data);
      callbacks.onInit?.(parsed);
    } catch (err) {
      console.error('SSE init parse error:', err);
    }
  });

  es.addEventListener('telemetry', (e) => {
    try {
      const parsed = JSON.parse(e.data);
      callbacks.onTelemetry?.(parsed);
    } catch (err) {
      console.error('SSE telemetry parse error:', err);
    }
  });

  es.addEventListener('stateChange', (e) => {
    try {
      const parsed = JSON.parse(e.data);
      callbacks.onStateChange?.(parsed);
    } catch (err) {
      console.error('SSE stateChange parse error:', err);
    }
  });

  return () => {
    es.close();
  };
}
