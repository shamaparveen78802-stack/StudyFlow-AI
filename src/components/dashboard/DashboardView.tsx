import React from 'react';
import { 
  CheckSquare, 
  Clock, 
  Flame, 
  Calendar, 
  Sparkles, 
  Bot, 
  Timer, 
  ListTree, 
  ArrowRight, 
  AlertCircle, 
  TrendingUp, 
  ChevronRight, 
  BookOpen,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { formatDate, getDaysRemaining, formatRelativeTime } from '../../utils/date';
import { TaskItem } from '../tasks/TaskItem';

interface DashboardViewProps {
  onOpenNewTask: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenNewTask }) => {
  const { 
    metrics, 
    tasks, 
    schedule, 
    activityLogs, 
    setActiveTab, 
    toggleTaskComplete, 
    preferences 
  } = useApp();

  // Urgent / High priority pending tasks
  const urgentTasks = tasks
    .filter(t => t.status !== 'completed' && (t.priority === 'urgent' || t.priority === 'high'))
    .slice(0, 4);

  // Today's schedule items
  const todayStr = new Date().toISOString().split('T')[0];
  const todayScheduleItems = schedule.filter(s => s.date === todayStr || s.day === 'Monday'); // fallback matching

  // Upcoming 7 days deadlines
  const upcomingDeadlines = tasks
    .filter(t => t.status !== 'completed' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 text-white relative overflow-hidden shadow-lg shadow-indigo-600/15">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Student Productivity Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {preferences.userName || 'Student'}!
          </h1>
          <p className="text-sm sm:text-base text-indigo-100 mt-2 leading-relaxed">
            You have <strong className="text-white font-semibold">{metrics.pendingTasks} pending tasks</strong> and <strong className="text-white font-semibold">{metrics.highPriorityTasks} urgent items</strong> requiring focus today.
          </p>

          {/* Quick Action Pills */}
          <div className="flex flex-wrap gap-2.5 mt-5">
            <button
              onClick={onOpenNewTask}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
            <button
              onClick={() => setActiveTab('planner')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs backdrop-blur-sm transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>AI Study Planner</span>
            </button>
            <button
              onClick={() => setActiveTab('timer')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs backdrop-blur-sm transition-all"
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Start 25m Focus</span>
            </button>
            <button
              onClick={() => setActiveTab('tutor')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs backdrop-blur-sm transition-all"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask AI Tutor</span>
            </button>
          </div>
        </div>

        {/* Decorative background watermark */}
        <div className="absolute -right-8 -bottom-8 opacity-10 text-white pointer-events-none">
          <Sparkles className="w-64 h-64" />
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-total-tasks"
          title="Total Tasks"
          value={metrics.totalTasks}
          subtitle={`${metrics.completedTasks} completed (${metrics.studyProgressPercent}%)`}
          icon={CheckSquare}
          colorScheme="indigo"
          onClick={() => setActiveTab('tasks')}
        />

        <StatCard
          id="stat-pending-tasks"
          title="Pending Coursework"
          value={metrics.pendingTasks}
          subtitle={`${metrics.todayTasksCount} due today`}
          icon={Clock}
          colorScheme="amber"
          onClick={() => setActiveTab('tasks')}
        />

        <StatCard
          id="stat-urgent-tasks"
          title="High Priority"
          value={metrics.highPriorityTasks}
          subtitle="Requires immediate focus"
          icon={Flame}
          colorScheme="rose"
          trend={metrics.highPriorityTasks > 0 ? 'Urgent' : 'All Clear'}
          onClick={() => setActiveTab('tasks')}
        />

        <StatCard
          id="stat-focus-time"
          title="Focus Time"
          value={`${metrics.totalFocusMinutes}m`}
          subtitle="Logged with Pomodoro timer"
          icon={Timer}
          colorScheme="emerald"
          onClick={() => setActiveTab('timer')}
        />
      </div>

      {/* Main Dashboard Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Urgent Tasks & Timetable */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgent Tasks Section */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Priority Action Items
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View All Tasks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {urgentTasks.length > 0 ? (
              <div className="space-y-3">
                {urgentTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={toggleTaskComplete}
                    onEdit={() => setActiveTab('tasks')}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  🎉 No urgent tasks pending!
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  You are all caught up on critical priorities.
                </p>
              </div>
            )}
          </div>

          {/* Today's Study Schedule Preview */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Study Timetable Focus Blocks
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('planner')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Open Planner</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {schedule.length > 0 ? (
              <div className="space-y-2.5">
                {schedule.slice(0, 3).map(item => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                            {item.startTime} - {item.endTime}
                          </span>
                          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                            {item.subject}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                          {item.topic}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      item.completed 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                        : 'bg-slate-200/80 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {item.completed ? 'Done' : 'Scheduled'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                <p className="text-xs text-slate-500">
                  No active study schedule. Click "Open Planner" to generate one.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Deadlines & Activity Feed */}
        <div className="space-y-6">
          {/* Upcoming Deadlines List */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Upcoming Deadlines
              </h3>
              <span className="text-xs text-slate-400 font-mono font-semibold">Next 7 Days</span>
            </div>

            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadlines.map(task => {
                  const deadline = getDaysRemaining(task.dueDate);
                  const isUrgent = deadline.status === 'overdue' || deadline.status === 'today';

                  return (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {task.subject} • {formatDate(task.dueDate)}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                        isUrgent
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}>
                        {deadline.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No upcoming deadlines.</p>
            )}
          </div>

          {/* Recent Activity Log Feed */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
              Recent Activity Feed
            </h3>

            {activityLogs.length > 0 ? (
              <div className="space-y-3">
                {activityLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="flex items-start gap-2.5 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 dark:text-slate-300 leading-snug">
                        {log.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {formatRelativeTime(log.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
