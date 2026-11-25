"use client";
import React, { useMemo } from "react";
import Image from "next/image";
import { BarChart3, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { ChampionData } from "@/lib/riot/assets";
import { StatRowData, SummaryStats } from "@/lib/stats/analytics";
import { Tooltip } from "@/components/ui/Tooltip";

interface GeneralInfoProps {
  summary: SummaryStats;
  tableData: StatRowData[];
  championsData: ChampionData[];
  perspectiveLabel?: string;
  onHighlightClick?: (championName: string) => void;
}

export const GeneralInfo: React.FC<GeneralInfoProps> = ({
  summary,
  tableData,
  championsData,
  perspectiveLabel,
  onHighlightClick,
}) => {
  const champMap = useMemo(() => {
    const map = new Map<string, ChampionData>();
    for (const c of championsData) {
      map.set(c.id, c);
      map.set(c.name, c);
    }
    return map;
  }, [championsData]);

  const { best, toughest } = useMemo(() => {
    const eligible = tableData.filter((r) => r.played >= 2);
    const pool = eligible.length >= 2 ? eligible : tableData;
    if (pool.length < 2) return { best: null, toughest: null };

    const sorted = [...pool].sort((a, b) => {
      const wrDiff = b.wins / b.played - a.wins / a.played;
      if (Math.abs(wrDiff) > 0.001) return wrDiff;
      return b.played - a.played;
    });

    return {
      best: sorted[0],
      toughest: sorted[sorted.length - 1],
    };
  }, [tableData]);

  if (summary.played === 0) {
    return (
      <div className="bg-neutral-900/35 border border-neutral-800/75 rounded-lg overflow-hidden flex flex-col h-full min-h-[240px]">
        <div className="px-4 py-3.5 border-b border-neutral-800/60">
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent-soft" />
            Filter Overview
          </h3>
        </div>
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
          <p className="text-neutral-300 text-sm font-medium">No games match the active filters.</p>
          <p className="text-neutral-500 text-xs mt-1">
            Adjust season, role, or champion selections to inspect your averages.
          </p>
        </div>
      </div>
    );
  }

  const avgMins = Math.floor(summary.avgDurationSec / 60);
  const avgSecs = Math.round(summary.avgDurationSec % 60);
  const wrColor =
    summary.winRate >= 60
      ? "text-blue-400"
      : summary.winRate >= 50
        ? "text-emerald-400"
        : "text-red-400";

  const formatSigned = (val: number | null, decimals = 1) => {
    if (val === null) return "—";
    const fixed = decimals === 0 ? Math.round(val).toString() : val.toFixed(decimals);
    return val > 0 ? `+${fixed}` : fixed;
  };

  const diffColor = (val: number | null) => {
    if (val === null) return "text-neutral-500";
    if (val > 0) return "text-blue-400";
    if (val < 0) return "text-red-400";
    return "text-neutral-300";
  };

  const renderHighlight = (row: StatRowData, kind: "best" | "toughest") => {
    const champ = champMap.get(row.championName);
    const displayName = champ?.name || row.championName;
    const wr = (row.wins / row.played) * 100;
    const isBest = kind === "best";

    return (
      <div
        role={onHighlightClick ? "button" : undefined}
        tabIndex={onHighlightClick ? 0 : undefined}
        onClick={() => onHighlightClick?.(row.championName)}
        onKeyDown={(e) => {
          if (onHighlightClick && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onHighlightClick(row.championName);
          }
        }}
        className={`flex items-center justify-between gap-3 py-1.5 px-2.5 -mx-2.5 rounded-md transition-colors ${
          onHighlightClick
            ? "cursor-pointer hover:bg-neutral-800/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            : ""
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-700/80 bg-neutral-900 shrink-0">
            {champ?.iconUrl && (
              <Image
                src={champ.iconUrl}
                alt={displayName}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider font-medium text-neutral-500 flex items-center gap-1">
              {isBest ? (
                <TrendingUp className="w-3 h-3 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              {isBest ? "Best" : "Toughest"}
              {perspectiveLabel ? ` (${perspectiveLabel})` : ""}
            </p>
            <p className="text-sm font-semibold text-neutral-100 truncate">{displayName}</p>
          </div>
        </div>
        <div className="text-right shrink-0 tabular-nums">
          <p className={`text-sm font-semibold ${isBest ? "text-emerald-400" : "text-red-400"}`}>
            {wr.toFixed(0)}%
          </p>
          <p className="text-[11px] text-neutral-500">{row.played}G</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-neutral-900/35 border border-neutral-800/75 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="px-4 sm:px-5 py-3.5 border-b border-neutral-800/60 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent-soft" />
          Filter Overview
        </h3>
        <span className="text-xs font-medium text-neutral-400 tabular-nums">
          {summary.played} {summary.played === 1 ? "game" : "games"}
        </span>
      </div>

      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between gap-5">
        {/* Win Rate Bar */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between tabular-nums">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-semibold tracking-tight ${wrColor}`}>
                {summary.winRate.toFixed(1)}%
              </span>
              <span className="text-xs text-neutral-400 font-medium">Win Rate</span>
            </div>
            <div className="text-xs sm:text-sm font-semibold">
              <span className="text-blue-400">{summary.wins}W</span>
              <span className="text-neutral-600 mx-1.5">–</span>
              <span className="text-red-400">{summary.losses}L</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${summary.winRate}%` }}
              className="h-full bg-blue-500 transition-all duration-300"
            />
            <div
              style={{ width: `${100 - summary.winRate}%` }}
              className="h-full bg-red-500 transition-all duration-300"
            />
          </div>
        </div>

        {/* De-boxed 4-column metric strip separated by subtle hairlines */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 sm:gap-y-0 sm:divide-x sm:divide-neutral-800/70 py-1">
          <div className="pr-3 sm:pr-4">
            <p className="text-[10px] uppercase tracking-wider font-medium text-neutral-500">
              Avg KDA
            </p>
            <p className="text-base font-semibold text-white mt-1 tabular-nums">
              {summary.avgKills.toFixed(1)}
              <span className="text-neutral-600 font-normal mx-1">/</span>
              <span className="text-red-400">{summary.avgDeaths.toFixed(1)}</span>
              <span className="text-neutral-600 font-normal mx-1">/</span>
              {summary.avgAssists.toFixed(1)}
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5 tabular-nums">
              {summary.kdaRatio.toFixed(2)} ratio
            </p>
          </div>

          <div className="pl-3 sm:px-4">
            <p className="text-[10px] uppercase tracking-wider font-medium text-neutral-500">
              CS / Avg Time
            </p>
            <p className="text-base font-semibold text-white mt-1 tabular-nums">
              {summary.avgCsPerMin.toFixed(1)}{" "}
              <span className="text-xs font-normal text-neutral-400">CS/m</span>
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1 tabular-nums">
              <Clock className="w-3 h-3 text-neutral-500" />
              {avgMins}m {avgSecs}s
            </p>
          </div>

          <div className="pr-3 sm:px-4">
            <Tooltip
              content={
                summary.earlyGameCount > 0
                  ? `Average CS difference vs lane opponent at 15 min across ${summary.earlyGameCount} games.`
                  : "No 15-minute timeline data available for these matches."
              }
              position="top"
              className="block cursor-help"
            >
              <div>
                <p className="text-[10px] uppercase tracking-wider font-medium text-neutral-500">
                  CS Diff @ 15
                </p>
                <p className={`text-base font-semibold mt-1 tabular-nums ${diffColor(summary.avgCsDiff15)}`}>
                  {formatSigned(summary.avgCsDiff15, 1)}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5 tabular-nums">
                  {summary.earlyGameCount > 0 ? `${summary.earlyGameCount}G sample` : "No @15 data"}
                </p>
              </div>
            </Tooltip>
          </div>

          <div className="pl-3 sm:pl-4">
            <Tooltip
              content={
                summary.earlyGameCount > 0
                  ? `Average gold difference vs lane opponent at 15 min across ${summary.earlyGameCount} games.`
                  : "No 15-minute timeline data available for these matches."
              }
              position="top"
              className="block cursor-help"
            >
              <div>
                <p className="text-[10px] uppercase tracking-wider font-medium text-neutral-500">
                  Gold Diff @ 15
                </p>
                <p className={`text-base font-semibold mt-1 tabular-nums ${diffColor(summary.avgGoldDiff15)}`}>
                  {formatSigned(summary.avgGoldDiff15, 0)}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5 tabular-nums">
                  {summary.earlyGameCount > 0 ? `${summary.earlyGameCount}G sample` : "No @15 data"}
                </p>
              </div>
            </Tooltip>
          </div>
        </div>

        {/* Raw Best & Toughest Highlights (no inner card boxes) */}
        {best && toughest && (
          <div className="pt-3.5 border-t border-neutral-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
            {renderHighlight(best, "best")}
            {renderHighlight(toughest, "toughest")}
          </div>
        )}
      </div>
    </div>
  );
};
