"use client";

import React, { useState } from "react";
import { Link2, Unlink } from "lucide-react";
import { MatchAssetsData, ShopItemData } from "@/lib/riot/assets";
import { Role } from "@/components/notes/RoleFilter";
import {
  BuildDraft,
  BuildPresetDTO,
  EMPTY_BUILD_DRAFT,
  EMPTY_RUNE_DRAFT,
  RunePageDraft,
  RunePresetDTO,
  SetupPresetDTO,
  normalizeBuildDraft,
  normalizeRuneDraft,
} from "@/lib/matchup/loadouts";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { UnifiedSetupPanel } from "./UnifiedSetupPanel";
import { DetachedLoadoutsPanel } from "./DetachedLoadoutsPanel";

export interface ImportedLoadoutDraft {
  id: number;
  suggestedName: string;
  runes: RunePageDraft;
  build: BuildDraft;
}

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

type PendingDelete =
  | { kind: "setup"; id: string; name: string }
  | { kind: "rune"; id: string; name: string }
  | { kind: "build"; id: string; name: string }
  | null;

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
  const { toast } = useToast();

  const [detachLoadouts, setDetachLoadouts] = useState(initialDetachLoadouts);
  const [isTogglingMode, setIsTogglingMode] = useState(false);

  const [setups, setSetups] = useState<SetupPresetDTO[]>(initialSetups);
  const [runePresets, setRunePresets] = useState<RunePresetDTO[]>(initialRunePresets);
  const [buildPresets, setBuildPresets] = useState<BuildPresetDTO[]>(initialBuildPresets);

  // Unified setup editor state
  const firstSetup = initialSetups[0] ?? null;
  const [selectedSetupId, setSelectedSetupId] = useState<string | null>(
    importedDraft ? null : firstSetup?.id ?? null
  );
  const [setupName, setSetupName] = useState(
    importedDraft ? importedDraft.suggestedName : firstSetup?.name ?? ""
  );
  const [setupNote, setSetupNote] = useState(importedDraft ? "" : firstSetup?.note ?? "");
  const [setupRunes, setSetupRunes] = useState<RunePageDraft>(
    importedDraft ? importedDraft.runes : normalizeRuneDraft(firstSetup?.runePreset)
  );
  const [setupBuild, setSetupBuild] = useState<BuildDraft>(
    importedDraft ? importedDraft.build : normalizeBuildDraft(firstSetup?.buildPreset)
  );
  const [isSavingSetup, setIsSavingSetup] = useState(false);

  // Detached editor state
  const firstRune = initialRunePresets[0] ?? null;
  const [selectedRuneId, setSelectedRuneId] = useState<string | null>(
    importedDraft ? null : firstRune?.id ?? null
  );
  const [runeName, setRuneName] = useState(
    importedDraft ? importedDraft.suggestedName : firstRune?.name ?? ""
  );
  const [detachedRunes, setDetachedRunes] = useState<RunePageDraft>(
    importedDraft ? importedDraft.runes : normalizeRuneDraft(firstRune)
  );
  const [isSavingRune, setIsSavingRune] = useState(false);

  const firstBuild = initialBuildPresets[0] ?? null;
  const [selectedBuildId, setSelectedBuildId] = useState<string | null>(
    importedDraft ? null : firstBuild?.id ?? null
  );
  const [buildName, setBuildName] = useState(
    importedDraft ? importedDraft.suggestedName : firstBuild?.name ?? ""
  );
  const [detachedBuild, setDetachedBuild] = useState<BuildDraft>(
    importedDraft ? importedDraft.build : normalizeBuildDraft(firstBuild)
  );
  const [isSavingBuild, setIsSavingBuild] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);

  // Apply imported match draft whenever its sequence id changes
  const [lastAppliedImportId, setLastAppliedImportId] = useState<number | null>(
    importedDraft?.id ?? null
  );
  if (importedDraft && importedDraft.id !== lastAppliedImportId) {
    setLastAppliedImportId(importedDraft.id);
    setSelectedSetupId(null);
    setSetupName(importedDraft.suggestedName);
    setSetupNote("");
    setSetupRunes(importedDraft.runes);
    setSetupBuild(importedDraft.build);

    setSelectedRuneId(null);
    setRuneName(importedDraft.suggestedName);
    setDetachedRunes(importedDraft.runes);

    setSelectedBuildId(null);
    setBuildName(importedDraft.suggestedName);
    setDetachedBuild(importedDraft.build);
  }

  const handleToggleDetach = async () => {
    const nextDetach = !detachLoadouts;
    setIsTogglingMode(true);
    try {
      const res = await fetch("/api/matchup/loadouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleDetach",
          matchup,
          detachLoadouts: nextDetach,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDetachLoadouts(nextDetach);
        if (data.noteId) onNoteAutoCreated?.(data.noteId);
      } else {
        toast({ type: "error", title: "Mode Switch Failed", message: data.message });
      }
    } catch {
      toast({ type: "error", title: "Error", message: "Could not update loadout mode." });
    } finally {
      setIsTogglingMode(false);
    }
  };

  const handleSaveSetup = async () => {
    if (!setupName.trim()) return;
    setIsSavingSetup(true);
    try {
      const res = await fetch("/api/matchup/loadouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "saveSetup",
          matchup,
          setupId: selectedSetupId,
          name: setupName.trim(),
          note: setupNote.trim(),
          runes: setupRunes,
          build: setupBuild,
        }),
      });
      const data = await res.json();
      if (res.ok && data.setup) {
        const saved: SetupPresetDTO = data.setup;
        if (data.noteId) onNoteAutoCreated?.(data.noteId);
        setSetups((prev) =>
          prev.some((s) => s.id === saved.id)
            ? prev.map((s) => (s.id === saved.id ? saved : s))
            : [...prev, saved]
        );
        if (saved.runePreset) {
          setRunePresets((prev) =>
            prev.some((r) => r.id === saved.runePreset!.id)
              ? prev.map((r) => (r.id === saved.runePreset!.id ? saved.runePreset! : r))
              : [...prev, saved.runePreset!]
          );
        }
        if (saved.buildPreset) {
          setBuildPresets((prev) =>
            prev.some((b) => b.id === saved.buildPreset!.id)
              ? prev.map((b) => (b.id === saved.buildPreset!.id ? saved.buildPreset! : b))
              : [...prev, saved.buildPreset!]
          );
        }
        setSelectedSetupId(saved.id);
        toast({
          type: "success",
          title: selectedSetupId ? "Setup Updated" : "Setup Saved",
          message: `"${saved.name}" saved to this matchup.`,
        });
      } else {
        toast({ type: "error", title: "Save Failed", message: data.message });
      }
    } catch {
      toast({ type: "error", title: "Error", message: "Unexpected error while saving setup." });
    } finally {
      setIsSavingSetup(false);
    }
  };

  const handleSaveRunePreset = async () => {
    if (!runeName.trim()) return;
    setIsSavingRune(true);
    try {
      const res = await fetch("/api/matchup/loadouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "saveRunePreset",
          matchup,
          presetId: selectedRuneId,
          name: runeName.trim(),
          runes: detachedRunes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.runePreset) {
        const saved: RunePresetDTO = data.runePreset;
        if (data.noteId) onNoteAutoCreated?.(data.noteId);
        setRunePresets((prev) =>
          prev.some((r) => r.id === saved.id)
            ? prev.map((r) => (r.id === saved.id ? saved : r))
            : [...prev, saved]
        );
        setSelectedRuneId(saved.id);
        toast({ type: "success", title: "Rune Page Saved", message: `"${saved.name}" saved.` });
      } else {
        toast({ type: "error", title: "Save Failed", message: data.message });
      }
    } catch {
      toast({ type: "error", title: "Error", message: "Could not save rune page." });
    } finally {
      setIsSavingRune(false);
    }
  };

  const handleSaveBuildPreset = async () => {
    if (!buildName.trim()) return;
    setIsSavingBuild(true);
    try {
      const res = await fetch("/api/matchup/loadouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "saveBuildPreset",
          matchup,
          presetId: selectedBuildId,
          name: buildName.trim(),
          build: detachedBuild,
        }),
      });
      const data = await res.json();
      if (res.ok && data.buildPreset) {
        const saved: BuildPresetDTO = data.buildPreset;
        if (data.noteId) onNoteAutoCreated?.(data.noteId);
        setBuildPresets((prev) =>
          prev.some((b) => b.id === saved.id)
            ? prev.map((b) => (b.id === saved.id ? saved : b))
            : [...prev, saved]
        );
        setSelectedBuildId(saved.id);
        toast({ type: "success", title: "Build Saved", message: `"${saved.name}" saved.` });
      } else {
        toast({ type: "error", title: "Save Failed", message: data.message });
      }
    } catch {
      toast({ type: "error", title: "Error", message: "Could not save build." });
    } finally {
      setIsSavingBuild(false);
    }
  };

  const executeDelete = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);

    try {
      const payload =
        target.kind === "setup"
          ? { action: "deleteSetup", setupId: target.id }
          : target.kind === "rune"
          ? { action: "deleteRunePreset", presetId: target.id }
          : { action: "deleteBuildPreset", presetId: target.id };

      const res = await fetch("/api/matchup/loadouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        toast({ type: "error", title: "Delete Failed", message: "Could not delete preset." });
        return;
      }

      if (target.kind === "setup") {
        const removed = setups.find((s) => s.id === target.id);
        const remaining = setups.filter((s) => s.id !== target.id);
        setSetups(remaining);
        if (removed?.runePresetId) {
          setRunePresets((prev) => prev.filter((r) => r.id !== removed.runePresetId));
        }
        if (removed?.buildPresetId) {
          setBuildPresets((prev) => prev.filter((b) => b.id !== removed.buildPresetId));
        }
        const next = remaining[0] ?? null;
        setSelectedSetupId(next?.id ?? null);
        setSetupName(next?.name ?? "");
        setSetupNote(next?.note ?? "");
        setSetupRunes(normalizeRuneDraft(next?.runePreset));
        setSetupBuild(normalizeBuildDraft(next?.buildPreset));
      } else if (target.kind === "rune") {
        const remaining = runePresets.filter((r) => r.id !== target.id);
        setRunePresets(remaining);
        const next = remaining[0] ?? null;
        setSelectedRuneId(next?.id ?? null);
        setRuneName(next?.name ?? "");
        setDetachedRunes(normalizeRuneDraft(next));
      } else {
        const remaining = buildPresets.filter((b) => b.id !== target.id);
        setBuildPresets(remaining);
        const next = remaining[0] ?? null;
        setSelectedBuildId(next?.id ?? null);
        setBuildName(next?.name ?? "");
        setDetachedBuild(normalizeBuildDraft(next));
      }

      toast({ type: "success", title: "Preset Deleted", message: `"${target.name}" removed.` });
    } catch {
      toast({ type: "error", title: "Error", message: "Unexpected error while deleting." });
    }
  };

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 space-y-5 shadow-sm">
      {/* Header + Linked / Detached Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/70 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center tracking-tight">
            <span className="w-1.5 h-5 bg-red-600 rounded-full mr-3 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
            Runes &amp; Builds
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5 pl-4">
            {detachLoadouts
              ? "Detached mode — manage rune pages and item builds independently."
              : "Linked mode — each named setup pairs a rune page with an item build."}
          </p>
        </div>

        <Tooltip
          title={detachLoadouts ? "Re-link as Unified Setups" : "Detach Runes & Builds"}
          content={
            detachLoadouts
              ? "Switch back to named setups combining runes and builds together (e.g. With Prio / Without Prio). Existing data is preserved."
              : "Unlink runes and item builds so you can save separate rune pages and separate builds independently without duplicating."
          }
          position="top"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isTogglingMode}
            onClick={handleToggleDetach}
            className="gap-1.5 border-neutral-700 bg-neutral-950/70 text-neutral-200 hover:bg-neutral-800 disabled:cursor-not-allowed"
          >
            {detachLoadouts ? (
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

      {detachLoadouts ? (
        <DetachedLoadoutsPanel
          runePresets={runePresets}
          buildPresets={buildPresets}
          selectedRuneId={selectedRuneId}
          runeName={runeName}
          draftRunes={detachedRunes}
          selectedBuildId={selectedBuildId}
          buildName={buildName}
          draftBuild={detachedBuild}
          isSavingRune={isSavingRune}
          isSavingBuild={isSavingBuild}
          matchAssets={matchAssets}
          shopItems={shopItems}
          onSelectRunePreset={(rp) => {
            setSelectedRuneId(rp.id);
            setRuneName(rp.name);
            setDetachedRunes(normalizeRuneDraft(rp));
          }}
          onNewRunePreset={() => {
            setSelectedRuneId(null);
            setRuneName("");
            setDetachedRunes(EMPTY_RUNE_DRAFT);
          }}
          onRuneNameChange={setRuneName}
          onRunesChange={setDetachedRunes}
          onSaveRunePreset={handleSaveRunePreset}
          onDeleteRunePreset={(id, name) => setPendingDelete({ kind: "rune", id, name })}
          onSelectBuildPreset={(bp) => {
            setSelectedBuildId(bp.id);
            setBuildName(bp.name);
            setDetachedBuild(normalizeBuildDraft(bp));
          }}
          onNewBuildPreset={() => {
            setSelectedBuildId(null);
            setBuildName("");
            setDetachedBuild(EMPTY_BUILD_DRAFT);
          }}
          onBuildNameChange={setBuildName}
          onBuildChange={setDetachedBuild}
          onSaveBuildPreset={handleSaveBuildPreset}
          onDeleteBuildPreset={(id, name) => setPendingDelete({ kind: "build", id, name })}
        />
      ) : (
        <UnifiedSetupPanel
          setups={setups}
          selectedSetupId={selectedSetupId}
          draftName={setupName}
          draftNote={setupNote}
          draftRunes={setupRunes}
          draftBuild={setupBuild}
          isSaving={isSavingSetup}
          matchAssets={matchAssets}
          shopItems={shopItems}
          onSelectSetup={(s) => {
            setSelectedSetupId(s.id);
            setSetupName(s.name);
            setSetupNote(s.note ?? "");
            setSetupRunes(normalizeRuneDraft(s.runePreset));
            setSetupBuild(normalizeBuildDraft(s.buildPreset));
          }}
          onStartNew={() => {
            setSelectedSetupId(null);
            setSetupName("");
            setSetupNote("");
            setSetupRunes(EMPTY_RUNE_DRAFT);
            setSetupBuild(EMPTY_BUILD_DRAFT);
          }}
          onNameChange={setSetupName}
          onNoteChange={setSetupNote}
          onRunesChange={setSetupRunes}
          onBuildChange={setSetupBuild}
          onSave={handleSaveSetup}
          onRequestDelete={(id, name) => setPendingDelete({ kind: "setup", id, name })}
        />
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Delete Preset"
        description={`Are you sure you want to delete "${pendingDelete?.name ?? ""}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={executeDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};
