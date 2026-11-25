import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getChampions, getMatchAssets, getShopItems } from "@/lib/riot/ddragon";
import {
  isBotRole,
  mapAppRoleToRiotRole,
  parseMatchupSearchParams,
} from "@/lib/matchup/url";
import { MatchupHubClient } from "@/components/matchup/MatchupHubClient";

export const metadata: Metadata = {
  title: "Matchup Hub",
};

export const dynamic = "force-dynamic";

export default async function MatchupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedSearch = await searchParams;
  const parsed = parseMatchupSearchParams(resolvedSearch);

  if (!parsed) {
    redirect("/matchups");
  }

  const { role, myPick, enemyPick, mySupp, enemySupp, from, tab } = parsed;
  const isBot = isBotRole(role);
  const hasPartnerFilter = isBot && Boolean(mySupp || enemySupp);
  const riotRole = mapAppRoleToRiotRole(role);

  const [exactNote, generalNote, broadMatches, champions, matchAssets, shopItems] =
    await Promise.all([
      prisma.matchupNote.findFirst({
        where: {
          userId: session.user.id,
          role,
          myChampion: myPick,
          enemyChampion: enemyPick,
          mySupport: isBot ? mySupp : null,
          enemySupport: isBot ? enemySupp : null,
        },
        select: {
          id: true,
          prio: true,
          notes: true,
          detachLoadouts: true,
          setups: {
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
            include: {
              runePreset: true,
              buildPreset: true,
            },
          },
          runePresets: {
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          },
          buildPresets: {
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          },
        },
      }),
      hasPartnerFilter
        ? prisma.matchupNote.findFirst({
            where: {
              userId: session.user.id,
              role,
              myChampion: myPick,
              enemyChampion: enemyPick,
              mySupport: null,
              enemySupport: null,
            },
            select: { id: true },
          })
        : Promise.resolve(null),
      prisma.match.findMany({
        where: {
          userId: session.user.id,
          role: riotRole,
          championName: myPick,
          enemyChampionName: enemyPick,
          gameDuration: { gte: 240 },
        },
        orderBy: { gameCreation: "desc" },
      }),
      getChampions(),
      getMatchAssets(),
      getShopItems(),
    ]);

  const exactMatches = hasPartnerFilter
    ? broadMatches.filter((m) => {
        if (mySupp && m.partnerChampionName !== mySupp) return false;
        if (enemySupp && m.enemyPartnerChampionName !== enemySupp) return false;
        return true;
      })
    : broadMatches;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <MatchupHubClient
        key={`${role}-${myPick}-${enemyPick}-${mySupp ?? ""}-${enemySupp ?? ""}`}
        role={role}
        myPick={myPick}
        enemyPick={enemyPick}
        mySupp={mySupp}
        enemySupp={enemySupp}
        from={from}
        initialTab={tab}
        initialNote={exactNote}
        hasGeneralNote={Boolean(generalNote)}
        exactMatches={exactMatches}
        broadMatches={broadMatches}
        champions={champions}
        matchAssets={matchAssets}
        shopItems={shopItems}
      />
    </div>
  );
}
