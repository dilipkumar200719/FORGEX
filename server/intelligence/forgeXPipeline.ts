import { state, addTimelineEvent } from '../state.js';
import { Machine, TelemetryPoint } from '../types.js';
import { detectSensorAnomalies } from './sensorAnomalyEngine.js';
import { runCrossSenseFusion } from './crossSenseEngine.js';
import { evaluateContradictions } from './contradictionEngine.js';
import { calculateMultiModalRisk } from './riskEngine.js';
import { diagnoseRootCauses } from './rootCauseEngine.js';
import { generateExplanation } from './explanationEngine.js';
import { executeAutonomousAction } from './actionEngine.js';
import { startVerification, completeVerification } from './verificationEngine.js';
import { FlowExecutionReport } from './types.js';

/**
 * DETERMINISTIC DEMO DATASET
 * Pre-calibrated industrial telemetry vectors and multi-modal signals
 * for reproducible execution without requiring external AI APIs.
 */
export const DETERMINISTIC_DATASET = {
  // Stage 1: Baseline Normal
  baseline: {
    telemetry: {
      temperature: 64.2,
      vibration: 5.6,
      current: 6.4,
      pressure: 6.1,
      rpm: 1475,
    } as TelemetryPoint,
    riskScore: 12,
    healthScore: 96,
  },

  // Stage 2: Anomaly Telemetry
  anomaly: {
    telemetry: {
      temperature: 88.4,
      vibration: 18.4,
      current: 8.9,
      pressure: 7.6,
      rpm: 1495,
    } as TelemetryPoint,
    sensorRiskScore: 95,
  },

  // Stage 3: Vision Inspection (Optical Runout & Flange Leak)
  vision: {
    hasAnomaly: true,
    condition: 'CRITICAL - Optical Shaft Runout & Seal Flange Fluid Seepage',
    leakageDetected: true,
    vibrationObserved: true,
    confidence: 94,
    summary: 'High-speed camera tracking identifies 2x shaft orbital runout and mechanical seal fluid seepage.',
  },

  // Stage 4: Voice Observation (Human on-site false negative)
  voice: {
    transcript: 'The machine sounds normal.',
    sentiment: 'NORMAL' as const,
    confidence: 89,
    source: 'Floor Technician Acoustic Check',
  },

  // Stage 8: Post-Mitigation Verified Telemetry (De-rated to 980 RPM)
  mitigated: {
    telemetry: {
      temperature: 66.8,
      vibration: 10.7,
      current: 5.8,
      pressure: 5.9,
      rpm: 980,
    } as TelemetryPoint,
    riskScore: 39,
    healthScore: 86,
  },
};

/**
 * FORGE X INTELLIGENCE PIPELINE
 * Coordinates and validates the complete 8-stage lifecycle:
 * NORMAL → ANOMALY → CROSS-SENSE → CONTRADICTION → RISK → ROOT CAUSE → ACTION → VERIFICATION
 */
