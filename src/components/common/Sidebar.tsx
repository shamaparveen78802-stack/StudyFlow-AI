import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  CalendarRange, 
  Bot, 
  Timer, 
  ListTree, 
  Settings, 
  Sparkles,
  Flame,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, metrics, isTimerRunning, timeLeft } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'tasks', 
      label: 'Task Manager', 
      icon: CheckSquare,
      badge: metrics.pendingTasks > 0 ? metrics.pendingTasks : undefined,
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
    },
    { id: 'planner', label: 'AI Study Planner', icon: CalendarRange, highlight: true },
    { id: 'tutor', label: 'AI Study Tutor', icon: Bot, isAi: true },
    { 
      id: 'timer', 
      label: 'Focus Timer', 
      icon: Timer,
      activePulse: isTimerRunning,
      timerBadge: isTimerRunning ? `${Math.floor(timeLeft / 60)}m` : undefined,
    },
    { id: 'breakdown', label: 'Assignment Breakdown', icon: ListTree },
    { id: 'settings', label: 'Settings & Data', icon: Settings },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        id="app-main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">StudyPulse</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Offline AI</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Student Productivity Suite</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Productivity Suite
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                  }`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.timerBadge && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500 text-white animate-pulse">
                      <Flame className="w-3 h-3" />
                      {item.timerBadge}
                    </span>
                  )}
                  {item.badge !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive ? 'bg-indigo-700 text-indigo-100' : (item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Focus Status Bottom Card */}
        <div className="p-3 m-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Study Goal</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{metrics.studyProgressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.max(0, metrics.studyProgressPercent))}%` }} 
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span>{metrics.completedTasks}/{metrics.totalTasks} Tasks Done</span>
            <span>{metrics.totalFocusMinutes}m Focus</span>
          </div>
        </div>
      </aside>
    </>
  );
};
