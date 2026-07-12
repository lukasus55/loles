import React from "react";
import { Target, Swords, LineChart, Coins, Eye } from "lucide-react";

export const GeneralStatsCards = ({ data }: { data: any }) => {
  const {
    totalMatches, winRate,
    avgKills, avgDeaths, avgAssists, avgCs,
    avgGold, avgDamage, avgVision
  } = data;

  const kdaRatio = ((avgKills + avgAssists) / Math.max(avgDeaths, 1)).toFixed(2);

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 md:p-10 flex flex-col xl:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -left-24 w-64 h-64rounded-full blur-[100px] pointer-events-none" />

      {/* Primary Stats: Win Rate & KDA */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-8 sm:gap-16 relative z-10 w-full xl:w-auto">

        {/* Win Rate */}
        <div className="flex flex-col items-center sm:items-start">
          <span className="text-neutral-400 font-medium tracking-wide uppercase text-sm mb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-red-500" /> Win Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl md:text-7xl font-black">
              {winRate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-24 bg-neutral-800 hidden sm:block mt-2" />

        {/* KDA */}
        <div className="flex flex-col items-center sm:items-start">
          <span className="text-neutral-400 font-medium tracking-wide uppercase text-sm mb-2 flex items-center gap-2">
            <Swords className="w-4 h-4 text-red-500" /> Average KDA
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black text-white tracking-tight">
              {kdaRatio}
            </span>
          </div>
          <div className="mt-3 inline-flex items-center gap-2">
            <span className="text-sm text-neutral-300">{avgKills.toFixed(1)} <span className="font-light mx-1">/</span> <span className="text-red-400">{avgDeaths.toFixed(1)}</span> <span className="font-light mx-1">/</span> {avgAssists.toFixed(1)}</span>
          </div>
        </div>

      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-8 relative z-10 w-full xl:w-auto xl:pl-10 xl:border-l border-neutral-800/80 pt-8 xl:pt-0 border-t xl:border-t-0">

        <div className="flex flex-col">
          <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <LineChart className="w-3.5 h-3.5 text-neutral-600" /> CS / Game
          </span>
          <span className="text-2xl font-bold text-neutral-200">{avgCs.toFixed(1)}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-neutral-600" /> Dmg / Game
          </span>
          <span className="text-2xl font-bold text-neutral-200">
            {avgDamage ? avgDamage.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "N/A"}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-neutral-600" /> Gold / Game
          </span>
          <span className="text-2xl font-bold text-neutral-200">
            {avgGold ? avgGold.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "N/A"}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-neutral-600" /> Vision Score
          </span>
          <span className="text-2xl font-bold text-neutral-200">
            {avgVision ? avgVision.toFixed(1) : "N/A"}
          </span>
        </div>

      </div>
    </div>
  );
};
