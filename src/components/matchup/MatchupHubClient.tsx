"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  History,
  Info,
  Save,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Role, RoleFilter } from "@/components/notes/RoleFilter";
import { ChampionFilterBlock, MatchupFilters } from "@/components/notes/ChampionFilterBlock";
import { MatchupHeader } from "@/components/notes/editor/MatchupHeader";
import { MatchupStrategyTab } from "./MatchupStrategyTab";
import { MatchupHistoryTab } from "./MatchupHistoryTab";
import { ChampionData, MatchAssetsData, ShopItemData } from "@/lib/riot/assets";
import { MatchRecordDTO } from "@/components/history/MatchCard";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import {
  BuildPresetDTO,
  RunePresetDTO,
  SetupPresetDTO,
  buildLoadoutFromMatch,
} from "@/lib/matchup/loadouts";
import { ImportedLoadoutDraft } from "./loadouts/MatchupLoadoutsSection";
import {
  MatchupOrigin,
  MatchupTab,
  buildMatchupUrl,
  getBackUrl,
  isBotRole,
} from "@/lib/matchup/url";

interface SavedNoteData {
  id: string;
  prio: string | null;
  notes: string | null;
  detachLoadouts: boolean;
  setups: SetupPresetDTO[];
  runePresets: RunePresetDTO[];
  buildPresets: BuildPresetDTO[];
}

interface MatchupHubClientProps {
  role: Role;
  myPick: string;
  enemyPick: string;
  mySupp: string | null;
  enemySupp: string | null;
  from: MatchupOrigin;
  initialTab: MatchupTab;
  initialNote: SavedNoteData | null;
  hasGeneralNote: boolean;
  exactMatches: MatchRecordDTO[];
  broadMatches: MatchRecordDTO[];
  champions: ChampionData[];
  matchAssets: MatchAssetsData;
  shopItems: ShopItemData[];
}

