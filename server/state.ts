import { Machine, Incident, TimelineEvent, CrossSenseAnalysis, SystemWeights, VerificationRecord } from './types.js';

export interface AppState {
  machines: Machine[];
  incidents: Incident[];
  timeline: TimelineEvent[];
  latestAnalysis: Record<string, CrossSenseAnalysis>;
  verifications: Record<string, VerificationRecord>;
  systemWeights: SystemWeights;
  simulationMode: {
    activeMachineId: string | null;
    isFailing: boolean;
    failProgress: number; // 0 to 100
    isMitigating: boolean;
    mitigationProgress: number; // 0 to 100
  };
  demoScenario: {
    isRunning: boolean;
    currentStepIndex: number;
    stepStartTime: number;
    stepTimer?: any;
  };
}

const now = Date.now();

// Initial Mock Telemetry History (last 30 points)
function generateNormalHistory(baseTemp: number, baseVib: number, baseCurr: number, basePress: number, baseRpm: number) {
  const history = [];
  for (let i = 29; i >= 0; i--) {
    const ts = now - i * 3000;
    history.push({
      timestamp: ts,
      temperature: +(baseTemp + (Math.random() * 2 - 1)).toFixed(1),
      vibration: +(baseVib + (Math.random() * 0.8 - 0.4)).toFixed(2),
      current: +(baseCurr + (Math.random() * 0.4 - 0.2)).toFixed(2),
      pressure: +(basePress + (Math.random() * 0.3 - 0.15)).toFixed(2),
      rpm: Math.round(baseRpm + (Math.random() * 10 - 5)),
    });
  }
  return history;
}

