export type MachineStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'MITIGATION_ACTIVE' | 'OFFLINE';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TelemetryPoint {
  timestamp: number;
  temperature: number; // °C
  vibration: number;   // mm/s
  current: number;     // A
  pressure: number;    // bar
  rpm: number;         // RPM
}

export interface MitigationRecord {
  id: string;
  timestamp: number;
  action: string;
  triggerReason: string;
  beforeVibration: number;
  afterVibration: number;
  result: 'SUCCESSFUL' | 'PARTIALLY_SUCCESSFUL' | 'FAILED';
}

export interface HistoricalEvent {
  date: string;
  event: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  telemetrySnapshot: Partial<TelemetryPoint>;
  resolution: string;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  location: string;
  status: MachineStatus;
  healthScore: number; // 0 - 100
  riskScore: number;   // 0 - 100
  riskLevel: RiskLevel;
  currentTelemetry: TelemetryPoint;
  telemetryHistory: TelemetryPoint[];
  normalRanges: {
    temperature: [number, number];
    vibration: [number, number];
    current: [number, number];
    pressure: [number, number];
    rpm: [number, number];
  };
  lastMaintenance: string;
  nextMaintenance: string;
  mitigationHistory: MitigationRecord[];
  historicalEvents: HistoricalEvent[];
  visionObservation?: {
    timestamp: number;
    hasAnomaly: boolean;
    condition: string;
    leakageDetected: boolean;
    vibrationObserved: boolean;
    confidence: number;
    notes: string;
    imageUrl?: string;
  };
  voiceObservation?: {
    timestamp: number;
    transcript: string;
    sentiment: 'NORMAL' | 'SUSPICIOUS' | 'ABNORMAL';
    confidence: number;
    source: string;
  };
}

export interface ModalityEvidence {
  modality: 'SENSOR' | 'VISION' | 'VOICE' | 'HISTORY' | 'MAINTENANCE';
  state: 'NORMAL' | 'ABNORMAL' | 'INCONCLUSIVE' | 'CRITICAL';
  confidence: number;
  weight: number;
  headline: string;
  details: string[];
  sourceData?: any;
}

export interface Contradiction {
  detected: boolean;
  severity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  conflictingModalities: Array<'SENSOR' | 'VISION' | 'VOICE' | 'HISTORY' | 'MAINTENANCE'>;
  summary: string;
  explanation: string;
  humanObservation: string;
  machineConsensus: string;
  confidencePenalty: number;
}

export interface RootCauseCandidate {
  id: string;
  cause: string;
  probability: number;
  symptoms: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggestedAction: string;
}

export interface CrossSenseAnalysis {
  id: string;
  machineId: string;
  timestamp: number;
  overallRiskScore: number;
  riskLevel: RiskLevel;
  crossSenseConfidence: number;
  evidences: ModalityEvidence[];
  contradiction: Contradiction;
  rootCauses: RootCauseCandidate[];
  recommendedAction: string;
  requiredAction: string;
  autonomousActionTaken?: string;
  explainability: {
    whatHappened: string;
    whyForgeXBelievesThis: string[];
    contradictorySignals: string[];
    confidenceRationale: string;
    actionJustification: string;
  };
  isAiFallback?: boolean;
}

export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'MITIGATION_ACTIVE' | 'VERIFIED' | 'RESOLVED';

export interface AutonomousAction {
  id: string;
  incidentId?: string;
  machineId: string;
  timestamp: number;
  type: 'CREATE_INCIDENT' | 'NOTIFY_TECHNICIAN' | 'REDUCE_MACHINE_LOAD' | 'START_MONITORING' | 'ESCALATE_RISK' | 'REQUEST_INSPECTION' | 'PURGE_LINE';
  title: string;
  description: string;
  parameters?: Record<string, any>;
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'VERIFIED' | 'FAILED';
  verificationId?: string;
}

export interface VerificationRecord {
  id: string;
  incidentId: string;
  machineId: string;
  startTime: number;
  completedTime?: number;
  status: 'IN_PROGRESS' | 'SUCCESSFUL' | 'PARTIALLY_SUCCESSFUL' | 'FAILED';
  beforeTelemetry: TelemetryPoint;
  beforeRiskScore: number;
  afterTelemetry?: TelemetryPoint;
  afterRiskScore?: number;
  vibrationReductionPct?: number;
  temperatureReductionPct?: number;
  riskReductionPct?: number;
  summary: string;
  telemetryStream: TelemetryPoint[];
}

export interface Incident {
  id: string;
  machineId: string;
  machineName: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: IncidentStatus;
  createdAt: number;
  updatedAt: number;
  rootCause: string;
  rootCauseProbability: number;
  confidenceScore: number;
  contradictionDetected: boolean;
  assignedTechnician: string;
  evidenceSummary: string[];
  actionsTaken: AutonomousAction[];
  verificationResult?: VerificationRecord;
  notes?: string[];
}

export interface TimelineEvent {
  id: string;
  timestamp: number;
  machineId: string;
  type: 'SENSOR_ANOMALY' | 'VISION_ANALYZED' | 'VOICE_OBSERVATION' | 'CONTRADICTION_DETECTED' | 'RISK_CALCULATED' | 'ROOT_CAUSE_IDENTIFIED' | 'INCIDENT_CREATED' | 'ACTION_EXECUTED' | 'VERIFICATION_STARTED' | 'MITIGATION_VERIFIED' | 'SYSTEM_INFO';
  title: string;
  description: string;
  badgeType: 'info' | 'warning' | 'danger' | 'success' | 'ai';
  metadata?: any;
}

export interface SystemWeights {
  sensor: number;
  vision: number;
  voice: number;
  history: number;
  maintenance: number;
}
