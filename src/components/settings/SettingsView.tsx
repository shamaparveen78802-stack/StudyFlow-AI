import React, { useState } from 'react';
import { 
  Settings, 
  RotateCcw, 
  Trash2, 
  Download, 
  Upload, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  User, 
  ShieldCheck, 
  Sparkles,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { exportAppDataJSON, importAppDataJSON } from '../../utils/storage';
import { ConfirmModal } from '../common/ConfirmModal';

export const SettingsView: React.FC = () => {
  const { 
    preferences, 
    updatePreferences, 
    resetToDemoData, 
    clearAllData, 
    timerSettings, 
    updateTimerSettings 
  } = useApp();
  const toast = useToast();

  const [userName, setUserName] = useState(preferences.userName);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({ userName: userName.trim() || 'Student' });
    toast.success('Profile preferences updated.', 'Profile Saved');
  };

  const handleExport = () => {
    try {
      const dataStr = exportAppDataJSON();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `studypulse_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Backup file exported successfully!', 'Data Exported');
    } catch {
      toast.error('Failed to export data.', 'Export Error');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const text = evt.target?.result as string;
        const success = importAppDataJSON(text);
        if (success) {
          toast.success('Data backup restored successfully! Reloading data...', 'Import Successful');
          setTimeout(() => {
            window.location.reload();
          }, 600);
        } else {
          toast.error('Invalid backup JSON format.', 'Import Failed');
        }
      } catch {
        toast.error('Failed to parse file.', 'Import Failed');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Settings & Data Management
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure application preferences, audio feedback, backups, and local storage controls.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Student Profile
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold shadow-sm transition-all"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* Appearance & Sound Preferences */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Settings className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Appearance & Audio Feedback
          </h3>
        </div>

        {/* Theme Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Color Theme
          </label>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            {[
              { id: 'light', label: 'Light Theme', icon: Sun },
              { id: 'dark', label: 'Dark Theme', icon: Moon },
              { id: 'system', label: 'System Theme', icon: Sparkles },
            ].map(opt => {
              const Icon = opt.icon;
              const isSelected = preferences.theme === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updatePreferences({ theme: opt.id as any })}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sound Toggle */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Synthesized Audio Effects
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Plays gentle chimes on focus completions and click feedback.
            </p>
          </div>
          <button
            type="button"
            onClick={() => updatePreferences({ enableSounds: !preferences.enableSounds })}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              preferences.enableSounds ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow-sm block" />
          </button>
        </div>
      </div>

      {/* Backup & Data Management */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Backup, Restore & Reset
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export JSON */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Export Data Backup
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Download all tasks, schedules, chat logs, and preferences as a portable JSON file.
            </p>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Backup</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Import & Restore Backup
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Load a previously exported JSON backup file into your browser storage.
            </p>
            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-sm cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Backup File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Destructive Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Reset & Clean Slate Controls
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Easily restore default sample data or wipe all local application storage.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setConfirmResetOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>

            <button
              onClick={() => setConfirmClearOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm shadow-rose-600/20 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={confirmClearOpen}
        title="Clear All Application Data?"
        message="This will completely erase all tasks, schedules, custom settings, and timer logs stored in this browser. Are you sure you want to proceed?"
        confirmLabel="Yes, Clear All Data"
        isDestructive={true}
        onConfirm={() => {
          clearAllData();
          setConfirmClearOpen(false);
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />

      <ConfirmModal
        isOpen={confirmResetOpen}
        title="Restore Default Demo Data?"
        message="This will reset all coursework tasks, sample schedules, and tutor messages back to the initial sample state."
        confirmLabel="Reset to Demo State"
        isDestructive={false}
        onConfirm={() => {
          resetToDemoData();
          setConfirmResetOpen(false);
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
};