export function runDeterministicEndToEndTest(machineId: string = 'PUMP-042'): FlowExecutionReport {
  const tStart = Date.now();
  const machine = state.machines.find((m) => m.id === machineId) || state.machines[0];
  const steps: FlowExecutionReport['flowSteps'] = [];

  // ==========================================
  // STAGE 1: NORMAL
  // ==========================================
  const s1Start = Date.now();
  machine.currentTelemetry = { ...DETERMINISTIC_DATASET.baseline.telemetry, timestamp: Date.now() };
  machine.status = 'NORMAL';
  machine.riskScore = DETERMINISTIC_DATASET.baseline.riskScore;
  machine.healthScore = DETERMINISTIC_DATASET.baseline.healthScore;
  machine.visionObservation = undefined;
  machine.voiceObservation = undefined;

  const baselineAnomaly = detectSensorAnomalies(machine);
  const stage1Passed = !baselineAnomaly.hasAnomaly && baselineAnomaly.severity === 'NORMAL';

  steps.push({
    step: 'NORMAL',
    stepName: '1. Baseline Normal State',
    passed: stage1Passed,
    durationMs: Date.now() - s1Start,
    data: {
      telemetry: machine.currentTelemetry,
      normalRanges: machine.normalRanges,
      sensorAnomaly: baselineAnomaly,
    },
    summary: `Baseline telemetry verified within certified normal ranges. Vibration ${machine.currentTelemetry.vibration} mm/s, Temperature ${machine.currentTelemetry.temperature} °C.`,
  });

  // ==========================================
  // STAGE 2: ANOMALY (Sensor Anomaly Engine)
  // ==========================================
  const s2Start = Date.now();
  machine.currentTelemetry = { ...DETERMINISTIC_DATASET.anomaly.telemetry, timestamp: Date.now() };
  const anomalyResult = detectSensorAnomalies(machine);
  const stage2Passed = anomalyResult.hasAnomaly && anomalyResult.severity === 'CRITICAL';

  steps.push({
    step: 'ANOMALY',
    stepName: '2. Sensor Anomaly Detection',
    passed: stage2Passed,
    durationMs: Date.now() - s2Start,
    data: anomalyResult,
    summary: `Critical multi-channel telemetry exceedance detected! Vibration: ${anomalyResult.telemetrySnapshot.vibration} mm/s (+${anomalyResult.metrics.vibration.excessPercentage}%), Temperature: ${anomalyResult.telemetrySnapshot.temperature} °C.`,
  });

  // ==========================================
  // STAGE 3: CROSS-SENSE (CrossSense Engine)
  // ==========================================
  const s3Start = Date.now();
  machine.visionObservation = {
    timestamp: Date.now(),
    notes: DETERMINISTIC_DATASET.vision.summary,
    ...DETERMINISTIC_DATASET.vision,
  };
  machine.voiceObservation = {
    timestamp: Date.now(),
    ...DETERMINISTIC_DATASET.voice,
  };

  const crossSenseAnalysis = runCrossSenseFusion(machine, state.systemWeights, {
    vision: DETERMINISTIC_DATASET.vision,
    voice: DETERMINISTIC_DATASET.voice,
  });

  const stage3Passed =
    crossSenseAnalysis.evidences.length === 5 && crossSenseAnalysis.crossSenseConfidence >= 90;

  steps.push({
    step: 'CROSS_SENSE',
    stepName: '3. CrossSense Multi-Modal Fusion',
    passed: stage3Passed,
    durationMs: Date.now() - s3Start,
    data: {
      evidences: crossSenseAnalysis.evidences,
      crossSenseConfidence: crossSenseAnalysis.crossSenseConfidence,
    },
    summary: `Cross-Sense fusion completed across 5 modalities with ${crossSenseAnalysis.crossSenseConfidence}% confidence.`,
  });

  // ==========================================
  // STAGE 4: CONTRADICTION (Contradiction Engine)
  // ==========================================
  const s4Start = Date.now();
  const contradiction = crossSenseAnalysis.contradiction;
  const stage4Passed =
    contradiction.detected &&
    (contradiction.severity === 'CRITICAL' || contradiction.severity === 'HIGH') &&
    contradiction.conflictingModalities.includes('VOICE') &&
    contradiction.conflictingModalities.includes('SENSOR');

  steps.push({
    step: 'CONTRADICTION',
    stepName: '4. Contradiction Detection',
    passed: stage4Passed,
    durationMs: Date.now() - s4Start,
    data: contradiction,
    summary: `Cognitive contradiction detected: ${contradiction.summary} (Human: Normal vs. Machine Consensus: Critical).`,
  });

  // ==========================================
  // STAGE 5: RISK (Risk Engine)
  // ==========================================
  const s5Start = Date.now();
  const stage5Passed =
    crossSenseAnalysis.overallRiskScore >= 80 && crossSenseAnalysis.riskLevel === 'CRITICAL';

  steps.push({
    step: 'RISK',
    stepName: '5. Multi-Modal Risk Calculation',
    passed: stage5Passed,
    durationMs: Date.now() - s5Start,
    data: {
      overallRiskScore: crossSenseAnalysis.overallRiskScore,
      riskLevel: crossSenseAnalysis.riskLevel,
    },
    summary: `Calculated asset risk score of ${crossSenseAnalysis.overallRiskScore}/100 (Level: ${crossSenseAnalysis.riskLevel}) with contradiction escalation.`,
  });

  // ==========================================
  // STAGE 6: ROOT CAUSE (Root Cause Engine)
  // ==========================================
  const s6Start = Date.now();
  const primaryRootCause = crossSenseAnalysis.rootCauses[0];
  const stage6Passed =
    primaryRootCause &&
    primaryRootCause.cause.includes('Bearing') &&
    primaryRootCause.probability >= 80;

  steps.push({
    step: 'ROOT_CAUSE',
    stepName: '6. Root Cause Diagnostics',
    passed: stage6Passed,
    durationMs: Date.now() - s6Start,
    data: {
      primaryCause: primaryRootCause,
      allCandidates: crossSenseAnalysis.rootCauses,
    },
    summary: `Diagnosed root cause: "${primaryRootCause.cause}" with ${primaryRootCause.probability}% probability.`,
  });

  // ==========================================
  // STAGE 7: ACTION (Action Engine)
  // ==========================================
  const s7Start = Date.now();
  const incidentResult = executeAutonomousAction('CREATE_INCIDENT', machine.id, {
    title: `Autonomous Critical Bearing Incident on ${machine.id}`,
    severity: 'CRITICAL',
    technician: 'Sarah Chen (Lead Reliability Engineer)',
  });

  const loadReduceResult = executeAutonomousAction('REDUCE_MACHINE_LOAD', machine.id);
  const notifyResult = executeAutonomousAction('NOTIFY_TECHNICIAN', machine.id, {
    technician: 'Sarah Chen (Lead Reliability Engineer)',
  });

  const verInit = startVerification(
    machine.id,
    incidentResult.incident?.id,
    { ...machine.currentTelemetry },
    crossSenseAnalysis.overallRiskScore
  );

  const stage7Passed =
    incidentResult.success &&
    loadReduceResult.success &&
    notifyResult.success &&
    (machine.status as string) === 'MITIGATION_ACTIVE';

  steps.push({
    step: 'ACTION',
    stepName: '7. Autonomous Action Execution',
    passed: stage7Passed,
    durationMs: Date.now() - s7Start,
    data: {
      incident: incidentResult.incident,
      loadReduce: loadReduceResult.action,
      verificationStarted: verInit,
    },
    summary: `Autonomous actions dispatched: Incident ${incidentResult.incident?.id} created, VFD throttled to 980 RPM, technician notified.`,
  });

  // ==========================================
  // STAGE 8: VERIFICATION (Verification Engine)
  // ==========================================
  const s8Start = Date.now();
  const verComplete = completeVerification(
    machine.id,
    { ...DETERMINISTIC_DATASET.mitigated.telemetry, timestamp: Date.now() },
    DETERMINISTIC_DATASET.mitigated.riskScore
  );

  const stage8Passed =
    verComplete.isVerified &&
    verComplete.record.status === 'SUCCESSFUL' &&
    verComplete.vibrationReductionPct > 35 &&
    verComplete.riskReductionPct > 50 &&
    machine.status === 'NORMAL';

  steps.push({
    step: 'VERIFICATION',
    stepName: '8. Closed-Loop Mitigation Verification',
    passed: stage8Passed,
    durationMs: Date.now() - s8Start,
    data: verComplete,
    summary: verComplete.summary,
  });

  const allPassed = steps.every((s) => s.passed);

  return {
    timestamp: tStart,
    machineId: machine.id,
    machineName: machine.name,
    flowSteps: steps,
    isSuccess: allPassed,
    overallSummary: allPassed
      ? `COMPLETE FLOW TEST PASSED (8/8 Stages Verified): NORMAL → ANOMALY → CROSS-SENSE → CONTRADICTION → RISK → ROOT CAUSE → ACTION → VERIFICATION successfully executed in ${Date.now() - tStart}ms.`
      : `COMPLETE FLOW TEST ENCOUNTERED FAILURES in ${steps.filter((s) => !s.passed).length} stages.`,
  };
}
