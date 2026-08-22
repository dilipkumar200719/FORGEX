import { state, addTimelineEvent } from './state.js';
import { VerificationRecord, TelemetryPoint } from './types.js';

export function startVerification(
  machineId: string,
  incidentId?: string,
  beforeTelemetry?: TelemetryPoint,
  beforeRiskScore: number = 94
): VerificationRecord {
  const machine = state.machines.find((m) => m.id === machineId);
  if (!machine) throw new Error(`Machine ${machineId} not found`);

  const vId = `VER-${Date.now()}`;
  const initialTel = beforeTelemetry || { ...machine.currentTelemetry };

  const record: VerificationRecord = {
    id: vId,
    incidentId: incidentId || `INC-AUTONOMOUS-${machineId}`,
    machineId,
    startTime: Date.now(),
    status: 'IN_PROGRESS',
    beforeTelemetry: initialTel,
    beforeRiskScore: beforeRiskScore || machine.riskScore || 94,
    summary: 'Verification monitoring active. Evaluating post-mitigation stabilization curve.',
    telemetryStream: [initialTel],
  };

  state.verifications[machineId] = record;

  addTimelineEvent({
    machineId,
    type: 'VERIFICATION_STARTED',
    title: 'Closed-Loop Verification Active',
    description: `Tracking telemetry normalization. Target vibration < 11 mm/s, risk score < 45.`,
    badgeType: 'ai',
  });

  return record;
}

export function completeVerification(
  machineId: string,
  afterTelemetry?: TelemetryPoint,
  afterRiskScore: number = 39
): VerificationRecord {
  const machine = state.machines.find((m) => m.id === machineId);
  if (!machine) throw new Error(`Machine ${machineId} not found`);

  let record = state.verifications[machineId];
  const finalTel = afterTelemetry || { ...machine.currentTelemetry };

  if (!record) {
    record = {
      id: `VER-${Date.now()}`,
      incidentId: `INC-2026-AUTO`,
      machineId,
      startTime: Date.now() - 15000,
      status: 'IN_PROGRESS',
      beforeTelemetry: {
        timestamp: Date.now() - 15000,
        temperature: 87.5,
        vibration: 18.4,
        current: 8.9,
        pressure: 7.6,
        rpm: 1485,
      },
      beforeRiskScore: 94,
      summary: 'Mitigation completed.',
      telemetryStream: [],
    };
  }

  record.completedTime = Date.now();
  record.afterTelemetry = finalTel;
  record.afterRiskScore = afterRiskScore;

  const vibBefore = record.beforeTelemetry.vibration;
  const vibAfter = finalTel.vibration;
  const tempBefore = record.beforeTelemetry.temperature;
  const tempAfter = finalTel.temperature;
  const riskBefore = record.beforeRiskScore;
  const riskAfter = afterRiskScore;

  const vibRed = Math.max(0, ((vibBefore - vibAfter) / vibBefore) * 100);
  const tempRed = Math.max(0, ((tempBefore - tempAfter) / tempBefore) * 100);
  const riskRed = Math.max(0, ((riskBefore - riskAfter) / riskBefore) * 100);

  record.vibrationReductionPct = +vibRed.toFixed(1);
  record.temperatureReductionPct = +tempRed.toFixed(1);
  record.riskReductionPct = +riskRed.toFixed(1);

  if (vibAfter <= 11.5 && riskAfter <= 45) {
    record.status = 'SUCCESSFUL';
    record.summary = `MITIGATION VERIFIED: Vibration reduced ${vibBefore.toFixed(1)} → ${vibAfter.toFixed(1)} mm/s (-${vibRed.toFixed(1)}%). Risk score dropped ${riskBefore} → ${riskAfter} (-${riskRed.toFixed(1)}%).`;
  } else if (vibAfter < vibBefore) {
    record.status = 'PARTIALLY_SUCCESSFUL';
    record.summary = `PARTIAL MITIGATION: Telemetry improving but exceeds normal envelope. Vibration ${vibBefore.toFixed(1)} → ${vibAfter.toFixed(1)} mm/s.`;
  } else {
    record.status = 'FAILED';
    record.summary = `MITIGATION INEFFECTIVE: Telemetry remains critical. Immediate manual physical isolation required.`;
  }

  // Update Machine state
  machine.status = 'NORMAL';
  machine.healthScore = 86;
  machine.riskScore = afterRiskScore;
  machine.riskLevel = afterRiskScore < 40 ? 'LOW' : 'MEDIUM';

  machine.mitigationHistory.unshift({
    id: `MIT-${Date.now()}`,
    timestamp: Date.now(),
    action: 'Autonomous Load De-rating to 980 RPM',
    triggerReason: 'Multi-Modal Bearing Race Degradation & Contradiction Alert',
    beforeVibration: +vibBefore.toFixed(2),
    afterVibration: +vibAfter.toFixed(2),
    result: record.status as any,
  });

  // Update Incident if any
  const inc = state.incidents.find(
    (i) => i.machineId === machineId && (i.status === 'MITIGATION_ACTIVE' || i.status === 'INVESTIGATING' || i.status === 'OPEN')
  );
  if (inc) {
    inc.status = 'VERIFIED';
    inc.updatedAt = Date.now();
    inc.verificationResult = record;
  }

  state.verifications[machineId] = record;

  addTimelineEvent({
    machineId,
    type: 'MITIGATION_VERIFIED',
    title: 'MITIGATION VERIFIED: Outcome Confirmed',
    description: record.summary,
    badgeType: 'success',
    metadata: {
      vibrationBefore: vibBefore,
      vibrationAfter: vibAfter,
      riskBefore,
      riskAfter,
      status: record.status,
    },
  });

  return record;
}
