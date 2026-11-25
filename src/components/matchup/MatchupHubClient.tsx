"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, History, Info } from "lucide-react";
import { Role } from "@/components/notes/RoleFilter";
import { MatchupFilters } from "@/components/notes/ChampionFilterBlock";
import { MatchupHeader } from "@/components/notes/editor/MatchupHeader";
import { MatchupTopBar } from "./MatchupTopBar";
import { MatchupStrategyTab } from "./MatchupStrategyTab";
import { MatchupHistoryTab } from "./MatchupHistoryTab";
import { ChampionData, MatchAssetsData, ShopItemData } from "@/lib/riot/assets";
import { MatchRecordDTO } from "@/components/history/MatchCard";
import { Button } from "@/components/ui/Button";
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
    setImportedDraft({ id: Date.now(), ...draft });
    setActiveTab("strategy");
    toast({
      type: "info",
      title: "Loaded from Match",
      message: "Runes & build copied into editor — name it and click Save!",
    });
  };

  const matchCountBadge = hasPartnerFilter ? exactMatches.length : broadMatches.length;

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-in fade-in duration-300 pb-16">
      <MatchupTopBar
        backUrl={backUrl}
        myPickName={getName(myPick)}
        enemyPickName={getName(enemyPick)}
        mySuppName={getName(mySupp)}
        enemySuppName={getName(enemySupp)}
        isBot={isBot}
        isSaved={Boolean(noteId)}
        isSaving={isSaving}
        isDeleting={isDeleting}
        isSwitcherOpen={isSwitcherOpen}
        draftRole={draftRole}
        draftFilters={draftFilters}
        champions={champions}
        onToggleSwitcher={() => setIsSwitcherOpen((o) => !o)}
        onDraftRoleChange={setDraftRole}
        onDraftFiltersChange={setDraftFilters}
        onSwitchMatchup={handleSwitchMatchup}
        onCloseSwitcher={() => setIsSwitcherOpen(false)}
        onRequestDelete={() => setIsConfirmOpen(true)}
        onSave={handleSave}
      />

      {hasPartnerFilter && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-lg border border-neutral-800/75 bg-neutral-900/35 px-3.5 py-2.5 text-xs">
          <div className="flex items-center gap-2 text-neutral-400">
            <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span>
              {hasGeneralNote
                ? `You also have a general 1v1 entry for ${getName(myPick)} vs ${getName(enemyPick)}.`
                : "Viewing specific 2v2 botlane matchup. Want general 1v1 notes?"}
            </span>
          </div>
          <Link href={general1v1Url} className="shrink-0">
            <Button type="button" variant="outline" size="sm" className="h-7 px-2.5 text-xs">
              View {getName(myPick)} vs {getName(enemyPick)}
            </Button>
          </Link>
        </div>
      )}

      <MatchupHeader
        filters={{ myPick, enemyPick, mySupp, enemySupp }}
        role={role}
        champions={champions}
        initialData={headerRecord}
      />

      {/* Clean Underline Tabs */}
      <div className="flex items-center gap-5 border-b border-neutral-800/75">
        <button
          type="button"
          onClick={() => setActiveTab("strategy")}
          className={`inline-flex items-center gap-2 pb-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer focus-visible:outline-none ${
            activeTab === "strategy"
              ? "border-accent text-white"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Strategy &amp; Loadouts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`inline-flex items-center gap-2 pb-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer focus-visible:outline-none ${
            activeTab === "history"
              ? "border-accent text-white"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Match History</span>
          <span
            className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold tabular-nums ${
              activeTab === "history"
                ? "bg-accent/20 text-accent-soft"
                : "bg-neutral-800/80 text-neutral-400"
            }`}
          >
            {matchCountBadge}
          </span>
        </button>
      </div>

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
