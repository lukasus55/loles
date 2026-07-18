import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { HistoryClient } from "@/components/history/HistoryClient";
import { getChampions } from "@/lib/riot/ddragon";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Match History',
};

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const riotAccount = await prisma.riotAccount.findUnique({
    where: { userId: session.user.id }
  });

  const matches = await prisma.match.findMany({
    where: { userId: session.user.id },
    orderBy: { gameCreation: 'desc' },
    take: 20
  });

  const existingNotes = await prisma.matchupNote.findMany({
    where: { userId: session.user.id },
    select: { id: true, role: true, myChampion: true, enemyChampion: true, mySupport: true, enemySupport: true }
  });

  const champions = await getChampions();

  return (
    <HistoryClient initialMatches={matches} riotAccount={riotAccount} champions={champions} existingNotes={existingNotes} />
  );
}
