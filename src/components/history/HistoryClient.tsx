"use client";
import React, { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ExistingNoteSummary, MatchCard, MatchRecordDTO } from "./MatchCard";
import { HistoryHeader, RiotAccountSummary } from "./HistoryHeader";
import { HistoryBackfillBanner } from "./HistoryBackfillBanner";
import { useHistorySync } from "./useHistorySync";
import { LinkAccountPrompt } from "@/components/account/LinkAccountPrompt";
import { ChampionData, MatchAssetsData } from "@/lib/riot/assets";

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
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const {
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
  } = useHistorySync({
    initialMatches,
    lastSyncedAt: riotAccount?.lastSyncedAt,
    initialPendingBackfillCount,
  });

  if (!riotAccount) {
    return (
      <div className="flex-1 flex flex-col justify-center p-8 w-full max-w-3xl mx-auto">
        <LinkAccountPrompt />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
      <div className="space-y-4 animate-in fade-in duration-300">
        <HistoryHeader
          riotAccount={riotAccount}
          mounted={mounted}
          isSyncing={isSyncing}
          isBackfilling={isBackfilling}
          syncCooldown={syncCooldown}
          syncProgress={syncProgress}
          onSync={handleSync}
        />

        <HistoryBackfillBanner
          pendingCount={pendingBackfillCount}
          isBackfilling={isBackfilling}
          isSyncing={isSyncing}
          backfillProgress={backfillProgress}
          onBackfill={handleBackfill}
        />

        {matches.length === 0 ? (
          <div className="text-center py-14 bg-neutral-900/25 border border-neutral-800/70 rounded-lg">
            <p className="text-sm text-neutral-500 mb-4">No matches synced yet.</p>
            <Button
              onClick={handleSync}
              variant="outline"
              size="sm"
              className="border-accent/40 text-accent-soft hover:bg-accent/10 hover:text-white"
            >
              Fetch Match History
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
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
              <div className="flex justify-center pt-2 pb-10">
                <Button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto min-w-[180px] border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:bg-neutral-800/80 hover:text-white"
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