export const state: AppState = {
  systemWeights: {
    sensor: 0.30,
    vision: 0.25,
    history: 0.20,
    voice: 0.10,
    maintenance: 0.15,
  },
  simulationMode: {
    activeMachineId: null,
    isFailing: false,
    failProgress: 0,
    isMitigating: false,
    mitigationProgress: 0,
  },
  demoScenario: {
    isRunning: false,
    currentStepIndex: 0,
    stepStartTime: 0,
  },
  latestAnalysis: {},
  verifications: {},
  timeline: [
    {
      id: 'evt-init-1',
      timestamp: now - 3600000 * 2,
      machineId: 'PUMP-042',
      type: 'SYSTEM_INFO',
      title: 'FORGE X Engine Initialized',
      description: 'Cross-modal edge perception node connected. Monitoring 4 primary industrial assets.',
      badgeType: 'info',
    },
    {
      id: 'evt-init-2',
      timestamp: now - 1800000,
      machineId: 'PUMP-042',
      type: 'SYSTEM_INFO',
      title: 'Baseline Sensor Telemetry Synced',
      description: 'Baseline vibration (5.8 mm/s) and temperature (63.4 °C) calibrated.',
      badgeType: 'success',
    },
  ],
  incidents: [
    {
      id: 'INC-2026-088',
      machineId: 'COMPRESSOR-021',
      machineName: 'High-Pressure Gas Compressor',
      title: 'Discharge Valve Thermal Flutter & Pressure Gradient Drop',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      createdAt: now - 86400000 * 3,
      updatedAt: now - 86400000 * 2,
      rootCause: 'Valve Reed Fatigue',
      rootCauseProbability: 79,
      confidenceScore: 91,
      contradictionDetected: false,
      assignedTechnician: 'Marcus Vance (Lead Tech)',
      evidenceSummary: [
        'Sensor pressure drop delta of 1.4 bar',
        'Thermal camera detected discharge flange heat spike (91°C)',
      ],
      actionsTaken: [
        {
          id: 'ACT-088-1',
          machineId: 'COMPRESSOR-021',
          timestamp: now - 86400000 * 3 + 120000,
          type: 'REDUCE_MACHINE_LOAD',
          title: 'Load Reduced to 70%',
          description: 'Autonomous load ramp-down initiated to prevent catastrophic head rupture.',
          status: 'VERIFIED',
        },
      ],
    },
  ],
  machines: [
    {
      id: 'PUMP-042',
      name: 'Primary Boiler Feed Water Pump',
      type: 'Centrifugal Multi-Stage Pump',
      location: 'Sector 4 - Power & Thermal Utilities',
      status: 'NORMAL',
      healthScore: 96,
      riskScore: 12,
      riskLevel: 'LOW',
      currentTelemetry: {
        timestamp: now,
        temperature: 64.2,
        vibration: 5.6,
        current: 6.4,
        pressure: 6.1,
        rpm: 1475,
      },
      telemetryHistory: generateNormalHistory(64.2, 5.6, 6.4, 6.1, 1475),
      normalRanges: {
        temperature: [60, 70],
        vibration: [4, 8],
        current: [5, 8],
        pressure: [5, 7],
        rpm: [1400, 1500],
      },
      lastMaintenance: '2026-07-28 (Quarterly Bearing Flush)',
      nextMaintenance: '2026-09-15 (Impeller Laser Alignment)',
      mitigationHistory: [],
      historicalEvents: [
        {
          date: 'Aug 10, 2026',
          event: 'Transient temperature spike (78°C) during peak utility transfer load.',
          severity: 'LOW',
          telemetrySnapshot: { temperature: 78.4, vibration: 7.1 },
          resolution: 'Normalized post load rebalance.',
        },
        {
          date: 'Aug 14, 2026',
          event: 'Vibration frequency modulation anomaly at 2x line frequency.',
          severity: 'MEDIUM',
          telemetrySnapshot: { vibration: 9.8, current: 7.9 },
          resolution: 'Technician tightened anchor fastener bolts.',
        },
        {
          date: 'Aug 17, 2026',
          event: 'Bearing non-destructive acoustic ultrasonic scan.',
          severity: 'LOW',
          telemetrySnapshot: { vibration: 6.2 },
          resolution: 'Minor raceway wear noted; scheduled for 60-day replacement.',
        },
        {
          date: 'Aug 20, 2026',
          event: 'Minor vibration rise with baseline temperature elevation.',
          severity: 'MEDIUM',
          telemetrySnapshot: { vibration: 10.4, temperature: 72.1 },
          resolution: 'Grease re-pack performed.',
        },
        {
          date: 'Aug 22, 2026',
          event: 'Current waveform harmonic distortion coupled with axial vibration.',
          severity: 'HIGH',
          telemetrySnapshot: { vibration: 14.1, current: 8.8, temperature: 79.5 },
          resolution: 'Identical pre-failure signature to past bearing spalling catastrophe.',
        },
      ],
    },
    {
      id: 'PUMP-017',
      name: 'Secondary Cooling Loop Circulation Pump',
      type: 'End-Suction Centrifugal Pump',
      location: 'Sector 2 - Chilled Water Plant',
      status: 'NORMAL',
      healthScore: 92,
      riskScore: 18,
      riskLevel: 'LOW',
      currentTelemetry: {
        timestamp: now,
        temperature: 58.1,
        vibration: 4.8,
        current: 5.2,
        pressure: 5.4,
        rpm: 1440,
      },
      telemetryHistory: generateNormalHistory(58.1, 4.8, 5.2, 5.4, 1440),
      normalRanges: {
        temperature: [50, 65],
        vibration: [3, 7],
        current: [4, 7],
        pressure: [4.5, 6.5],
        rpm: [1400, 1500],
      },
      lastMaintenance: '2026-08-02 (Mechanical Seal Replacement)',
      nextMaintenance: '2026-10-10',
      mitigationHistory: [],
      historicalEvents: [
        {
          date: 'Jul 19, 2026',
          event: 'Cavitation warning due to inlet filter clogging.',
          severity: 'MEDIUM',
          telemetrySnapshot: { pressure: 3.9, vibration: 8.4 },
          resolution: 'Inlet strainer back-washed.',
        },
      ],
    },
    {
      id: 'MOTOR-009',
      name: 'Variable Frequency Drive Motor 200kW',
      type: '3-Phase AC Induction Motor',
      location: 'Sector 4 - Drive Hall Alpha',
      status: 'NORMAL',
      healthScore: 98,
      riskScore: 8,
      riskLevel: 'LOW',
      currentTelemetry: {
        timestamp: now,
        temperature: 61.5,
        vibration: 3.9,
        current: 7.1,
        pressure: 5.0,
        rpm: 1490,
      },
      telemetryHistory: generateNormalHistory(61.5, 3.9, 7.1, 5.0, 1490),
      normalRanges: {
        temperature: [55, 75],
        vibration: [2, 6],
        current: [5, 9],
        pressure: [4.5, 5.5],
        rpm: [1450, 1520],
      },
      lastMaintenance: '2026-08-11 (Stator Insulation Test)',
      nextMaintenance: '2026-11-20',
      mitigationHistory: [],
      historicalEvents: [
        {
          date: 'Jun 30, 2026',
          event: 'VFD Inverter harmonic noise check.',
          severity: 'LOW',
          telemetrySnapshot: { current: 7.5 },
          resolution: 'Output filter capacitance verified within spec.',
        },
      ],
    },
    {
      id: 'COMPRESSOR-021',
      name: 'High-Pressure Nitrogen Gas Compressor',
      type: 'Reciprocating 2-Stage Compressor',
      location: 'Sector 1 - Gas Separation Bay',
      status: 'NORMAL',
      healthScore: 88,
      riskScore: 24,
      riskLevel: 'LOW',
      currentTelemetry: {
        timestamp: now,
        temperature: 68.3,
        vibration: 6.9,
        current: 7.8,
        pressure: 6.8,
        rpm: 1420,
      },
      telemetryHistory: generateNormalHistory(68.3, 6.9, 7.8, 6.8, 1420),
      normalRanges: {
        temperature: [60, 75],
        vibration: [4, 8.5],
        current: [6, 9.5],
        pressure: [5.5, 7.8],
        rpm: [1380, 1480],
      },
      lastMaintenance: '2026-08-19 (Valve Assembly Replacement)',
      nextMaintenance: '2026-09-30',
      mitigationHistory: [],
      historicalEvents: [
        {
          date: 'Aug 19, 2026',
          event: 'Discharge valve thermal flutter investigated.',
          severity: 'HIGH',
          telemetrySnapshot: { temperature: 84.1, vibration: 11.2 },
          resolution: 'Replaced reed valve plate and cylinder head gasket.',
        },
      ],
    },
  ],
};

export function addTimelineEvent(event: Omit<TimelineEvent, 'id' | 'timestamp'>) {
  const newEvt: TimelineEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: Date.now(),
    ...event,
  };
  state.timeline.unshift(newEvt);
  if (state.timeline.length > 50) {
    state.timeline.pop();
  }
  return newEvt;
}
