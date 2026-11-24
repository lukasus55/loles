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
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full min-h-[260px]">
        <div className="p-4 border-b border-neutral-800/50">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-red-500" />
            Filter Overview
          </h3>
        </div>
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
          <p className="text-neutral-400 font-medium">No games match the active filters.</p>
          <p className="text-neutral-600 text-xs mt-1">
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
      ? "text-green-400"
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

  const renderHighlightCard = (
    row: StatRowData,
    kind: "best" | "toughest"
  ) => {
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
        className={`flex items-center justify-between gap-3 p-3 rounded-lg bg-neutral-950/70 border border-neutral-800/80 transition-colors ${
          onHighlightClick ? "cursor-pointer hover:border-neutral-700 hover:bg-neutral-900/70" : ""
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-700 bg-neutral-900 shrink-0">
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
            <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 flex items-center gap-1">
              {isBest ? (
                <TrendingUp className="w-3 h-3 text-green-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              {isBest ? "Best" : "Toughest"} {perspectiveLabel ? `(${perspectiveLabel})` : ""}
            </p>
            <p className="text-sm font-bold text-white truncate">{displayName}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-sm font-bold ${isBest ? "text-green-400" : "text-red-400"}`}>
            {wr.toFixed(0)}%
          </p>
          <p className="text-[11px] text-neutral-500">{row.played}G</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-neutral-800/50 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-red-500" />
          Filter Overview
        </h3>
        <span className="text-xs font-medium text-neutral-400">
          {summary.played} {summary.played === 1 ? "game" : "games"}
        </span>
      </div>

      <div className="flex-1 p-5 flex flex-col justify-between gap-5">
        {/* Win Rate Bar */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2.5">
              <span className={`text-2xl font-bold ${wrColor}`}>
                {summary.winRate.toFixed(1)}%
              </span>
              <span className="text-xs text-neutral-400 font-medium">Win Rate</span>
            </div>
            <div className="text-sm font-bold">
              <span className="text-blue-400">{summary.wins}W</span>
              <span className="text-neutral-600 mx-1.5">-</span>
              <span className="text-red-400">{summary.losses}L</span>
            </div>
          </div>
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${summary.winRate}%` }}
              className="h-full bg-blue-500 transition-all duration-500"
            />
            <div
              style={{ width: `${100 - summary.winRate}%` }}
              className="h-full bg-red-500 transition-all duration-500"
            />
          </div>
        </div>

        {/* Core Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
              Avg KDA
            </p>
            <p className="text-sm font-bold text-white mt-1">
              {summary.avgKills.toFixed(1)} /{" "}
              <span className="text-red-400">{summary.avgDeaths.toFixed(1)}</span> /{" "}
              {summary.avgAssists.toFixed(1)}
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {summary.kdaRatio.toFixed(2)} ratio
            </p>
          </div>

          <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
              CS / Avg Time
            </p>
            <p className="text-sm font-bold text-white mt-1">
              {summary.avgCsPerMin.toFixed(1)} <span className="text-xs text-neutral-400">CS/m</span>
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-neutral-500" />
              {avgMins}m {avgSecs}s
            </p>
          </div>

          <Tooltip
            content={
              summary.earlyGameCount > 0
                ? `Average CS difference vs lane opponent at 15 min across ${summary.earlyGameCount} games.`
                : "No 15-minute timeline data available for these matches."
            }
            position="top"
            className="block"
          >
            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-lg p-3 h-full">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
                CS Diff @ 15
              </p>
              <p className={`text-base font-bold mt-1 ${diffColor(summary.avgCsDiff15)}`}>
                {formatSigned(summary.avgCsDiff15, 1)}
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {summary.earlyGameCount > 0 ? `${summary.earlyGameCount}G sample` : "No @15 data"}
              </p>
            </div>
          </Tooltip>

          <Tooltip
            content={
              summary.earlyGameCount > 0
                ? `Average gold difference vs lane opponent at 15 min across ${summary.earlyGameCount} games.`
                : "No 15-minute timeline data available for these matches."
            }
            position="top"
            className="block"
          >
            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-lg p-3 h-full">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
                Gold Diff @ 15
              </p>
              <p className={`text-base font-bold mt-1 ${diffColor(summary.avgGoldDiff15)}`}>
                {formatSigned(summary.avgGoldDiff15, 0)}
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {summary.earlyGameCount > 0 ? `${summary.earlyGameCount}G sample` : "No @15 data"}
              </p>
            </div>
          </Tooltip>
        </div>

        {/* Best & Toughest Highlights */}
        {best && toughest && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderHighlightCard(best, "best")}
            {renderHighlightCard(toughest, "toughest")}
          </div>
        )}
      </div>
    </div>
  );
};
