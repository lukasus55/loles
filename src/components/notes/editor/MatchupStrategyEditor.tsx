"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MatchupStrategyEditorProps {
  notes: string;
  onChange: (val: string) => void;
  rightSlot?: React.ReactNode;
}

export const MatchupStrategyEditor: React.FC<MatchupStrategyEditorProps> = ({
  notes,
  onChange,
  rightSlot,
}) => {
  const [previewMode, setPreviewMode] = useState<"edit" | "live" | "preview">("edit");

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-base font-semibold text-white tracking-tight">
            Matchup Strategy
          </h2>
          {rightSlot}
        </div>

        <div className="inline-flex items-center gap-0.5 bg-neutral-900/70 border border-neutral-800/80 p-0.5 rounded-lg w-fit">
          {(
            [
              { id: "edit", label: "Edit" },
              { id: "live", label: "Split" },
              { id: "preview", label: "View" },
            ] as const
          ).map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setPreviewMode(mode.id)}
              className={`cursor-pointer px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                previewMode === mode.id
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div data-color-mode="dark" className="rounded-lg overflow-hidden">
        <MDEditor
          value={notes}
          onChange={(val) => onChange(val || "")}
          height={440}
          preview={previewMode}
        />
      </div>
    </div>
  );
};
