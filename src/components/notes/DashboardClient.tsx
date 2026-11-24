"use client";
import React, { useState, useEffect } from "react";
import { ChampionData } from "@/lib/riot/assets";
import { RoleFilter, Role } from "./RoleFilter";
import { ChampionFilterBlock, MatchupFilters } from "./ChampionFilterBlock";
import { ArrowRight, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
    <div className="animate-in fade-in duration-500">
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden min-h-[400px] shadow-sm">
        {/* Top Header Row */}
        <div className="p-4 sm:px-6 border-b border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/40">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center tracking-tight">
              <span className="w-1.5 h-6 bg-red-600 rounded-full mr-3 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
              Matchups Playbook
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5 pl-4">
              Browse saved matchups or select champions below to open any Matchup Hub directly.
            </p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full md:w-auto">
            <RoleFilter selectedRole={role} onChange={handleRoleChange} />
            {openMatchupUrl ? (
              <Link href={openMatchupUrl} className="shrink-0">
                <Button className="flex items-center gap-2 shadow-sm" size="sm">
                  <span>Open Matchup</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled
                className="shrink-0 border-neutral-800 text-neutral-500 disabled:cursor-not-allowed"
                title="Select both My Pick and Enemy Pick to open Matchup Hub"
              >
                <span>Open Matchup</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Filter Configuration Row */}
        <div className="p-4 sm:px-6 border-b border-neutral-800 bg-neutral-950/30">
          <ChampionFilterBlock
            role={role}
            champions={champions}
            filters={filters}
            onChange={setFilters}
          />
        </div>

        <div className="p-6 relative min-h-[300px]">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in">
              {Array.from({ length: 6 }).map((_, i) => (
                <NoteCardSkeleton key={i} />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <div className="w-20 h-20 bg-neutral-950 border border-neutral-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <span className="text-3xl opacity-50">
                  <NotebookPen />
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {openMatchupUrl ? "No saved strategy yet" : "No saved matchups found"}
              </h3>
              <p className="text-neutral-400 max-w-sm mb-8 text-sm">
                {openMatchupUrl
                  ? "You can still open the Matchup Hub right now to inspect your match history, stats, and write your gameplan."
                  : "Select My Pick and Enemy Pick above to open any Matchup Hub, or adjust your filters."}
              </p>
              {openMatchupUrl && (
                <Link href={openMatchupUrl}>
                  <Button variant="primary" className="px-8 gap-2">
                    Open Matchup Hub
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in">
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} champions={champions} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-10 flex justify-center pb-4">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="px-8 border-neutral-800 bg-neutral-950 hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed"
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
      </div>
    </div>
  );
};
