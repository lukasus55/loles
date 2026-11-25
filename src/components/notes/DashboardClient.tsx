"use client";
import React, { useState, useEffect } from "react";
import { ChampionData } from "@/lib/riot/assets";
import { RoleFilter, Role } from "./RoleFilter";
import { ChampionFilterBlock, MatchupFilters } from "./ChampionFilterBlock";
import { ArrowRight, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import Link from "next/link";
import { NoteCard, MatchupNoteDTO, NoteCardSkeleton } from "./NoteCard";
import { Spinner } from "@/components/ui/Spinner";
import { buildMatchupUrl } from "@/lib/matchup/url";

interface DashboardClientProps {
  champions: ChampionData[];
  preferredRole?: Role | null;
}

export const DashboardClient: React.FC<DashboardClientProps> = ({
  champions,
  preferredRole,
}) => {
  const [role, setRole] = useState<Role>(preferredRole || "TOP");
  const [filters, setFilters] = useState<MatchupFilters>({
    myPick: null,
    enemyPick: null,
    mySupp: null,
    enemySupp: null,
  });

  const [notes, setNotes] = useState<MatchupNoteDTO[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const canOpenMatchup = Boolean(filters.myPick && filters.enemyPick);
  const openMatchupUrl = canOpenMatchup
    ? buildMatchupUrl(
        {
          role,
          myPick: filters.myPick!,
          enemyPick: filters.enemyPick!,
          mySupp: filters.mySupp,
          enemySupp: filters.enemySupp,
        },
        { from: "matchups" }
      )
    : null;

  const handleRoleChange = (newRole: Role | null) => {
    if (!newRole) return;
    setRole(newRole);
    setFilters({ myPick: null, enemyPick: null, mySupp: null, enemySupp: null });
  };

  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/notes/list", {
          method: "POST",
          body: JSON.stringify({ role, ...filters, page: 1 }),
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (res.ok) {
          setNotes(data.notes);
          setHasMore(data.hasMore);
          setPage(1);
        }
      } catch (e) {
        console.error("Failed to fetch notes", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [role, filters]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await fetch("/api/notes/list", {
        method: "POST",
        body: JSON.stringify({ role, ...filters, page: nextPage }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setNotes((prev) => [...prev, ...data.notes]);
        setHasMore(data.hasMore);
        setPage(nextPage);
      }
    } catch (e) {
      console.error("Failed to load more notes", e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Slim Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-neutral-800/70">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Matchups Playbook
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Browse saved matchups or pick champions below to open a Matchup Hub.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-3 w-full md:w-auto">
          <RoleFilter selectedRole={role} onChange={handleRoleChange} />
          {openMatchupUrl ? (
            <Link href={openMatchupUrl} className="shrink-0">
              <Button size="sm" className="h-9 px-3.5 gap-1.5">
                <span>Open Matchup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          ) : (
            <Tooltip
              compact
              content="Select both My Pick and Enemy Pick to open Matchup Hub"
              position="top"
              className="inline-flex cursor-not-allowed"
            >
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled
                className="shrink-0 h-9 px-3.5 gap-1.5 border-neutral-800 text-neutral-500 disabled:cursor-not-allowed"
              >
                <span>Open Matchup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Champion Filters */}
      <div className="pb-5 border-b border-neutral-800/60">
        <ChampionFilterBlock
          role={role}
          champions={champions}
          filters={filters}
          onChange={setFilters}
        />
      </div>

      {/* Matchup Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <NoteCardSkeleton key={i} />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-14 px-4 rounded-lg border border-neutral-800/60 bg-neutral-900/20">
          <div className="w-11 h-11 rounded-full bg-neutral-900/80 border border-neutral-800/80 flex items-center justify-center mb-3.5">
            <NotebookPen className="w-5 h-5 text-neutral-500" />
          </div>
          <h2 className="text-base font-semibold text-white">
            {openMatchupUrl ? "No saved strategy yet" : "No saved matchups found"}
          </h2>
          <p className="text-neutral-400 max-w-sm mt-1 text-xs leading-relaxed">
            {openMatchupUrl
              ? "Open the Matchup Hub to inspect your match history, stats, and write your gameplan."
              : "Select My Pick and Enemy Pick above to open any Matchup Hub, or adjust your filters."}
          </p>
          {openMatchupUrl && (
            <Link href={openMatchupUrl} className="mt-5">
              <Button variant="primary" size="sm" className="px-5 gap-1.5">
                <span>Open Matchup Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} champions={champions} />
            ))}
          </div>

          {hasMore && (
            <div className="pt-2 pb-6 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="min-w-[180px] border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:bg-neutral-800/80 hover:text-white disabled:cursor-not-allowed"
              >
                {isLoadingMore ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" /> Loading...
                  </span>
                ) : (
                  "Load More Matchups"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
