"use client";

import React from "react";
import { Link2, Unlink } from "lucide-react";
import { MatchAssetsData, ShopItemData } from "@/lib/riot/assets";
import { Role } from "@/components/notes/RoleFilter";
import { BuildPresetDTO, RunePresetDTO, SetupPresetDTO } from "@/lib/matchup/loadouts";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { UnifiedSetupPanel } from "./UnifiedSetupPanel";
import { DetachedLoadoutsPanel } from "./DetachedLoadoutsPanel";
import { ImportedLoadoutDraft, useLoadoutPresets } from "./useLoadoutPresets";

export type { ImportedLoadoutDraft };

interface MatchupLoadoutsSectionProps {
  matchup: {
    role: Role;
    myPick: string;
    enemyPick: string;
    mySupp: string | null;
    enemySupp: string | null;
  };
  initialDetachLoadouts: boolean;
  initialSetups: SetupPresetDTO[];
  initialRunePresets: RunePresetDTO[];
  initialBuildPresets: BuildPresetDTO[];
  importedDraft?: ImportedLoadoutDraft | null;
  matchAssets: MatchAssetsData;
  shopItems: ShopItemData[];
  onNoteAutoCreated?: (noteId: string) => void;
}

export const MatchupLoadoutsSection: React.FC<MatchupLoadoutsSectionProps> = ({
  matchup,
  initialDetachLoadouts,
  initialSetups,
  initialRunePresets,
  initialBuildPresets,
  importedDraft,
  matchAssets,
  shopItems,
  onNoteAutoCreated,
}) => {
  const presets = useLoadoutPresets({
    matchup,
    initialDetachLoadouts,
    initialSetups,
    initialRunePresets,
    initialBuildPresets,
    importedDraft,
    onNoteAutoCreated,
  });

  return (
    <section className="rounded-lg border border-neutral-800/75 bg-neutral-900/35 p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/60 pb-3.5">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">
            Runes &amp; Builds
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {presets.detachLoadouts
              ? "Detached mode — manage rune pages and item builds independently."
              : "Linked mode — each setup pairs a rune page with an item build."}
          </p>
        </div>

        <Tooltip
          title={presets.detachLoadouts ? "Re-link as Unified Setups" : "Detach Runes & Builds"}
          content={
            presets.detachLoadouts
              ? "Switch back to named setups combining runes and builds together. Existing data is preserved."
              : "Unlink runes and builds so you can save separate rune pages and separate builds independently."
          }
          position="top"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={presets.isTogglingMode}
            onClick={presets.handleToggleDetach}
            className="h-8 gap-1.5 border-neutral-800 bg-neutral-950/60 text-neutral-300 hover:bg-neutral-800/80 hover:text-white disabled:cursor-not-allowed"
          >
            {presets.detachLoadouts ? (
              <>
                <Link2 className="w-3.5 h-3.5 text-amber-400" />
                Link as Setups
              </>
            ) : (
              <>
                <Unlink className="w-3.5 h-3.5 text-neutral-400" />
                Detach Runes &amp; Builds
              </>
            )}
          </Button>
        </Tooltip>
      </div>

      {presets.detachLoadouts ? (
        <DetachedLoadoutsPanel
          runePresets={presets.runePresets}
          buildPresets={presets.buildPresets}
          selectedRuneId={presets.selectedRuneId}
          runeName={presets.runeName}
          draftRunes={presets.detachedRunes}
          selectedBuildId={presets.selectedBuildId}
          buildName={presets.buildName}
          draftBuild={presets.detachedBuild}
          isSavingRune={presets.isSavingRune}
          isSavingBuild={presets.isSavingBuild}
          matchAssets={matchAssets}
          shopItems={shopItems}
          onSelectRunePreset={presets.selectRunePreset}
          onNewRunePreset={presets.startNewRunePreset}
          onRuneNameChange={presets.setRuneName}
          onRunesChange={presets.setDetachedRunes}
          onSaveRunePreset={presets.handleSaveRunePreset}
          onDeleteRunePreset={(id, name) =>
            presets.setPendingDelete({ kind: "rune", id, name })
          }
          onSelectBuildPreset={presets.selectBuildPreset}
          onNewBuildPreset={presets.startNewBuildPreset}
          onBuildNameChange={presets.setBuildName}
          onBuildChange={presets.setDetachedBuild}
          onSaveBuildPreset={presets.handleSaveBuildPreset}
          onDeleteBuildPreset={(id, name) =>
            presets.setPendingDelete({ kind: "build", id, name })
          }
        />
      ) : (
        <UnifiedSetupPanel
          setups={presets.setups}
          selectedSetupId={presets.selectedSetupId}
          draftName={presets.setupName}
          draftNote={presets.setupNote}
          draftRunes={presets.setupRunes}
          draftBuild={presets.setupBuild}
          isSaving={presets.isSavingSetup}
          matchAssets={matchAssets}
          shopItems={shopItems}
          onSelectSetup={presets.selectSetup}
          onStartNew={presets.startNewSetup}
          onNameChange={presets.setSetupName}
          onNoteChange={presets.setSetupNote}
          onRunesChange={presets.setSetupRunes}
          onBuildChange={presets.setSetupBuild}
          onSave={presets.handleSaveSetup}
          onRequestDelete={(id, name) =>
            presets.setPendingDelete({ kind: "setup", id, name })
          }
        />
      )}

      <ConfirmDialog
        isOpen={presets.pendingDelete !== null}
        title="Delete Preset"
        description={`Are you sure you want to delete "${presets.pendingDelete?.name ?? ""}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={presets.executeDelete}
        onCancel={() => presets.setPendingDelete(null)}
      />
    </section>
  );
};
