import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  duration?: number;
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const tIn = setTimeout(() => setVisible(true), 10);
    // Auto-remove
    const tOut = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration ?? 3500);
    return () => { clearTimeout(tIn); clearTimeout(tOut); };
  }, [toast, onRemove]);

  const styles = {
    success: { bg: 'bg-emerald-600', icon: <CheckCircle2 className="w-4 h-4" /> },
    warning: { bg: 'bg-amber-500', icon: <AlertTriangle className="w-4 h-4" /> },
    error: { bg: 'bg-red-600', icon: <AlertTriangle className="w-4 h-4" /> },
    info: { bg: 'bg-blue-600', icon: <Info className="w-4 h-4" /> },
  }[toast.type];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white text-xs font-semibold shadow-xl transition-all duration-300 ${
        styles.bg
      } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ minWidth: '280px', maxWidth: '400px' }}
    >
      {styles.icon}
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

// Global toast manager hook
let globalAddToast: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export const useToastManager = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    globalAddToast = addToast;
    return () => { globalAddToast = null; };
  }, [addToast]);

  return { toasts, addToast, removeToast };
};

export const showToast = (toast: Omit<Toast, 'id'>) => {
  if (globalAddToast) globalAddToast(toast);
};
