import { Role } from "@/components/notes/RoleFilter";
import { MatchupFilters } from "@/components/notes/ChampionFilterBlock";

export interface StatsMatchRecord {
  id: string;
  season: number;
  role: string;
  championName: string;
  enemyChampionName: string | null;
  partnerChampionName: string | null;
  enemyPartnerChampionName: string | null;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  gameDuration: number;
  csAt15?: number | null;
  enemyCsAt15?: number | null;
  goldAt15?: number | null;
  enemyGoldAt15?: number | null;
}

export interface StatsFilterInput {
  season: number | null;
  role: Role | null;
  champions: MatchupFilters;
}

export type StatsGroupBy = "myPick" | "mySupp" | "enemyPick" | "enemySupp";

export interface PerspectiveOption {
  id: StatsGroupBy;
  label: string;
  columnLabel: string;
}

export interface StatRowData {
  championName: string;
  played: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  gameDuration: number;
}

export interface SummaryStats {
  played: number;
  wins: number;
  losses: number;
  winRate: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  kdaRatio: number;
  avgCsPerMin: number;
  avgDurationSec: number;
  avgCsDiff15: number | null;
  avgGoldDiff15: number | null;
  earlyGameCount: number;
}

const APP_ROLE_TO_RIOT_ROLE: Record<Role, string> = {
  TOP: "TOP",
  JGL: "JUNGLE",
  MID: "MIDDLE",
  ADC: "BOTTOM",
  SUPP: "UTILITY",
};

export function isBotLaneRole(role: Role | null): boolean {
  return role === "ADC" || role === "SUPP";
}

export function filterMatches(
  matches: StatsMatchRecord[],
  filters: StatsFilterInput
): StatsMatchRecord[] {
  const isBot = isBotLaneRole(filters.role);
  const riotRole = filters.role ? APP_ROLE_TO_RIOT_ROLE[filters.role] : null;

  return matches.filter((m) => {
    if (filters.season !== null && m.season !== filters.season) return false;
    if (riotRole && m.role !== riotRole) return false;
    if (filters.champions.myPick && m.championName !== filters.champions.myPick) return false;
    if (filters.champions.enemyPick && m.enemyChampionName !== filters.champions.enemyPick) {
      return false;
    }
    if (isBot) {
      if (filters.champions.mySupp && m.partnerChampionName !== filters.champions.mySupp) {
        return false;
      }
      if (
        filters.champions.enemySupp &&
        m.enemyPartnerChampionName !== filters.champions.enemySupp
      ) {
        return false;
      }
    }
    return true;
  });
}

function getPerspectiveMeta(id: StatsGroupBy, role: Role | null): PerspectiveOption {
  if (role === "ADC") {
    switch (id) {
      case "myPick":
        return { id, label: "My ADCs", columnLabel: "ADC" };
      case "enemyPick":
        return { id, label: "vs Enemy ADC", columnLabel: "Enemy ADC" };
      case "mySupp":
        return { id, label: "With Ally Support", columnLabel: "Ally Support" };
      case "enemySupp":
        return { id, label: "vs Enemy Support", columnLabel: "Enemy Support" };
    }
  }

  if (role === "SUPP") {
    switch (id) {
      case "myPick":
        return { id, label: "My Supports", columnLabel: "Support" };
      case "enemyPick":
        return { id, label: "vs Enemy Support", columnLabel: "Enemy Support" };
      case "mySupp":
        return { id, label: "With Ally ADC", columnLabel: "Ally ADC" };
      case "enemySupp":
        return { id, label: "vs Enemy ADC", columnLabel: "Enemy ADC" };
    }
  }

  switch (id) {
    case "myPick":
      return { id, label: "My Champions", columnLabel: "Champion" };
    case "enemyPick":
      return { id, label: "vs Enemy", columnLabel: "Enemy" };
    case "mySupp":
      return { id, label: "With Ally Partner", columnLabel: "Ally Partner" };
    case "enemySupp":
      return { id, label: "vs Enemy Partner", columnLabel: "Enemy Partner" };
  }
}

/**
 * Returns the ordered list of available grouping tabs for all unlocked champion slots.
 */
export function getAvailablePerspectives(
  role: Role | null,
  champions: MatchupFilters
): PerspectiveOption[] {
  const isBot = isBotLaneRole(role);
  const candidateOrder: StatsGroupBy[] = isBot
    ? ["myPick", "enemyPick", "mySupp", "enemySupp"]
    : ["myPick", "enemyPick"];

  const unlocked = candidateOrder.filter((slot) => !champions[slot]);
  return unlocked.map((slot) => getPerspectiveMeta(slot, role));
}

export function resolveActivePerspective(
  requested: StatsGroupBy | null,
  available: PerspectiveOption[]
): StatsGroupBy | null {
  if (available.length === 0) return null;
  if (requested && available.some((p) => p.id === requested)) {
    return requested;
  }
  return available[0].id;
}

