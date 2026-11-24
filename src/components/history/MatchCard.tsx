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
  existingNotes,
  mounted,
}) => {
  const timeAgo = (dateStr: string | Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
      }
    }
    return "Just now";
  };

  const getChampionDisplayName = (champName: string) => {
    const champData = champions.find(
      (c) =>
        c.name === champName ||
        c.id === champName ||
        c.name.toLowerCase() === champName.toLowerCase()
    );
    return champData?.name || champName;
  };

  const getChampionIconUrl = (champName: string) => {
    let normalized = champName;
    if (champName === "FiddleSticks") normalized = "Fiddlesticks";
    const champData = champions.find(
      (c) =>
        c.name === champName ||
        c.id === champName ||
        c.name.toLowerCase() === champName.toLowerCase()
    );

    if (champData?.iconUrl) return champData.iconUrl;

    const id = champData ? champData.id : normalized;
    return `https://ddragon.leagueoflegends.com/cdn/${matchAssets.version}/img/champion/${id}.png`;
  };

  const getRoleIcon = (role: string) => {
    let src = "/roles/top.webp";
    if (role === "JUNGLE" || role === "JGL") src = "/roles/jg.webp";
    if (role === "MIDDLE" || role === "MID") src = "/roles/mid.webp";
    if (role === "BOTTOM" || role === "ADC") src = "/roles/adc.webp";
    if (role === "UTILITY" || role === "SUPP") src = "/roles/supp.webp";

    return (
      <div className="w-5 h-5 relative opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-md">
        <Image src={src} alt={role} fill className="object-contain" />
      </div>
    );
  };

  const isRemake = match.gameDuration < 240; // Less than 4 minutes
  const isWin = !isRemake && match.win;

  const kda =
    match.deaths === 0
      ? "Perfect"
      : ((match.kills + match.assists) / match.deaths).toFixed(2);
  const durationMins = Math.floor(match.gameDuration / 60);
  const durationSecs = match.gameDuration % 60;
  const csPerMin = (match.cs / Math.max(1, match.gameDuration / 60)).toFixed(1);

  const roleEnum =
    match.role === "UTILITY"
      ? "SUPP"
      : match.role === "BOTTOM"
      ? "ADC"
      : match.role === "JUNGLE"
      ? "JGL"
      : match.role;
  const isBot = match.role === "BOTTOM" || match.role === "UTILITY";

  const existingNote = existingNotes.find(
    (n) =>
      n.role === roleEnum &&
      n.myChampion === match.championName &&
      n.enemyChampion === match.enemyChampionName &&
      (!isBot ||
        (n.mySupport === match.partnerChampionName &&
          n.enemySupport === match.enemyPartnerChampionName))
  );

  let targetUrl = `/note/new?role=${roleEnum}&myPick=${match.championName}`;
  if (existingNote) {
    targetUrl = `/note/${existingNote.id}/edit?from=history`;
  } else {
    if (match.enemyChampionName) targetUrl += `&enemyPick=${match.enemyChampionName}`;
    if (match.partnerChampionName) targetUrl += `&mySupp=${match.partnerChampionName}`;
    if (match.enemyPartnerChampionName) targetUrl += `&enemySupp=${match.enemyPartnerChampionName}`;
    targetUrl += `&from=history`;
  }

  return (
    <Link
      href={targetUrl}
      className="group flex flex-col border rounded-lg relative hover:z-20 shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer bg-neutral-900/60 border-neutral-700/50 hover:border-neutral-600/50 hover:bg-neutral-800/50"
    >
      {/* Status Bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg ${
          isRemake ? "bg-neutral-500" : isWin ? "bg-blue-600" : "bg-red-600"
        }`}
      />

      <div className="w-full p-3.5 sm:p-4 pl-5 sm:pl-6 flex flex-wrap lg:flex-nowrap items-center gap-4 lg:gap-5">
        {/* Game Info */}
        <div className="w-20 sm:w-22 shrink-0 text-left">
          <p
            className={`text-xs sm:text-sm font-bold tracking-wider ${
              isRemake ? "text-neutral-500" : isWin ? "text-blue-500" : "text-red-500"
            }`}
          >
            {isRemake ? "REMAKE" : isWin ? "VICTORY" : "DEFEAT"}
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">
            {durationMins}m {durationSecs}s
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            {mounted ? timeAgo(match.gameCreation) : "Just now"}
          </p>
        </div>

        {/* Player Champ + Summoner Spells & Runes */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Tooltip compact content={getChampionDisplayName(match.championName)} position="top">
            <div className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full overflow-hidden border-2 border-neutral-800 shrink-0">
              <Image
                src={getChampionIconUrl(match.championName)}
                alt={match.championName}
                fill
                className="object-cover"
              />
            </div>
          </Tooltip>
          <MatchSpellsAndRunes match={match} assets={matchAssets} size="md" />
        </div>

        {/* KDA & CS */}
        <div className="w-28 sm:w-32 shrink-0 text-center border-l border-neutral-800/50 pl-3">
          <p className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
            {match.kills} / <span className="text-red-500">{match.deaths}</span> / {match.assists}
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5 font-medium">
            {kda} KDA <span className="text-neutral-600">•</span> CS {match.cs} ({csPerMin})
          </p>
        </div>

        {/* Items Row */}
        <div className="flex items-center border-l border-neutral-800/50 pl-3 sm:pl-4">
          <MatchItemsRow match={match} assets={matchAssets} size="md" />
        </div>

        {/* Matchup vs (fixed-width aligned block, hover tooltips for names) */}
        {match.enemyChampionName && match.role !== "UNKNOWN" && (
          <div className="hidden lg:flex items-center justify-between w-[140px] ml-auto border-l border-neutral-800/50 pl-4 shrink-0">
            {/* Ally Partner Slot (fixed width so VS stays perfectly aligned across rows) */}
            <div className="w-8 flex flex-col items-center justify-center shrink-0">
              {match.partnerChampionName && (
                <Tooltip
                  compact
                  content={`Ally: ${getChampionDisplayName(match.partnerChampionName)}`}
                  position="top"
                >
                  <div className="flex flex-col items-center opacity-85 hover:opacity-100 transition-opacity">
                    <span className="text-[9px] text-neutral-500 font-bold uppercase leading-none mb-1">
                      Ally
                    </span>
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-neutral-700 relative">
                      <Image
                        src={getChampionIconUrl(match.partnerChampionName)}
                        alt={match.partnerChampionName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </Tooltip>
              )}
            </div>

            <span className="text-[10px] text-neutral-600 font-black italic uppercase tracking-wider shrink-0">
              vs
            </span>

            {/* Enemy Champion + Enemy Partner Slot (fixed width) */}
            <div className="w-[58px] flex items-center justify-start shrink-0">
              <Tooltip
                compact
                content={`vs ${getChampionDisplayName(match.enemyChampionName)}`}
                position="top"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-neutral-800 opacity-90 hover:opacity-100 relative z-10 drop-shadow-md transition-opacity">
                  <Image
                    src={getChampionIconUrl(match.enemyChampionName)}
                    alt={match.enemyChampionName}
                    fill
                    className="object-cover"
                  />
                </div>
              </Tooltip>
              {match.enemyPartnerChampionName && (
                <Tooltip
                  compact
                  content={`Enemy Partner: ${getChampionDisplayName(match.enemyPartnerChampionName)}`}
                  position="top"
                  className="inline-flex -ml-2.5 z-0 hover:z-20"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-neutral-700 opacity-75 hover:opacity-100 relative transition-all">
                    <Image
                      src={getChampionIconUrl(match.enemyPartnerChampionName)}
                      alt={match.enemyPartnerChampionName}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Tooltip>
              )}
            </div>
          </div>
        )}

        {/* Role */}
        <div className="ml-auto lg:ml-0 flex shrink-0">
          <Tooltip compact content={roleEnum} position="top">
            <div className="w-8 h-8 flex items-center justify-center bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400">
              {getRoleIcon(match.role)}
            </div>
          </Tooltip>
        </div>
      </div>
    </Link>
  );
};
