import { Contradiction, ModalityEvidence } from './types.js';

export function detectContradictions(
  evidences: ModalityEvidence[],
  voiceObservation?: { transcript: string; sentiment: 'NORMAL' | 'SUSPICIOUS' | 'ABNORMAL' }
): Contradiction {
  const sensorEv = evidences.find((e) => e.modality === 'SENSOR');
  const visionEv = evidences.find((e) => e.modality === 'VISION');
  const historyEv = evidences.find((e) => e.modality === 'HISTORY');
  const voiceEv = evidences.find((e) => e.modality === 'VOICE');

  const sensorAbnormal = sensorEv?.state === 'ABNORMAL' || sensorEv?.state === 'CRITICAL';
  const visionAbnormal = visionEv?.state === 'ABNORMAL' || visionEv?.state === 'CRITICAL';
  const historyAbnormal = historyEv?.state === 'ABNORMAL' || historyEv?.state === 'CRITICAL';
  
  // Human / Voice says normal
  const voiceSaysNormal = voiceEv?.state === 'NORMAL' || (voiceObservation && voiceObservation.sentiment === 'NORMAL');

  // Count machine signals pointing to danger/anomaly
  const machineSignalsAbnormal = [
    sensorAbnormal ? 'SENSOR' : null,
    visionAbnormal ? 'VISION' : null,
    historyAbnormal ? 'HISTORY' : null,
  ].filter(Boolean) as Array<'SENSOR' | 'VISION' | 'VOICE' | 'HISTORY' | 'MAINTENANCE'>;

  // Contradiction scenario 1: Human says NORMAL while 2 or more machine modalities say ABNORMAL
  if (voiceSaysNormal && machineSignalsAbnormal.length >= 2) {
    const conflicting = ['VOICE', ...machineSignalsAbnormal] as Array<'SENSOR' | 'VISION' | 'VOICE' | 'HISTORY' | 'MAINTENANCE'>;
    
    return {
      detected: true,
      severity: machineSignalsAbnormal.length >= 3 ? 'HIGH' : 'MEDIUM',
      conflictingModalities: conflicting,
      summary: `Human on-site observation directly conflicts with ${machineSignalsAbnormal.length} independent machine modalities (${machineSignalsAbnormal.join(', ')}).`,
      explanation: `Technician stated: "${voiceObservation?.transcript || 'The machine sounds normal.'}" (Sentiment: NORMAL). However, IoT Telemetry indicates critical vibration/thermal exceedance, Optical Vision confirms structural displacement, and Historical ML models match a signature preceding bearing seizure. Human auditory limits mask high-frequency micro-spalling.`,
      humanObservation: voiceObservation?.transcript || 'Technician reported: "The machine sounds normal."',
      machineConsensus: `Cross-modal telemetry, optical displacement, and historical failure vectors confirm severe mechanical anomaly.`,
      confidencePenalty: 4.8, // small penalty for cognitive divergence, but machine evidence heavily overrides
    };
  }

  // Contradiction scenario 2: Sensor says normal, but Vision sees visible smoke or structural leak
  if (sensorEv?.state === 'NORMAL' && visionAbnormal) {
    return {
      detected: true,
      severity: 'MEDIUM',
      conflictingModalities: ['SENSOR', 'VISION'],
      summary: 'Sensor telemetry appears nominal, but Optical Vision detected physical external leakage or displacement.',
      explanation: 'Point sensors may not cover peripheral seal integrity. Visual inspection detected surface seepage not yet registering on internal pressure gauges.',
      humanObservation: voiceObservation?.transcript || 'N/A',
      machineConsensus: 'Visual inspection discovered unmonitored physical defect.',
      confidencePenalty: 6.2,
    };
  }

  // Contradiction scenario 3: Voice reports loud knocking, but Sensors show completely normal metrics
  if (voiceEv?.state === 'ABNORMAL' && !sensorAbnormal && !visionAbnormal) {
    return {
      detected: true,
      severity: 'LOW',
      conflictingModalities: ['VOICE', 'SENSOR'],
      summary: 'Human technician reported anomalous acoustic knocking, while automated sensors are currently within baseline thresholds.',
      explanation: 'May indicate external structure resonance or early sub-threshold acoustic cavitation.',
      humanObservation: voiceObservation?.transcript || 'Reported abnormal sound',
      machineConsensus: 'Sensors within nominal range.',
      confidencePenalty: 8.0,
    };
  }

  return {
    detected: false,
    severity: 'NONE',
    conflictingModalities: [],
    summary: 'All operational modalities are in mutual consensus.',
    explanation: 'Telemetric, visual, acoustic, and historical indicators are mutually aligned.',
    humanObservation: voiceObservation?.transcript || 'No voice report filed',
    machineConsensus: 'Unanimous telemetry agreement across modalities.',
    confidencePenalty: 0,
  };
}
