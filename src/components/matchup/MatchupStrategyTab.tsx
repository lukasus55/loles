"use client";

import React from "react";
import { MatchupStrategyEditor } from "@/components/notes/editor/MatchupStrategyEditor";
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
  const prioSelector = (
    <div className="flex items-center gap-2">
      <span className="text-xs text-neutral-500">Lane Prio:</span>
      <div className="inline-flex items-center gap-0.5 bg-neutral-900/70 border border-neutral-800/80 p-0.5 rounded-lg">
        {PRIO_OPTIONS.map((option) => {
          const isSelected = prio === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onPrioChange(option)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                isSelected
                  ? "bg-accent/15 border border-accent/45 text-white"
                  : "border border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800/60"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
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

      <MatchupStrategyEditor notes={notes} onChange={onNotesChange} rightSlot={prioSelector} />
    </div>
  );
};
