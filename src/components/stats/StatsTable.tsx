"use client";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import { ChampionData } from "@/lib/riot/ddragon";
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";

export interface StatRowData {
  championName: string;
  played: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  gameDuration: number;
}

interface StatsTableProps {
  data: StatRowData[];
  championsData: ChampionData[];
  title: string;
  onRowClick?: (championName: string) => void;
}

type SortColumn = "championName" | "played" | "winRate" | "kda" | "cs";
type SortDirection = "asc" | "desc";

export const StatsTable: React.FC<StatsTableProps> = ({ data, championsData, title, onRowClick }) => {
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
      setSortDir("desc"); // Default to desc for new columns
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
  }, [data, sortCol, sortDir]);

  if (data.length === 0) {
    return (
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-8 flex flex-col items-center justify-center text-center">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-neutral-500">No data available for the current filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-neutral-800/50 shrink-0">
        <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
      </div>
      
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        <table className="w-full text-sm text-left table-fixed">
          <thead className="text-[10px] sm:text-xs text-neutral-400 uppercase bg-neutral-950/80 sticky top-0 z-10 border-b border-neutral-800/50 shadow-sm">
            <tr>
              <th scope="col" className="px-4 py-3 sm:px-6 cursor-pointer group hover:bg-neutral-900/50 transition-colors w-[45%] sm:w-[28%] relative" onClick={() => handleSort("championName")}>
                <div className="flex items-center gap-2">Champion</div>
                <span className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2"><SortIcon col="championName" /></span>
              </th>
              <th scope="col" className="px-4 py-3 sm:px-6 cursor-pointer group hover:bg-neutral-900/50 transition-colors text-center w-[20%] sm:w-[14%] relative" onClick={() => handleSort("played")}>
                <span>Played</span>
                <span className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2"><SortIcon col="played" /></span>
              </th>
              <th scope="col" className="px-4 py-3 sm:px-6 cursor-pointer group hover:bg-neutral-900/50 transition-colors text-center w-[35%] sm:w-[18%] relative" onClick={() => handleSort("winRate")}>
                <span>Win Rate</span>
                <span className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2"><SortIcon col="winRate" /></span>
              </th>
              <th scope="col" className="px-4 py-3 sm:px-6 cursor-pointer group hover:bg-neutral-900/50 transition-colors text-center hidden sm:table-cell sm:w-[25%] relative" onClick={() => handleSort("kda")}>
                <span>KDA</span>
                <span className="absolute right-4 top-1/2 -translate-y-1/2"><SortIcon col="kda" /></span>
              </th>
              <th scope="col" className="px-4 py-3 sm:px-6 cursor-pointer group hover:bg-neutral-900/50 transition-colors text-center hidden sm:table-cell sm:w-[15%] relative" onClick={() => handleSort("cs")}>
                <span>CS/min</span>
                <span className="absolute right-4 top-1/2 -translate-y-1/2"><SortIcon col="cs" /></span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {sortedData.map((row) => {
              const wr = row.played > 0 ? (row.wins / row.played) * 100 : 0;
              let wrColor = "text-neutral-300";
              if (wr >= 70) wrColor = "text-yellow-500";
              else if (wr >= 60) wrColor = "text-blue-500";
              else if (wr >= 50) wrColor = "text-green-500";
              
              const avgKills = row.played > 0 ? row.kills / row.played : 0;
              const avgDeaths = row.played > 0 ? row.deaths / row.played : 0;
              const avgAssists = row.played > 0 ? row.assists / row.played : 0;
              const kdaRatioValue = avgDeaths > 0 ? ((avgKills + avgAssists) / avgDeaths) : 999;
              const kdaRatio = avgDeaths > 0 ? kdaRatioValue.toFixed(2) : "Perfect";
              
              let kdaColor = "text-neutral-300";
              if (kdaRatioValue >= 5) kdaColor = "text-yellow-500";
              else if (kdaRatioValue >= 4) kdaColor = "text-blue-500";
              else if (kdaRatioValue >= 3) kdaColor = "text-green-500";
              
              const csPerMin = row.gameDuration > 0 ? row.cs / (row.gameDuration / 60) : 0;

              const iconSrc = getChampIcon(row.championName);
              const displayChampName = getDisplayChampName(row.championName);
              return (
                <tr 
                  key={row.championName} 
                  onClick={() => onRowClick?.(row.championName)}
                  className={`bg-transparent hover:bg-neutral-800/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  <td className="px-4 py-3 sm:px-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 overflow-hidden shrink-0">
                      {iconSrc && <Image src={iconSrc} alt={displayChampName} width={32} height={32} className="w-full h-full object-cover" />}
                    </div>
                    <span className="font-bold text-white truncate max-w-[100px] sm:max-w-none">{displayChampName}</span>
                  </td>
                  <td className="px-4 py-3 sm:px-6 text-center font-medium text-neutral-300">
                    {row.played}
                  </td>
                  <td className="px-4 py-3 sm:px-6 text-center">
                    <span className={`font-bold ${wrColor}`}>
                      {wr.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 sm:px-6 text-center hidden sm:table-cell">
                    <div className="flex flex-col items-center">
                      <span className="text-neutral-300 text-xs font-medium">
                        {avgKills.toFixed(1)} / <span className="text-red-400">{avgDeaths.toFixed(1)}</span> / {avgAssists.toFixed(1)}
                      </span>
                      <span className={`text-[10px] font-bold ${kdaColor}`}>{kdaRatio} KDA</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 sm:px-6 text-center hidden sm:table-cell font-medium text-neutral-400">
                    {csPerMin.toFixed(1)}
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
