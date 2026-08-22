import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { state, addTimelineEvent } from './server/state.js';
import { initSensorSimulator, triggerFailureSimulation, stopSimulation, runDemoScenario, stopDemoScenario } from './server/sensorSimulator.js';
import { runCrossSenseFusion } from './server/crossSenseEngine.js';
import { executeAutonomousAction } from './server/actionEngine.js';
import { startVerification, completeVerification } from './server/verificationEngine.js';
import { analyzeMachineImageWithGemini, analyzeVoiceTranscriptWithGemini } from './server/gemini.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Set up SSE Clients array
const sseClients: Response[] = [];

function broadcastSSE(type: string, data: any) {
  const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].write(payload);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

// Start Simulator
initSensorSimulator((tickData) => {
  broadcastSSE('telemetry', tickData);
});

// SSE endpoint for live telemetry stream
app.get('/api/stream', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.write('\n');
  sseClients.push(res);

  // Send initial snapshot immediately
  res.write(`event: init\ndata: ${JSON.stringify({
    machines: state.machines,
    incidents: state.incidents,
    timeline: state.timeline,
    systemWeights: state.systemWeights,
    latestAnalysis: state.latestAnalysis,
    verifications: state.verifications,
    simulationMode: state.simulationMode,
    demoScenario: state.demoScenario,
  })}\n\n`);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Machines API
app.get('/api/machines', (req: Request, res: Response) => {
  res.json({ success: true, machines: state.machines });
});

app.get('/api/machines/:id', (req: Request, res: Response) => {
  const machine = state.machines.find((m) => m.id === req.params.id);
  if (!machine) {
    return res.status(404).json({ success: false, error: 'Machine not found' });
  }
  const analysis = state.latestAnalysis[machine.id] || runCrossSenseFusion(machine, state.systemWeights);
  const verification = state.verifications[machine.id];
  res.json({ success: true, machine, analysis, verification });
});

app.get('/api/sensors/:machineId', (req: Request, res: Response) => {
  const machine = state.machines.find((m) => m.id === req.params.machineId);
  if (!machine) {
    return res.status(404).json({ success: false, error: 'Machine not found' });
  }
  res.json({
    success: true,
    currentTelemetry: machine.currentTelemetry,
    history: machine.telemetryHistory,
    normalRanges: machine.normalRanges,
  });
});

// Simulation & Demo Controls
app.post('/api/simulation/start', (req: Request, res: Response) => {
  const { machineId = 'PUMP-042' } = req.body;
  triggerFailureSimulation(machineId);
  broadcastSSE('stateChange', { simulationMode: state.simulationMode });
  res.json({ success: true, simulationMode: state.simulationMode });
});

app.post('/api/simulation/stop', (req: Request, res: Response) => {
  const { machineId = 'PUMP-042' } = req.body;
  stopSimulation(machineId);
  broadcastSSE('stateChange', { simulationMode: state.simulationMode });
  res.json({ success: true, simulationMode: state.simulationMode });
});

app.post('/api/simulation/demo', (req: Request, res: Response) => {
  const { machineId = 'PUMP-042' } = req.body;
  runDemoScenario(machineId);
  broadcastSSE('stateChange', { demoScenario: state.demoScenario });
  res.json({ success: true, demoScenario: state.demoScenario });
});

app.post('/api/simulation/demo-stop', (req: Request, res: Response) => {
  stopDemoScenario();
  broadcastSSE('stateChange', { demoScenario: state.demoScenario });
  res.json({ success: true, demoScenario: state.demoScenario });
});

// Multimodal Vision Inspection API
app.post('/api/vision/analyze', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', machineId = 'PUMP-042' } = req.body;
    const machine = state.machines.find((m) => m.id === machineId);

    const result = await analyzeMachineImageWithGemini(
      imageBase64 || '',
      mimeType,
      machine ? { id: machine.id, name: machine.name, currentVibration: machine.currentTelemetry.vibration } : undefined
    );

    if (machine) {
      machine.visionObservation = {
        timestamp: Date.now(),
        hasAnomaly: result.hasAnomaly,
        condition: result.condition,
        leakageDetected: result.leakageDetected,
        vibrationObserved: result.vibrationObserved,
        confidence: result.confidence,
        notes: result.summary,
      };

      addTimelineEvent({
        machineId,
        type: 'VISION_ANALYZED',
        title: `Vision Inspection: ${result.condition}`,
        description: `${result.summary} (Confidence: ${result.confidence}%)`,
        badgeType: result.hasAnomaly ? 'danger' : 'success',
        metadata: result,
      });

      state.latestAnalysis[machine.id] = runCrossSenseFusion(machine, state.systemWeights);
    }

    broadcastSSE('stateChange', { machines: state.machines, latestAnalysis: state.latestAnalysis });
    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Vision analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Voice Transcript & Audio Analysis API
app.post('/api/voice/analyze', async (req: Request, res: Response) => {
  try {
    const { transcript, machineId = 'PUMP-042', source = 'Technician Voice Terminal' } = req.body;
    const machine = state.machines.find((m) => m.id === machineId);

    const result = await analyzeVoiceTranscriptWithGemini(transcript || 'The machine sounds normal.');

    if (machine) {
      machine.voiceObservation = {
        timestamp: Date.now(),
        transcript: result.transcript,
        sentiment: result.sentiment,
        confidence: result.confidence,
        source,
      };

      addTimelineEvent({
        machineId,
        type: 'VOICE_OBSERVATION',
        title: `Voice Ingested: "${result.transcript}"`,
        description: `Sentiment: ${result.sentiment} | ${result.technicianAssessment}`,
        badgeType: 'info',
        metadata: result,
      });

      state.latestAnalysis[machine.id] = runCrossSenseFusion(machine, state.systemWeights);
    }

    broadcastSSE('stateChange', { machines: state.machines, latestAnalysis: state.latestAnalysis });
    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Voice analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// CrossSense Fusion Query API
app.post('/api/crosssense/analyze', (req: Request, res: Response) => {
  const { machineId = 'PUMP-042', overrides, weights } = req.body;
  const machine = state.machines.find((m) => m.id === machineId);
  if (!machine) {
    return res.status(404).json({ success: false, error: 'Machine not found' });
  }

  const currentWeights = weights || state.systemWeights;
  const analysis = runCrossSenseFusion(machine, currentWeights, overrides);
  state.latestAnalysis[machine.id] = analysis;

  if (analysis.contradiction.detected) {
    addTimelineEvent({
      machineId,
      type: 'CONTRADICTION_DETECTED',
      title: `Contradiction Detected on ${machine.id}`,
      description: analysis.contradiction.summary,
      badgeType: 'danger',
      metadata: analysis.contradiction,
    });
  }

  res.json({ success: true, analysis });
});

// Incidents API
app.get('/api/incidents', (req: Request, res: Response) => {
  res.json({ success: true, incidents: state.incidents });
});

app.post('/api/incidents', (req: Request, res: Response) => {
  const { machineId, title, severity, technician, rootCause } = req.body;
  const machine = state.machines.find((m) => m.id === machineId);
  if (!machine) {
    return res.status(404).json({ success: false, error: 'Machine not found' });
  }

  const result = executeAutonomousAction('CREATE_INCIDENT', machineId, {
    title,
    severity,
    technician,
    rootCause,
  });

  broadcastSSE('stateChange', { incidents: state.incidents });
  res.json({ success: true, incident: result.incident });
});

app.patch('/api/incidents/:id', (req: Request, res: Response) => {
  const inc = state.incidents.find((i) => i.id === req.params.id);
  if (!inc) {
    return res.status(404).json({ success: false, error: 'Incident not found' });
  }

  const { status, assignedTechnician, note } = req.body;
  if (status) inc.status = status;
  if (assignedTechnician) inc.assignedTechnician = assignedTechnician;
  if (note) {
    if (!inc.notes) inc.notes = [];
    inc.notes.push(`[${new Date().toLocaleTimeString()}] ${note}`);
  }
  inc.updatedAt = Date.now();

  broadcastSSE('stateChange', { incidents: state.incidents });
  res.json({ success: true, incident: inc });
});

// Autonomous Actions API
app.post('/api/actions/execute', (req: Request, res: Response) => {
  const { actionType, machineId, params } = req.body;
  try {
    const result = executeAutonomousAction(actionType, machineId, params);
    broadcastSSE('stateChange', {
      machines: state.machines,
      incidents: state.incidents,
      timeline: state.timeline,
      simulationMode: state.simulationMode,
    });
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verification Loop API
app.post('/api/verification/start', (req: Request, res: Response) => {
  const { machineId } = req.body;
  try {
    const record = startVerification(machineId);
    broadcastSSE('stateChange', { verifications: state.verifications });
    res.json({ success: true, record });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/verification/complete', (req: Request, res: Response) => {
  const { machineId, afterTelemetry, afterRiskScore } = req.body;
  try {
    const record = completeVerification(machineId, afterTelemetry, afterRiskScore);
    broadcastSSE('stateChange', {
      verifications: state.verifications,
      machines: state.machines,
      incidents: state.incidents,
    });
    res.json({ success: true, record });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Event Timeline API
app.get('/api/events', (req: Request, res: Response) => {
  res.json({ success: true, events: state.timeline });
});

// Analytics & Weights API
app.get('/api/analytics', (req: Request, res: Response) => {
  const totalMachines = state.machines.length;
  const criticalCount = state.machines.filter((m) => m.riskLevel === 'CRITICAL').length;
  const warningCount = state.machines.filter((m) => m.riskLevel === 'HIGH' || m.riskLevel === 'MEDIUM').length;
  const normalCount = state.machines.filter((m) => m.riskLevel === 'LOW').length;
  const openIncidents = state.incidents.filter((i) => i.status !== 'RESOLVED').length;

  res.json({
    success: true,
    stats: {
      totalMachines,
      criticalCount,
      warningCount,
      normalCount,
      openIncidents,
      averageHealth: Math.round(state.machines.reduce((acc, m) => acc + m.healthScore, 0) / totalMachines),
      mitigationsVerified: state.incidents.filter((i) => i.status === 'VERIFIED' || i.status === 'RESOLVED').length,
    },
    systemWeights: state.systemWeights,
    latestAnalysis: state.latestAnalysis,
    verifications: state.verifications,
  });
});

app.post('/api/weights', (req: Request, res: Response) => {
  const { weights } = req.body;
  if (weights) {
    state.systemWeights = { ...state.systemWeights, ...weights };
    // Re-run analyses
    state.machines.forEach((m) => {
      state.latestAnalysis[m.id] = runCrossSenseFusion(m, state.systemWeights);
    });
  }
  broadcastSSE('stateChange', { systemWeights: state.systemWeights, latestAnalysis: state.latestAnalysis });
  res.json({ success: true, systemWeights: state.systemWeights });
});

// Mount Vite middleware or Static Server
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FORGE X Server running at http://0.0.0.0:${PORT}`);
  });
}

start();
