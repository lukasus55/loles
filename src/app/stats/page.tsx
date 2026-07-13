import React from 'react';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StatsClient } from "@/components/stats/StatsClient";
import prisma from "@/lib/prisma";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Analytics',
};

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const riotAccount = await prisma.riotAccount.findUnique({
    where: { userId: session.user.id }
  });

  const matches = await prisma.match.findMany({
    where: { 
      userId: session.user.id,
      gameDuration: { gte: 240 }
    }
  });

  if (!matches.length) {
    return <StatsClient data={{ totalMatches: 0, riotAccount }} />;
  }

  const totalMatches = matches.length;
  const wins = matches.filter(m => m.win).length;
  
  let totalKills = 0, totalDeaths = 0, totalAssists = 0, totalCs = 0;
  let totalGold = 0, totalDamage = 0, totalVision = 0;

  const champsMap: Record<string, any> = {};
  const rolesMap: Record<string, any> = {};
  const matchupsMap: Record<string, any> = {};

  for (const m of matches) {
    totalKills += m.kills;
    totalDeaths += m.deaths;
    totalAssists += m.assists;
    totalCs += m.cs;
    totalGold += m.goldEarned || 0;
    totalDamage += m.totalDamageDealtToChampions || 0;
    totalVision += m.visionScore || 0;

    if (!champsMap[m.championName]) {
      champsMap[m.championName] = { name: m.championName, games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, cs: 0 };
    }
    champsMap[m.championName].games++;
    if (m.win) champsMap[m.championName].wins++;
    champsMap[m.championName].kills += m.kills;
    champsMap[m.championName].deaths += m.deaths;
    champsMap[m.championName].assists += m.assists;
    champsMap[m.championName].cs += m.cs;

    const role = m.role || "UNKNOWN";
    if (!rolesMap[role]) {
      rolesMap[role] = { role, games: 0, wins: 0 };
    }
    rolesMap[role].games++;
    if (m.win) rolesMap[role].wins++;

    if (m.enemyChampionName) {
      if (!matchupsMap[m.enemyChampionName]) {
        matchupsMap[m.enemyChampionName] = { enemy: m.enemyChampionName, games: 0, wins: 0 };
      }
      matchupsMap[m.enemyChampionName].games++;
      if (m.win) matchupsMap[m.enemyChampionName].wins++;
    }
  }

  const champions = Object.values(champsMap).map((c: any) => ({
    ...c,
    winRate: (c.wins / c.games) * 100,
    avgKills: c.kills / c.games,
    avgDeaths: c.deaths / c.games,
    avgAssists: c.assists / c.games,
    avgCs: c.cs / c.games
  })).sort((a, b) => b.games - a.games);

  const roles = Object.values(rolesMap).map((r: any) => ({
    ...r,
    winRate: (r.wins / r.games) * 100
  })).sort((a, b) => b.games - a.games);

  const matchups = Object.values(matchupsMap).map((m: any) => ({
    ...m,
    winRate: (m.wins / m.games) * 100
  })).sort((a, b) => b.games - a.games);

  const data = {
    riotAccount,
    totalMatches,
    winRate: (wins / totalMatches) * 100,
    avgKills: totalKills / totalMatches,
    avgDeaths: totalDeaths / totalMatches,
    avgAssists: totalAssists / totalMatches,
    avgCs: totalCs / totalMatches,
    avgGold: totalGold / totalMatches,
    avgDamage: totalDamage / totalMatches,
    avgVision: totalVision / totalMatches,
    champions,
    roles,
    matchups
  };

  return <StatsClient data={data} />;
}
