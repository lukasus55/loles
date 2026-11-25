"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Save, SlidersHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Role, RoleFilter } from "@/components/notes/RoleFilter";
import { ChampionFilterBlock, MatchupFilters } from "@/components/notes/ChampionFilterBlock";
import { ChampionData } from "@/lib/riot/assets";
import { isBotRole } from "@/lib/matchup/url";

interface MatchupTopBarProps {
  backUrl: string;
  myPickName: string;
  enemyPickName: string;
  mySuppName?: string;
  enemySuppName?: string;
  isBot: boolean;
  isSaved: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  isSwitcherOpen: boolean;
  draftRole: Role;
  draftFilters: MatchupFilters;
  champions: ChampionData[];
  onToggleSwitcher: () => void;
  onDraftRoleChange: (role: Role) => void;
  onDraftFiltersChange: (filters: MatchupFilters) => void;
  onSwitchMatchup: () => void;
  onCloseSwitcher: () => void;
  onRequestDelete: () => void;
  onSave: () => void;
}

export const MatchupTopBar: React.FC<MatchupTopBarProps> = ({
  backUrl,
  myPickName,
  enemyPickName,
  mySuppName,
  enemySuppName,
  isBot,
  isSaved,
  isSaving,
  isDeleting,
  isSwitcherOpen,
  draftRole,
  draftFilters,
  champions,
  onToggleSwitcher,
  onDraftRoleChange,
  onDraftFiltersChange,
  onSwitchMatchup,
  onCloseSwitcher,
  onRequestDelete,
  onSave,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={backUrl}
            className="h-9 w-9 flex items-center justify-center bg-neutral-900/60 border border-neutral-800/80 rounded-lg hover:bg-neutral-800 hover:border-neutral-700 transition-colors shrink-0 cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 text-neutral-400" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight truncate">
              {myPickName}
              {isBot && mySuppName ? ` + ${mySuppName}` : ""}{" "}
              <span className="text-accent-soft font-semibold text-sm mx-1">vs</span>{" "}
              {enemyPickName}
              {isBot && enemySuppName ? ` + ${enemySuppName}` : ""}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isSaved
                ? "Saved in your Playbook"
                : "Unsaved matchup — save anytime to add to your Playbook"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleSwitcher}
            className="h-8 gap-1.5 border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:text-white"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Change
          </Button>

          {isSaved && (
            <Button
              type="button"
              onClick={onRequestDelete}
              disabled={isDeleting || isSaving}
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-red-900/50 text-red-400 hover:bg-red-950/40 hover:text-red-300 disabled:cursor-not-allowed"
            >
              {isDeleting ? <Spinner size="sm" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete
            </Button>
          )}

          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving || isDeleting}
            size="sm"
            className="h-8 gap-1.5 px-4 ml-auto md:ml-0 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Spinner size="sm" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                {isSaved ? "Save Changes" : "Save to Playbook"}
              </>
            )}
          </Button>
        </div>
      </div>

      {isSwitcherOpen && (
        <div className="rounded-lg border border-neutral-800/80 bg-neutral-900/50 p-4 space-y-3.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-neutral-800/60 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Switch Matchup
            </span>
            <RoleFilter
              selectedRole={draftRole}
              onChange={(r) => {
                if (!r) return;
                onDraftRoleChange(r);
                if (!isBotRole(r)) {
                  onDraftFiltersChange({ ...draftFilters, mySupp: null, enemySupp: null });
                }
              }}
            />
          </div>
          <ChampionFilterBlock
            role={draftRole}
            champions={champions}
            filters={draftFilters}
            onChange={onDraftFiltersChange}
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={onCloseSwitcher}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onSwitchMatchup}
              disabled={!draftFilters.myPick || !draftFilters.enemyPick}
              className="disabled:cursor-not-allowed"
            >
              Open Matchup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
