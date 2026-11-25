"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChampionData, MatchAssetsData } from "@/lib/riot/assets";
import { MatchItemsRow, MatchSpellsAndRunes } from "@/components/match/MatchLoadoutDisplay";
import { MatchRecordDTO } from "@/components/history/MatchCard";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { BookmarkPlus, History } from "lucide-react";

interface MatchupHistoryTabProps {
  exactMatches: MatchRecordDTO[];
  broadMatches: MatchRecordDTO[];
  hasPartnerFilter: boolean;
  myPick: string;
  enemyPick: string;
  champions: ChampionData[];
  matchAssets: MatchAssetsData;
  onSaveAsPreset?: (match: MatchRecordDTO) => void;
}

function formatShortDate(dateStr: string | Date): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const MatchupHistoryTab: React.FC<MatchupHistoryTabProps> = ({
  exactMatches,
  broadMatches,
  hasPartnerFilter,
  myPick,
  enemyPick,
  champions,
  matchAssets,
  onSaveAsPreset,
}) => {
  const [scope, setScope] = useState<"exact" | "broad">(
    hasPartnerFilter && exactMatches.length > 0 ? "exact" : "broad"
  );

  const champMap = useMemo(() => {
    const map = new Map<string, ChampionData>();
    for (const c of champions) {
      map.set(c.id, c);
      map.set(c.name, c);
    }
    return map;
  }, [champions]);

  const activeMatches = hasPartnerFilter && scope === "exact" ? exactMatches : broadMatches;

  const getChampIcon = (name: string) =>
    champMap.get(name)?.iconUrl ||
    `https://ddragon.leagueoflegends.com/cdn/${matchAssets.version}/img/champion/${name}.png`;

  const getChampName = (name: string) => champMap.get(name)?.name || name;

  return (
    <div className="space-y-4">
      {/* Scope Switcher (Botlane 2v2 vs All 1v1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            Played Games in this Matchup
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Showing {activeMatches.length} {activeMatches.length === 1 ? "game" : "games"} (remakes excluded)
          </p>
        </div>

        {hasPartnerFilter && (
          <div className="inline-flex items-center gap-0.5 bg-neutral-900/70 border border-neutral-800/80 p-0.5 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setScope("exact")}
              className={`h-7 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                scope === "exact"
                  ? "bg-accent/15 border border-accent/45 text-white"
                  : "border border-transparent text-neutral-400 hover:text-white"
              }`}
            >
              Exact 2v2 ({exactMatches.length})
            </button>
            <button
              type="button"
              onClick={() => setScope("broad")}
              className={`h-7 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                scope === "broad"
                  ? "bg-accent/15 border border-accent/45 text-white"
                  : "border border-transparent text-neutral-400 hover:text-white"
              }`}
            >
              All {getChampName(myPick)} vs {getChampName(enemyPick)} ({broadMatches.length})
            </button>
          </div>
        )}
      </div>

      {activeMatches.length === 0 ? (
        <div className="bg-neutral-900/30 border border-neutral-800/75 rounded-lg p-10 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center mb-3">
            <History className="w-5 h-5 text-neutral-500" />
          </div>
          <p className="text-neutral-300 font-semibold">No tracked matches found</p>
          <p className="text-xs text-neutral-500 max-w-sm mt-1">
            {hasPartnerFilter && scope === "exact" && broadMatches.length > 0
              ? `You haven't played this exact 2v2 yet, but you have ${broadMatches.length} games as ${getChampName(myPick)} vs ${getChampName(enemyPick)}.`
              : "Sync your latest games in Match History to see your builds, runes, and @15 lane diffs here."}
          </p>
          <div className="mt-4 flex items-center gap-3">
            {hasPartnerFilter && scope === "exact" && broadMatches.length > 0 ? (
              <Button size="sm" variant="outline" onClick={() => setScope("broad")}>
                Show All {getChampName(myPick)} vs {getChampName(enemyPick)}
              </Button>
            ) : (
              <Link href="/history">
                <Button size="sm" variant="outline">
                  Go to Match History
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {activeMatches.map((match) => {
            const isWin = match.win;
            const durationMins = Math.floor(match.gameDuration / 60);
            const durationSecs = match.gameDuration % 60;
            const csPerMin = (match.cs / Math.max(1, match.gameDuration / 60)).toFixed(1);
            const kda =
              match.deaths === 0
                ? "Perfect"
                : ((match.kills + match.assists) / match.deaths).toFixed(2);

            const hasCs15 =
              typeof match.csAt15 === "number" && typeof match.enemyCsAt15 === "number";
            const csDiff15 = hasCs15 ? match.csAt15! - match.enemyCsAt15! : null;
            const hasGold15 =
              typeof match.goldAt15 === "number" && typeof match.enemyGoldAt15 === "number";
            const goldDiff15 = hasGold15 ? match.goldAt15! - match.enemyGoldAt15! : null;

            return (
              <div
                key={match.id}
                className="relative flex flex-wrap lg:flex-nowrap items-center gap-4 p-3 pl-4 bg-neutral-900/35 border border-neutral-800/75 rounded-lg hover:border-neutral-700/80 transition-colors overflow-hidden"
              >
                <div
                  className={`absolute inset-y-0 left-0 w-[3px] ${
                    isWin ? "bg-blue-500/90" : "bg-red-500/90"
                  }`}
                />

                {/* Result & Date */}
                <div className="w-20 shrink-0">
                  <p
                    className={`text-xs font-bold tracking-wider ${
                      isWin ? "text-blue-400" : "text-red-400"
                    }`}
                  >
                    {isWin ? "VICTORY" : "DEFEAT"}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {durationMins}m {durationSecs}s
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    {formatShortDate(match.gameCreation)}
                  </p>
                </div>

                {/* Spells & Runes */}
                <MatchSpellsAndRunes match={match} assets={matchAssets} size="md" />

                {/* KDA & CS */}
                <div className="w-28 shrink-0 text-center border-l border-neutral-800/60 pl-3">
                  <p className="text-sm font-bold text-white leading-tight">
                    {match.kills} / <span className="text-red-400">{match.deaths}</span> /{" "}
                    {match.assists}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {kda} KDA <span className="text-neutral-600">•</span> {csPerMin} CS/m
                  </p>
                </div>

                {/* Items Row */}
                <div className="border-l border-neutral-800/60 pl-3">
                  <MatchItemsRow match={match} assets={matchAssets} size="md" />
                </div>

                {/* Lane Diff @15 */}
                <div className="hidden xl:flex flex-col items-end gap-1 ml-auto border-l border-neutral-800/60 pl-4 min-w-[116px]">
                  {csDiff15 !== null && (
                    <span
                      className={`text-[11px] font-semibold ${
                        csDiff15 > 0
                          ? "text-blue-400"
                          : csDiff15 < 0
                          ? "text-red-400"
                          : "text-neutral-400"
                      }`}
                    >
                      CS@15: {csDiff15 > 0 ? `+${csDiff15}` : csDiff15}
                    </span>
                  )}
                  {goldDiff15 !== null && (
                    <span
                      className={`text-[11px] font-semibold ${
                        goldDiff15 > 0
                          ? "text-blue-400"
                          : goldDiff15 < 0
                          ? "text-red-400"
                          : "text-neutral-400"
                      }`}
                    >
                      Gold@15: {goldDiff15 > 0 ? `+${goldDiff15}` : goldDiff15}
                    </span>
                  )}
                  {csDiff15 === null && goldDiff15 === null && (
                    <span className="text-[11px] text-neutral-600">No @15 data</span>
                  )}
                </div>

                {/* Botlane Partners Context */}
                {(match.partnerChampionName || match.enemyPartnerChampionName) && (
                  <div className="flex items-center gap-2 ml-auto xl:ml-0 border-l border-neutral-800/60 pl-3 shrink-0">
                    {match.partnerChampionName && (
                      <Tooltip
                        compact
                        content={`Ally: ${getChampName(match.partnerChampionName)}`}
                        position="top"
                      >
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-blue-500/40 relative">
                          <Image
                            src={getChampIcon(match.partnerChampionName)}
                            alt={match.partnerChampionName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Tooltip>
                    )}
                    <span className="text-[10px] font-black italic text-neutral-600">vs</span>
                    {match.enemyPartnerChampionName && (
                      <Tooltip
                        compact
                        content={`Enemy Partner: ${getChampName(match.enemyPartnerChampionName)}`}
                        position="top"
                      >
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-red-500/40 relative">
                          <Image
                            src={getChampIcon(match.enemyPartnerChampionName)}
                            alt={match.enemyPartnerChampionName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Tooltip>
                    )}
                  </div>
                )}

                {/* One-click Copy Runes & Build to Preset */}
                {onSaveAsPreset &&
                  (match.loadoutSynced ||
                    (match.items?.length ?? 0) > 0 ||
                    Boolean(match.primaryRuneStyle)) && (
                    <div className="ml-auto xl:ml-0 shrink-0">
                      <Tooltip
                        compact
                        content="Copy runes & build from this game into a new preset"
                        position="top"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onSaveAsPreset(match)}
                          className="h-8 px-2.5 text-xs gap-1.5 text-neutral-400 hover:text-white border border-neutral-800/80 hover:border-neutral-700"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5 text-accent-soft" />
                          <span className="hidden sm:inline">Preset</span>
                        </Button>
                      </Tooltip>
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
