"use client";
import React, { useState, useEffect, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { RefreshCw, Sparkles } from "lucide-react";
import { ExistingNoteSummary, MatchCard, MatchRecordDTO } from "./MatchCard";
import { useToast } from "@/components/ui/ToastProvider";
import { LinkAccountPrompt } from "@/components/account/LinkAccountPrompt";
import { ChampionData, MatchAssetsData } from "@/lib/riot/assets";

interface RiotAccountSummary {
  gameName: string;
  tagLine: string;
  region: string;
  lastSyncedAt?: string | Date | null;
}

interface HistoryClientProps {
  initialMatches: MatchRecordDTO[];
  riotAccount: RiotAccountSummary | null;
  champions: ChampionData[];
  matchAssets: MatchAssetsData;
  existingNotes?: ExistingNoteSummary[];
  initialPendingBackfillCount?: number;
}

const emptySubscribe = () => () => {};

export const HistoryClient: React.FC<HistoryClientProps> = ({
  initialMatches,
  riotAccount,
  champions,
  matchAssets,
  existingNotes = [],
  initialPendingBackfillCount = 0,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [backfillProgress, setBackfillProgress] = useState({ current: 0, total: 0 });
  const [pendingBackfillCount, setPendingBackfillCount] = useState(initialPendingBackfillCount);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [syncCooldown, setSyncCooldown] = useState(() => {
    if (!riotAccount?.lastSyncedAt) return 0;
    const timeSince = Date.now() - new Date(riotAccount.lastSyncedAt).getTime();
    const remaining = Math.floor((120000 - timeSince) / 1000);
    return remaining > 0 ? remaining : 0;
  });
  const { toast } = useToast();

  // Pagination state
  const [matches, setMatches] = useState<MatchRecordDTO[]>(initialMatches);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialMatches.length === 20);

  useEffect(() => {
    if (syncCooldown <= 0) return;
    const t = setInterval(() => setSyncCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [syncCooldown]);

  const timeAgo = (dateStr: string | Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const refreshVisibleMatches = async (count?: number) => {
    const take = count ?? Math.max(20, page * 20);
    const refreshRes = await fetch(`/api/riot/matches?skip=0&take=${take}`);
    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      const updated: MatchRecordDTO[] = refreshData.matches || [];
      setMatches(updated);
      setHasMore(updated.length === take);
    }
  };

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const skip = page * 20;
      const res = await fetch(`/api/riot/matches?skip=${skip}&take=20`);
      if (res.ok) {
        const data = await res.json();
        const nextMatches: MatchRecordDTO[] = data.matches || [];
        setMatches((prev) => [...prev, ...nextMatches]);
        setPage((p) => p + 1);
        setHasMore(nextMatches.length === 20);
      }
    } catch {
      console.error("Failed to load more");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncProgress({ current: 0, total: 0 });
    try {
      const initRes = await fetch("/api/riot/sync/init", { method: "POST" });
      const initData = await initRes.json();

      if (!initRes.ok) {
        toast({
          type: "error",
          title: "Sync Failed",
          message: initData.message || "Failed to initialize sync",
        });
        setIsSyncing(false);
        return;
      }

      const newMatchIds: string[] = initData.newMatchIds || [];
      if (newMatchIds.length === 0) {
        toast({ type: "info", title: "Up to Date", message: "Everything is up to date!" });
        setSyncCooldown(120);
        setIsSyncing(false);
        return;
      }

      setSyncProgress({ current: 0, total: newMatchIds.length });

      const chunkSize = 5;
      let processedTotal = 0;

      for (let i = 0; i < newMatchIds.length; i += chunkSize) {
        const chunk = newMatchIds.slice(i, i + chunkSize);

        try {
          const processRes = await fetch("/api/riot/sync/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ matchIds: chunk }),
          });
          const processData = await processRes.json();
          if (processRes.ok && processData.processedCount !== undefined) {
            processedTotal += processData.processedCount;
          } else {
            processedTotal += chunk.length;
          }
        } catch {
          processedTotal += chunk.length;
        }

        setSyncProgress({
          current: Math.min(processedTotal, newMatchIds.length),
          total: newMatchIds.length,
        });

        if (i + chunkSize < newMatchIds.length) {
          await new Promise((r) => setTimeout(r, 1500));
        }
      }

      toast({
        type: "success",
        title: "Sync Complete",
        message: `Successfully synced ${processedTotal} new matches!`,
      });
      setSyncCooldown(120);

      setPage(1);
      await refreshVisibleMatches(20);
    } catch {
      toast({ type: "error", title: "Error", message: "An unexpected error occurred" });
    } finally {
      setIsSyncing(false);
      setSyncProgress({ current: 0, total: 0 });
    }
  };

  const handleBackfill = async () => {
    if (isBackfilling || isSyncing) return;
    setIsBackfilling(true);
    setBackfillProgress({ current: 0, total: pendingBackfillCount });

    try {
      const listRes = await fetch("/api/riot/sync/backfill");
      const listData = await listRes.json();

      if (!listRes.ok) {
        toast({
          type: "error",
          title: "Backfill Failed",
          message: listData.message || "Could not load matches to update.",
        });
        return;
      }

      const matchIds: string[] = listData.matchIds || [];
      if (matchIds.length === 0) {
        setPendingBackfillCount(0);
        toast({
          type: "info",
          title: "All Set",
          message: "All your matches already have items and runes synced!",
        });
        return;
      }

      setBackfillProgress({ current: 0, total: matchIds.length });

      const chunkSize = 5;
      let processed = 0;
      let updatedTotal = 0;

      for (let i = 0; i < matchIds.length; i += chunkSize) {
        const chunk = matchIds.slice(i, i + chunkSize);

        try {
          const res = await fetch("/api/riot/sync/backfill", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ matchIds: chunk }),
          });
          const data = await res.json();
          if (res.ok && typeof data.updatedCount === "number") {
            updatedTotal += data.updatedCount;
          }
        } catch (err) {
          console.error("Backfill chunk error", err);
        }

        processed += chunk.length;
        setBackfillProgress({
          current: Math.min(processed, matchIds.length),
          total: matchIds.length,
        });

        // Refresh list after first few chunks so user sees items/runes populate quickly
        if (i === 0 || i === chunkSize * 2) {
          await refreshVisibleMatches();
        }

        if (i + chunkSize < matchIds.length) {
          await new Promise((r) => setTimeout(r, 1200));
        }
      }

      const checkRes = await fetch("/api/riot/sync/backfill");
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        setPendingBackfillCount(checkData.total ?? 0);
      } else {
        setPendingBackfillCount(0);
      }

      await refreshVisibleMatches();

      toast({
        type: "success",
        title: "Items & Runes Synced",
        message: `Updated ${updatedTotal} older matches with items, runes & summoner spells.`,
      });
    } catch {
      toast({
        type: "error",
        title: "Error",
        message: "An unexpected error occurred during backfill.",
      });
    } finally {
      setIsBackfilling(false);
      setBackfillProgress({ current: 0, total: 0 });
    }
  };

  if (!riotAccount) {
    return (
      <div className="flex-1 flex flex-col justify-center p-8 w-full max-w-3xl mx-auto">
        <LinkAccountPrompt />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/60 border border-neutral-800 p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-red-600 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.6)]"></span>
              Match History
            </h1>
            <p className="text-neutral-400 mt-1 text-sm">
              Synced from{" "}
              <strong className="text-neutral-300">
                {riotAccount.gameName}#{riotAccount.tagLine}
              </strong>{" "}
              ({riotAccount.region})
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <Button
              onClick={handleSync}
              disabled={isSyncing || isBackfilling || syncCooldown > 0}
              className="px-6 min-w-[140px] flex items-center justify-center transition-colors shadow-sm bg-neutral-900 border border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500 cursor-pointer disabled:opacity-75 disabled:bg-neutral-800 disabled:border-neutral-600 disabled:text-neutral-300 disabled:cursor-not-allowed disabled:hover:bg-neutral-800"
            >
              {isSyncing ? (
                <>
                  <Spinner size="sm" className="mr-2 border-red-500" />{" "}
                  {syncProgress.total > 0
                    ? `Syncing ${syncProgress.current}/${syncProgress.total}`
                    : "Syncing..."}
                </>
              ) : syncCooldown > 0 ? (
                `Wait ${syncCooldown}s`
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" /> Update
                </>
              )}
            </Button>
            {riotAccount.lastSyncedAt && (
              <span className="text-xs text-neutral-500 font-medium">
                Last synced: {mounted ? timeAgo(riotAccount.lastSyncedAt) : "Just now"}
              </span>
            )}
          </div>
        </div>

        {/* Backfill banner for pre-v1.1 matches missing items & runes */}
        {pendingBackfillCount > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/80 border border-red-900/40 rounded-xl px-5 py-4 shadow-sm">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-950/60 border border-red-900/50 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {pendingBackfillCount} older{" "}
                  {pendingBackfillCount === 1 ? "match is" : "matches are"} missing items &amp;
                  runes
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Run a one-time backfill to populate builds, runes, and summoner spells for your
                  previously synced games.
                </p>
              </div>
            </div>
            <Button
              onClick={handleBackfill}
              disabled={isBackfilling || isSyncing}
              variant="outline"
              size="sm"
              className="shrink-0 border-red-800/60 bg-red-950/30 text-red-300 hover:bg-red-950/60 hover:text-white cursor-pointer disabled:cursor-not-allowed"
            >
              {isBackfilling ? (
                <>
                  <Spinner size="sm" className="mr-2 border-red-400" />
                  Updating {backfillProgress.current}/{backfillProgress.total}
                </>
              ) : (
                "Sync Items & Runes"
              )}
            </Button>
          </div>
        )}

        {matches.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/30 border border-neutral-800 rounded-xl">
            <p className="text-neutral-500 mb-4">No matches synced yet.</p>
            <Button
              onClick={handleSync}
              variant="outline"
              className="border-red-900/50 text-red-500 hover:bg-red-950/40 cursor-pointer"
            >
              Fetch Match History
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  champions={champions}
                  matchAssets={matchAssets}
                  existingNotes={existingNotes}
                  mounted={mounted}
                />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-6 pb-12">
                <Button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  className="w-full sm:w-auto min-w-[200px] border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? (
                    <>
                      <Spinner size="sm" className="mr-2" /> Loading more...
                    </>
                  ) : (
                    "Load More Matches"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
