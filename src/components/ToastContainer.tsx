import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { ToastMessage } from '../types/reelsync';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-32 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const iconMap = {
            success: <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />,
            info: <Info className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />,
            warning: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
            error: <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />,
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              role="status"
              className="pointer-events-auto flex items-start gap-3 bg-white/95 dark:bg-[#0A1A38]/95 backdrop-blur-md border border-blue-200 dark:border-blue-800/80 rounded-xl px-4 py-3 shadow-xl"
            >
              {iconMap[toast.variant]}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-950 dark:text-blue-50 leading-snug">
                  {toast.title}
                </p>
                {toast.description && (
                  <p className="text-xs text-blue-800/80 dark:text-blue-200/75 mt-0.5 leading-relaxed">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
                className="text-blue-700/70 hover:text-blue-950 dark:text-blue-400/70 dark:hover:text-blue-100 transition-colors p-0.5 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
