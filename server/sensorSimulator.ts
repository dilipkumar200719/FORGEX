import { state, addTimelineEvent } from './state.js';
import { runCrossSenseFusion } from './crossSenseEngine.js';
import { executeAutonomousAction } from './actionEngine.js';
import { startVerification, completeVerification } from './verificationEngine.js';

let intervalTimer: NodeJS.Timeout | null = null;
let demoStepTimer: NodeJS.Timeout | null = null;

export function initSensorSimulator(onTick?: (data: any) => void) {
  if (intervalTimer) clearInterval(intervalTimer);

  intervalTimer = setInterval(() => {
    tickSensors();
    if (onTick) {
      onTick({
        timestamp: Date.now(),
        machines: state.machines,
        simulationMode: state.simulationMode,
        demoScenario: {
          isRunning: state.demoScenario.isRunning,
          currentStepIndex: state.demoScenario.currentStepIndex,
        },
      });
    }
  }, 1000);
}

function tickSensors() {
  const sim = state.simulationMode;
  const targetMachineId = sim.activeMachineId || 'PUMP-042';

  state.machines.forEach((machine) => {
    const isTarget = machine.id === targetMachineId;
    const cur = { ...machine.currentTelemetry };
    const nr = machine.normalRanges;

    if (isTarget && sim.isFailing) {
      // Progress failure gradually from 0 to 100%
      sim.failProgress = Math.min(100, sim.failProgress + 4);
      const p = sim.failProgress / 100;

      // Gradually drift up to abnormal failure targets
      const targetTemp = 64.0 + p * (88.4 - 64.0) + (Math.random() * 0.8 - 0.4);
      const targetVib = 5.6 + p * (18.4 - 5.6) + (Math.random() * 0.6 - 0.3);
      const targetCurr = 6.4 + p * (8.9 - 6.4) + (Math.random() * 0.2 - 0.1);
      const targetPress = 6.1 + p * (7.6 - 6.1) + (Math.random() * 0.15 - 0.07);
      const targetRpm = Math.round(1475 + p * (1495 - 1475));

      cur.temperature = +targetTemp.toFixed(1);
      cur.vibration = +targetVib.toFixed(2);
      cur.current = +targetCurr.toFixed(2);
      cur.pressure = +targetPress.toFixed(2);
      cur.rpm = targetRpm;

      // Update machine risk & health
      machine.riskScore = Math.min(96, Math.round(12 + p * (94 - 12)));
      machine.healthScore = Math.max(14, Math.round(96 - p * (96 - 18)));
      if (machine.riskScore >= 80) {
        machine.status = 'CRITICAL';
        machine.riskLevel = 'CRITICAL';
      } else if (machine.riskScore >= 50) {
        machine.status = 'WARNING';
        machine.riskLevel = 'HIGH';
      }
    } else if (isTarget && sim.isMitigating) {
      // Progress mitigation recovery from 0 to 100%
      sim.mitigationProgress = Math.min(100, sim.mitigationProgress + 6);
      const p = sim.mitigationProgress / 100;

      // Recovery targets (load reduced to 980 RPM)
      const targetTemp = 88.4 - p * (88.4 - 66.8) + (Math.random() * 0.6 - 0.3);
      const targetVib = 18.4 - p * (18.4 - 10.7) + (Math.random() * 0.4 - 0.2);
      const targetCurr = 8.9 - p * (8.9 - 5.8) + (Math.random() * 0.2 - 0.1);
      const targetPress = 7.6 - p * (7.6 - 5.9) + (Math.random() * 0.1 - 0.05);
      const targetRpm = Math.round(1495 - p * (1495 - 980));

      cur.temperature = +targetTemp.toFixed(1);
      cur.vibration = +targetVib.toFixed(2);
      cur.current = +targetCurr.toFixed(2);
      cur.pressure = +targetPress.toFixed(2);
      cur.rpm = targetRpm;

      machine.riskScore = Math.max(38, Math.round(94 - p * (94 - 39)));
      machine.healthScore = Math.min(88, Math.round(18 + p * (86 - 18)));

      if (sim.mitigationProgress >= 100) {
        sim.isMitigating = false;
        completeVerification(machine.id, cur, machine.riskScore);
      }
    } else {
      // Normal minor stochastic fluctuation around baseline
      const baseTemp = (nr.temperature[0] + nr.temperature[1]) / 2;
      const baseVib = (nr.vibration[0] + nr.vibration[1]) / 2;
      const baseCurr = (nr.current[0] + nr.current[1]) / 2;
      const basePress = (nr.pressure[0] + nr.pressure[1]) / 2;
      const baseRpm = (nr.rpm[0] + nr.rpm[1]) / 2;

      cur.temperature = +(cur.temperature * 0.85 + (baseTemp + (Math.random() * 1.6 - 0.8)) * 0.15).toFixed(1);
      cur.vibration = +(cur.vibration * 0.85 + (baseVib + (Math.random() * 0.6 - 0.3)) * 0.15).toFixed(2);
      cur.current = +(cur.current * 0.85 + (baseCurr + (Math.random() * 0.3 - 0.15)) * 0.15).toFixed(2);
      cur.pressure = +(cur.pressure * 0.85 + (basePress + (Math.random() * 0.2 - 0.1)) * 0.15).toFixed(2);
      cur.rpm = Math.round(cur.rpm * 0.85 + (baseRpm + (Math.random() * 8 - 4)) * 0.15);
    }

    cur.timestamp = Date.now();
    machine.currentTelemetry = cur;
    machine.telemetryHistory.push(cur);
    if (machine.telemetryHistory.length > 50) {
      machine.telemetryHistory.shift();
    }

    // Refresh CrossSense Fusion analysis periodically
    state.latestAnalysis[machine.id] = runCrossSenseFusion(machine, state.systemWeights);
  });
}

