import { state } from './server/state.js';
import {
  detectSensorAnomalies,
  evaluateContradictions,
  calculateMultiModalRisk,
  diagnoseRootCauses,
  generateExplanation,
  executeAutonomousAction,
  startVerification,
  completeVerification,
  runCrossSenseFusion,
  runDeterministicEndToEndTest,
  DETERMINISTIC_DATASET,
} from './server/intelligence/index.js';

console.log('========================================================================');
console.log('🚀 FORGE X INTELLIGENCE LAYER: COMPREHENSIVE 8-ENGINE VALIDATION SUITE');
console.log('========================================================================\n');

const testMachine = state.machines.find((m) => m.id === 'PUMP-042') || state.machines[0];
let passedCount = 0;
let totalTests = 9;

function assert(condition: boolean, label: string, details?: any) {
  if (condition) {
    passedCount++;
    console.log(`✅ [PASS] ${label}`);
    if (details) console.log(`   ↳ ${JSON.stringify(details)}`);
  } else {
    console.error(`❌ [FAIL] ${label}`);
    if (details) console.error(`   ↳ ${JSON.stringify(details)}`);
  }
}

// -------------------------------------------------------------
// TEST 1: Sensor Anomaly Detection Engine
// -------------------------------------------------------------
console.log('\n--- 1. Testing Sensor Anomaly Detection Engine ---');
const normalAnomaly = detectSensorAnomalies(testMachine, DETERMINISTIC_DATASET.baseline.telemetry);
assert(!normalAnomaly.hasAnomaly && normalAnomaly.severity === 'NORMAL', 'Baseline normal telemetry produces severity=NORMAL', {
  vibration: normalAnomaly.metrics.vibration.currentValue,
  excessRatio: normalAnomaly.metrics.vibration.excessPercentage,
});

const criticalAnomaly = detectSensorAnomalies(testMachine, DETERMINISTIC_DATASET.anomaly.telemetry);
assert(
  criticalAnomaly.hasAnomaly &&
    criticalAnomaly.severity === 'CRITICAL' &&
    criticalAnomaly.harmonicVibrationSpike &&
    criticalAnomaly.sensorRiskScore >= 90,
  'Failure telemetry produces severity=CRITICAL with harmonic vibration spike',
  {
    sensorRiskScore: criticalAnomaly.sensorRiskScore,
    vibrationExcess: criticalAnomaly.metrics.vibration.excessPercentage + '%',
    harmonicSpike: criticalAnomaly.harmonicVibrationSpike,
  }
);

// -------------------------------------------------------------
// TEST 2: CrossSenseEngine (5-Modality Weighted Fusion)
// -------------------------------------------------------------
console.log('\n--- 2. Testing CrossSenseEngine ---');
testMachine.currentTelemetry = { ...DETERMINISTIC_DATASET.anomaly.telemetry };
const crossSenseResult = runCrossSenseFusion(testMachine, state.systemWeights, {
  vision: DETERMINISTIC_DATASET.vision,
  voice: DETERMINISTIC_DATASET.voice,
});
assert(
  crossSenseResult.evidences.length === 5 && crossSenseResult.crossSenseConfidence >= 90,
  'Fused 5 modalities with high cross-sense confidence (>=90%)',
  {
    modalitiesCount: crossSenseResult.evidences.length,
    confidence: crossSenseResult.crossSenseConfidence + '%',
  }
);

// -------------------------------------------------------------
// TEST 3: ContradictionEngine (Human vs Multi-Machine Consensus)
// -------------------------------------------------------------
console.log('\n--- 3. Testing ContradictionEngine ---');
const contradiction = evaluateContradictions(crossSenseResult.evidences, DETERMINISTIC_DATASET.voice);
assert(
  contradiction.detected &&
    (contradiction.severity === 'CRITICAL' || contradiction.severity === 'HIGH') &&
    contradiction.conflictingModalities.includes('VOICE') &&
    contradiction.conflictingModalities.includes('SENSOR'),
  'Detected human on-site false negative vs. 3+ physical machine modalities',
  {
    detected: contradiction.detected,
    severity: contradiction.severity,
    conflicting: contradiction.conflictingModalities,
    summary: contradiction.summary,
  }
);

// -------------------------------------------------------------
// TEST 4: RiskEngine (Multi-Factor Scoring with Escalation)
// -------------------------------------------------------------
console.log('\n--- 4. Testing RiskEngine ---');
assert(
  crossSenseResult.overallRiskScore >= 85 && crossSenseResult.riskLevel === 'CRITICAL',
  'Calculated multi-modal risk score >= 85 and riskLevel=CRITICAL with contradiction escalation',
  {
    riskScore: crossSenseResult.overallRiskScore,
    riskLevel: crossSenseResult.riskLevel,
  }
);

