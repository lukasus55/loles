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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="bg-[#0d0e12] border border-neutral-800 rounded-xl p-5 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col relative overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close dialog"
          className="absolute top-3.5 right-3.5 h-8 w-8 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/70 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 mb-5 pr-8">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
              isDestructive ? "bg-red-500/10 text-red-400" : "bg-neutral-800 text-neutral-200"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="px-4 border-neutral-800 hover:bg-neutral-800 hover:text-white"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-4 ${
              isDestructive ? "bg-red-600 hover:bg-red-700 text-white" : ""
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
