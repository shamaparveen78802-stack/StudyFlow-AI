import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  id?: string;
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  id,
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div 
      id={id}
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-800"
    >
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
