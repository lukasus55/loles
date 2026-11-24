"use client";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import { ChampionData } from "@/lib/riot/assets";
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";

export interface EnemyStatRow {
  championName: string;
  played: number;
  wins: number;
}

interface EnemyChampionsTableProps {
  data: EnemyStatRow[];
  championsData: ChampionData[];
  title?: string;
  onRowClick?: (championName: string) => void;
}

type SortColumn = "championName" | "played" | "winRate";
type SortDirection = "asc" | "desc";

const EnemySortIcon: React.FC<{
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

export const EnemyChampionsTable: React.FC<EnemyChampionsTableProps> = ({
  data,
  championsData,
  title = "Most Faced Opponents",
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
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortCol, sortDir, champMap]);

  if (data.length === 0) {
    return (
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-8 flex flex-col items-center justify-center text-center h-full">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-neutral-500 text-sm">No data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full max-h-[400px]">
      <div className="p-4 border-b border-neutral-800/50 shrink-0">
        <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
      </div>

      <div className="overflow-y-auto flex-1 custom-scrollbar">
        <table className="w-full text-sm text-left table-fixed">
          <thead className="text-[10px] text-neutral-400 uppercase bg-neutral-950 sticky top-0 z-10 border-b border-neutral-800/50 shadow-sm">
            <tr>
              <th
                scope="col"
                className="px-4 py-2 cursor-pointer group hover:bg-neutral-900/50 transition-colors w-[50%] relative"
                onClick={() => handleSort("championName")}
              >
                <div className="flex items-center gap-2">Champion</div>
                <span className="absolute right-2 top-1/2 -translate-y-1/2">
                  <EnemySortIcon col="championName" sortCol={sortCol} sortDir={sortDir} />
                </span>
              </th>
              <th
                scope="col"
                className="px-4 py-2 cursor-pointer group hover:bg-neutral-900/50 transition-colors text-center w-[25%] relative"
                onClick={() => handleSort("played")}
              >
                <span>Played</span>
                <span className="absolute right-1 top-1/2 -translate-y-1/2">
                  <EnemySortIcon col="played" sortCol={sortCol} sortDir={sortDir} />
                </span>
              </th>
              <th
                scope="col"
                className="px-4 py-2 cursor-pointer group hover:bg-neutral-900/50 transition-colors text-center w-[25%] relative"
                onClick={() => handleSort("winRate")}
              >
                <span>Win Rate</span>
                <span className="absolute right-1 top-1/2 -translate-y-1/2">
                  <EnemySortIcon col="winRate" sortCol={sortCol} sortDir={sortDir} />
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {sortedData.map((row) => {
              const wr = row.played > 0 ? (row.wins / row.played) * 100 : 0;
              let wrColor = "text-neutral-300";
              if (wr >= 60) wrColor = "text-blue-400";
              else if (wr >= 50) wrColor = "text-green-400";
              else if (wr < 45) wrColor = "text-red-400";

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
                  <td className="px-4 py-2 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 overflow-hidden shrink-0">
                      {iconSrc && (
                        <Image
                          src={iconSrc}
                          alt={displayChampName}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span className="font-medium text-white truncate text-xs">
                      {displayChampName}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center text-xs text-neutral-300">{row.played}</td>
                  <td className="px-4 py-2 text-center text-xs">
                    <span className={`font-semibold ${wrColor}`}>{wr.toFixed(1)}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
