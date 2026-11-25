"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

interface HistoryBackfillBannerProps {
  pendingCount: number;
  isBackfilling: boolean;
  isSyncing: boolean;
  backfillProgress: { current: number; total: number };
  onBackfill: () => void;
}

export const HistoryBackfillBanner: React.FC<HistoryBackfillBannerProps> = ({
  pendingCount,
  isBackfilling,
  isSyncing,
  backfillProgress,
  onBackfill,
}) => {
  if (pendingCount <= 0) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-neutral-900/40 border border-accent/25">
      <div className="flex items-center gap-2.5 min-w-0">
        <Sparkles className="w-4 h-4 text-accent-soft shrink-0" />
        <p className="text-xs text-neutral-400 leading-snug">
          <span className="font-medium text-neutral-200">
            {pendingCount} older {pendingCount === 1 ? "match" : "matches"}
          </span>{" "}
          missing items &amp; runes — run a one-time backfill to populate them.
        </p>
      </div>

      <Button
        onClick={onBackfill}
        disabled={isBackfilling || isSyncing}
        variant="outline"
        size="sm"
        className="self-start sm:self-auto shrink-0 h-7 px-3 text-xs border-accent/35 bg-accent/10 text-accent-soft hover:bg-accent/20 hover:text-white disabled:cursor-not-allowed"
      >
        {isBackfilling ? (
          <>
            <Spinner size="sm" className="mr-1.5" />
            <span>
              Updating {backfillProgress.current}/{backfillProgress.total}
            </span>
          </>
        ) : (
          "Sync Items & Runes"
        )}
      </Button>
    </div>
  );
};
