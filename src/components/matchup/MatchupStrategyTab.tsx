"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { MatchupStrategyEditor } from "@/components/notes/editor/MatchupStrategyEditor";
import { Button } from "@/components/ui/Button";

const PRIO_OPTIONS = ["Yes", "50/50", "No", "N/A"] as const;

interface MatchupStrategyTabProps {
  notes: string;
  prio: string;
  onNotesChange: (value: string) => void;
  onPrioChange: (value: string) => void;
}

export const MatchupStrategyTab: React.FC<MatchupStrategyTabProps> = ({
  notes,
  prio,
  onNotesChange,
  onPrioChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Stage 5 Loadouts Slot (Runes & Builds Presets) */}
      <div className="bg-neutral-900/50 border border-neutral-800/90 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-950/50 border border-red-900/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Runes &amp; Builds Presets</p>
            <p className="text-xs text-neutral-400">
              Interactive rune tree &amp; item build picker with named presets (e.g. With Prio / Without Prio) arrives in Stage 5.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 bg-neutral-950 border border-neutral-800 px-2.5 py-1 rounded-md w-fit shrink-0">
          Next Up
        </span>
      </div>

      {/* Strategy Markdown Editor + Lane Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <MatchupStrategyEditor notes={notes} onChange={onNotesChange} />

        <div className="space-y-6">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-md font-bold text-white mb-4">Lane Priority</h3>
            <div className="flex flex-col space-y-2">
              {PRIO_OPTIONS.map((option) => {
                const isSelected = prio === option;
                return (
                  <Button
                    key={option}
                    type="button"
                    variant="outline"
                    onClick={() => onPrioChange(option)}
                    className={`justify-start h-11 px-4 text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-red-950/40 border-red-900 text-white hover:bg-red-950/60 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                        : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                    }`}
                  >
                    {option}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
