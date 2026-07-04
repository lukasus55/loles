"use client";
import React, { useEffect } from "react";
import { Button } from "./Button";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div 
        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-6">
          <div className={`p-3 rounded-full shrink-0 ${isDestructive ? 'bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-neutral-800 text-white'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="pt-1">
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-2">
          <Button variant="outline" onClick={onCancel} className="px-5 border-neutral-700 hover:bg-neutral-800 hover:text-white">
            {cancelText}
          </Button>
          <Button 
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-5 ${isDestructive ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
