"use client";

import { useState, useEffect, useCallback } from "react";
import { MatchRecordDTO } from "./MatchCard";
import { useToast } from "@/components/ui/ToastProvider";

interface UseHistorySyncOptions {
  initialMatches: MatchRecordDTO[];
  lastSyncedAt?: string | Date | null;
  initialPendingBackfillCount: number;
}

export function useHistorySync({
  initialMatches,
  lastSyncedAt,
  initialPendingBackfillCount,
}: UseHistorySyncOptions) {
  const { toast } = useToast();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [backfillProgress, setBackfillProgress] = useState({ current: 0, total: 0 });
  const [pendingBackfillCount, setPendingBackfillCount] = useState(
    initialPendingBackfillCount
  );

  const [syncCooldown, setSyncCooldown] = useState(() => {
    if (!lastSyncedAt) return 0;
    const timeSince = Date.now() - new Date(lastSyncedAt).getTime();
    const remaining = Math.floor((120000 - timeSince) / 1000);
    return remaining > 0 ? remaining : 0;
  });

  const [matches, setMatches] = useState<MatchRecordDTO[]>(initialMatches);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialMatches.length === 20);

  useEffect(() => {
    if (syncCooldown <= 0) return;
    const t = setInterval(() => setSyncCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [syncCooldown]);

  const refreshVisibleMatches = useCallback(
    async (count?: number) => {
      const take = count ?? Math.max(20, page * 20);
      const refreshRes = await fetch(`/api/riot/matches?skip=0&take=${take}`);
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const updated: MatchRecordDTO[] = refreshData.matches || [];
        setMatches(updated);
        setHasMore(updated.length === take);
      }
    },
    [page]
  );

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

  return {
    matches,
    hasMore,
    isLoadingMore,
    isSyncing,
    syncProgress,
    syncCooldown,
    isBackfilling,
    backfillProgress,
    pendingBackfillCount,
    loadMore,
    handleSync,
    handleBackfill,
  };
}
