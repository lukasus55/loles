import React from "react";
import { Trophy, Target, Swords, LineChart, Coins, Eye } from "lucide-react";

export const GeneralStatsCards = ({ data }: { data: any }) => {
  const {
    riotAccount, totalMatches, winRate,
    avgKills, avgDeaths, avgAssists, avgCs,
    avgGold, avgDamage, avgVision
  } = data;

  const rankString = riotAccount.tier ? `${riotAccount.tier} ${riotAccount.rank || ""}` : "Unranked";
  const lpString = riotAccount.leaguePoints !== null ? `${riotAccount.leaguePoints} LP` : "";

  const stats = [
    {
      title: "Overall Win Rate",
      value: `${winRate.toFixed(1)}%`,
      subValue: `${totalMatches} matches`,
      icon: <Target className="w-5 h-5 text-green-500" />
    },
    {
      title: "Average KDA",
      value: `${avgKills.toFixed(1)} / ${avgDeaths.toFixed(1)} / ${avgAssists.toFixed(1)}`,
      subValue: `${((avgKills + avgAssists) / Math.max(avgDeaths, 1)).toFixed(2)} Ratio`,
      icon: <Swords className="w-5 h-5 text-red-500" />
    },
    {
      title: "Average CS",
      value: avgCs.toFixed(1),
      subValue: "Per Game",
      icon: <LineChart className="w-5 h-5 text-blue-500" />
    },
    {
      title: "Average Damage",
      value: avgDamage ? avgDamage.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "N/A",
      subValue: "Per Game",
      icon: <Target className="w-5 h-5 text-orange-500" />
    },
    {
      title: "Average Gold",
      value: avgGold ? avgGold.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "N/A",
      subValue: "Per Game",
      icon: <Coins className="w-5 h-5 text-yellow-600" />
    },
    {
      title: "Vision Score",
      value: avgVision ? avgVision.toFixed(1) : "N/A",
      subValue: "Per Game",
      icon: <Eye className="w-5 h-5 text-teal-500" />
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {stats.map((s, i) => (
        <div key={i} className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 shadow-sm hover:border-neutral-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-neutral-400">{s.title}</h3>
            {s.icon}
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white capitalize">{s.value}</span>
            {s.subValue && <span className="text-xs text-neutral-500 mt-1">{s.subValue}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};