// -------------------------------------------------------------
// TEST 5: RootCauseEngine (Multi-Hypothesis Bayesian Inference)
// -------------------------------------------------------------
console.log('\n--- 5. Testing RootCauseEngine ---');
const rootCauses = crossSenseResult.rootCauses;
const primaryCause = rootCauses[0];
assert(
  primaryCause &&
    primaryCause.cause.includes('Bearing') &&
    primaryCause.probability >= 80 &&
    rootCauses.length >= 3,
  'Identified primary root cause "Bearing Race Degradation" with probability >= 80%',
  {
    primaryCause: primaryCause.cause,
    probability: primaryCause.probability + '%',
    candidatesCount: rootCauses.length,
  }
);

// -------------------------------------------------------------
// TEST 6: Evidence & Explanation Engine (XAI Justification)
// -------------------------------------------------------------
console.log('\n--- 6. Testing Evidence & Explanation Engine ---');
const xai = crossSenseResult.explainability;
assert(
  xai.whatHappened.length > 0 &&
    xai.whyForgeXBelievesThis.length >= 2 &&
    xai.contradictorySignals.length >= 1 &&
    xai.confidenceRationale.length > 0 &&
    xai.actionJustification.length > 0,
  'Generated complete Explainable AI rationale with evidence bullets and contradiction breakdown',
  {
    whyCount: xai.whyForgeXBelievesThis.length,
    contradictoryCount: xai.contradictorySignals.length,
  }
);

// -------------------------------------------------------------
// TEST 7: ActionEngine (Autonomous Edge Dispatch)
// -------------------------------------------------------------
console.log('\n--- 7. Testing ActionEngine ---');
const actionExec = executeAutonomousAction('REDUCE_MACHINE_LOAD', testMachine.id);
const incidentExec = executeAutonomousAction('CREATE_INCIDENT', testMachine.id, {
  title: 'Critical Bearing Degradation Emergency',
  severity: 'CRITICAL',
});
assert(
  actionExec.success &&
    incidentExec.success &&
    testMachine.status === 'MITIGATION_ACTIVE' &&
    incidentExec.incident !== undefined,
  'Executed autonomous load reduction and instantiated incident ticket',
  {
    machineStatus: testMachine.status,
    incidentId: incidentExec.incident?.id,
  }
);

// -------------------------------------------------------------
// TEST 8: VerificationEngine (Closed-Loop Telemetry Delta Validation)
// -------------------------------------------------------------
console.log('\n--- 8. Testing VerificationEngine ---');
startVerification(testMachine.id, incidentExec.incident?.id, DETERMINISTIC_DATASET.anomaly.telemetry, 95);
const verificationResult = completeVerification(
  testMachine.id,
  DETERMINISTIC_DATASET.mitigated.telemetry,
  DETERMINISTIC_DATASET.mitigated.riskScore
);
assert(
  verificationResult.isVerified &&
    verificationResult.record.status === 'SUCCESSFUL' &&
    verificationResult.vibrationReductionPct > 35 &&
    verificationResult.riskReductionPct > 50 &&
    testMachine.status === 'NORMAL',
  'Verified post-mitigation stabilization: Vibration reduced >35%, Risk dropped >50%, Machine restored to NORMAL',
  {
    status: verificationResult.record.status,
    vibrationReduction: verificationResult.vibrationReductionPct + '%',
    riskReduction: verificationResult.riskReductionPct + '%',
  }
);

// -------------------------------------------------------------
// INTEGRATED PIPELINE END-TO-END FLOW RUNNER
// -------------------------------------------------------------
console.log('\n========================================================================');
console.log('🔄 EXECUTING COMPLETE END-TO-END FLOW (NORMAL → VERIFICATION)');
console.log('========================================================================\n');

const fullReport = runDeterministicEndToEndTest('PUMP-042');
console.log(`Flow Outcome: ${fullReport.isSuccess ? 'SUCCESS' : 'FAILED'}`);
console.log(`Summary: ${fullReport.overallSummary}\n`);
fullReport.flowSteps.forEach((s) => {
  console.log(`  [${s.passed ? 'PASS' : 'FAIL'}] ${s.stepName} (${s.durationMs}ms)`);
  console.log(`         ↳ ${s.summary}`);
});

console.log('\n========================================================================');
console.log(`FINAL RESULT: ${passedCount}/${totalTests} Core Intelligence Unit Tests Passed. End-to-End Pipeline: ${fullReport.isSuccess ? '100% OPERATIONAL' : 'FAILED'}`);
console.log('========================================================================\n');

if (!fullReport.isSuccess || passedCount !== totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}
