import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Flame, 
  Coffee, 
  Sparkles, 
  CheckCircle2, 
  Sliders, 
  Radio,
  Headphones
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TimerMode } from '../../types';
import { formatRelativeTime } from '../../utils/date';

export const PomodoroTimerView: React.FC = () => {
  const { 
    timerMode, 
    timeLeft, 
    isTimerRunning, 
    completedPomodoros, 
    timerSettings, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    switchTimerMode, 
    updateTimerSettings, 
    focusLogs 
  } = useApp();

  const [showSettings, setShowSettings] = useState(false);

  const totalDuration = React.useMemo(() => {
    switch (timerMode) {
      case 'pomodoro': return timerSettings.pomodoroMinutes * 60;
      case 'short_break': return timerSettings.shortBreakMinutes * 60;
      case 'long_break': return timerSettings.longBreakMinutes * 60;
      case 'custom': return timerSettings.customMinutes * 60;
      default: return 25 * 60;
    }
  }, [timerMode, timerSettings]);

  const progressPercent = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // SVG Progress Ring measurements
  const strokeWidth = 8;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const modeColors: Record<TimerMode, { ring: string; text: string; bg: string }> = {
    pomodoro: {
      ring: 'stroke-indigo-600 dark:stroke-indigo-500',
      text: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/60',
    },
    short_break: {
      ring: 'stroke-emerald-600 dark:stroke-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
    long_break: {
      ring: 'stroke-cyan-600 dark:stroke-cyan-500',
      text: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-950/60',
    },
    custom: {
      ring: 'stroke-purple-600 dark:stroke-purple-500',
      text: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/60',
    },
  };

  const currentTheme = modeColors[timerMode];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Pomodoro Focus Timer
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Maintain high cognitive endurance using timed single-task focus cycles.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          {[
            { id: 'pomodoro', label: 'Focus (25m)', icon: Flame },
            { id: 'short_break', label: 'Short Break (5m)', icon: Coffee },
            { id: 'long_break', label: 'Long Break (15m)', icon: Sparkles },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = timerMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTimerMode(tab.id as TimerMode)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Timer Display Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
        {/* Ambient Sound Indicator */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          {timerSettings.ambientSound !== 'none' && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Headphones className="w-3 h-3 text-indigo-500" />
              {timerSettings.ambientSound.replace('_', ' ')}
            </span>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Timer Settings"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

        {/* Circular Progress Display */}
        <div className="relative w-72 h-72 flex items-center justify-center my-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 280 280">
            {/* Background Track Ring */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress Stroke Ring */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              className={`${currentTheme.ring} transition-all duration-1000 ease-linear`}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Digital Clock */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-5xl sm:text-6xl font-extrabold tracking-tighter text-slate-900 dark:text-slate-100 font-mono">
              {formattedTime}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-2">
              {timerMode.replace('_', ' ')}
            </span>
            <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium">
              <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{completedPomodoros} Focus Cycles</span>
            </div>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button
            type="button"
            onClick={resetTimer}
            title="Reset timer"
            aria-label="Reset timer"
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {isTimerRunning ? (
            <button
              type="button"
              id="btn-pause-timer"
              onClick={pauseTimer}
              className="px-8 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-base shadow-lg shadow-amber-600/25 transition-all flex items-center gap-2"
            >
              <Pause className="w-5 h-5 fill-white" />
              <span>Pause Focus</span>
            </button>
          ) : (
            <button
              type="button"
              id="btn-start-timer"
              onClick={startTimer}
              className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-base shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Start Focus</span>
            </button>
          )}
        </div>
      </div>

      {/* Timer Settings Drawer / Accordion */}
      {showSettings && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Timer & Sound Customization
            </h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold"
            >
              Done
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pomodoro Duration (min)
              </label>
              <input
                type="number"
                min="5"
                max="90"
                value={timerSettings.pomodoroMinutes}
                onChange={e => updateTimerSettings({ pomodoroMinutes: parseInt(e.target.value, 10) || 25 })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Short Break (min)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={timerSettings.shortBreakMinutes}
                onChange={e => updateTimerSettings({ shortBreakMinutes: parseInt(e.target.value, 10) || 5 })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Long Break (min)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={timerSettings.longBreakMinutes}
                onChange={e => updateTimerSettings({ longBreakMinutes: parseInt(e.target.value, 10) || 15 })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Ambient Noise Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Background Focus Noise (Web Audio Synthesized)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'none', label: 'None (Silent)' },
                { id: 'brown_noise', label: 'Brown Noise (Deep)' },
                { id: 'rain_tones', label: 'Soft Rain simulation' },
                { id: 'white_noise', label: 'White Noise' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateTimerSettings({ ambientSound: opt.id as any })}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                    timerSettings.ambientSound === opt.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Focus History Log */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Completed Focus Sessions
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {focusLogs.length} Total Sessions
          </span>
        </div>

        {focusLogs.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {focusLogs.slice(0, 5).map(log => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {log.durationMinutes} min {log.mode === 'pomodoro' ? 'Deep Work' : 'Break'}
                  </span>
                </div>
                <span className="text-slate-400">
                  {formatRelativeTime(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">
            No completed focus sessions recorded yet. Start your first session above!
          </p>
        )}
      </div>
    </div>
  );
};
