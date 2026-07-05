"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { RefreshCw, AlertTriangle, ShieldAlert, Swords } from "lucide-react";
import { MatchCard } from "./MatchCard";
import Link from "next/link";

export const HistoryClient = ({ initialMatches, riotAccount, champions, existingNotes = [] }: any) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [mounted, setMounted] = useState(false);
  const [syncCooldown, setSyncCooldown] = useState(0);

  // Pagination state
  const [matches, setMatches] = useState(initialMatches);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialMatches.length === 20);

  useEffect(() => {
    setMounted(true);
    if (riotAccount?.lastSyncedAt) {
      const timeSince = new Date().getTime() - new Date(riotAccount.lastSyncedAt).getTime();
      const remaining = Math.floor((120000 - timeSince) / 1000); // 120s cooldown
      if (remaining > 0) {
        setSyncCooldown(remaining);
      }
    }
  }, [riotAccount]);

  useEffect(() => {
    if (syncCooldown <= 0) return;
    const t = setInterval(() => setSyncCooldown(c => c - 1), 1000);
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

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const skip = page * 20;
      const res = await fetch(`/api/riot/matches?skip=${skip}&take=20`);
      if (res.ok) {
        const data = await res.json();
        setMatches((prev: any) => [...prev, ...data.matches]);
        setPage((p) => p + 1);
        setHasMore(data.matches.length === 20);
      }
    } catch (e) {
      console.error("Failed to load more");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/riot/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        if (data.count > 0) {
          setSuccessMsg(`Successfully synced ${data.count} new matches!`);
          setPage(1);
          setMatches(data.matches || initialMatches);
          setHasMore((data.matches || initialMatches).length === 20);
        } else {
          setSuccessMsg("Everything is up to date!");
        }
        setSyncCooldown(120); // Manually trigger frontend cooldown after successful sync check
        setTimeout(() => setSuccessMsg(""), 5000);
      } else {
        setError(data.message || "Failed to sync");
      }
    } catch (e) {
      setError("An unexpected error occurred");
    } finally {
      setIsSyncing(false);
    }
  };

  if (!riotAccount) {
    return (
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-10 text-center shadow-sm">
        <ShieldAlert className="w-16 h-16 text-neutral-500 mx-auto mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-white mb-2">No Riot Account Linked</h2>
        <p className="text-neutral-400 max-w-md mx-auto mb-8">
          You need to link your League of Legends account before you can sync and view your match history.
        </p>
        <Link href="/account">
          <Button className="px-8 bg-red-600 hover:bg-red-700 text-white">Link Account</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/60 border border-neutral-800 p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="w-1.5 h-6 bg-red-600 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.6)]"></span>
            Match History
          </h1>
          <p className="text-neutral-400 mt-1 text-sm">
            Synced from <strong className="text-neutral-300">{riotAccount.gameName}#{riotAccount.tagLine}</strong> ({riotAccount.region})
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-2">
          <Button
            onClick={handleSync}
            disabled={isSyncing || syncCooldown > 0}
            className="px-6 min-w-[140px] flex items-center justify-center transition-colors shadow-sm bg-neutral-900 border border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500 disabled:opacity-75 disabled:bg-neutral-800 disabled:border-neutral-600 disabled:text-neutral-300 disabled:cursor-not-allowed disabled:hover:bg-neutral-800"
          >
            {isSyncing ? (
              <><Spinner size="sm" className="mr-2 border-red-500" /> Syncing...</>
            ) : syncCooldown > 0 ? (
              `Wait ${syncCooldown}s`
            ) : (
              <><RefreshCw className="w-4 h-4 mr-2" /> Update</>
            )}
          </Button>
          {riotAccount.lastSyncedAt && (
            <span className="text-xs text-neutral-500 font-medium">
              Last synced: {mounted ? timeAgo(riotAccount.lastSyncedAt) : "Just now"}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-red-400 text-sm font-medium">{error}</p>
        </div>
      )}

      {matches.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/30 border border-neutral-800 rounded-xl">
          <p className="text-neutral-500 mb-4">No matches synced yet.</p>
          <Button onClick={handleSync} variant="outline" className="border-red-900/50 text-red-500 hover:bg-red-950/40">
            Fetch Match History
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {matches.map((match: any) => (
              <MatchCard
                key={match.id}
                match={match}
                champions={champions}
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
                className="w-full sm:w-auto min-w-[200px] border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
              >
                {isLoadingMore ? (
                  <><Spinner size="sm" className="mr-2" /> Loading more...</>
                ) : (
                  "Load More Matches"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
