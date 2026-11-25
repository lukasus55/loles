"use client";

import { useState } from "react";
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
import { useToast } from "@/components/ui/ToastProvider";

export interface ImportedLoadoutDraft {
  id: number;
  suggestedName: string;
  runes: RunePageDraft;
  build: BuildDraft;
}

export type PendingDelete =
  | { kind: "setup"; id: string; name: string }
  | { kind: "rune"; id: string; name: string }
  | { kind: "build"; id: string; name: string }
  | null;

interface UseLoadoutPresetsOptions {
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
  onNoteAutoCreated?: (noteId: string) => void;
}

export function useLoadoutPresets({
  matchup,
  initialDetachLoadouts,
  initialSetups,
  initialRunePresets,
  initialBuildPresets,
  importedDraft,
  onNoteAutoCreated,
}: UseLoadoutPresetsOptions) {
  const { toast } = useToast();

  const [detachLoadouts, setDetachLoadouts] = useState(initialDetachLoadouts);
  const [isTogglingMode, setIsTogglingMode] = useState(false);

  const [setups, setSetups] = useState<SetupPresetDTO[]>(initialSetups);
  const [runePresets, setRunePresets] = useState<RunePresetDTO[]>(initialRunePresets);
  const [buildPresets, setBuildPresets] = useState<BuildPresetDTO[]>(initialBuildPresets);

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

  return {
    detachLoadouts,
    isTogglingMode,
    setups,
    runePresets,
    buildPresets,
    selectedSetupId,
    setupName,
    setupNote,
    setupRunes,
    setupBuild,
    isSavingSetup,
    selectedRuneId,
    runeName,
    detachedRunes,
    isSavingRune,
    selectedBuildId,
    buildName,
    detachedBuild,
    isSavingBuild,
    pendingDelete,
    setPendingDelete,
    handleToggleDetach,
    handleSaveSetup,
    handleSaveRunePreset,
    handleSaveBuildPreset,
    executeDelete,
    selectSetup: (s: SetupPresetDTO) => {
      setSelectedSetupId(s.id);
      setSetupName(s.name);
      setSetupNote(s.note ?? "");
      setSetupRunes(normalizeRuneDraft(s.runePreset));
      setSetupBuild(normalizeBuildDraft(s.buildPreset));
    },
    startNewSetup: () => {
      setSelectedSetupId(null);
      setSetupName("");
      setSetupNote("");
      setSetupRunes(EMPTY_RUNE_DRAFT);
      setSetupBuild(EMPTY_BUILD_DRAFT);
    },
    setSetupName,
    setSetupNote,
    setSetupRunes,
    setSetupBuild,
    selectRunePreset: (rp: RunePresetDTO) => {
      setSelectedRuneId(rp.id);
      setRuneName(rp.name);
      setDetachedRunes(normalizeRuneDraft(rp));
    },
    startNewRunePreset: () => {
      setSelectedRuneId(null);
      setRuneName("");
      setDetachedRunes(EMPTY_RUNE_DRAFT);
    },
    setRuneName,
    setDetachedRunes,
    selectBuildPreset: (bp: BuildPresetDTO) => {
      setSelectedBuildId(bp.id);
      setBuildName(bp.name);
      setDetachedBuild(normalizeBuildDraft(bp));
    },
    startNewBuildPreset: () => {
      setSelectedBuildId(null);
      setBuildName("");
      setDetachedBuild(EMPTY_BUILD_DRAFT);
    },
    setBuildName,
    setDetachedBuild,
  };
}
