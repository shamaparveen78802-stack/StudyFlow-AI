/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Bot, 
  Timer, 
  Layers, 
  Settings 
} from 'lucide-react';
import { ToastProvider } from './context/ToastContext';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { TaskManagerView } from './components/tasks/TaskManagerView';
import { StudyPlannerView } from './components/planner/StudyPlannerView';
import { AITutorView } from './components/tutor/AITutorView';
import { PomodoroTimerView } from './components/timer/PomodoroTimerView';
import { AssignmentBreakdownView } from './components/breakdown/AssignmentBreakdownView';
import { SettingsView } from './components/settings/SettingsView';
import { TaskModal } from './components/tasks/TaskModal';
import { NavTab } from './types';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, tasks, isTimerRunning } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  const uncompletedTasksCount = tasks.filter(t => t.status !== 'completed').length;

  const navTabs: Array<{ id: NavTab; label: string; icon: any }> = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'tutor', label: 'Tutor', icon: Bot },
    { id: 'timer', label: 'Timer', icon: Timer },
    { id: 'breakdown', label: 'Roadmap', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onOpenNewTask={() => setIsNewTaskModalOpen(true)} />;
      case 'tasks':
        return <TaskManagerView />;
      case 'planner':
        return <StudyPlannerView />;
      case 'tutor':
        return <AITutorView />;
      case 'timer':
        return <PomodoroTimerView />;
      case 'breakdown':
        return <AssignmentBreakdownView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onOpenNewTask={() => setIsNewTaskModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200 pb-16 lg:pb-0">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Sticky Top Header */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          onOpenNewTask={() => setIsNewTaskModalOpen(true)}
        />

        {/* Dynamic Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Quick Bar */}
      <nav 
        id="mobile-bottom-nav" 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around"
      >
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`mobile-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-semibold transition-all relative ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.id === 'tasks' && uncompletedTasksCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-indigo-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                    {uncompletedTasksCount > 9 ? '9+' : uncompletedTasksCount}
                  </span>
                )}
                {tab.id === 'timer' && isTimerRunning && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                )}
              </div>
              <span className="mt-0.5 leading-none">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Global Quick Add Task Modal */}
      <TaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppProvider>
          <MainLayout />
        </AppProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
