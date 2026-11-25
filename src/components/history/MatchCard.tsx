import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChampionData, MatchAssetsData } from "@/lib/riot/assets";
import {
  MatchItemsRow,
  MatchLoadoutFields,
  MatchSpellsAndRunes,
} from "@/components/match/MatchLoadoutDisplay";
import { Tooltip } from "@/components/ui/Tooltip";
import { buildMatchupUrl, mapRiotRoleToAppRole } from "@/lib/matchup/url";
import {
  formatTimeAgo,
  getChampionDisplayName,
  getChampionIconUrl,
  getRoleIconSrc,
} from "./historyHelpers";

export interface MatchRecordDTO extends MatchLoadoutFields {
  id: string;
  matchId: string;
  gameCreation: string | Date;
  gameDuration: number;
  championName: string;
  role: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  enemyChampionName?: string | null;
  partnerChampionName?: string | null;
  enemyPartnerChampionName?: string | null;
  csAt15?: number | null;
  enemyCsAt15?: number | null;
  goldAt15?: number | null;
  enemyGoldAt15?: number | null;
}

export interface ExistingNoteSummary {
  id: string;
  role: string;
  myChampion: string;
  enemyChampion: string;
  mySupport: string | null;
  enemySupport: string | null;
}

interface MatchCardProps {
  match: MatchRecordDTO;
  champions: ChampionData[];
  matchAssets: MatchAssetsData;
  existingNotes: ExistingNoteSummary[];
  mounted: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  champions,
  matchAssets,
  mounted,
}) => {
  const isRemake = match.gameDuration < 240;
  const isWin = !isRemake && match.win;

  const kda =
    match.deaths === 0
      ? "Perfect"
      : ((match.kills + match.assists) / match.deaths).toFixed(2);
  const durationMins = Math.floor(match.gameDuration / 60);
  const durationSecs = match.gameDuration % 60;
  const csPerMin = (match.cs / Math.max(1, match.gameDuration / 60)).toFixed(1);

  const appRole = mapRiotRoleToAppRole(match.role);
  const roleLabel = appRole || match.role;

  const targetUrl =
    appRole && match.enemyChampionName
      ? buildMatchupUrl(
          {
            role: appRole,
            myPick: match.championName,
            enemyPick: match.enemyChampionName,
            mySupp: match.partnerChampionName,
            enemySupp: match.enemyPartnerChampionName,
          },
          { from: "history" }
        )
      : "/matchups";

  const accentBarClass = isRemake
    ? "bg-neutral-600"
    : isWin
      ? "bg-blue-500/90"
      : "bg-red-500/90";

  const tintClass = isRemake
    ? ""
    : isWin
      ? "bg-gradient-to-r from-blue-500/[0.04] via-transparent to-transparent"
      : "bg-gradient-to-r from-red-500/[0.04] via-transparent to-transparent";

  const outcomeLabel = isRemake ? "Remake" : isWin ? "Victory" : "Defeat";
  const outcomeColorClass = isRemake
    ? "text-neutral-500"
    : isWin
      ? "text-blue-400"
      : "text-red-400";

  const myChampName = getChampionDisplayName(match.championName, champions);
  const hasMatchup = Boolean(match.enemyChampionName && match.role !== "UNKNOWN");

  return (
    <Link
      href={targetUrl}
      className={`group relative block rounded-lg border border-neutral-800/75 bg-neutral-900/35 hover:bg-neutral-900/70 hover:border-neutral-700/80 transition-colors cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${tintClass}`}
    >
      <div className={`absolute inset-y-0 left-0 w-[3px] ${accentBarClass}`} />

      <div className="px-3.5 py-2.5 pl-4 sm:px-4 sm:py-3 sm:pl-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 lg:grid lg:grid-cols-[82px_100px_154px_minmax(0,1fr)_118px_22px] lg:gap-4">
        {/* Outcome, Duration & Relative Time */}
        <div className="min-w-[74px] text-left">
          <p className={`text-xs font-semibold tracking-wide uppercase ${outcomeColorClass}`}>
            {outcomeLabel}
          </p>
          <p className="text-[11px] text-neutral-300 tabular-nums mt-0.5">
            {durationMins}m {durationSecs}s
          </p>
          <p className="text-[11px] text-neutral-500">
            {mounted ? formatTimeAgo(match.gameCreation) : "Just now"}
          </p>
        </div>

        {/* Champion + Spells & Runes */}
        <div className="flex items-center gap-2 shrink-0">
          <Tooltip compact content={myChampName} position="top">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-neutral-700/70 shrink-0">
              <Image
                src={getChampionIconUrl(match.championName, champions, matchAssets.version)}
                alt={myChampName}
                fill
                className="object-cover"
              />
            </div>
          </Tooltip>
          <MatchSpellsAndRunes match={match} assets={matchAssets} size="sm" />
        </div>

        {/* KDA & CS */}
        <div className="text-left lg:text-center shrink-0">
          <p className="text-[15px] font-semibold text-neutral-100 tabular-nums leading-tight">
            {match.kills}
            <span className="text-neutral-600 font-normal mx-1">/</span>
            <span className="text-red-400">{match.deaths}</span>
            <span className="text-neutral-600 font-normal mx-1">/</span>
            {match.assists}
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5 whitespace-nowrap tabular-nums">
            <span className="text-neutral-300 font-medium">{kda}</span> KDA
            <span className="text-neutral-600 mx-1">·</span>
            {match.cs} CS <span className="text-neutral-500">({csPerMin})</span>
          </p>
        </div>

        {/* Items Row */}
        <div className="flex items-center min-w-0">
          <MatchItemsRow match={match} assets={matchAssets} size="md" />
        </div>

        {/* Lane Matchup */}
        <div className="flex items-center justify-end lg:justify-between gap-2 shrink-0">
          {hasMatchup && match.enemyChampionName ? (
            <>
              <div className="hidden lg:flex w-6 justify-center shrink-0">
                {match.partnerChampionName && (
                  <Tooltip
                    compact
                    content={`Ally: ${getChampionDisplayName(match.partnerChampionName, champions)}`}
                    position="top"
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-neutral-700/80 opacity-85 hover:opacity-100 transition-opacity relative">
                      <Image
                        src={getChampionIconUrl(
                          match.partnerChampionName,
                          champions,
                          matchAssets.version
                        )}
                        alt={match.partnerChampionName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Tooltip>
                )}
              </div>

              <span className="text-[10px] text-neutral-600 font-semibold uppercase tracking-wider shrink-0">
                vs
              </span>

              <div className="flex items-center lg:w-[54px] shrink-0">
                <Tooltip
                  compact
                  content={`vs ${getChampionDisplayName(match.enemyChampionName, champions)}`}
                  position="top"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-700/80 opacity-90 group-hover:opacity-100 relative z-10 transition-opacity">
                    <Image
                      src={getChampionIconUrl(
                        match.enemyChampionName,
                        champions,
                        matchAssets.version
                      )}
                      alt={match.enemyChampionName}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Tooltip>
                {match.enemyPartnerChampionName && (
                  <Tooltip
                    compact
                    content={`Enemy Partner: ${getChampionDisplayName(
                      match.enemyPartnerChampionName,
                      champions
                    )}`}
                    position="top"
                    className="inline-flex -ml-2 z-0 hover:z-20"
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-neutral-800 opacity-80 hover:opacity-100 relative transition-opacity">
                      <Image
                        src={getChampionIconUrl(
                          match.enemyPartnerChampionName,
                          champions,
                          matchAssets.version
                        )}
                        alt={match.enemyPartnerChampionName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Tooltip>
                )}
              </div>
            </>
          ) : (
            <span className="hidden lg:block" />
          )}
        </div>

        {/* Role */}
        <div className="flex justify-end shrink-0">
          <Tooltip compact content={roleLabel} position="top">
            <div className="w-5 h-5 relative opacity-70 group-hover:opacity-100 transition-opacity">
              <Image
                src={getRoleIconSrc(match.role)}
                alt={roleLabel}
                fill
                className="object-contain"
              />
            </div>
          </Tooltip>
        </div>
      </div>
    </Link>
  );
};
