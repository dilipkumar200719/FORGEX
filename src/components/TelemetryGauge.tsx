import React from 'react';
import { Thermometer, Activity, Zap, Gauge, RotateCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface TelemetryGaugeProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  normalMin: number;
  normalMax: number;
  type: 'temperature' | 'vibration' | 'current' | 'pressure' | 'rpm';
}

export const TelemetryGauge: React.FC<TelemetryGaugeProps> = ({
  label,
  value,
  unit,
  min,
  max,
  normalMin,
  normalMax,
  type,
}) => {
  // Normalize percentage for arc (0 to 100)
  const clampedVal = Math.min(max, Math.max(min, value));
  const percent = ((clampedVal - min) / (max - min)) * 100;

  const isHigh = value > normalMax;
  const isLow = value < normalMin;
  const isCritical = isHigh && (value > normalMax * 1.2 || (type === 'vibration' && value > 14));

  // Modality-specific theme aesthetics
  const typeStyles = {
    vibration: {
      accent: 'text-sky-400',
      strokeNormal: 'stroke-sky-400',
      bgGlow: 'from-sky-500/10 to-transparent',
      borderColor: 'border-sky-500/30',
      icon: Activity,
      desc: 'Tri-Axial Velocity',
    },
    temperature: {
      accent: 'text-rose-400',
      strokeNormal: 'stroke-rose-400',
      bgGlow: 'from-rose-500/10 to-transparent',
      borderColor: 'border-rose-500/30',
      icon: Thermometer,
      desc: 'Bearing Stator Temp',
    },
    current: {
      accent: 'text-amber-400',
      strokeNormal: 'stroke-amber-400',
      bgGlow: 'from-amber-500/10 to-transparent',
      borderColor: 'border-amber-500/30',
      icon: Zap,
      desc: 'Motor Power Draw',
    },
    pressure: {
      accent: 'text-purple-400',
      strokeNormal: 'stroke-purple-400',
      bgGlow: 'from-purple-500/10 to-transparent',
      borderColor: 'border-purple-500/30',
      icon: Gauge,
      desc: 'Hydraulic Seal Head',
    },
    rpm: {
      accent: 'text-emerald-400',
      strokeNormal: 'stroke-emerald-400',
      bgGlow: 'from-emerald-500/10 to-transparent',
      borderColor: 'border-emerald-500/30',
      icon: RotateCw,
      desc: 'Shaft Angular Speed',
    },
  }[type];

  let strokeClass = typeStyles.strokeNormal;
  let statusBadge = (
    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 border border-emerald-600/70 text-emerald-300 flex items-center gap-1">
      <CheckCircle2 className="w-2.5 h-2.5" />
      OPTIMAL
    </span>
  );

  if (isCritical) {
    strokeClass = 'stroke-rose-500';
    statusBadge = (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/90 border border-rose-500 text-rose-200 animate-pulse flex items-center gap-1 shadow-sm shadow-rose-950">
        <AlertTriangle className="w-2.5 h-2.5" />
        DANGER
      </span>
    );
  } else if (isHigh || isLow) {
    strokeClass = 'stroke-amber-500';
    statusBadge = (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-600/80 text-amber-300 flex items-center gap-1">
        <AlertTriangle className="w-2.5 h-2.5" />
        {isHigh ? 'ELEVATED' : 'BELOW NORM'}
      </span>
    );
  }

  // SVG Gauge calculations
  const radius = 40;
  const stroke = 7;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (percent / 100) * arcLength;

  const Icon = typeStyles.icon;

  return (
    <div className={`bg-gradient-to-b ${typeStyles.bgGlow} bg-slate-900/90 border ${typeStyles.borderColor} rounded-xl p-3.5 flex flex-col items-center justify-between relative overflow-hidden group hover:border-slate-600 transition-all duration-200 shadow-md`}>
      {/* Top Header */}
      <div className="w-full flex items-center justify-between text-xs mb-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <div className={`p-1 rounded-md bg-slate-950/80 ${typeStyles.accent}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="block leading-tight">{label}</span>
            <span className="text-[9px] text-slate-400 font-normal">{typeStyles.desc}</span>
          </div>
        </div>
        {statusBadge}
      </div>

      {/* SVG Arc Display */}
      <div className="relative flex items-center justify-center my-1.5">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-135">
          {/* Background Track */}
          <circle
            stroke="#1e293b"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
          {/* Active Value Arc */}
          <circle
            className={`transition-all duration-500 ease-out ${strokeClass}`}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            style={{ strokeDashoffset }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-lg font-black font-mono tracking-tight ${isCritical ? 'text-rose-400' : 'text-white'}`}>
            {value.toFixed(type === 'rpm' ? 0 : 1)}
          </span>
          <span className="text-[10px] text-slate-400 font-mono -mt-1 font-semibold">{unit}</span>
        </div>
      </div>

      {/* Threshold bounds footer */}
      <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-800/80">
        <span>Safe: <strong className="text-slate-300">{normalMin}-{normalMax}</strong></span>
        <span>Peak: <strong className="text-slate-300">{max}</strong></span>
      </div>
    </div>
  );
};
