import { Machine, TelemetryPoint } from '../types.js';
import { SensorAnomalyResult, MetricAnomaly } from './types.js';

const METRIC_CONFIGS: Record<
  keyof Omit<TelemetryPoint, 'timestamp'>,
  { unit: string; warningRatio: number; criticalRatio: number; label: string }
> = {
  vibration: { unit: 'mm/s', warningRatio: 1.15, criticalRatio: 1.5, label: 'Velocity RMS Vibration' },
  temperature: { unit: '°C', warningRatio: 1.08, criticalRatio: 1.2, label: 'Drive-End Housing Temperature' },
  current: { unit: 'A', warningRatio: 1.15, criticalRatio: 1.35, label: 'Motor Stator Current' },
  pressure: { unit: 'bar', warningRatio: 1.12, criticalRatio: 1.25, label: 'Discharge Hydraulic Pressure' },
  rpm: { unit: 'RPM', warningRatio: 1.05, criticalRatio: 1.15, label: 'Shaft Rotational Speed' },
};

/**
 * 1. SENSOR ANOMALY DETECTION ENGINE
 * Performs deterministic multi-channel edge telemetry boundary analysis,
 * harmonic exceedance calculation, and anomaly confidence scoring.
 */
export function detectSensorAnomalies(
  machine: Machine,
  telemetryOverride?: TelemetryPoint
): SensorAnomalyResult {
  const tel = telemetryOverride || machine.currentTelemetry;
  const nr = machine.normalRanges;

  const metrics: Record<string, MetricAnomaly> = {};
  let maxExcessRatio = 0;
  let primaryMetric: MetricAnomaly | null = null;
  let exceededCount = 0;

  const metricKeys: Array<keyof Omit<TelemetryPoint, 'timestamp'>> = [
    'vibration',
    'temperature',
    'current',
    'pressure',
    'rpm',
  ];

  for (const key of metricKeys) {
    const val = tel[key];
    const range = nr[key] || [0, 100];
    const minVal = range[0];
    const maxVal = range[1];
    const cfg = METRIC_CONFIGS[key];

    const isHigh = val > maxVal;
    const isLow = val < minVal;
    const isExceeded = isHigh || isLow;

    let excessAmount = 0;
    let excessRatio = 1.0;

    if (isHigh) {
      excessAmount = +(val - maxVal).toFixed(2);
      excessRatio = maxVal > 0 ? val / maxVal : 1.0;
    } else if (isLow) {
      excessAmount = +(minVal - val).toFixed(2);
      excessRatio = minVal > 0 ? (minVal - val) / minVal + 1.0 : 1.0;
    }

    let severity: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
    if (isExceeded) {
      exceededCount++;
      if (excessRatio >= cfg.criticalRatio) {
        severity = 'CRITICAL';
      } else {
        severity = 'WARNING';
      }
    }

    const excessPercentage = isExceeded ? +((excessRatio - 1.0) * 100).toFixed(1) : 0;

    let description = `${cfg.label} is nominal at ${val} ${cfg.unit} (Safe: ${minVal} - ${maxVal} ${cfg.unit})`;
    if (isExceeded) {
      description = `${cfg.label} (${val} ${cfg.unit}) is ${excessPercentage}% ${isHigh ? 'above maximum threshold' : 'below minimum threshold'} (${isHigh ? maxVal : minVal} ${cfg.unit})`;
    }

    const metricAnomaly: MetricAnomaly = {
      metric: key,
      currentValue: val,
      minThreshold: minVal,
      maxThreshold: maxVal,
      unit: cfg.unit,
      isExceeded,
      excessAmount,
      excessPercentage,
      severity,
      description,
    };

    metrics[key] = metricAnomaly;

    if (excessRatio > maxExcessRatio) {
      maxExcessRatio = excessRatio;
      primaryMetric = metricAnomaly;
    }
  }

  // Detect harmonic vibration spike (common bearing precursor)
  const harmonicVibrationSpike = tel.vibration >= nr.vibration[1] * 1.5 || tel.vibration >= 12.0;

  // Compute composite sensor risk score (0 - 100)
  const vibRatio = nr.vibration[1] > 0 ? tel.vibration / nr.vibration[1] : 1;
  const tempRatio = nr.temperature[1] > 0 ? tel.temperature / nr.temperature[1] : 1;
  const currRatio = nr.current[1] > 0 ? tel.current / nr.current[1] : 1;

  let sensorRiskScore = 10;
  if (vibRatio >= 2.0 || tempRatio >= 1.25 || maxExcessRatio >= 1.8) {
    sensorRiskScore = 95;
  } else if (vibRatio >= 1.4 || tempRatio >= 1.15 || maxExcessRatio >= 1.4) {
    sensorRiskScore = 78;
  } else if (vibRatio >= 1.1 || tempRatio >= 1.05 || exceededCount >= 1) {
    sensorRiskScore = 45;
  } else {
    sensorRiskScore = 12;
  }

  let overallSeverity: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
  if (sensorRiskScore >= 75 || exceededCount >= 2 || (primaryMetric && primaryMetric.severity === 'CRITICAL')) {
    overallSeverity = 'CRITICAL';
  } else if (sensorRiskScore >= 40 || exceededCount >= 1) {
    overallSeverity = 'WARNING';
  }

  const confidence = overallSeverity === 'NORMAL' ? 98.5 : 96.0;

  let summary = 'All 5 sensor channels are operating strictly within baseline certified thresholds.';
  if (overallSeverity === 'CRITICAL') {
    summary = `CRITICAL TELEMETRY EXCEEDANCE: ${exceededCount} metrics out of tolerance. Vibration at ${tel.vibration} mm/s (+${metrics.vibration.excessPercentage}%) indicates severe mechanical resonance.`;
  } else if (overallSeverity === 'WARNING') {
    summary = `TELEMETRY WARNING: ${exceededCount} metrics elevated above nominal envelope. Monitoring gradient.`;
  }

  return {
    hasAnomaly: overallSeverity !== 'NORMAL',
    severity: overallSeverity,
    sensorRiskScore,
    confidence,
    metrics,
    primaryAnomaly: primaryMetric && primaryMetric.isExceeded ? primaryMetric : null,
    exceededCount,
    harmonicVibrationSpike,
    summary,
    telemetrySnapshot: { ...tel },
  };
}
