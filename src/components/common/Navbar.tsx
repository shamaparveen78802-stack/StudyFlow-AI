import React from 'react';
import { 
  Menu, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Plus, 
  Flame, 
  Sparkles,
  WifiOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenNewTask: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenNewTask }) => {
  const { preferences, updatePreferences, metrics, isTimerRunning, timeLeft } = useApp();

  const toggleTheme = () => {
    const nextTheme = preferences.theme === 'dark' ? 'light' : 'dark';
    updatePreferences({ theme: nextTheme });
  };

  const toggleSound = () => {
    updatePreferences({ enableSounds: !preferences.enableSounds });
  };

  const formattedTimer = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;

  return (
    <header
      id="app-main-navbar"
      className="sticky top-0 z-30 h-16 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
          <WifiOff className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>Zero-API Offline Engine Active</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Timer Pill if running */}
        {isTimerRunning && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold animate-pulse">
            <Flame className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-mono">{formattedTimer}</span>
          </div>
        )}

        {/* Streak indicator */}
        <div 
          title={`${metrics.completedTasks} tasks completed`}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-semibold"
        >
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{metrics.completedTasks} Done</span>
        </div>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          title={preferences.enableSounds ? 'Mute sound effects' : 'Enable sound effects'}
          aria-label="Toggle sound feedback"
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {preferences.enableSounds ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${preferences.theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle color theme"
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {preferences.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Quick Add Task Button */}
        <button
          id="btn-quick-add-task"
          onClick={onOpenNewTask}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Task</span>
        </button>
      </div>
    </header>
  );
};