export function triggerFailureSimulation(machineId: string = 'PUMP-042') {
  state.simulationMode = {
    activeMachineId: machineId,
    isFailing: true,
    failProgress: 0,
    isMitigating: false,
    mitigationProgress: 0,
  };

  const machine = state.machines.find((m) => m.id === machineId);
  if (machine) {
    machine.visionObservation = {
      timestamp: Date.now(),
      hasAnomaly: true,
      condition: 'Optical Motion Oscillation & Flange Fluid Spray',
      leakageDetected: true,
      vibrationObserved: true,
      confidence: 94,
      notes: 'Drive-end bearing collar displacement detected via optical analysis.',
    };
    machine.voiceObservation = {
      timestamp: Date.now(),
      transcript: 'The machine sounds normal.',
      sentiment: 'NORMAL',
      confidence: 89,
      source: 'On-site technician handheld radio',
    };
  }

  addTimelineEvent({
    machineId,
    type: 'SENSOR_ANOMALY',
    title: 'Failure Scenario Initiated on ' + machineId,
    description: 'Telemetry gradient diverging. Introducing bearing raceway friction simulation.',
    badgeType: 'warning',
  });
}

export function stopSimulation(machineId: string = 'PUMP-042') {
  state.simulationMode = {
    activeMachineId: null,
    isFailing: false,
    failProgress: 0,
    isMitigating: false,
    mitigationProgress: 0,
  };

  const machine = state.machines.find((m) => m.id === machineId);
  if (machine) {
    machine.status = 'NORMAL';
    machine.riskScore = 14;
    machine.healthScore = 95;
    machine.riskLevel = 'LOW';
    machine.currentTelemetry = {
      timestamp: Date.now(),
      temperature: 64.5,
      vibration: 5.4,
      current: 6.2,
      pressure: 6.0,
      rpm: 1475,
    };
    machine.visionObservation = undefined;
    machine.voiceObservation = undefined;
  }

  addTimelineEvent({
    machineId,
    type: 'SYSTEM_INFO',
    title: 'Simulation Reset to Normal Baseline',
    description: 'Telemetry normalized. Machine status restored to nominal.',
    badgeType: 'info',
  });
}

