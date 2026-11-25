"use client";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import { ChampionData } from "@/lib/riot/assets";
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { PerspectiveOption, StatRowData, StatsGroupBy } from "@/lib/stats/analytics";

export type { StatRowData };

interface StatsTableProps {
  data: StatRowData[];
  championsData: ChampionData[];
  title: string;
  columnLabel?: string;
  perspectives?: PerspectiveOption[];
  activePerspective?: StatsGroupBy | null;
  onPerspectiveChange?: (perspective: StatsGroupBy) => void;
  onRowClick?: (championName: string) => void;
}

type SortColumn = "championName" | "played" | "winRate" | "kda" | "cs";
type SortDirection = "asc" | "desc";

const SortIcon: React.FC<{
  col: SortColumn;
  sortCol: SortColumn;
  sortDir: SortDirection;
}> = ({ col, sortCol, sortDir }) => {
  if (sortCol !== col) {
    return (
      <ArrowUpDown className="w-3 h-3 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    );
  }
  return sortDir === "asc" ? (
    <ChevronUp className="w-4 h-4 text-white" />
  ) : (
    <ChevronDown className="w-4 h-4 text-white" />
  );
};

export const StatsTable: React.FC<StatsTableProps> = ({
  data,
  championsData,
  title,
  columnLabel = "Champion",
  perspectives = [],
  activePerspective,
  onPerspectiveChange,
  onRowClick,
}) => {
  const [sortCol, setSortCol] = useState<SortColumn>("played");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const champMap = useMemo(() => {
    const map = new Map<string, ChampionData>();
    for (const c of championsData) {
      map.set(c.id, c);
      map.set(c.name, c);
    }
    return map;
  }, [championsData]);

  const handleSort = (col: SortColumn) => {
    if (sortCol === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setSortDir("desc");
    }
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      switch (sortCol) {
        case "championName":
          valA = champMap.get(a.championName)?.name || a.championName;
          valB = champMap.get(b.championName)?.name || b.championName;
          break;
        case "played":
          valA = a.played;
          valB = b.played;
          break;
        case "winRate":
          valA = a.played > 0 ? a.wins / a.played : 0;
          valB = b.played > 0 ? b.wins / b.played : 0;
          break;
        case "kda":
          valA = (a.kills + a.assists) / Math.max(1, a.deaths);
          valB = (b.kills + b.assists) / Math.max(1, b.deaths);
          break;
        case "cs":
          valA = a.gameDuration > 0 ? a.cs / (a.gameDuration / 60) : 0;
          valB = b.gameDuration > 0 ? b.cs / (b.gameDuration / 60) : 0;
          break;
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortCol, sortDir, champMap]);

  return (
    <div className="bg-neutral-900/35 border border-neutral-800/75 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="px-4 sm:px-5 py-3.5 border-b border-neutral-800/60 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight truncate">
          {title}
        </h3>

        {perspectives.length > 1 && onPerspectiveChange && (
          <div className="inline-flex flex-wrap items-center gap-0.5 bg-neutral-950/60 border border-neutral-800/80 p-0.5 rounded-lg w-fit">
            {perspectives.map((p) => {
              const isActive = p.id === activePerspective;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onPerspectiveChange(p.id)}
                  className={`h-7 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-accent/15 border border-accent/45 text-white"
                      : "border border-transparent text-neutral-400 hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
          <p className="text-neutral-400 font-medium">No matches found for this view.</p>
          <p className="text-neutral-600 text-xs mt-1">
            Try switching perspective or clearing one of the champion filters above.
          </p>
        </div>
      ) : (
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full text-sm text-left table-fixed">
            <thead className="text-[11px] text-neutral-400 uppercase bg-neutral-950/95 sticky top-0 z-10 border-b border-neutral-800/60">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-2.5 sm:px-5 cursor-pointer group hover:bg-neutral-900/50 transition-colors w-[45%] sm:w-[28%] relative"
                  onClick={() => handleSort("championName")}
                >
                  <div className="flex items-center gap-2">{columnLabel}</div>
                  <span className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2">
                    <SortIcon col="championName" sortCol={sortCol} sortDir={sortDir} />
                  </span>
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 sm:px-5 cursor-pointer group hover:bg-neutral-900/50 transition-colors text-center w-[20%] sm:w-[14%] relative"
                  onClick={() => handleSort("played")}
                >
                  <span>Played</span>
                  <span className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2">
                    <SortIcon col="played" sortCol={sortCol} sortDir={sortDir} />
                  </span>
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 sm:px-5 cursor-pointer group hover:bg-neutral-900/50 transition-colors text-center w-[35%] sm:w-[18%] relative"
                  onClick={() => handleSort("winRate")}
                >
                  <span>Win Rate</span>
                  <span className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2">
                    <SortIcon col="winRate" sortCol={sortCol} sortDir={sortDir} />
                  </span>
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 sm:px-5 cursor-pointer group hover:bg-neutral-900/50 transition-colors text-center hidden sm:table-cell sm:w-[25%] relative"
                  onClick={() => handleSort("kda")}
                >
                  <span>KDA</span>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2">
                    <SortIcon col="kda" sortCol={sortCol} sortDir={sortDir} />
                  </span>
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 sm:px-5 cursor-pointer group hover:bg-neutral-900/50 transition-colors text-center hidden sm:table-cell sm:w-[15%] relative"
                  onClick={() => handleSort("cs")}
                >
                  <span>CS/min</span>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2">
                    <SortIcon col="cs" sortCol={sortCol} sortDir={sortDir} />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/45 tabular-nums">
              {sortedData.map((row) => {
                const wr = row.played > 0 ? (row.wins / row.played) * 100 : 0;
                let wrColor = "text-neutral-300";
                if (wr >= 70) wrColor = "text-yellow-500";
                else if (wr >= 60) wrColor = "text-blue-400";
                else if (wr >= 50) wrColor = "text-emerald-400";

                const avgKills = row.played > 0 ? row.kills / row.played : 0;
                const avgDeaths = row.played > 0 ? row.deaths / row.played : 0;
                const avgAssists = row.played > 0 ? row.assists / row.played : 0;
                const kdaRatioValue = avgDeaths > 0 ? (avgKills + avgAssists) / avgDeaths : 999;
                const kdaRatio = avgDeaths > 0 ? kdaRatioValue.toFixed(2) : "Perfect";

                let kdaColor = "text-neutral-400";
                if (kdaRatioValue >= 5) kdaColor = "text-yellow-500";
                else if (kdaRatioValue >= 4) kdaColor = "text-blue-400";
                else if (kdaRatioValue >= 3) kdaColor = "text-emerald-400";

                const csPerMin = row.gameDuration > 0 ? row.cs / (row.gameDuration / 60) : 0;

                const champ = champMap.get(row.championName);
                const iconSrc = champ?.iconUrl || "";
                const displayChampName = champ?.name || row.championName;

                return (
                  <tr
                    key={row.championName}
                    onClick={() => onRowClick?.(row.championName)}
                    className={`bg-transparent hover:bg-neutral-800/40 transition-colors ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                  >
                    <td className="px-4 py-2.5 sm:px-5 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700/80 overflow-hidden shrink-0">
                        {iconSrc && (
                          <Image
                            src={iconSrc}
                            alt={displayChampName}
                            width={28}
                            height={28}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <span className="font-semibold text-neutral-100 truncate max-w-[100px] sm:max-w-none">
                        {displayChampName}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 sm:px-5 text-center font-medium text-neutral-300">
                      {row.played}
                    </td>
                    <td className="px-4 py-2.5 sm:px-5 text-center">
                      <span className={`font-semibold ${wrColor}`}>{wr.toFixed(1)}%</span>
                    </td>
                    <td className="px-4 py-2.5 sm:px-5 text-center hidden sm:table-cell">
                      <div className="flex flex-col items-center">
                        <span className="text-neutral-300 text-xs font-medium">
                          {avgKills.toFixed(1)} /{" "}
                          <span className="text-red-400">{avgDeaths.toFixed(1)}</span> /{" "}
                          {avgAssists.toFixed(1)}
                        </span>
                        <span className={`text-[10px] font-medium ${kdaColor}`}>{kdaRatio} KDA</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 sm:px-5 text-center hidden sm:table-cell font-medium text-neutral-400">
                      {csPerMin.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
