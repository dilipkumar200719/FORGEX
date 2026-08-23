import { state, addTimelineEvent } from '../state.js';
import { AutonomousAction, Incident, Machine } from '../types.js';
import { runCrossSenseFusion } from './crossSenseEngine.js';

export interface ActionExecutionResult {
  action: AutonomousAction;
  incident?: Incident;
  machine: Machine;
  success: boolean;
  message: string;
}

/**
 * 7. ACTION ENGINE
 * Autonomous closed-loop edge action orchestrator and dispatch controller.
 */
export function executeAutonomousAction(
  actionType: AutonomousAction['type'],
  machineId: string,
  params: Record<string, any> = {}
): ActionExecutionResult {
  const machine = state.machines.find((m) => m.id === machineId);
  if (!machine) {
    throw new Error(`ActionEngine Error: Machine ${machineId} not found`);
  }

  const actionId = `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const timestamp = Date.now();

  let incident: Incident | undefined;
  let message = `Action ${actionType} executed successfully.`;

  switch (actionType) {
    case 'CREATE_INCIDENT': {
      const existingOpen = state.incidents.find(
        (i) =>
          i.machineId === machineId &&
          (i.status === 'OPEN' ||
            i.status === 'INVESTIGATING' ||
            i.status === 'MITIGATION_ACTIVE')
      );

      if (existingOpen) {
        incident = existingOpen;
        message = `Existing incident ${existingOpen.id} updated.`;
      } else {
        const analysis =
          state.latestAnalysis[machineId] ||
          runCrossSenseFusion(machine, state.systemWeights);

        const newInc: Incident = {
          id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
          machineId: machine.id,
          machineName: machine.name,
          title:
            params.title ||
            `Autonomous Anomaly Incident on ${machine.id} (${machine.name})`,
          severity: (params.severity || analysis.riskLevel) as any,
          status: 'OPEN',
          createdAt: timestamp,
          updatedAt: timestamp,
          rootCause: analysis.rootCauses[0]?.cause || 'Bearing Race Degradation',
          rootCauseProbability: analysis.rootCauses[0]?.probability || 87,
          confidenceScore: analysis.crossSenseConfidence || 94.2,
          contradictionDetected: analysis.contradiction?.detected || false,
          assignedTechnician:
            params.technician || 'Sarah Chen (Lead Reliability Engineer)',
          evidenceSummary: analysis.explainability.whyForgeXBelievesThis || [
            'Multi-channel telemetry spike detected',
            'Cross-modal anomaly confirmed',
          ],
          actionsTaken: [],
          notes: ['Incident autonomously instantiated by FORGE X Intelligence Layer.'],
        };

        state.incidents.unshift(newInc);
        incident = newInc;
        message = `New critical incident ${newInc.id} created and assigned to ${newInc.assignedTechnician}.`;

        addTimelineEvent({
          machineId,
          type: 'INCIDENT_CREATED',
          title: `Incident ${newInc.id} Created`,
          description: `Autonomous high-priority incident opened for ${machine.name}. Assigned to ${newInc.assignedTechnician}.`,
          badgeType: 'danger',
          metadata: { incidentId: newInc.id },
        });
      }
      break;
    }

    case 'REDUCE_MACHINE_LOAD': {
      machine.status = 'MITIGATION_ACTIVE';
      // Trigger simulation cooldown / load reduction in simulator
      state.simulationMode.isFailing = false;
      state.simulationMode.isMitigating = true;
      state.simulationMode.mitigationProgress = 0;

      message = 'Autonomous load de-rating activated: VFD throttled to 980 RPM (65% capacity).';

      addTimelineEvent({
        machineId,
        type: 'ACTION_EXECUTED',
        title: 'Autonomous Load De-rating Activated',
        description: `VFD speed throttled down to 980 RPM (65% nominal capacity). Thermal mitigation valves opened.`,
        badgeType: 'warning',
        metadata: { targetRpm: 980, targetLoad: '65%' },
      });

      // Update active incident if present
      const inc = state.incidents.find(
        (i) =>
          i.machineId === machineId &&
          (i.status === 'OPEN' || i.status === 'INVESTIGATING')
      );
      if (inc) {
        inc.status = 'MITIGATION_ACTIVE';
        inc.updatedAt = timestamp;
        incident = inc;
      }
      break;
    }

    case 'NOTIFY_TECHNICIAN': {
      const tech =
        params.technician || 'Sarah Chen (Lead Reliability Engineer)';
      message = `High-priority dispatch notification sent to ${tech}.`;

      addTimelineEvent({
        machineId,
        type: 'ACTION_EXECUTED',
        title: `Technician Dispatched: ${tech}`,
        description: `Urgent SMS, industrial telemetry beacon, and pager alert dispatched with vibration waterfall and optical proof.`,
        badgeType: 'info',
        metadata: { technician: tech },
      });
      break;
    }

    case 'START_MONITORING': {
      message = 'High-resolution 1000ms closed-loop verification stream engaged.';

      addTimelineEvent({
        machineId,
        type: 'VERIFICATION_STARTED',
        title: 'Verification Monitoring Loop Engaged',
        description: `High-resolution 1000ms telemetry sampling stream active to verify stabilization curve.`,
        badgeType: 'ai',
      });
      break;
    }

    case 'ESCALATE_RISK': {
      machine.status = 'CRITICAL';
      machine.riskLevel = 'CRITICAL';
      machine.riskScore = 95;
      message = 'Machine risk escalated to CRITICAL (95/100).';

      addTimelineEvent({
        machineId,
        type: 'RISK_CALCULATED',
        title: 'Asset Risk Escalated to CRITICAL (95/100)',
        description: 'Cross-modal threshold breached across sensor, optical, and historical layers.',
        badgeType: 'danger',
      });
      break;
    }
  }

  const action: AutonomousAction = {
    id: actionId,
    incidentId: incident?.id,
    machineId,
    timestamp,
    type: actionType,
    title: params.title || actionType.replace(/_/g, ' '),
    description: params.description || `Autonomous ${actionType} triggered by FORGE X.`,
    parameters: params,
    status: 'COMPLETED',
  };

  if (incident) {
    incident.actionsTaken.push(action);
  }

  return { action, incident, machine, success: true, message };
}