// 60-90 Second Automated Hackathon Demo Runner
export function runDemoScenario(machineId: string = 'PUMP-042') {
  stopDemoScenario();

  state.demoScenario.isRunning = true;
  state.demoScenario.currentStepIndex = 0;
  state.demoScenario.stepStartTime = Date.now();

  const machine = state.machines.find((m) => m.id === machineId) || state.machines[0];

  const steps = [
    // Step 0: Baseline Normal
    {
      name: 'Baseline Telemetry Sync',
      duration: 6000,
      action: () => {
        stopSimulation(machine.id);
        addTimelineEvent({
          machineId: machine.id,
          type: 'SYSTEM_INFO',
          title: 'Demo Step 1: Baseline Normal Operation',
          description: 'PUMP-042 telemetry nominal. Temperature 64.2°C, Vibration 5.6 mm/s.',
          badgeType: 'info',
        });
      },
    },
    // Step 1: Telemetry Anomaly
    {
      name: 'Simulate Failure & Telemetry Divergence',
      duration: 10000,
      action: () => {
        triggerFailureSimulation(machine.id);
        addTimelineEvent({
          machineId: machine.id,
          type: 'SENSOR_ANOMALY',
          title: 'Demo Step 2: Telemetry Anomaly Detected',
          description: 'Vibration increasing toward 18.4 mm/s (+220%). Housing temperature exceeding 85°C.',
          badgeType: 'warning',
        });
      },
    },
    // Step 2: Multimodal Vision
    {
      name: 'Optical Multimodal Vision Inspection',
      duration: 8000,
      action: () => {
        machine.visionObservation = {
          timestamp: Date.now(),
          hasAnomaly: true,
          condition: 'CRITICAL - Optical Displacement & Seal Seepage',
          leakageDetected: true,
          vibrationObserved: true,
          confidence: 94,
          notes: 'High-speed camera tracking identifies 2x shaft orbital runout and mechanical seal leakage.',
        };
        addTimelineEvent({
          machineId: machine.id,
          type: 'VISION_ANALYZED',
          title: 'Demo Step 3: Vision Analysis Completed',
          description: 'AI vision confirmed physical oscillation and seal leak at coupling flange.',
          badgeType: 'ai',
        });
      },
    },
    // Step 3: Voice Observation
    {
      name: 'Technician Voice Observation Ingested',
      duration: 8000,
      action: () => {
        machine.voiceObservation = {
          timestamp: Date.now(),
          transcript: 'The machine sounds normal.',
          sentiment: 'NORMAL',
          confidence: 88,
          source: 'Floor Technician Acoustic Check',
        };
        addTimelineEvent({
          machineId: machine.id,
          type: 'VOICE_OBSERVATION',
          title: 'Demo Step 4: Technician Audio Observation Received',
          description: 'Technician radioed: "The machine sounds normal." (Human ear unaware of ultrasonic race damage).',
          badgeType: 'info',
        });
      },
    },
    // Step 4: Cross-Modal Contradiction Detection
    {
      name: 'Cross-Sense Fusion & Contradiction Alert',
      duration: 10000,
      action: () => {
        const analysis = runCrossSenseFusion(machine, state.systemWeights);
        state.latestAnalysis[machine.id] = analysis;
        addTimelineEvent({
          machineId: machine.id,
          type: 'CONTRADICTION_DETECTED',
          title: 'Demo Step 5: Contradiction Detected! Confidence: 94.2%',
          description:
            'Voice (NORMAL) conflicts with Sensors (CRITICAL), Vision (CRITICAL), and History (CRITICAL). Machine consensus overrides human perception.',
          badgeType: 'danger',
        });
      },
    },
    // Step 5: Root Cause & Autonomous Incident Creation
    {
      name: 'Root Cause & Autonomous Incident Created',
      duration: 8000,
      action: () => {
        executeAutonomousAction('CREATE_INCIDENT', machine.id, {
          title: 'High-Priority Bearing Degradation & Seal Breach on PUMP-042',
          severity: 'CRITICAL',
          technician: 'Sarah Chen (Lead Reliability Engineer)',
        });
        executeAutonomousAction('NOTIFY_TECHNICIAN', machine.id, {
          technician: 'Sarah Chen (Lead Reliability Engineer)',
        });
      },
    },
    // Step 6: Autonomous Load Mitigation
    {
      name: 'Autonomous Load De-rating (980 RPM)',
      duration: 12000,
      action: () => {
        executeAutonomousAction('REDUCE_MACHINE_LOAD', machine.id);
        startVerification(machine.id, undefined, { ...machine.currentTelemetry }, 94);
      },
    },
    // Step 7: Closed-Loop Verification Confirmed
    {
      name: 'Verification Monitoring & Mitigation Confirmed',
      duration: 10000,
      action: () => {
        completeVerification(machine.id, {
          timestamp: Date.now(),
          temperature: 66.8,
          vibration: 10.7,
          current: 5.8,
          pressure: 5.9,
          rpm: 980,
        }, 39);
        state.demoScenario.isRunning = false;
      },
    },
  ];

  let currentIdx = 0;

  function executeNextStep() {
    if (currentIdx >= steps.length || !state.demoScenario.isRunning) {
      state.demoScenario.isRunning = false;
      return;
    }

    state.demoScenario.currentStepIndex = currentIdx;
    state.demoScenario.stepStartTime = Date.now();
    const step = steps[currentIdx];
    step.action();

    currentIdx++;
    if (currentIdx < steps.length) {
      demoStepTimer = setTimeout(executeNextStep, step.duration);
    } else {
      state.demoScenario.isRunning = false;
    }
  }

  executeNextStep();
}

export function stopDemoScenario() {
  if (demoStepTimer) {
    clearTimeout(demoStepTimer);
    demoStepTimer = null;
  }
  state.demoScenario.isRunning = false;
}
