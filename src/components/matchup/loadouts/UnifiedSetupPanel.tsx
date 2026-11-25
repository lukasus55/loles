"use client";

import React from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { MatchAssetsData, ShopItemData } from "@/lib/riot/assets";
import { BuildDraft, RunePageDraft, SetupPresetDTO } from "@/lib/matchup/loadouts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { RunePicker } from "./RunePicker";
import { BuildPicker } from "./BuildPicker";

interface UnifiedSetupPanelProps {
  setups: SetupPresetDTO[];
  selectedSetupId: string | null;
  draftName: string;
  draftNote: string;
  draftRunes: RunePageDraft;
  draftBuild: BuildDraft;
  isSaving: boolean;
  matchAssets: MatchAssetsData;
  shopItems: ShopItemData[];
  onSelectSetup: (setup: SetupPresetDTO) => void;
  onStartNew: () => void;
  onNameChange: (name: string) => void;
  onNoteChange: (note: string) => void;
  onRunesChange: (runes: RunePageDraft) => void;
  onBuildChange: (build: BuildDraft) => void;
  onSave: () => void;
  onRequestDelete: (setupId: string, name: string) => void;
}

export const UnifiedSetupPanel: React.FC<UnifiedSetupPanelProps> = ({
  setups,
  selectedSetupId,
  draftName,
  draftNote,
  draftRunes,
  draftBuild,
  isSaving,
  matchAssets,
  shopItems,
  onSelectSetup,
  onStartNew,
  onNameChange,
  onNoteChange,
  onRunesChange,
  onBuildChange,
  onSave,
  onRequestDelete,
}) => {
  return (
    <div className="space-y-4">
      {/* Preset Pills Row */}
      <div className="flex flex-wrap items-center gap-1.5">
        {setups.map((setup) => {
          const isActive = setup.id === selectedSetupId;
          return (
            <button
              key={setup.id}
              type="button"
              onClick={() => onSelectSetup(setup)}
              className={`h-7 px-3 rounded-md text-xs font-medium border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                isActive
                  ? "bg-accent/15 border-accent/50 text-white"
                  : "bg-neutral-950/50 border-neutral-800/80 text-neutral-400 hover:text-white hover:border-neutral-700"
              }`}
            >
              {setup.name}
            </button>
          );
        })}

        <button
          type="button"
          onClick={onStartNew}
          className={`h-7 px-2.5 rounded-md text-xs font-medium border border-dashed inline-flex items-center gap-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
            selectedSetupId === null
              ? "bg-neutral-800/80 border-neutral-600 text-white"
              : "bg-transparent border-neutral-700/80 text-neutral-400 hover:text-white hover:border-neutral-600"
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          New Setup
        </button>
      </div>

      {/* Name, Optional Hint & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-4">
          <Input
            label="Setup Name"
            value={draftName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. With Prio, Without Prio"
            className="h-9 bg-neutral-950/70"
          />
        </div>
        <div className="md:col-span-5">
          <Input
            label="Quick Hint (Optional)"
            value={draftNote}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="e.g. Push wave 1, crash wave 3 for cheater recall"
            className="h-9 bg-neutral-950/70"
          />
        </div>
        <div className="md:col-span-3 flex items-center justify-end gap-2">
          {selectedSetupId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => onRequestDelete(selectedSetupId, draftName || "this setup")}
              className="h-9 w-9 p-0 border-red-900/50 text-red-400 hover:bg-red-950/40 hover:text-red-300 disabled:cursor-not-allowed"
              aria-label="Delete setup"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isSaving || !draftName.trim()}
            onClick={onSave}
            className="flex-1 md:flex-none h-9 gap-1.5 px-4 disabled:cursor-not-allowed"
          >
            {isSaving ? <Spinner size="sm" /> : <Save className="w-3.5 h-3.5" />}
            {selectedSetupId ? "Update" : "Save"}
          </Button>
        </div>
      </div>

      {/* Interactive Pickers Side-by-Side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        <RunePicker trees={matchAssets.runes} value={draftRunes} onChange={onRunesChange} />
        <BuildPicker
          value={draftBuild}
          onChange={onBuildChange}
          itemsById={matchAssets.items}
          shopItems={shopItems}
          ddragonVersion={matchAssets.version}
        />
      </div>
    </div>
  );
};
