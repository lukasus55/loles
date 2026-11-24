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
      <div className="flex flex-wrap items-center gap-2">
        {setups.map((setup) => {
          const isActive = setup.id === selectedSetupId;
          return (
            <Button
              key={setup.id}
              type="button"
              size="sm"
              variant={isActive ? "primary" : "outline"}
              onClick={() => onSelectSetup(setup)}
              className={
                isActive
                  ? "h-8 px-3.5 text-xs font-semibold"
                  : "h-8 px-3.5 text-xs border-neutral-800 bg-neutral-950/60 text-neutral-300 hover:text-white"
              }
            >
              {setup.name}
            </Button>
          );
        })}

        <Button
          type="button"
          size="sm"
          variant={selectedSetupId === null ? "secondary" : "ghost"}
          onClick={onStartNew}
          className="h-8 px-3 text-xs gap-1 border border-dashed border-neutral-700 text-neutral-300 hover:text-white"
        >
          <Plus className="w-3.5 h-3.5" />
          New Setup
        </Button>
      </div>

      {/* Name, Optional Tactical Hint & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-4">
          <Input
            label="Setup Name"
            value={draftName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. With Prio, Without Prio, Scaling"
          />
        </div>
        <div className="md:col-span-5">
          <Input
            label="Quick Hint (Optional)"
            value={draftNote}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="e.g. Push wave 1, crash wave 3 for cheater recall"
          />
        </div>
        <div className="md:col-span-3 flex items-center justify-end gap-2">
          {selectedSetupId && (
            <Button
              type="button"
              variant="outline"
              size="md"
              disabled={isSaving}
              onClick={() => onRequestDelete(selectedSetupId, draftName || "this setup")}
              className="border-red-900/50 text-red-500 hover:bg-red-950/40 hover:text-red-400 px-3 disabled:cursor-not-allowed"
              aria-label="Delete setup"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={isSaving || !draftName.trim()}
            onClick={onSave}
            className="flex-1 md:flex-none gap-1.5 px-4 disabled:cursor-not-allowed"
          >
            {isSaving ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
            {selectedSetupId ? "Update" : "Save"}
          </Button>
        </div>
      </div>

      {/* Interactive Pickers Side-by-Side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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
