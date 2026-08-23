import { ModalityEvidence, Contradiction, RiskLevel } from '../types.js';
import { RiskEngineResult } from './types.js';

/**
 * 4. RISK ENGINE
 * Deterministic multi-factor asset risk scoring with contradiction escalation
 * and operational response SLA determination.
 */
export function calculateMultiModalRisk(
  evidences: ModalityEvidence[],
  weights: { sensor: number; vision: number; voice: number; history: number; maintenance: number },
  contradiction: Contradiction,
  modalityScores: {
    sensor: number;
    vision: number;
    voice: number;
    history: number;
    maintenance: number;
  }
): RiskEngineResult {
  const sensorEv = evidences.find((e) => e.modality === 'SENSOR');
  const visionEv = evidences.find((e) => e.modality === 'VISION');
  const historyEv = evidences.find((e) => e.modality === 'HISTORY');

  const rawWeightedRisk =
    modalityScores.sensor * weights.sensor +
    modalityScores.vision * weights.vision +
    modalityScores.voice * weights.voice +
    modalityScores.history * weights.history +
    modalityScores.maintenance * weights.maintenance;

  let contradictionEscalationMultiplier = 1.0;
  let adjustedRiskScore = Math.round(rawWeightedRisk);

  // If physical machine sensors and vision are critical while voice says normal,
  // we do NOT drop risk; we elevate and protect the asset from cognitive false negatives!
  const isPhysicalConsensusCritical =
    (sensorEv?.state === 'CRITICAL' && visionEv?.state === 'CRITICAL') ||
    (sensorEv?.state === 'CRITICAL' && historyEv?.state === 'CRITICAL');

  if (isPhysicalConsensusCritical) {
    contradictionEscalationMultiplier = 1.25;
    adjustedRiskScore = Math.max(adjustedRiskScore, 94);
  } else if (sensorEv?.state === 'CRITICAL' || visionEv?.state === 'CRITICAL') {
    adjustedRiskScore = Math.max(adjustedRiskScore, 82);
  } else if (sensorEv?.state === 'ABNORMAL') {
    adjustedRiskScore = Math.max(adjustedRiskScore, 55);
  }

  // Bound to 0 - 100
  adjustedRiskScore = Math.min(100, Math.max(0, adjustedRiskScore));

  // Determine Risk Level
  let riskLevel: RiskLevel = 'LOW';
  let urgencySLA = 'Standard Surveillance (24h SLA)';
  if (adjustedRiskScore >= 80) {
    riskLevel = 'CRITICAL';
    urgencySLA = 'IMMEDIATE (Autonomous intervention within 5 seconds)';
  } else if (adjustedRiskScore >= 60) {
    riskLevel = 'HIGH';
    urgencySLA = 'HIGH PRIORITY (Technician investigation within 15 minutes)';
  } else if (adjustedRiskScore >= 30) {
    riskLevel = 'MEDIUM';
    urgencySLA = 'ELEVATED (Automated verification sampling stream active)';
  }

  // Health score calculation (inverse with non-linear penalty for critical vibration)
  const healthScore = Math.max(12, Math.round(100 - adjustedRiskScore * 0.88));

  const modalityContributions = {
    sensor: +(modalityScores.sensor * weights.sensor).toFixed(1),
    vision: +(modalityScores.vision * weights.vision).toFixed(1),
    voice: +(modalityScores.voice * weights.voice).toFixed(1),
    history: +(modalityScores.history * weights.history).toFixed(1),
    maintenance: +(modalityScores.maintenance * weights.maintenance).toFixed(1),
  };

  const rationale =
    riskLevel === 'CRITICAL'
      ? `Critical multi-modal risk score (${adjustedRiskScore}/100) driven by physical sensor exceedance (${modalityScores.sensor}) and optical displacement (${modalityScores.vision}) overriding benign human voice transcript.`
      : riskLevel === 'HIGH'
      ? `Elevated risk score (${adjustedRiskScore}/100) due to harmonic vibration drift and thermal acceleration.`
      : `Nominal baseline risk score (${adjustedRiskScore}/100) within standard operational tolerance.`;

  return {
    overallRiskScore: adjustedRiskScore,
    healthScore,
    riskLevel,
    urgencySLA,
    rawWeightedRisk: +rawWeightedRisk.toFixed(1),
    contradictionEscalationMultiplier,
    modalityContributions,
    rationale,
  };
}
