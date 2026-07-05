import React from "react";
import Image from "next/image";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export const MatchupInsights = ({ matchups }: { matchups: any[] }) => {
  if (!matchups.length) return null;

  // Filter matchups with at least 2 games for meaningful stats, otherwise fallback to any
  const meaningfulMatchups = matchups.filter(m => m.games >= 2);
  const dataToUse = meaningfulMatchups.length > 0 ? meaningfulMatchups : matchups;

  // Sort by win rate
  const sorted = [...dataToUse].sort((a, b) => b.winRate - a.winRate);
  
  const best = sorted.slice(0, 3);
  const worst = sorted.slice().reverse().slice(0, 3).filter(w => !best.find(b => b.enemy === w.enemy));

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <ThumbsUp className="w-5 h-5 text-green-500" /> Best Matchups
        </h3>
        {best.length === 0 ? (
          <p className="text-sm text-neutral-500">Not enough data.</p>
        ) : (
          <div className="space-y-4">
            {best.map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden relative border border-neutral-700">
                    <Image
                      src={`https://ddragon.leagueoflegends.com/cdn/14.13.1/img/champion/${m.enemy === "FiddleSticks" ? "Fiddlesticks" : m.enemy}.png`}
                      alt={m.enemy}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="font-medium text-neutral-300 text-sm">vs {m.enemy}</span>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-bold text-green-500">{m.winRate.toFixed(0)}% WR</span>
                  <span className="block text-xs text-neutral-500">{m.games} games</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <ThumbsDown className="w-5 h-5 text-red-500" /> Worst Matchups
        </h3>
        {worst.length === 0 ? (
          <p className="text-sm text-neutral-500">Not enough data.</p>
        ) : (
          <div className="space-y-4">
            {worst.map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden relative border border-neutral-700">
                    <Image
                      src={`https://ddragon.leagueoflegends.com/cdn/14.13.1/img/champion/${m.enemy === "FiddleSticks" ? "Fiddlesticks" : m.enemy}.png`}
                      alt={m.enemy}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="font-medium text-neutral-300 text-sm">vs {m.enemy}</span>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-bold text-red-500">{m.winRate.toFixed(0)}% WR</span>
                  <span className="block text-xs text-neutral-500">{m.games} games</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
