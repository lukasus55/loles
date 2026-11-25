"use client";

import React, { useState, useEffect } from "react";
import { ChampionData } from "@/lib/riot/ddragon";
import { MatchupFilters } from "../ChampionFilterBlock";
import { Role } from "../RoleFilter";
import { Tooltip } from "@/components/ui/Tooltip";
import { WinRateIcon, KillRateIcon, CSIcon, GoldIcon } from "@/components/ui/icons/GameIcons";
import { Spinner } from "@/components/ui/Spinner";

interface MatchupHeaderProps {
  filters: MatchupFilters;
  role: Role | null;
  champions: ChampionData[];
  initialData?: {
    wins?: number;
    losses?: number;
  };
}

export const MatchupHeader: React.FC<MatchupHeaderProps> = ({
  filters,
  role,
  champions,
  initialData,
}) => {
  const [stats, setStats] = useState<{
    winRate: number;
    killRate: number;
    csDiffAt15: number;
    goldDiffAt15: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isBotLane = role === "ADC" || role === "SUPP";

  useEffect(() => {
    const fetchStats = async () => {
      if (!filters.myPick || !filters.enemyPick) return;
      setIsLoading(true);
      try {
        const query = new URLSearchParams({
          role: role || "null",
          myPick: filters.myPick,
          enemyPick: filters.enemyPick,
        });
        if (isBotLane && filters.mySupp) query.append("mySupp", filters.mySupp);
        if (isBotLane && filters.enemySupp) query.append("enemySupp", filters.enemySupp);

        const res = await fetch(`/api/notes/stats?${query.toString()}`);
        const data = await res.json();
        if (data.hasData && data.stats) {
          setStats(data.stats);
        } else {
          setStats(null);
        }
      } catch {
        console.error("Failed to fetch stats");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [role, filters.myPick, filters.enemyPick, filters.mySupp, filters.enemySupp, isBotLane]);

  const getChampIcon = (id: string | null) =>
    id ? champions.find((c) => c.id === id)?.iconUrl || "" : "";

  const getChampName = (id: string | null) =>
    id ? champions.find((c) => c.id === id)?.name || id : "";

  const getRoleIcon = (roleId: string | null) => {
    if (!roleId) return "";
    if (roleId === "JGL") return "/roles/jg.webp";
    if (roleId === "SUPP") return "/roles/supp.webp";
    return `/roles/${roleId.toLowerCase()}.webp`;
  };

  const renderSide = (pick: string | null, supp: string | null, isEnemy: boolean) => (
    <div className="flex flex-col items-center">
      <span
        className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${
          isEnemy ? "text-red-400/90" : "text-blue-400/90"
        }`}
      >
        {isEnemy ? "Enemy" : "You"}
      </span>
      <div className={`flex items-center ${!isEnemy ? "flex-row-reverse" : ""}`}>
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border overflow-hidden shrink-0 relative z-10 ${
            isEnemy ? "border-red-500/60" : "border-blue-500/60"
          }`}
        >
          <img src={getChampIcon(pick)} alt={getChampName(pick)} className="w-full h-full object-cover" />
        </div>
        {isBotLane && supp && (
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border overflow-hidden shrink-0 relative z-0 ${
              !isEnemy ? "-mr-2.5" : "-ml-2.5"
            } ${isEnemy ? "border-red-500/40" : "border-blue-500/40"}`}
          >
            <img src={getChampIcon(supp)} alt={getChampName(supp)} className="w-full h-full object-cover" />
          </div>
        )}
      </div>
      <div className="mt-2 text-center">
        <p className="text-xs font-semibold text-neutral-200">{getChampName(pick)}</p>
        {isBotLane && supp && (
          <p className="text-[11px] text-neutral-500">w/ {getChampName(supp)}</p>
        )}
      </div>
    </div>
  );

  const getCsStr = (diff: number, isEnemy: boolean) => {
    if (diff === 0) return "0.0";
    if (!isEnemy) return diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
    return diff < 0 ? `+${Math.abs(diff).toFixed(1)}` : `-${diff.toFixed(1)}`;
  };

  const getGoldStr = (diff: number, isEnemy: boolean) => {
    const rd = Math.round(diff);
    if (rd === 0) return "0";
    if (!isEnemy) return rd > 0 ? `+${rd}` : rd.toString();
    return rd < 0 ? `+${Math.abs(rd)}` : `-${rd}`;
  };

  const wins = initialData?.wins ?? 0;
  const losses = initialData?.losses ?? 0;
  const totalGames = wins + losses;

  const renderStats = () => (
    <div className="w-full flex flex-col gap-3.5">
      {role && (
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
          <img src={getRoleIcon(role)} alt={role} className="w-3.5 h-3.5 opacity-80" />
          <span>{role === "JGL" ? "Jungle" : role === "SUPP" ? "Support" : role}</span>
        </div>
      )}

      {initialData && (
        <div className="flex items-center justify-center w-full tabular-nums">
          <span className="w-1/4 text-right text-blue-400 font-semibold text-xs">{wins}W</span>
          <div className="w-2/4 flex justify-center px-3">
            {totalGames > 0 ? (
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${(wins / totalGames) * 100}%` }}
                  className="h-full bg-blue-500 transition-all duration-300"
                />
                <div
                  style={{ width: `${(losses / totalGames) * 100}%` }}
                  className="h-full bg-red-500 transition-all duration-300"
                />
              </div>
            ) : (
              <div className="w-full h-1.5 bg-neutral-800 rounded-full" />
            )}
          </div>
          <span className="w-1/4 text-left text-red-400 font-semibold text-xs">{losses}L</span>
        </div>
      )}

      <div className="flex flex-col space-y-1.5 relative min-h-[120px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : stats ? (
          <>
            <StatRow
              label="Win Rate"
              left={`${stats.winRate.toFixed(1)}%`}
              right={`${(100 - stats.winRate).toFixed(1)}%`}
              leftColor={stats.winRate >= 50 ? "text-blue-400" : "text-neutral-500"}
              rightColor={stats.winRate < 50 ? "text-red-400" : "text-neutral-500"}
              tooltipTitle="Matchup Win Rate"
              tooltip="Percentage of games won by this champion in this specific matchup."
              icon={WinRateIcon}
              iconClassName="text-[#E4C259]"
            />
            <StatRow
              label="Kill Rate"
              left={`${stats.killRate.toFixed(1)}%`}
              right={`${(100 - stats.killRate).toFixed(1)}%`}
              leftColor={stats.killRate >= 50 ? "text-blue-400" : "text-neutral-500"}
              rightColor={stats.killRate < 50 ? "text-red-400" : "text-neutral-500"}
              tooltipTitle="Lane Kill Rate"
              tooltip={
                isBotLane
                  ? "Percentage of times your duo gets a lane kill on the enemy duo before 14 minutes."
                  : "Percentage of times you get a solo kill on the enemy before 14 minutes."
              }
              icon={KillRateIcon}
              iconClassName="text-[#E24A4A]"
            />
            <StatRow
              label="CS @ 15"
              left={getCsStr(stats.csDiffAt15, false)}
              right={getCsStr(stats.csDiffAt15, true)}
              leftColor={
                stats.csDiffAt15 > 0
                  ? "text-blue-400"
                  : stats.csDiffAt15 < 0
                    ? "text-neutral-500"
                    : "text-neutral-400"
              }
              rightColor={
                stats.csDiffAt15 < 0
                  ? "text-red-400"
                  : stats.csDiffAt15 > 0
                    ? "text-neutral-500"
                    : "text-neutral-400"
              }
              tooltipTitle="CS Difference @ 15"
              tooltip="Average creep score difference between you and the enemy at the 15-minute mark."
              icon={CSIcon}
              iconClassName="text-[#A0AAB5]"
            />
            <StatRow
              label="Gold @ 15"
              left={getGoldStr(stats.goldDiffAt15, false)}
              right={getGoldStr(stats.goldDiffAt15, true)}
              leftColor={
                stats.goldDiffAt15 > 0
                  ? "text-blue-400"
                  : stats.goldDiffAt15 < 0
                    ? "text-neutral-500"
                    : "text-neutral-400"
              }
              rightColor={
                stats.goldDiffAt15 < 0
                  ? "text-red-400"
                  : stats.goldDiffAt15 > 0
                    ? "text-neutral-500"
                    : "text-neutral-400"
              }
              tooltipTitle="Gold Difference @ 15"
              tooltip="Average gold difference between you and the enemy at the 15-minute mark."
              icon={GoldIcon}
              iconClassName="text-[#F1C40F]"
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 text-xs">
            <span className="font-semibold text-neutral-400">No Historical Data</span>
            <span className="mt-0.5 text-neutral-600">Play this matchup to generate stats.</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="rounded-lg border border-neutral-800/75 bg-neutral-900/35 p-4 sm:p-5">
      <div className="hidden md:flex items-center justify-between gap-6">
        <div className="w-1/4 flex justify-center shrink-0">
          {renderSide(filters.myPick, filters.mySupp, false)}
        </div>
        <div className="flex-1 max-w-sm">{renderStats()}</div>
        <div className="w-1/4 flex justify-center shrink-0">
          {renderSide(filters.enemyPick, filters.enemySupp, true)}
        </div>
      </div>

      <div className="flex flex-col md:hidden gap-4 items-center">
        <div className="flex items-center justify-between w-full px-2">
          <div className="w-[44%] flex justify-center">
            {renderSide(filters.myPick, filters.mySupp, false)}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
            vs
          </span>
          <div className="w-[44%] flex justify-center">
            {renderSide(filters.enemyPick, filters.enemySupp, true)}
          </div>
        </div>
        <div className="w-full max-w-sm">{renderStats()}</div>
      </div>
    </div>
  );
};

const StatRow = ({
  label,
  left,
  right,
  leftColor,
  rightColor,
  tooltipTitle,
  tooltip,
  icon,
  iconClassName,
}: {
  label: string;
  left: string;
  right: string;
  leftColor: string;
  rightColor: string;
  tooltipTitle: string;
  tooltip: string;
  icon: React.ElementType;
  iconClassName: string;
}) => (
  <Tooltip
    title={tooltipTitle}
    content={tooltip}
    icon={icon}
    iconClassName={iconClassName}
    position="top"
    className="flex items-center justify-between text-xs sm:text-sm group w-full cursor-help hover:bg-neutral-900/50 py-1 rounded transition-colors tabular-nums"
  >
    <span className={`w-1/3 text-right font-semibold ${leftColor}`}>{left}</span>
    <span className="w-1/3 text-center text-[11px] font-medium text-neutral-400 px-1 uppercase tracking-wider group-hover:text-neutral-200 transition-colors">
      {label}
    </span>
    <span className={`w-1/3 text-left font-semibold ${rightColor}`}>{right}</span>
  </Tooltip>
);
