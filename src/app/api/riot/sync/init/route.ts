import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { fetchMatchIds, fetchSummonerByPuuid, fetchLeagueEntries } from "@/lib/riot/api";

const SYNC_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const riotAccount = await prisma.riotAccount.findUnique({
      where: { userId: session.user.id }
    });

    if (!riotAccount) {
      return NextResponse.json({ message: "No Riot account linked" }, { status: 400 });
    }

    // Cooldown check
    if (riotAccount.lastSyncedAt) {
      const timeSinceLastSync = Date.now() - riotAccount.lastSyncedAt.getTime();
      if (timeSinceLastSync < SYNC_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((SYNC_COOLDOWN_MS - timeSinceLastSync) / 1000);
        return NextResponse.json({ 
          message: `Please wait ${remainingSeconds} seconds before syncing again.` 
        }, { status: 429 });
      }
    }

    // Update rank silently in the background (we won't block on this failing)
    try {
      const summonerData = await fetchSummonerByPuuid(riotAccount.puuid, riotAccount.region);
      const leagueData = await fetchLeagueEntries(summonerData.id, riotAccount.region);
      const soloQ = leagueData?.find((q: any) => q.queueType === "RANKED_SOLO_5x5");
      
      await prisma.riotAccount.update({
        where: { id: riotAccount.id },
        data: { 
          summonerId: summonerData.id,
          tier: soloQ?.tier || null,
          rank: soloQ?.rank || null,
          leaguePoints: soloQ?.leaguePoints || null,
          lastSyncedAt: new Date() 
        }
      });
    } catch (e) {
      console.error("Rank sync error (safe to ignore if no league-v4 access):", e);
      await prisma.riotAccount.update({
        where: { id: riotAccount.id },
        data: { lastSyncedAt: new Date() }
      });
    }

    // Fetch latest 100 match IDs (instead of 15)
    const matchIds = await fetchMatchIds(riotAccount.puuid, riotAccount.region, 100);

    if (!matchIds || matchIds.length === 0) {
      return NextResponse.json({ message: "No recent matches found", newMatchIds: [] });
    }

    // Check which match IDs we already have
    const existingMatches = await prisma.match.findMany({
      where: {
        matchId: { in: matchIds },
        userId: session.user.id
      },
      select: { matchId: true }
    });

    const existingMatchIds = new Set(existingMatches.map(m => m.matchId));
    const newMatchIds = matchIds.filter((id: string) => !existingMatchIds.has(id));

    return NextResponse.json({ success: true, newMatchIds });
  } catch (error: any) {
    console.error("Sync Init API Error:", error);
    return NextResponse.json({ message: "Failed to initialize sync" }, { status: 500 });
  }
}
