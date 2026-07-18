"use client";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import { ChampionData } from "@/lib/riot/ddragon";
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";

export interface EnemyStatRow {
  championName: string;
  played: number;
  wins: number;
}

interface EnemyChampionsTableProps {
  data: EnemyStatRow[];
  championsData: ChampionData[];
}

type SortColumn = "championName" | "played" | "winRate";
type SortDirection = "asc" | "desc";

export const EnemyChampionsTable: React.FC<EnemyChampionsTableProps> = ({ data, championsData }) => {
  const [sortCol, setSortCol] = useState<SortColumn>("played");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const getChampIcon = (name: string) => {
    return championsData.find(c => c.name === name || c.id === name)?.iconUrl || "";
  };

  const getDisplayChampName = (name: string) => {
    return championsData.find(c => c.name === name || c.id === name)?.name || name;
  };

  const handleSort = (col: SortColumn) => {
    if (sortCol === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ col }: { col: SortColumn }) => {
    if (sortCol !== col) return <ArrowUpDown className="w-3 h-3 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortDir === "asc" ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />;
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      switch (sortCol) {
        case "championName":
          valA = getDisplayChampName(a.championName);
          valB = getDisplayChampName(b.championName);
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
  }, [data, sortCol, sortDir, championsData]);

  if (data.length === 0) {
    return (
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-8 flex flex-col items-center justify-center text-center h-full">
        <h3 className="text-lg font-bold text-white mb-2">Enemy Champions</h3>
        <p className="text-neutral-500 text-sm">No data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full max-h-[400px]">
      <div className="p-4 border-b border-neutral-800/50 shrink-0">
        <h3 className="text-lg font-bold text-white tracking-tight">Enemy Champions</h3>
      </div>

      <div className="overflow-y-auto flex-1 custom-scrollbar">
        <table className="w-full text-sm text-left table-fixed">
          <thead className="text-[10px] text-neutral-400 uppercase bg-neutral-950 sticky top-0 z-10 border-b border-neutral-800/50 shadow-sm">
            <tr>
              <th scope="col" className="px-4 py-2 cursor-pointer group hover:bg-neutral-900/50 transition-colors w-[50%] relative" onClick={() => handleSort("championName")}>
                <div className="flex items-center gap-2">Champion</div>
                <span className="absolute right-2 top-1/2 -translate-y-1/2"><SortIcon col="championName" /></span>
              </th>
              <th scope="col" className="px-4 py-2 cursor-pointer group hover:bg-neutral-900/50 transition-colors text-center w-[25%] relative" onClick={() => handleSort("played")}>
                <span>Played</span>
                <span className="absolute right-1 top-1/2 -translate-y-1/2"><SortIcon col="played" /></span>
              </th>
              <th scope="col" className="px-4 py-2 cursor-pointer group hover:bg-neutral-900/50 transition-colors text-center w-[25%] relative" onClick={() => handleSort("winRate")}>
                <span>Win Rate</span>
                <span className="absolute right-1 top-1/2 -translate-y-1/2"><SortIcon col="winRate" /></span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {sortedData.map((row) => {
              const wr = row.played > 0 ? (row.wins / row.played) * 100 : 0;
              const iconSrc = getChampIcon(row.championName);
              const displayChampName = getDisplayChampName(row.championName);

              return (
                <tr key={row.championName} className="bg-transparent hover:bg-neutral-800/30 transition-colors">
                  <td className="px-4 py-2 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 overflow-hidden shrink-0">
                      {iconSrc && <Image src={iconSrc} alt={displayChampName} width={24} height={24} className="w-full h-full object-cover" />}
                    </div>
                    <span className="font-medium text-white truncate text-xs">{displayChampName}</span>
                  </td>
                  <td className="px-4 py-2 text-center text-xs text-neutral-300">
                    {row.played}
                  </td>
                  <td className="px-4 py-2 text-center text-xs">
                    <span className="font-medium text-neutral-300">
                      {wr.toFixed(1)}%
                    </span>
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
