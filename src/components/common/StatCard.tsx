import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple';
  trend?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme,
  trend,
  onClick,
}) => {
  const schemeStyles = {
    indigo: {
      bgIcon: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
      border: 'hover:border-indigo-300 dark:hover:border-indigo-800',
      badge: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40',
    },
    emerald: {
      bgIcon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
      border: 'hover:border-emerald-300 dark:hover:border-emerald-800',
      badge: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
    },
    amber: {
      bgIcon: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
      border: 'hover:border-amber-300 dark:hover:border-amber-800',
      badge: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
    },
    rose: {
      bgIcon: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
      border: 'hover:border-rose-300 dark:hover:border-rose-800',
      badge: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40',
    },
    cyan: {
      bgIcon: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400',
      border: 'hover:border-cyan-300 dark:hover:border-cyan-800',
      badge: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40',
    },
    purple: {
      bgIcon: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
      border: 'hover:border-purple-300 dark:hover:border-purple-800',
      badge: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40',
    },
  };

  const style = schemeStyles[colorScheme];

  return (
    <div
      id={id}
      onClick={onClick}
      className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md ' + style.border : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${style.bgIcon}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
          {value}
        </span>
        {trend && (
          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${style.badge}`}>
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};
