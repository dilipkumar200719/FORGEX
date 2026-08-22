import React, { useState } from 'react';
import { Activity, Thermometer, Zap, RotateCw, BarChart3, TrendingUp } from 'lucide-react';
import { TelemetrySnapshot } from '../types';

interface TelemetryChartProps {
  history: TelemetrySnapshot[];
  normalRanges: {
    vibration: [number, number];
    temperature: [number, number];
    current: [number, number];
    pressure: [number, number];
    rpm: [number, number];
  };
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  history,
  normalRanges,
}) => {
  const [activeMetric, setActiveMetric] = useState<'vibration' | 'temperature' | 'current' | 'rpm'>('vibration');

  const metricConfigs = {
    vibration: {
      label: 'Vibration (mm/s)',
      color: 'stroke-sky-400',
      fillColor: 'fill-sky-400/20',
      accent: 'text-sky-400',
      activeBtn: 'bg-sky-950/80 border-sky-500 text-sky-300 shadow-md shadow-sky-950',
      icon: Activity,
      range: normalRanges.vibration,
      min: 0,
      max: 25,
      unit: 'mm/s',
    },
    temperature: {
      label: 'Temperature (°C)',
      color: 'stroke-rose-400',
      fillColor: 'fill-rose-400/20',
      accent: 'text-rose-400',
      activeBtn: 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-md shadow-rose-950',
      icon: Thermometer,
      range: normalRanges.temperature,
      min: 20,
      max: 120,
      unit: '°C',
    },
    current: {
      label: 'Power Current (A)',
      color: 'stroke-amber-400',
      fillColor: 'fill-amber-400/20',
      accent: 'text-amber-400',
      activeBtn: 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-md shadow-amber-950',
      icon: Zap,
      range: normalRanges.current,
      min: 0,
      max: 15,
      unit: 'A',
    },
    rpm: {
      label: 'Shaft Speed (RPM)',
      color: 'stroke-emerald-400',
      fillColor: 'fill-emerald-400/20',
      accent: 'text-emerald-400',
      activeBtn: 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950',
      icon: RotateCw,
      range: normalRanges.rpm,
      min: 500,
      max: 2000,
      unit: 'RPM',
    },
  };

  const cfg = metricConfigs[activeMetric];
  const dataPoints = history.slice(-25); // latest 25 snapshots

  // SVG Chart Dimensions
  const width = 500;
  const height = 180;
  const padding = 25;

  const getX = (index: number) => {
    if (dataPoints.length <= 1) return padding;
    return padding + (index / (dataPoints.length - 1)) * (width - padding * 2);
  };

  const getY = (val: number) => {
    const clamped = Math.min(cfg.max, Math.max(cfg.min, val));
    const pct = (clamped - cfg.min) / (cfg.max - cfg.min);
    return height - padding - pct * (height - padding * 2);
  };

  // Generate SVG Path
  const points = dataPoints.map((d, i) => `${getX(i)},${getY(d[activeMetric])}`).join(' ');
  const areaPoints = `${getX(0)},${height - padding} ${points} ${getX(dataPoints.length - 1)},${height - padding}`;

  const currentVal = dataPoints[dataPoints.length - 1]?.[activeMetric] ?? 0;
  const safeMinY = getY(cfg.range[0]);
  const safeMaxY = getY(cfg.range[1]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 text-slate-100 shadow-xl space-y-3">
      {/* Header with Metric Switcher Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">
              Live Real-Time Telemetry Stream
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">Continuous 1 Hz sampling & buffer</span>
          </div>
        </div>

        {/* 4 Metric Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(Object.keys(metricConfigs) as Array<keyof typeof metricConfigs>).map((key) => {
            const m = metricConfigs[key];
            const Icon = m.icon;
            const isActive = activeMetric === key;
            return (
              <button
                key={key}
                onClick={() => setActiveMetric(key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
                  isActive
                    ? m.activeBtn
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="capitalize">{key}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Time-Series Chart */}
      <div className="relative w-full h-[180px] bg-slate-950 rounded-xl border border-slate-800/80 p-2 overflow-hidden shadow-inner">
        {/* Safe Range Shaded Band */}
        <div
          className="absolute left-6 right-6 bg-emerald-500/10 border-y border-emerald-500/20 pointer-events-none"
          style={{
            top: `${Math.min(safeMinY, safeMaxY)}px`,
            height: `${Math.abs(safeMinY - safeMaxY)}px`,
          }}
        >
          <span className="absolute right-2 top-0.5 text-[9px] font-mono text-emerald-400 font-bold">
            Safe Operating Zone ({cfg.range[0]}-{cfg.range[1]} {cfg.unit})
          </span>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          {/* Shaded Area */}
          <polygon points={areaPoints} className={cfg.fillColor} />
          {/* Main Line */}
          <polyline
            points={points}
            fill="none"
            className={`${cfg.color} stroke-2 transition-all duration-300`}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Data Points */}
          {dataPoints.map((d, i) => (
            <circle
              key={i}
              cx={getX(i)}
              cy={getY(d[activeMetric])}
              r={i === dataPoints.length - 1 ? 4 : 2}
              className={`${cfg.color} fill-slate-950 stroke-2`}
            />
          ))}
        </svg>

        {/* Real-time Value Stamp overlay */}
        <div className="absolute left-4 bottom-3 flex items-baseline gap-2 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-lg shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Live Value:</span>
          <span className={`text-sm font-mono font-black ${cfg.accent}`}>
            {currentVal.toFixed(activeMetric === 'rpm' ? 0 : 1)} {cfg.unit}
          </span>
        </div>
      </div>
    </div>
  );
};
