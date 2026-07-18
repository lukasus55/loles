import React from 'react';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StatsClient } from "@/components/stats/StatsClient";
import prisma from "@/lib/prisma";
import { getChampions } from "@/lib/riot/ddragon";

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
      gameDuration: { gte: 240 } // Filter out remakes
    },
    select: {
      id: true,
      season: true,
      role: true,
      championName: true,
      enemyChampionName: true,
      win: true,
      kills: true,
      deaths: true,
      assists: true,
      cs: true,
      gameDuration: true,
    }
  });

  const champions = await getChampions();

  return <StatsClient matches={matches} champions={champions} riotAccount={riotAccount} />;
}
