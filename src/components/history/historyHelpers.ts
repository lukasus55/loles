import { ChampionData } from "@/lib/riot/assets";

export function formatTimeAgo(dateStr: string | Date): string {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  );

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function findChampionData(
  champName: string,
  champions: ChampionData[]
): ChampionData | undefined {
  const lower = champName.toLowerCase();
  return champions.find(
    (c) => c.name === champName || c.id === champName || c.name.toLowerCase() === lower
  );
}

export function getChampionDisplayName(
  champName: string,
  champions: ChampionData[]
): string {
  return findChampionData(champName, champions)?.name || champName;
}

export function getChampionIconUrl(
  champName: string,
  champions: ChampionData[],
  ddragonVersion: string
): string {
  const champData = findChampionData(champName, champions);
  if (champData?.iconUrl) return champData.iconUrl;

  const normalized = champName === "FiddleSticks" ? "Fiddlesticks" : champName;
  return `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${normalized}.png`;
}

export function getRoleIconSrc(role: string): string {
  switch (role) {
    case "JUNGLE":
    case "JGL":
      return "/roles/jg.webp";
    case "MIDDLE":
    case "MID":
      return "/roles/mid.webp";
    case "BOTTOM":
    case "ADC":
      return "/roles/adc.webp";
    case "UTILITY":
    case "SUPP":
      return "/roles/supp.webp";
    default:
      return "/roles/top.webp";
  }
}
