import React from 'react';
import { 
  Activity, 
  Cpu, 
  Radio, 
  AlertTriangle, 
  Layers, 
  Sliders, 
  CheckCircle2, 
  Play, 
  Square,
  Sparkles,
  ShieldCheck,
  Zap,
  Volume2,
  Sun,
  Moon,
  Compass,
  HelpCircle
} from 'lucide-react';
import { Machine } from '../types';
import { useTheme, AppTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedMachineId: string;
  setSelectedMachineId: (id: string) => void;
  machines: Machine[];
  demoRunning: boolean;
  onRunDemo: () => void;
  onStopDemo: () => void;
  isSimulatingFailure: boolean;
  onToggleFailureSim: () => void;
  onOpenExplainer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedMachineId,
  setSelectedMachineId,
  machines,
  demoRunning,
  onRunDemo,
  onStopDemo,
  isSimulatingFailure,
  onToggleFailureSim,
  onOpenExplainer,
}) => {
  const { theme, setTheme } = useTheme();
  const currentMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];

  const navItems = [
    { id: 'command', label: 'Command HUD', icon: Activity, color: 'text-sky-400', activeBg: 'border-sky-400 text-sky-400 bg-sky-500/10' },
    { id: 'machines', label: 'Digital Twins', icon: Cpu, color: 'text-indigo-400', activeBg: 'border-indigo-400 text-indigo-400 bg-indigo-500/10' },
    { id: 'crosssense', label: 'Cross-Sense Fusion', icon: Layers, color: 'text-fuchsia-400', activeBg: 'border-fuchsia-400 text-fuchsia-400 bg-fuchsia-500/10' },
    { id: 'decisions', label: 'AI Explainability', icon: Sparkles, color: 'text-amber-400', activeBg: 'border-amber-400 text-amber-400 bg-amber-500/10' },
    { id: 'incidents', label: 'Incidents & Actions', icon: AlertTriangle, color: 'text-rose-400', activeBg: 'border-rose-400 text-rose-400 bg-rose-500/10' },
    { id: 'verification', label: 'Verification Loop', icon: CheckCircle2, color: 'text-emerald-400', activeBg: 'border-emerald-400 text-emerald-400 bg-emerald-500/10' },
    { id: 'analytics', label: 'Settings & Weights', icon: Sliders, color: 'text-teal-400', activeBg: 'border-teal-400 text-teal-400 bg-teal-500/10' },
  ];

  return (
    <header id="forge-navbar" className="bg-slate-950/95 dark:bg-slate-950/95 border-b border-slate-800 text-slate-100 sticky top-0 z-50 backdrop-blur-md transition-colors duration-300">
      {/* Top Utility Bar */}
      <div className="px-4 py-2.5 bg-slate-900/90 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800/80">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('command')}>
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 flex items-center justify-center font-black tracking-tighter text-white shadow-lg shadow-cyan-500/30">
              FX
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wider text-white text-sm">FORGE X</span>
                <span className="text-[10px] uppercase tracking-wider text-cyan-300 font-bold px-2 py-0.5 bg-cyan-950/90 border border-cyan-700/80 rounded-full shadow-sm">
                  Autonomous Multi-Sense
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Industrial Intelligence & Contradiction Resolution
              </p>
            </div>
          </div>
        </div>

        {/* Live Controls: Asset Switcher, Theme Switcher, Quick Guide & Demo Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Active Asset Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1 shadow-inner">
            <span className="text-slate-400 text-[11px] font-medium">Asset:</span>
            <select
              id="asset-selector"
              value={selectedMachineId || ''}
              onChange={(e) => setSelectedMachineId(e.target.value)}
              className="bg-transparent text-cyan-300 font-mono text-xs font-bold focus:outline-none cursor-pointer"
            >
              {machines.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                  {m.id} - {m.name} ({m.status})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Guide Explainer Button */}
          {onOpenExplainer && (
            <button
              id="btn-open-explainer"
              onClick={onOpenExplainer}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-slate-800 to-indigo-950 hover:from-indigo-900 hover:to-indigo-800 text-indigo-300 border border-indigo-700/60 flex items-center gap-1.5 transition-all shadow-sm"
              title="How FORGE X works (Quick guide)"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">How It Works</span>
            </button>
          )}

          {/* Theme Palette Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setTheme('dark')}
              className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                theme === 'dark'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Dark Cyber Theme"
            >
              <Moon className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">Dark</span>
            </button>

            <button
              onClick={() => setTheme('light')}
              className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                theme === 'light'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-700/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Clean Daylight Light Theme"
            >
              <Sun className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </button>

            <button
              onClick={() => setTheme('midnight')}
              className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                theme === 'midnight'
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Deep Midnight Navy Theme"
            >
              <Compass className="w-3 h-3 text-indigo-400" />
              <span className="hidden sm:inline">Navy</span>
            </button>
          </div>

          {/* Simulate Failure Anomaly Trigger */}
          <button
            id="btn-toggle-failure-sim"
            onClick={onToggleFailureSim}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isSimulatingFailure
                ? 'bg-rose-950 text-rose-200 border-rose-500 shadow-md shadow-rose-950/60 animate-pulse'
                : 'bg-slate-900 text-amber-300 border-amber-600/50 hover:bg-amber-950/40 hover:border-amber-500'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulatingFailure ? 'text-rose-400 fill-current' : 'text-amber-400'}`} />
            <span>{isSimulatingFailure ? 'Anomaly Active' : 'Simulate Anomaly'}</span>
          </button>

          {/* 60s HACKATHON LIVE DEMO BUTTON */}
          <button
            id="btn-run-hackathon-demo"
            onClick={demoRunning ? onStopDemo : onRunDemo}
            className={`px-3.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all ${
              demoRunning
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/50 animate-pulse'
                : 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white shadow-cyan-950/50'
            }`}
          >
            {demoRunning ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Demo</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-cyan-100" />
                <span>⚡ RUN 60S FAILURE SCENARIO</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <nav className="px-4 flex items-center gap-1 overflow-x-auto scrollbar-none bg-slate-950">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all duration-150 ${
                isActive
                  ? item.activeBg
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? item.color : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.id === 'incidents' && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-300 border border-rose-700 text-[10px] font-mono font-bold">
                  1
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
