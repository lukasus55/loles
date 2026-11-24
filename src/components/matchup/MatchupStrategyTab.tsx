"use client";

import React from "react";
import { MatchupStrategyEditor } from "@/components/notes/editor/MatchupStrategyEditor";
import { Button } from "@/components/ui/Button";
import { Role } from "@/components/notes/RoleFilter";
import { MatchAssetsData, ShopItemData } from "@/lib/riot/assets";
import { BuildPresetDTO, RunePresetDTO, SetupPresetDTO } from "@/lib/matchup/loadouts";
import {
  ImportedLoadoutDraft,
  MatchupLoadoutsSection,
} from "./loadouts/MatchupLoadoutsSection";

const PRIO_OPTIONS = ["Yes", "50/50", "No", "N/A"] as const;

interface MatchupStrategyTabProps {
  matchup: {
    role: Role;
    myPick: string;
    enemyPick: string;
    mySupp: string | null;
    enemySupp: string | null;
  };
  notes: string;
  prio: string;
  onNotesChange: (value: string) => void;
  onPrioChange: (value: string) => void;
  initialDetachLoadouts: boolean;
  initialSetups: SetupPresetDTO[];
  initialRunePresets: RunePresetDTO[];
  initialBuildPresets: BuildPresetDTO[];
  importedDraft?: ImportedLoadoutDraft | null;
  matchAssets: MatchAssetsData;
  shopItems: ShopItemData[];
  onNoteAutoCreated?: (noteId: string) => void;
}

export const MatchupStrategyTab: React.FC<MatchupStrategyTabProps> = ({
  matchup,
  notes,
  prio,
  onNotesChange,
  onPrioChange,
  initialDetachLoadouts,
  initialSetups,
  initialRunePresets,
  initialBuildPresets,
  importedDraft,
  matchAssets,
  shopItems,
  onNoteAutoCreated,
}) => {
  return (
    <div className="space-y-8">
      {/* Interactive Runes & Builds Presets Section */}
      <MatchupLoadoutsSection
        matchup={matchup}
        initialDetachLoadouts={initialDetachLoadouts}
        initialSetups={initialSetups}
        initialRunePresets={initialRunePresets}
        initialBuildPresets={initialBuildPresets}
        importedDraft={importedDraft}
        matchAssets={matchAssets}
        shopItems={shopItems}
        onNoteAutoCreated={onNoteAutoCreated}
      />

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
