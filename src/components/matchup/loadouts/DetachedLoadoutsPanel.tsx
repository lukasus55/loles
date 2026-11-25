"use client";

import React from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { MatchAssetsData, ShopItemData } from "@/lib/riot/assets";
import {
  BuildDraft,
  BuildPresetDTO,
  RunePageDraft,
  RunePresetDTO,
} from "@/lib/matchup/loadouts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { RunePicker } from "./RunePicker";
import { BuildPicker } from "./BuildPicker";

interface DetachedLoadoutsPanelProps {
  runePresets: RunePresetDTO[];
  buildPresets: BuildPresetDTO[];
  selectedRuneId: string | null;
  runeName: string;
  draftRunes: RunePageDraft;
  selectedBuildId: string | null;
  buildName: string;
  draftBuild: BuildDraft;
  isSavingRune: boolean;
  isSavingBuild: boolean;
  matchAssets: MatchAssetsData;
  shopItems: ShopItemData[];
  onSelectRunePreset: (preset: RunePresetDTO) => void;
  onNewRunePreset: () => void;
  onRuneNameChange: (name: string) => void;
  onRunesChange: (runes: RunePageDraft) => void;
  onSaveRunePreset: () => void;
  onDeleteRunePreset: (id: string, name: string) => void;
  onSelectBuildPreset: (preset: BuildPresetDTO) => void;
  onNewBuildPreset: () => void;
  onBuildNameChange: (name: string) => void;
  onBuildChange: (build: BuildDraft) => void;
  onSaveBuildPreset: () => void;
  onDeleteBuildPreset: (id: string, name: string) => void;
}

export const DetachedLoadoutsPanel: React.FC<DetachedLoadoutsPanelProps> = ({
  runePresets,
  buildPresets,
  selectedRuneId,
  runeName,
  draftRunes,
  selectedBuildId,
  buildName,
  draftBuild,
  isSavingRune,
  isSavingBuild,
  matchAssets,
  shopItems,
  onSelectRunePreset,
  onNewRunePreset,
  onRuneNameChange,
  onRunesChange,
  onSaveRunePreset,
  onDeleteRunePreset,
  onSelectBuildPreset,
  onNewBuildPreset,
  onBuildNameChange,
  onBuildChange,
  onSaveBuildPreset,
  onDeleteBuildPreset,
}) => {
  const pillClass = (isActive: boolean) =>
    `h-7 px-3 rounded-md text-xs font-medium border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
      isActive
        ? "bg-accent/15 border-accent/50 text-white"
        : "bg-neutral-950/50 border-neutral-800/80 text-neutral-400 hover:text-white hover:border-neutral-700"
    }`;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {/* LEFT: RUNE PRESETS */}
      <div className="space-y-3.5 bg-neutral-950/35 border border-neutral-800/75 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
            Rune Pages
          </h3>
          <span className="text-[11px] text-neutral-500 tabular-nums">
            {runePresets.length} saved
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {runePresets.map((rp) => (
            <button
              key={rp.id}
              type="button"
              onClick={() => onSelectRunePreset(rp)}
              className={pillClass(rp.id === selectedRuneId)}
            >
              {rp.name}
            </button>
          ))}
          <button
            type="button"
            onClick={onNewRunePreset}
            className={`h-7 px-2.5 rounded-md text-xs font-medium border border-dashed inline-flex items-center gap-1 transition-colors cursor-pointer ${
              selectedRuneId === null
                ? "bg-neutral-800/80 border-neutral-600 text-white"
                : "border-neutral-700/80 text-neutral-400 hover:text-white"
            }`}
          >
            <Plus className="w-3 h-3" />
            New
          </button>
        </div>

        <div className="flex items-end gap-2">
          <Input
            label="Rune Page Name"
            value={runeName}
            onChange={(e) => onRuneNameChange(e.target.value)}
            placeholder="e.g. Lethal Tempo, Fleet Sustain"
            className="h-9 bg-neutral-950/70"
          />
          {selectedRuneId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSavingRune}
              onClick={() => onDeleteRunePreset(selectedRuneId, runeName || "this rune page")}
              className="h-9 w-9 p-0 border-red-900/50 text-red-400 hover:bg-red-950/40 shrink-0 disabled:cursor-not-allowed"
              aria-label="Delete rune preset"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isSavingRune || !runeName.trim()}
            onClick={onSaveRunePreset}
            className="h-9 gap-1.5 px-3.5 shrink-0 disabled:cursor-not-allowed"
          >
            {isSavingRune ? <Spinner size="sm" /> : <Save className="w-3.5 h-3.5" />}
            Save
          </Button>
        </div>

        <RunePicker trees={matchAssets.runes} value={draftRunes} onChange={onRunesChange} />
      </div>

      {/* RIGHT: BUILD PRESETS */}
      <div className="space-y-3.5 bg-neutral-950/35 border border-neutral-800/75 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
            Item Builds
          </h3>
          <span className="text-[11px] text-neutral-500 tabular-nums">
            {buildPresets.length} saved
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {buildPresets.map((bp) => (
            <button
              key={bp.id}
              type="button"
              onClick={() => onSelectBuildPreset(bp)}
              className={pillClass(bp.id === selectedBuildId)}
            >
              {bp.name}
            </button>
          ))}
          <button
            type="button"
            onClick={onNewBuildPreset}
            className={`h-7 px-2.5 rounded-md text-xs font-medium border border-dashed inline-flex items-center gap-1 transition-colors cursor-pointer ${
              selectedBuildId === null
                ? "bg-neutral-800/80 border-neutral-600 text-white"
                : "border-neutral-700/80 text-neutral-400 hover:text-white"
            }`}
          >
            <Plus className="w-3 h-3" />
            New
          </button>
        </div>

        <div className="flex items-end gap-2">
          <Input
            label="Build Name"
            value={buildName}
            onChange={(e) => onBuildNameChange(e.target.value)}
            placeholder="e.g. Crit Core, Vs Heavy AP"
            className="h-9 bg-neutral-950/70"
          />
          {selectedBuildId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSavingBuild}
              onClick={() => onDeleteBuildPreset(selectedBuildId, buildName || "this build")}
              className="h-9 w-9 p-0 border-red-900/50 text-red-400 hover:bg-red-950/40 shrink-0 disabled:cursor-not-allowed"
              aria-label="Delete build preset"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isSavingBuild || !buildName.trim()}
            onClick={onSaveBuildPreset}
            className="h-9 gap-1.5 px-3.5 shrink-0 disabled:cursor-not-allowed"
          >
            {isSavingBuild ? <Spinner size="sm" /> : <Save className="w-3.5 h-3.5" />}
            Save
          </Button>
        </div>

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
