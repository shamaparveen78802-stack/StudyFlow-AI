import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string, title?: string, duration = 3500) => {
    // Prevent duplicate spam if identical message is already in queue
    setToasts(prev => {
      if (prev.some(t => t.message === message && t.type === type)) {
        return prev;
      }
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newToast: Toast = { id, type, message, title, duration };

      setTimeout(() => {
        dismissToast(id);
      }, duration);

      return [...prev.slice(-4), newToast]; // Keep at most 5 visible toasts
    });
  }, [dismissToast]);

  const success = useCallback((msg: string, title?: string) => showToast('success', msg, title), [showToast]);
  const error = useCallback((msg: string, title?: string) => showToast('error', msg, title), [showToast]);
  const info = useCallback((msg: string, title?: string) => showToast('info', msg, title), [showToast]);
  const warning = useCallback((msg: string, title?: string) => showToast('warning', msg, title), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, dismissToast }}>
      {children}
      {/* Toast Render Portal */}
      <div 
        id="toast-notification-region"
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence>
          {toasts.map(toast => {
            const icons = {
              success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
              error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
              warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
              info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />,
            };

            const borderColors = {
              success: 'border-emerald-200 dark:border-emerald-900/60 bg-white/95 dark:bg-slate-900/95',
              error: 'border-rose-200 dark:border-rose-900/60 bg-white/95 dark:bg-slate-900/95',
              warning: 'border-amber-200 dark:border-amber-900/60 bg-white/95 dark:bg-slate-900/95',
              info: 'border-indigo-200 dark:border-indigo-900/60 bg-white/95 dark:bg-slate-900/95',
            };

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md ${borderColors[toast.type]} transition-all`}
                role="alert"
              >
                <div className="pt-0.5">{icons[toast.type]}</div>
                <div className="flex-1 min-w-0">
                  {toast.title && (
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-0.5">
                      {toast.title}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words">
                    {toast.message}
                  </p>
                </div>
                <button
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Close notification"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};