function getChampionKeyForPerspective(
  m: StatsMatchRecord,
  groupBy: StatsGroupBy
): string | null {
  switch (groupBy) {
    case "myPick":
      return m.championName || null;
    case "enemyPick":
      return m.enemyChampionName || null;
    case "mySupp":
      return m.partnerChampionName || null;
    case "enemySupp":
      return m.enemyPartnerChampionName || null;
  }
}

export function aggregateByPerspective(
  matches: StatsMatchRecord[],
  groupBy: StatsGroupBy
): StatRowData[] {
  const dataMap: Record<string, StatRowData> = {};

  for (const m of matches) {
    const key = getChampionKeyForPerspective(m, groupBy);
    if (!key) continue;

    if (!dataMap[key]) {
      dataMap[key] = {
        championName: key,
        played: 0,
        wins: 0,
        kills: 0,
        deaths: 0,
        assists: 0,
        cs: 0,
        gameDuration: 0,
      };
    }

    const row = dataMap[key];
    row.played++;
    if (m.win) row.wins++;
    row.kills += m.kills || 0;
    row.deaths += m.deaths || 0;
    row.assists += m.assists || 0;
    row.cs += m.cs || 0;
    row.gameDuration += m.gameDuration || 0;
  }

  return Object.values(dataMap);
}

export function computeSummaryStats(matches: StatsMatchRecord[]): SummaryStats {
  const played = matches.length;
  if (played === 0) {
    return {
      played: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      avgKills: 0,
      avgDeaths: 0,
      avgAssists: 0,
      kdaRatio: 0,
      avgCsPerMin: 0,
      avgDurationSec: 0,
      avgCsDiff15: null,
      avgGoldDiff15: null,
      earlyGameCount: 0,
    };
  }

  let wins = 0;
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalCs = 0;
  let totalDuration = 0;
  let earlyGameCount = 0;
  let totalCsDiff15 = 0;
  let totalGoldDiff15 = 0;

  for (const m of matches) {
    if (m.win) wins++;
    totalKills += m.kills || 0;
    totalDeaths += m.deaths || 0;
    totalAssists += m.assists || 0;
    totalCs += m.cs || 0;
    totalDuration += m.gameDuration || 0;

    if (
      typeof m.csAt15 === "number" &&
      typeof m.enemyCsAt15 === "number"
    ) {
      earlyGameCount++;
      totalCsDiff15 += m.csAt15 - m.enemyCsAt15;
      totalGoldDiff15 += (m.goldAt15 ?? 0) - (m.enemyGoldAt15 ?? 0);
    }
  }

  const losses = played - wins;
  const avgKills = totalKills / played;
  const avgDeaths = totalDeaths / played;
  const avgAssists = totalAssists / played;
  const kdaRatio = totalDeaths > 0 ? (totalKills + totalAssists) / totalDeaths : totalKills + totalAssists;
  const avgCsPerMin = totalDuration > 0 ? totalCs / (totalDuration / 60) : 0;

  return {
    played,
    wins,
    losses,
    winRate: (wins / played) * 100,
    avgKills,
    avgDeaths,
    avgAssists,
    kdaRatio,
    avgCsPerMin,
    avgDurationSec: totalDuration / played,
    avgCsDiff15: earlyGameCount > 0 ? totalCsDiff15 / earlyGameCount : null,
    avgGoldDiff15: earlyGameCount > 0 ? totalGoldDiff15 / earlyGameCount : null,
    earlyGameCount,
  };
}

export function buildTableTitle(
  groupBy: StatsGroupBy,
  role: Role | null,
  champions: MatchupFilters
): string {
  const meta = getPerspectiveMeta(groupBy, role);
  const isBot = isBotLaneRole(role);

  const contextParts: string[] = [];
  if (champions.myPick && champions.enemyPick) {
    contextParts.push(`${champions.myPick} vs ${champions.enemyPick}`);
  } else {
    if (champions.myPick) contextParts.push(champions.myPick);
    if (champions.enemyPick) contextParts.push(`vs ${champions.enemyPick}`);
  }

  if (isBot && champions.mySupp) {
    contextParts.push(`with ${champions.mySupp}`);
  }
  if (isBot && champions.enemySupp) {
    contextParts.push(`vs ${champions.enemySupp}`);
  }

  if (groupBy === "myPick") {
    const base = role === "ADC" ? "Your ADCs" : role === "SUPP" ? "Your Supports" : "Your Champions";
    return contextParts.length > 0 ? `${base} ${contextParts.join(" ")}` : base;
  }

  if (contextParts.length > 0) {
    return `${contextParts.join(" ")} — ${meta.label}`;
  }

  return meta.label;
}
