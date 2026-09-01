import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  CheckSquare, 
  Clock, 
  Flame, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { Task, Priority, TaskStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { TaskItem } from './TaskItem';
import { TaskModal } from './TaskModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { EmptyState } from '../common/EmptyState';

export const TaskManagerView: React.FC = () => {
  const { 
    tasks, 
    toggleTaskComplete, 
    deleteTask, 
    subjects, 
    metrics 
  } = useApp();

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title' | 'createdAt'>('dueDate');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

  // Filter & Sort Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Status filter
      if (statusFilter === 'pending' && task.status === 'completed') return false;
      if (statusFilter === 'completed' && task.status !== 'completed') return false;

      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      // Subject filter
      if (subjectFilter !== 'all' && task.subject !== subjectFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesSubject = task.subject.toLowerCase().includes(q);
        const matchesNotes = task.notes ? task.notes.toLowerCase().includes(q) : false;
        const matchesTags = task.tags ? task.tags.some(t => t.toLowerCase().includes(q)) : false;
        if (!matchesTitle && !matchesSubject && !matchesNotes && !matchesTags) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 9999999999999;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 9999999999999;
        return dateA - dateB;
      }
      if (sortBy === 'priority') {
        const priorityWeight: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'createdAt') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  }, [tasks, statusFilter, priorityFilter, subjectFilter, searchQuery, sortBy]);

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id: string) => {
    setTaskToDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (taskToDeleteId) {
      deleteTask(taskToDeleteId);
      setTaskToDeleteId(null);
    }
  };

  const openNewTask = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Task Manager
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track coursework, problem sets, deadlines, and project milestones.
          </p>
        </div>

        <button
          id="btn-add-task-view"
          onClick={openNewTask}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold shadow-sm shadow-indigo-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Task</span>
        </button>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">{metrics.totalTasks}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">{metrics.pendingTasks}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">High Priority</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">{metrics.highPriorityTasks}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">{metrics.completedTasks}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="task-search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by title, subject, notes, or tags..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Dropdowns & Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Status Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
            {(['all', 'pending', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  statusFilter === tab
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tab === 'all' ? `All (${tasks.length})` : tab === 'pending' ? `Pending (${metrics.pendingTasks})` : `Completed (${metrics.completedTasks})`}
              </button>
            ))}
          </div>

          {/* Secondary Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Subject Selector */}
            <select
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>

            {/* Priority Selector */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-none"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="title">Title (A-Z)</option>
                <option value="createdAt">Newest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-2.5">
          {filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={toggleTaskComplete}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CheckSquare}
          title={searchQuery || priorityFilter !== 'all' || subjectFilter !== 'all' ? 'No matching tasks' : 'No tasks created yet'}
          description={
            searchQuery || priorityFilter !== 'all' || subjectFilter !== 'all'
              ? 'Try resetting your search filters to see all coursework tasks.'
              : 'Add your first assignment, problem set, or study goal to get started!'
          }
          actionLabel={searchQuery || priorityFilter !== 'all' || subjectFilter !== 'all' ? 'Clear Filters' : 'Add First Task'}
          onAction={
            searchQuery || priorityFilter !== 'all' || subjectFilter !== 'all'
              ? () => { setSearchQuery(''); setPriorityFilter('all'); setSubjectFilter('all'); setStatusFilter('all'); }
              : openNewTask
          }
        />
      )}

      {/* Create / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskToEdit={taskToEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={taskToDeleteId !== null}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete Task"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDeleteId(null)}
      />
    </div>
  );
};
