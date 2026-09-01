import React, { useState } from 'react';
import { 
  Check, 
  Clock, 
  Calendar, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  AlertCircle 
} from 'lucide-react';
import { Task, Priority } from '../../types';
import { formatDate, formatTime, getDaysRemaining } from '../../utils/date';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCompleted = task.status === 'completed';

  const priorityStyles: Record<Priority, { label: string; badge: string; dot: string }> = {
    urgent: {
      label: 'Urgent',
      badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
      dot: 'bg-rose-500',
    },
    high: {
      label: 'High',
      badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
      dot: 'bg-amber-500',
    },
    medium: {
      label: 'Medium',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60',
      dot: 'bg-indigo-500',
    },
    low: {
      label: 'Low',
      badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      dot: 'bg-slate-400',
    },
  };

  const currentPriority = priorityStyles[task.priority] || priorityStyles.medium;
  const deadlineInfo = getDaysRemaining(task.dueDate);

  const deadlineBadge = {
    overdue: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-semibold',
    today: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold',
    tomorrow: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    upcoming: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    none: 'text-slate-400',
  }[deadlineInfo.status];

  return (
    <div
      id={`task-card-${task.id}`}
      className={`group relative p-4 rounded-2xl border transition-all duration-200 ${
        isCompleted
          ? 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/60 opacity-75'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800/80 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Custom Checkbox */}
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          aria-label={isCompleted ? 'Mark task incomplete' : 'Mark task completed'}
          className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center border transition-all duration-200 shrink-0 ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-transparent'
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        {/* Task Core Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {/* Subject Pill */}
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
              {task.subject}
            </span>

            {/* Priority Badge */}
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1 ${currentPriority.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${currentPriority.dot}`} />
              {currentPriority.label}
            </span>

            {/* Deadline Pill */}
            {task.dueDate && (
              <span className={`text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 ${deadlineBadge}`}>
                <Calendar className="w-3 h-3 shrink-0" />
                <span>{formatDate(task.dueDate)}</span>
                {deadlineInfo.status === 'overdue' && <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />}
              </span>
            )}

            {/* Time Estimate */}
            {task.estimatedMinutes && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{task.estimatedMinutes}m</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className={`text-sm sm:text-base font-semibold transition-colors ${
            isCompleted 
              ? 'line-through text-slate-400 dark:text-slate-500' 
              : 'text-slate-900 dark:text-slate-100'
          }`}>
            {task.title}
          </h4>

          {/* Details / Notes snippet */}
          {task.notes && (
            <div className="mt-1.5">
              <p className={`text-xs text-slate-500 dark:text-slate-400 leading-relaxed ${
                isExpanded ? '' : 'line-clamp-1'
              }`}>
                {task.notes}
              </p>
              {task.notes.length > 80 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5"
                >
                  {isExpanded ? <>Less <ChevronUp className="w-3 h-3" /></> : <>More <ChevronDown className="w-3 h-3" /></>}
                </button>
              )}
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {task.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-1.5 py-0.5 rounded flex items-center gap-0.5"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(task)}
            title="Edit task"
            aria-label="Edit task"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            title="Delete task"
            aria-label="Delete task"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
