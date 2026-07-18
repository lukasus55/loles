import React, { useState, useEffect } from 'react';
import { ChampionData } from '@/lib/riot/ddragon';
import { MatchupFilters } from '../ChampionFilterBlock';
import { Role } from '../RoleFilter';
import { Tooltip } from '@/components/ui/Tooltip';
import { WinRateIcon, KillRateIcon, CSIcon, GoldIcon } from '@/components/ui/icons/GameIcons';
import { Spinner } from '@/components/ui/Spinner';

interface MatchupHeaderProps {
  filters: MatchupFilters;
  role: Role;
  champions: ChampionData[];
  initialData?: {
    wins?: number;
    losses?: number;
  };
}

export const MatchupHeader: React.FC<MatchupHeaderProps> = ({ filters, role, champions, initialData }) => {
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
          role,
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
      } catch (e) {
        console.error("Failed to fetch stats");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [role, filters.myPick, filters.enemyPick, filters.mySupp, filters.enemySupp, isBotLane]);

  const getChampIcon = (id: string | null) => {
    if (!id) return "";
    return champions.find(c => c.id === id)?.iconUrl || "";
  };

  const getChampName = (id: string | null) => {
    if (!id) return "";
    return champions.find(c => c.id === id)?.name || id;
  };

  const getRoleIcon = (roleId: string) => {
    switch (roleId) {
      case "JGL": return "/roles/jg.webp";
      case "SUPP": return "/roles/supp.webp";
      default: return `/roles/${roleId.toLowerCase()}.webp`;
    }
  };

  const renderSide = (pick: string | null, supp: string | null, isEnemy: boolean) => (
    <div className="flex flex-col items-center">
      <span className={`font-black uppercase tracking-widest text-[10px] sm:text-xs mb-3 ${isEnemy ? 'text-red-500' : 'text-blue-500'}`}>
        {isEnemy ? "Enemy Team" : "Your Team"}
      </span>
      <div className={`flex gap-2 items-center justify-center flex-wrap ${!isEnemy ? 'flex-row-reverse' : ''}`}>
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 shadow-[0_0_15px_rgba(0,0,0,0.15)] overflow-hidden shrink-0 ${isEnemy ? 'border-red-500 shadow-red-500/15' : 'border-blue-500 shadow-blue-500/15'}`}>
          <img src={getChampIcon(pick)} alt="Pick" className="w-full h-full object-cover" />
        </div>
        {isBotLane && supp && (
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 overflow-hidden opacity-90 shrink-0 ${isEnemy ? 'border-red-500/50' : 'border-blue-500/50'}`}>
            <img src={getChampIcon(supp)} alt="Support" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-col items-center text-center">
        <span className="text-xs font-bold text-neutral-300">{getChampName(pick)}</span>
        {isBotLane && supp && (
          <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mt-0.5">w/ {getChampName(supp)}</span>
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

  const renderStats = () => (
    <div className="w-full flex flex-col gap-5">
      {/* Your Record */}
      {initialData && (
        <div className="flex items-center justify-center w-full relative">
          <span className="w-1/4 text-right text-blue-500 font-bold text-sm">{initialData.wins}W</span>
          <div className="w-2/4 flex justify-center px-4">
            {initialData.wins! + initialData.losses! > 0 ? (
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden flex shadow-inner">
                <div style={{ width: `${(initialData.wins! / (initialData.wins! + initialData.losses!)) * 100}%` }} className="h-full bg-blue-500 transition-all duration-500" />
                <div style={{ width: `${(initialData.losses! / (initialData.wins! + initialData.losses!)) * 100}%` }} className="h-full bg-red-500 transition-all duration-500" />
              </div>
            ) : (
              <div className="w-full h-1.5 bg-neutral-800 rounded-full" />
            )}
          </div>
          <span className="w-1/4 text-left text-red-500 font-bold text-sm">{initialData.losses}L</span>
        </div>
      )}

      {/* Global Stats */}
      <div className="flex flex-col space-y-3 pt-2 relative min-h-[140px]">
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
              icon={WinRateIcon} iconClassName="text-[#E4C259]"
            />
            <StatRow 
              label="Kill Rate" 
              left={`${stats.killRate.toFixed(1)}%`} 
              right={`${(100 - stats.killRate).toFixed(1)}%`} 
              leftColor={stats.killRate >= 50 ? "text-blue-400" : "text-neutral-500"} 
              rightColor={stats.killRate < 50 ? "text-red-400" : "text-neutral-500"} 
              tooltipTitle="Lane Kill Rate"
              tooltip={isBotLane ? "Percentage of times your duo gets a lane kill on the enemy duo before 14 minutes." : "Percentage of times you get a solo kill on the enemy before 14 minutes."} 
              icon={KillRateIcon} iconClassName="text-[#E24A4A]"
            />
            <StatRow 
              label="CS @ 15" 
              left={getCsStr(stats.csDiffAt15, false)} 
              right={getCsStr(stats.csDiffAt15, true)} 
              leftColor={stats.csDiffAt15 > 0 ? "text-blue-400" : (stats.csDiffAt15 < 0 ? "text-neutral-500" : "text-neutral-400")} 
              rightColor={stats.csDiffAt15 < 0 ? "text-red-400" : (stats.csDiffAt15 > 0 ? "text-neutral-500" : "text-neutral-400")} 
              tooltipTitle="CS Difference @ 15"
              tooltip="Average creep score difference between you and the enemy at the 15-minute mark." 
              icon={CSIcon} iconClassName="text-[#A0AAB5]"
            />
            <StatRow 
              label="Gold @ 15" 
              left={getGoldStr(stats.goldDiffAt15, false)} 
              right={getGoldStr(stats.goldDiffAt15, true)} 
              leftColor={stats.goldDiffAt15 > 0 ? "text-blue-400" : (stats.goldDiffAt15 < 0 ? "text-neutral-500" : "text-neutral-400")} 
              rightColor={stats.goldDiffAt15 < 0 ? "text-red-400" : (stats.goldDiffAt15 > 0 ? "text-neutral-500" : "text-neutral-400")} 
              tooltipTitle="Gold Difference @ 15"
              tooltip="Average gold difference between you and the enemy at the 15-minute mark." 
              icon={GoldIcon} iconClassName="text-[#F1C40F]"
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 text-sm">
            <span className="font-bold">No Historical Data</span>
            <span className="text-xs mt-1 text-neutral-600">Play this matchup to generate stats.</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl shadow-sm relative flex flex-col items-center">
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/10 via-neutral-950/40 to-neutral-950/80"></div>
        <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-blue-900/5 to-transparent"></div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-red-900/5 to-transparent"></div>
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-800 border-t-0 rounded-b-xl px-4 py-1.5 flex items-center gap-2 shadow-md z-20">
        <img src={getRoleIcon(role)} alt={role} className="w-4 h-4 opacity-80 filter brightness-150" />
        <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">{role === "JGL" ? "Jungle" : role === "SUPP" ? "Support" : role} Lane</span>
      </div>

      <div className="relative z-30 w-full mx-auto p-5 sm:p-8 pt-10 sm:pt-12">
        <div className="hidden md:flex items-center justify-between w-full gap-8">
          <div className="flex flex-col items-center justify-center w-1/4 shrink-0">
            {renderSide(filters.myPick, filters.mySupp, false)}
          </div>
          <div className="flex flex-col items-center justify-center flex-1 max-w-sm px-4">
            {renderStats()}
          </div>
          <div className="flex flex-col items-center justify-center w-1/4 shrink-0">
            {renderSide(filters.enemyPick, filters.enemySupp, true)}
          </div>
        </div>

        <div className="flex flex-col md:hidden w-full gap-6 items-center">
          <div className="flex items-center justify-between w-full px-2">
            <div className="flex flex-col items-center justify-center w-[45%]">
              {renderSide(filters.myPick, filters.mySupp, false)}
            </div>
            <div className="w-[10%] flex justify-center text-lg font-black italic text-neutral-800">VS</div>
            <div className="flex flex-col items-center justify-center w-[45%]">
              {renderSide(filters.enemyPick, filters.enemySupp, true)}
            </div>
          </div>
          <div className="w-full max-w-sm mt-2">
            {renderStats()}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatRow = ({ 
  label, left, right, leftColor, rightColor, 
  tooltipTitle, tooltip, icon, iconClassName 
}: { 
  label: string, left: string, right: string, leftColor: string, rightColor: string, 
  tooltipTitle: string, tooltip: string, icon: React.ElementType, iconClassName: string 
}) => (
  <Tooltip title={tooltipTitle} content={tooltip} icon={icon} iconClassName={iconClassName} position="top" className="flex items-center justify-between text-xs sm:text-sm relative group w-full cursor-help hover:bg-neutral-900/40 py-1.5 rounded transition-colors">
    <span className={`w-1/3 text-right font-bold ${leftColor}`}>{left}</span>
    <span className="w-1/3 text-center text-[11px] sm:text-xs font-medium text-neutral-400 z-10 bg-transparent px-1 uppercase tracking-widest group-hover:text-neutral-200 transition-colors">{label}</span>
    <span className={`w-1/3 text-left font-bold ${rightColor}`}>{right}</span>
  </Tooltip>
);