export const MatchupHubClient: React.FC<MatchupHubClientProps> = ({
  role,
  myPick,
  enemyPick,
  mySupp,
  enemySupp,
  from,
  initialTab,
  initialNote,
  hasGeneralNote,
  exactMatches,
  broadMatches,
  champions,
  matchAssets,
  shopItems,
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<MatchupTab>(initialTab);
  const [noteId, setNoteId] = useState<string | null>(initialNote?.id ?? null);
  const [prio, setPrio] = useState<string>(initialNote?.prio || "N/A");
  const [notes, setNotes] = useState<string>(initialNote?.notes || "");
  const [importedDraft, setImportedDraft] = useState<ImportedLoadoutDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Quick matchup switcher state
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [draftRole, setDraftRole] = useState<Role>(role);
  const [draftFilters, setDraftFilters] = useState<MatchupFilters>({
    myPick,
    enemyPick,
    mySupp,
    enemySupp,
  });

  const isBot = isBotRole(role);
  const hasPartnerFilter = isBot && Boolean(mySupp || enemySupp);
  const backUrl = getBackUrl(from);

  const champNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of champions) {
      map.set(c.id, c.name);
      map.set(c.name, c.name);
    }
    return map;
  }, [champions]);

  const getName = (id: string | null) => (id ? champNames.get(id) || id : "");

  const headerRecord = useMemo(() => {
    const source = hasPartnerFilter ? exactMatches : broadMatches;
    const wins = source.filter((m) => m.win).length;
    return { wins, losses: source.length - wins };
  }, [hasPartnerFilter, exactMatches, broadMatches]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/matchup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          myPick,
          enemyPick,
          mySupp,
          enemySupp,
          prio,
          notes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.note) {
        setNoteId(data.note.id);
        toast({
          type: "success",
          title: data.created ? "Matchup Saved" : "Matchup Updated",
          message: "Your strategy and lane priority have been saved.",
        });
        router.refresh();
      } else {
        toast({
          type: "error",
          title: "Save Failed",
          message: data.message || "Could not save matchup.",
        });
      }
    } catch {
      toast({ type: "error", title: "Error", message: "Unexpected error while saving." });
    } finally {
      setIsSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!noteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/matchup?id=${encodeURIComponent(noteId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNoteId(null);
        setPrio("N/A");
        setNotes("");
        setIsConfirmOpen(false);
        toast({
          type: "success",
          title: "Note Deleted",
          message: "Saved note removed. Match stats and history remain available.",
        });
        router.refresh();
      } else {
        const data = await res.json();
        toast({
          type: "error",
          title: "Delete Failed",
          message: data.message || "Could not delete note.",
        });
      }
    } catch {
      toast({ type: "error", title: "Error", message: "Unexpected error while deleting." });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSwitchMatchup = () => {
    if (!draftFilters.myPick || !draftFilters.enemyPick) {
      toast({
        type: "warning",
        title: "Select Champions",
        message: "Choose both your champion and the enemy champion.",
      });
      return;
    }
    const nextUrl = buildMatchupUrl(
      {
        role: draftRole,
        myPick: draftFilters.myPick,
        enemyPick: draftFilters.enemyPick,
        mySupp: draftFilters.mySupp,
        enemySupp: draftFilters.enemySupp,
      },
      { from, tab: activeTab }
    );
    setIsSwitcherOpen(false);
    router.push(nextUrl);
  };

  const general1v1Url = buildMatchupUrl(
    { role, myPick, enemyPick },
    { from, tab: activeTab }
  );

  const handleSaveMatchAsPreset = (match: MatchRecordDTO) => {
    const draft = buildLoadoutFromMatch(match);
    setImportedDraft({
      id: Date.now(),
      ...draft,
    });
    setActiveTab("strategy");
    toast({
      type: "info",
      title: "Loaded from Match",
      message: "Runes & build copied into editor — name it (e.g. With Prio) and click Save!",
    });
  };

  const matchCountBadge = hasPartnerFilter ? exactMatches.length : broadMatches.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Link
            href={backUrl}
            className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-400" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
              {getName(myPick)}
              {isBot && mySupp ? ` + ${getName(mySupp)}` : ""}{" "}
              <span className="text-red-500 font-black italic text-base mx-1">vs</span>{" "}
              {getName(enemyPick)}
              {isBot && enemySupp ? ` + ${getName(enemySupp)}` : ""}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              {noteId ? "Saved in your Playbook" : "Unsaved matchup — save anytime to add to your Playbook"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsSwitcherOpen((o) => !o)}
            className="gap-1.5 border-neutral-800 bg-neutral-900/70 text-neutral-300 hover:text-white"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Change Matchup
          </Button>

          {noteId && (
            <Button
              type="button"
              onClick={() => setIsConfirmOpen(true)}
              disabled={isDeleting || isSaving}
              variant="outline"
              size="sm"
              className="gap-1.5 border-red-900/50 text-red-500 hover:bg-red-950/40 hover:text-red-400 disabled:cursor-not-allowed"
            >
              {isDeleting ? <Spinner size="sm" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete
            </Button>
          )}

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isDeleting}
            size="sm"
            className="gap-1.5 px-5 ml-auto md:ml-0 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Spinner size="sm" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                {noteId ? "Save Changes" : "Save to Playbook"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Collapsible Inline Matchup Switcher */}
      {isSwitcherOpen && (
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/60 pb-3">
            <span className="text-sm font-bold text-white">Switch Matchup</span>
            <RoleFilter
              selectedRole={draftRole}
              onChange={(r) => {
                if (!r) return;
                setDraftRole(r);
                if (!isBotRole(r)) {
                  setDraftFilters((f) => ({ ...f, mySupp: null, enemySupp: null }));
                }
              }}
            />
          </div>
          <ChampionFilterBlock
            role={draftRole}
            champions={champions}
            filters={draftFilters}
            onChange={setDraftFilters}
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsSwitcherOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSwitchMatchup}
              disabled={!draftFilters.myPick || !draftFilters.enemyPick}
              className="disabled:cursor-not-allowed"
            >
              Open Matchup
            </Button>
          </div>
        </div>
      )}

      {/* Botlane 2v2 -> General 1v1 Quick Link Banner */}
      {hasPartnerFilter && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3 text-xs">
          <div className="flex items-center gap-2.5 text-neutral-300">
            <Info className="w-4 h-4 text-neutral-400 shrink-0" />
            <span>
              {hasGeneralNote
                ? `You also have a general 1v1 playbook entry for ${getName(myPick)} vs ${getName(enemyPick)}.`
                : `Viewing specific botlane matchup. Want general notes across all supports?`}
            </span>
          </div>
          <Link href={general1v1Url} className="shrink-0">
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs">
              View {getName(myPick)} vs {getName(enemyPick)}
            </Button>
          </Link>
        </div>
      )}

      {/* Matchup Stats Header */}
      <MatchupHeader
        filters={{ myPick, enemyPick, mySupp, enemySupp }}
        role={role}
        champions={champions}
        initialData={headerRecord}
      />

      {/* 2-Tab Navigation Bar: Strategy & Loadouts | Match History */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
        <Button
          type="button"
          variant={activeTab === "strategy" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("strategy")}
          className={`gap-2 px-4 h-9 ${
            activeTab === "strategy" ? "" : "text-neutral-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Strategy &amp; Loadouts
        </Button>

        <Button
          type="button"
          variant={activeTab === "history" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("history")}
          className={`gap-2 px-4 h-9 ${
            activeTab === "history" ? "" : "text-neutral-400 hover:text-white"
          }`}
        >
          <History className="w-4 h-4" />
          Match History
          <span
            className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === "history"
                ? "bg-black/25 text-white"
                : "bg-neutral-800 text-neutral-300"
            }`}
          >
            {matchCountBadge}
          </span>
        </Button>
      </div>

      {/* Active Tab Content */}
      {activeTab === "strategy" ? (
        <MatchupStrategyTab
          matchup={{ role, myPick, enemyPick, mySupp, enemySupp }}
          notes={notes}
          prio={prio}
          onNotesChange={setNotes}
          onPrioChange={setPrio}
          initialDetachLoadouts={initialNote?.detachLoadouts ?? false}
          initialSetups={initialNote?.setups ?? []}
          initialRunePresets={initialNote?.runePresets ?? []}
          initialBuildPresets={initialNote?.buildPresets ?? []}
          importedDraft={importedDraft}
          matchAssets={matchAssets}
          shopItems={shopItems}
          onNoteAutoCreated={(id) => setNoteId(id)}
        />
      ) : (
        <MatchupHistoryTab
          exactMatches={exactMatches}
          broadMatches={broadMatches}
          hasPartnerFilter={hasPartnerFilter}
          myPick={myPick}
          enemyPick={enemyPick}
          champions={champions}
          matchAssets={matchAssets}
          onSaveAsPreset={handleSaveMatchAsPreset}
        />
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Matchup Note"
        description="Are you sure you want to delete your saved strategy for this matchup? Your match history and statistics will remain intact."
        confirmText="Delete Note"
        cancelText="Keep Note"
        isDestructive={true}
        onConfirm={executeDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
