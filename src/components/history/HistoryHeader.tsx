"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { formatTimeAgo } from "./historyHelpers";

export interface RiotAccountSummary {
  gameName: string;
  tagLine: string;
  region: string;
  lastSyncedAt?: string | Date | null;
}

interface HistoryHeaderProps {
  riotAccount: RiotAccountSummary;
  mounted: boolean;
  isSyncing: boolean;
  isBackfilling: boolean;
  syncCooldown: number;
  syncProgress: { current: number; total: number };
  onSync: () => void;
}

export const HistoryHeader: React.FC<HistoryHeaderProps> = ({
  riotAccount,
  mounted,
  isSyncing,
  isBackfilling,
  syncCooldown,
  syncProgress,
  onSync,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800/70">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1 h-5 bg-red-500 rounded-full" />
          Match History
        </h1>
        <p className="text-xs text-neutral-500 mt-1 pl-3.5 flex items-center gap-1.5 flex-wrap">
          <span className="text-neutral-300 font-medium">
            {riotAccount.gameName}#{riotAccount.tagLine}
          </span>
          <span aria-hidden="true">·</span>
          <span>{riotAccount.region}</span>
          {riotAccount.lastSyncedAt && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                Synced {mounted ? formatTimeAgo(riotAccount.lastSyncedAt) : "recently"}
              </span>
            </>
          )}
        </p>
      </div>

      <Button
        onClick={onSync}
        disabled={isSyncing || isBackfilling || syncCooldown > 0}
        variant="outline"
        size="sm"
        className="self-start sm:self-auto h-8 px-3.5 gap-1.5 border-neutral-700/80 bg-neutral-900/60 text-neutral-200 hover:bg-neutral-800/80 hover:border-red-500/40 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSyncing ? (
          <>
            <Spinner size="sm" className="border-red-500" />
            <span>
              {syncProgress.total > 0
                ? `Syncing ${syncProgress.current}/${syncProgress.total}`
                : "Syncing..."}
            </span>
          </>
        ) : syncCooldown > 0 ? (
          <span>Wait {syncCooldown}s</span>
        ) : (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-red-400" />
            <span>Update</span>
          </>
        )}
      </Button>
    </div>
  );
};
