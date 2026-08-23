import { Machine, ModalityEvidence, Contradiction, RootCauseCandidate, RiskLevel, TelemetryPoint, CrossSenseAnalysis, SystemWeights, AutonomousAction, VerificationRecord, Incident } from '../types.js';

export interface MetricAnomaly {
  metric: 'temperature' | 'vibration' | 'current' | 'pressure' | 'rpm';
  currentValue: number;
  minThreshold: number;
  maxThreshold: number;
  unit: string;
  isExceeded: boolean;
  excessAmount: number;
  excessPercentage: number;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
  description: string;
}

export interface SensorAnomalyResult {
  hasAnomaly: boolean;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
  sensorRiskScore: number; // 0 - 100
  confidence: number; // 0 - 100
  metrics: Record<string, MetricAnomaly>;
  primaryAnomaly: MetricAnomaly | null;
  exceededCount: number;
  harmonicVibrationSpike: boolean;
  summary: string;
  telemetrySnapshot: TelemetryPoint;
}

export interface RiskEngineResult {
  overallRiskScore: number; // 0 - 100
  healthScore: number; // 0 - 100
  riskLevel: RiskLevel;
  urgencySLA: string;
  rawWeightedRisk: number;
  contradictionEscalationMultiplier: number;
  modalityContributions: {
    sensor: number;
    vision: number;
    voice: number;
    history: number;
    maintenance: number;
  };
  rationale: string;
}

export interface RootCauseEngineResult {
  primaryCause: RootCauseCandidate;
  candidates: RootCauseCandidate[];
  diagnosedPattern: string;
  correlationConfidence: number;
  recommendedAction: string;
  requiredAction: AutonomousAction['type'] | 'NONE';
}

export interface ExplanationResult {
  whatHappened: string;
  whyForgeXBelievesThis: string[];
  contradictorySignals: string[];
  confidenceRationale: string;
  actionJustification: string;
  evidenceMatrixSummary: string;
}

export interface FlowExecutionReport {
  timestamp: number;
  machineId: string;
  machineName: string;
  flowSteps: {
    step: 'NORMAL' | 'ANOMALY' | 'CROSS_SENSE' | 'CONTRADICTION' | 'RISK' | 'ROOT_CAUSE' | 'ACTION' | 'VERIFICATION';
    stepName: string;
    passed: boolean;
    durationMs: number;
    data: any;
    summary: string;
  }[];
  isSuccess: boolean;
  overallSummary: string;
}
