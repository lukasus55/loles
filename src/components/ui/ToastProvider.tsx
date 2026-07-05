"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (options: Omit<ToastMessage, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 5000;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 10);

    return () => clearInterval(interval);
  }, [duration, toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const bgColors = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-blue-500"
  };

  return (
    <div className="relative overflow-hidden bg-neutral-900 border border-neutral-800 shadow-xl rounded-lg p-4 mb-3 w-80 animate-in slide-in-from-right-8 fade-in duration-300">
      <div className="flex items-start gap-3 relative z-10">
        <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
        <div className="flex-1">
          {toast.title && <h4 className="text-sm font-bold text-white mb-1">{toast.title}</h4>}
          <p className="text-sm text-neutral-300">{toast.message}</p>
        </div>
        <button 
          onClick={() => onDismiss(toast.id)} 
          className="shrink-0 text-neutral-500 hover:text-white transition-colors p-0.5 -mt-0.5 -mr-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-800">
        <div 
          className={`h-full ${bgColors[toast.type]} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((options: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...options, id }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
