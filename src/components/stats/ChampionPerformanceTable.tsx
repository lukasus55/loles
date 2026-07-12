import React from "react";
import Image from "next/image";

export const ChampionPerformanceTable = ({ champions }: { champions: any[] }) => {
  if (!champions.length) return null;

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-neutral-800 bg-neutral-900/80">
        <h2 className="text-xl font-bold text-white">Your Champions</h2>

      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-400">
          <thead className="text-xs text-neutral-500 uppercase bg-neutral-950/50">
            <tr>
              <th className="px-6 py-4 font-bold tracking-wider">Champion</th>
              <th className="px-6 py-4 font-bold tracking-wider text-center">Played</th>
              <th className="px-6 py-4 font-bold tracking-wider text-center">Win Rate</th>
              <th className="px-6 py-4 font-bold tracking-wider text-center">KDA</th>
              <th className="px-6 py-4 font-bold tracking-wider text-center">CS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {champions.slice(0, 10).map((champ, idx) => (
              <tr key={idx} className="hover:bg-neutral-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-neutral-700">
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/14.13.1/img/champion/${champ.name === "FiddleSticks" ? "Fiddlesticks" : champ.name}.png`}
                        alt={champ.name}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <span className="font-medium text-white">{champ.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center font-medium text-neutral-300">
                  {champ.games}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`font-bold ${champ.winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                    {champ.winRate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-neutral-300">
                  {champ.avgKills.toFixed(1)} / <span className="text-red-400">{champ.avgDeaths.toFixed(1)}</span> / {champ.avgAssists.toFixed(1)}
                </td>
                <td className="px-6 py-4 text-center text-neutral-300">
                  {champ.avgCs.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
