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

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const duration = toast.duration || 5000;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), duration);
    return () => clearTimeout(timer);
  }, [duration, toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    error: <XCircle className="w-4 h-4 text-red-400" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    info: <Info className="w-4 h-4 text-blue-400" />,
  };

  const barColors = {
    success: "bg-emerald-500/80",
    error: "bg-red-500/80",
    warning: "bg-amber-500/80",
    info: "bg-blue-500/80",
  };

  return (
    <div
      role="status"
      className="relative overflow-hidden bg-[#0d0e12]/95 backdrop-blur-md border border-neutral-800/90 shadow-2xl shadow-black/70 rounded-lg px-3.5 py-3 w-80 animate-in slide-in-from-right-6 fade-in duration-200"
    >
      <div className="flex items-start gap-2.5">
        <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="text-xs font-semibold text-white leading-snug">{toast.title}</h4>
          )}
          <p className={`text-xs text-neutral-300 leading-relaxed ${toast.title ? "mt-0.5" : ""}`}>
            {toast.message}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          className="shrink-0 text-neutral-500 hover:text-white transition-colors p-1 -mt-1 -mr-1 rounded cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Smooth CSS Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-800/80">
        <div
          className={`h-full origin-left ${barColors[toast.type]}`}
          style={{
            animation: `toast-shrink ${duration}ms linear forwards`,
          }}
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
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2.5">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
