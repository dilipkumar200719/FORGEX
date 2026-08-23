import { Contradiction, ModalityEvidence } from '../types.js';

export interface ContradictionEvaluationInput {
  evidences: ModalityEvidence[];
  voiceObservation?: {
    transcript: string;
    sentiment: 'NORMAL' | 'SUSPICIOUS' | 'ABNORMAL';
    confidence?: number;
  };
  sensorAbnormal: boolean;
  visionAbnormal: boolean;
  historyAbnormal: boolean;
  maintenanceAbnormal: boolean;
}

/**
 * 3. CONTRADICTION ENGINE
 * Detects epistemic and cognitive divergence between human observation and
 * multi-modal physical sensor/vision/historical consensus.
 */
export function evaluateContradictions(
  evidences: ModalityEvidence[],
  voiceObservation?: {
    transcript: string;
    sentiment: 'NORMAL' | 'SUSPICIOUS' | 'ABNORMAL';
    confidence?: number;
  }
): Contradiction {
  const sensorEv = evidences.find((e) => e.modality === 'SENSOR');
  const visionEv = evidences.find((e) => e.modality === 'VISION');
  const historyEv = evidences.find((e) => e.modality === 'HISTORY');
  const voiceEv = evidences.find((e) => e.modality === 'VOICE');
  const maintenanceEv = evidences.find((e) => e.modality === 'MAINTENANCE');

  const sensorAbnormal = sensorEv?.state === 'ABNORMAL' || sensorEv?.state === 'CRITICAL';
  const visionAbnormal = visionEv?.state === 'ABNORMAL' || visionEv?.state === 'CRITICAL';
  const historyAbnormal = historyEv?.state === 'ABNORMAL' || historyEv?.state === 'CRITICAL';
  const maintenanceAbnormal = maintenanceEv?.state === 'ABNORMAL' || maintenanceEv?.state === 'CRITICAL';

  // Human / Voice says normal
  const voiceSaysNormal =
    voiceEv?.state === 'NORMAL' || (voiceObservation && voiceObservation.sentiment === 'NORMAL');

  // Machine physical streams pointing to anomaly
  const machineSignalsAbnormal: Array<'SENSOR' | 'VISION' | 'VOICE' | 'HISTORY' | 'MAINTENANCE'> = [];
  if (sensorAbnormal) machineSignalsAbnormal.push('SENSOR');
  if (visionAbnormal) machineSignalsAbnormal.push('VISION');
  if (historyAbnormal) machineSignalsAbnormal.push('HISTORY');
  if (maintenanceAbnormal) machineSignalsAbnormal.push('MAINTENANCE');

  // Scenario 1: PRIMARY CONTRADICTION - Human says NORMAL while 2+ Machine Modalities confirm CRITICAL Anomaly
  if (voiceSaysNormal && machineSignalsAbnormal.length >= 2) {
    const conflicting: Array<'SENSOR' | 'VISION' | 'VOICE' | 'HISTORY' | 'MAINTENANCE'> = ['VOICE', ...machineSignalsAbnormal];
    const isSevere = machineSignalsAbnormal.length >= 3 || (sensorAbnormal && visionAbnormal);

    const humanTranscript = voiceObservation?.transcript || voiceEv?.sourceData?.transcript || 'The machine sounds normal.';

    return {
      detected: true,
      severity: isSevere ? 'CRITICAL' : 'HIGH',
      conflictingModalities: conflicting,
      summary: `Human on-site observation directly conflicts with ${machineSignalsAbnormal.length} independent machine modalities (${machineSignalsAbnormal.join(', ')}).`,
      explanation: `Technician stated: "${humanTranscript}" (Sentiment: NORMAL). However, IoT Telemetry indicates critical vibration/thermal exceedance, Optical Vision confirms structural shaft oscillation, and Historical ML models match a signature preceding bearing seizure. Human auditory limits mask ultrasonic bearing raceway micro-spalling.`,
      humanObservation: `Technician reported: "${humanTranscript}"`,
      machineConsensus: `Cross-modal telemetry (${sensorEv?.state}), optical tracking (${visionEv?.state}), and historical failure vectors (${historyEv?.state}) confirm severe mechanical anomaly.`,
      confidencePenalty: 4.8, // Cognitive divergence penalty; machine evidence decisively overrides human false-negative
    };
  }

  // Scenario 2: Optical Anomaly with Nominal Point Sensors (Peripheral Seal Leak)
  if (sensorEv?.state === 'NORMAL' && visionAbnormal) {
    return {
      detected: true,
      severity: 'MEDIUM',
      conflictingModalities: ['SENSOR', 'VISION'],
      summary: 'Sensor telemetry appears nominal, but Optical Vision detected physical external leakage or displacement.',
      explanation: 'Point sensors may not cover peripheral seal housing integrity. Optical thermal/vision inspection detected surface fluid seepage not yet registering on internal pressure gauges.',
      humanObservation: voiceObservation?.transcript || 'N/A',
      machineConsensus: 'Visual inspection discovered unmonitored physical defect on exterior casing.',
      confidencePenalty: 6.2,
    };
  }

  // Scenario 3: Human reports anomalous sound/knocking but automated sensors are currently nominal
  if (voiceEv?.state === 'ABNORMAL' && !sensorAbnormal && !visionAbnormal) {
    return {
      detected: true,
      severity: 'LOW',
      conflictingModalities: ['VOICE', 'SENSOR'],
      summary: 'Human technician reported anomalous acoustic knocking, while automated sensors are currently within baseline thresholds.',
      explanation: 'May indicate sub-threshold acoustic cavitation or early stage structural resonance not yet triggering point sensor thresholds.',
      humanObservation: voiceObservation?.transcript || 'Reported abnormal sound',
      machineConsensus: 'Sensors within nominal range.',
      confidencePenalty: 8.0,
    };
  }

  // Scenario 4: Mutual Consensus
  return {
    detected: false,
    severity: 'NONE',
    conflictingModalities: [],
    summary: 'All operational modalities are in mutual consensus.',
    explanation: 'Telemetric, visual, acoustic, and historical indicators are mutually aligned.',
    humanObservation: voiceObservation?.transcript || 'Technician reports nominal operation.',
    machineConsensus: 'Unanimous telemetry agreement across modalities.',
    confidencePenalty: 0,
  };
}
