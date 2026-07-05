import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Axe, Trees, Swords, Crosshair, ShieldPlus, Component } from "lucide-react";

interface MatchCardProps {
  match: any;
  champions: any[];
  existingNotes: any[];
  mounted: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, champions, existingNotes, mounted }) => {
  const timeAgo = (dateStr: string | Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }
    return 'Just now';
  };

  const getChampionIconUrl = (champName: string) => {
    let normalized = champName;
    if (champName === "FiddleSticks") normalized = "Fiddlesticks";
    const champData = champions.find((c: any) => c.name === champName || c.id === champName || c.name.toLowerCase() === champName.toLowerCase());
    
    if (champData?.iconUrl) return champData.iconUrl;

    const id = champData ? champData.id : normalized;
    return `https://ddragon.leagueoflegends.com/cdn/14.13.1/img/champion/${id}.png`;
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
  
  const kda = match.deaths === 0 ? "Perfect" : ((match.kills + match.assists) / match.deaths).toFixed(2);
  const durationMins = Math.floor(match.gameDuration / 60);
  const durationSecs = match.gameDuration % 60;
  const csPerMin = (match.cs / (match.gameDuration / 60)).toFixed(1);
  
  const roleEnum = match.role === "UTILITY" ? "SUPP" : match.role === "BOTTOM" ? "ADC" : match.role === "JUNGLE" ? "JGL" : match.role;
  const isBot = match.role === "BOTTOM" || match.role === "UTILITY";

  const existingNote = existingNotes.find((n: any) => 
    n.role === roleEnum && 
    n.myChampion === match.championName && 
    n.enemyChampion === match.enemyChampionName && 
    (!isBot || (n.mySupport === match.partnerChampionName && n.enemySupport === match.enemyPartnerChampionName))
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
      className={`group flex flex-col sm:flex-row items-center border rounded-lg overflow-hidden relative shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer ${
        isRemake
          ? 'bg-neutral-800/30 border-neutral-700/50 hover:border-neutral-600/50 hover:bg-neutral-800/50'
          : isWin 
            ? 'bg-blue-950/20 border-blue-900/30 hover:border-blue-700/50 hover:bg-blue-900/30' 
            : 'bg-red-950/20 border-red-900/30 hover:border-red-700/50 hover:bg-red-900/30'
      }`}
    >
      {/* Status Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isRemake ? 'bg-neutral-500' : isWin ? 'bg-blue-600' : 'bg-red-600'}`}></div>
      
      <div className="flex-1 w-full p-4 pl-6 flex items-center gap-6">
        {/* Game Info */}
        <div className="w-24 shrink-0 text-left">
          <p className={`text-sm font-bold tracking-wider ${isRemake ? 'text-neutral-500' : isWin ? 'text-blue-500' : 'text-red-500'}`}>
            {isRemake ? 'REMAKE' : isWin ? 'VICTORY' : 'DEFEAT'}
          </p>
          <p className="text-xs text-neutral-400 mt-1">{durationMins}m {durationSecs}s</p>
          <p className="text-xs text-neutral-500 mt-0.5">{mounted ? timeAgo(match.gameCreation) : "Just now"}</p>
        </div>

        {/* Player Champ */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-neutral-800">
              <Image src={getChampionIconUrl(match.championName)} alt={match.championName} fill className="object-cover" />
            </div>
          </div>
          
          {/* Stats */}
          <div className="w-28 text-center">
            <p className="text-lg font-bold text-white tracking-tight">
              {match.kills} / <span className="text-red-500">{match.deaths}</span> / {match.assists}
            </p>
            <p className="text-xs text-neutral-400 mt-1 font-medium">{kda} KDA</p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="hidden md:block w-24 border-l border-neutral-800/50 pl-4">
          <p className="text-sm text-neutral-300 font-medium">CS {match.cs}</p>
          <p className="text-xs text-neutral-500 mt-1">({csPerMin})</p>
        </div>

        {/* Matchup vs */}
        {match.enemyChampionName && match.role !== "UNKNOWN" && (
          <div className="hidden lg:flex items-center gap-4 ml-auto border-l border-neutral-800/50 pl-6">
            
            {/* Ally Partner Portrait (Only if bot lane) */}
            {match.partnerChampionName && (
              <div className="mr-2 opacity-80 hover:opacity-100 transition-opacity">
                 <p className="text-[10px] text-neutral-500 font-bold uppercase mb-0.5 text-center">Partner</p>
                 <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-700 mx-auto relative">
                   <Image src={getChampionIconUrl(match.partnerChampionName)} alt={match.partnerChampionName} fill className="object-cover" />
                 </div>
              </div>
            )}

            <div className="text-right">
              <p className="text-xs text-neutral-500 font-bold tracking-wider uppercase mb-1">Played Against</p>
              <p className="text-sm text-neutral-300 font-medium">{match.enemyChampionName}</p>
            </div>
            
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-neutral-800 opacity-80 relative z-10 drop-shadow-md">
                <Image src={getChampionIconUrl(match.enemyChampionName)} alt={match.enemyChampionName} fill className="object-cover" />
              </div>
              {/* Enemy Partner Portrait */}
              {match.enemyPartnerChampionName && (
                 <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-700 opacity-70 relative -ml-3 z-0 hover:z-20 transition-all">
                   <Image src={getChampionIconUrl(match.enemyPartnerChampionName)} alt={match.enemyPartnerChampionName} fill className="object-cover" />
                 </div>
              )}
            </div>
          </div>
        )}

        {/* Role */}
        <div className="ml-auto flex shrink-0 pr-4" title={match.role}>
           <div className="w-8 h-8 flex items-center justify-center bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400">
             {getRoleIcon(match.role)}
           </div>
        </div>
      </div>
    </Link>
  );
};
