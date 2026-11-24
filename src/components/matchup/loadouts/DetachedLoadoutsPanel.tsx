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
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {/* LEFT CARD: INDEPENDENT RUNE PRESETS */}
      <div className="space-y-3.5 bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Rune Pages</h4>
          <span className="text-xs text-neutral-500">{runePresets.length} saved</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {runePresets.map((rp) => {
            const isActive = rp.id === selectedRuneId;
            return (
              <Button
                key={rp.id}
                type="button"
                size="sm"
                variant={isActive ? "primary" : "outline"}
                onClick={() => onSelectRunePreset(rp)}
                className={
                  isActive
                    ? "h-7 px-3 text-xs"
                    : "h-7 px-3 text-xs border-neutral-800 bg-neutral-950/60 text-neutral-300"
                }
              >
                {rp.name}
              </Button>
            );
          })}
          <Button
            type="button"
            size="sm"
            variant={selectedRuneId === null ? "secondary" : "ghost"}
            onClick={onNewRunePreset}
            className="h-7 px-2.5 text-xs gap-1 border border-dashed border-neutral-700 text-neutral-300"
          >
            <Plus className="w-3 h-3" />
            New
          </Button>
        </div>

        <div className="flex items-end gap-2">
          <Input
            label="Rune Page Name"
            value={runeName}
            onChange={(e) => onRuneNameChange(e.target.value)}
            placeholder="e.g. Lethal Tempo, Fleet Sustain"
          />
          {selectedRuneId && (
            <Button
              type="button"
              variant="outline"
              size="md"
              disabled={isSavingRune}
              onClick={() => onDeleteRunePreset(selectedRuneId, runeName || "this rune page")}
              className="border-red-900/50 text-red-500 hover:bg-red-950/40 px-3 shrink-0 disabled:cursor-not-allowed"
              aria-label="Delete rune preset"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={isSavingRune || !runeName.trim()}
            onClick={onSaveRunePreset}
            className="gap-1.5 px-3.5 shrink-0 disabled:cursor-not-allowed"
          >
            {isSavingRune ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
            Save
          </Button>
        </div>

        <RunePicker trees={matchAssets.runes} value={draftRunes} onChange={onRunesChange} />
      </div>

      {/* RIGHT CARD: INDEPENDENT BUILD PRESETS */}
      <div className="space-y-3.5 bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Item Builds</h4>
          <span className="text-xs text-neutral-500">{buildPresets.length} saved</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {buildPresets.map((bp) => {
            const isActive = bp.id === selectedBuildId;
            return (
              <Button
                key={bp.id}
                type="button"
                size="sm"
                variant={isActive ? "primary" : "outline"}
                onClick={() => onSelectBuildPreset(bp)}
                className={
                  isActive
                    ? "h-7 px-3 text-xs"
                    : "h-7 px-3 text-xs border-neutral-800 bg-neutral-950/60 text-neutral-300"
                }
              >
                {bp.name}
              </Button>
            );
          })}
          <Button
            type="button"
            size="sm"
            variant={selectedBuildId === null ? "secondary" : "ghost"}
            onClick={onNewBuildPreset}
            className="h-7 px-2.5 text-xs gap-1 border border-dashed border-neutral-700 text-neutral-300"
          >
            <Plus className="w-3 h-3" />
            New
          </Button>
        </div>

        <div className="flex items-end gap-2">
          <Input
            label="Build Name"
            value={buildName}
            onChange={(e) => onBuildNameChange(e.target.value)}
            placeholder="e.g. Crit Core, Vs Heavy AP"
          />
          {selectedBuildId && (
            <Button
              type="button"
              variant="outline"
              size="md"
              disabled={isSavingBuild}
              onClick={() => onDeleteBuildPreset(selectedBuildId, buildName || "this build")}
              className="border-red-900/50 text-red-500 hover:bg-red-950/40 px-3 shrink-0 disabled:cursor-not-allowed"
              aria-label="Delete build preset"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={isSavingBuild || !buildName.trim()}
            onClick={onSaveBuildPreset}
            className="gap-1.5 px-3.5 shrink-0 disabled:cursor-not-allowed"
          >
            {isSavingBuild ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
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
