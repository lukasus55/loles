import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { fetchMatchIds, fetchMatchDetails } from "@/lib/riot/api";

const SYNC_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

export async function POST() {
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

    // Fetch latest 15 match IDs
    const matchIds = await fetchMatchIds(riotAccount.puuid, riotAccount.region, 15);

    if (!matchIds || matchIds.length === 0) {
      return NextResponse.json({ message: "No recent matches found", syncedCount: 0 });
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

    if (newMatchIds.length === 0) {
      // Update last synced
      await prisma.riotAccount.update({
        where: { id: riotAccount.id },
        data: { lastSyncedAt: new Date() }
      });
      return NextResponse.json({ message: "Already up to date", syncedCount: 0 });
    }

    let syncedCount = 0;

    // Fetch and process new matches sequentially to avoid slamming the Riot API rate limits
    for (const matchId of newMatchIds) {
      try {
        const matchData = await fetchMatchDetails(matchId, riotAccount.region);
        
        // Ensure it's a valid match with participants
        if (!matchData?.info?.participants) continue;

        const p = matchData.info.participants.find((p: any) => p.puuid === riotAccount.puuid);
        if (!p) continue;

        // Skip non-standard game modes where teamPosition might be empty (like Arena/ARAM) if desired.
        // Or just save them as "UNKNOWN"
        const role = p.teamPosition || "UNKNOWN";

        // Find enemy opponent
        let enemyChampionName = null;
        let partnerChampionName = null;
        let enemyPartnerChampionName = null;

        if (role !== "UNKNOWN") {
          const enemy = matchData.info.participants.find(
            (ep: any) => ep.teamPosition === role && ep.teamId !== p.teamId
          );
          if (enemy) {
            enemyChampionName = enemy.championName;
          }

          // Bot lane specific: extract support/adc partners
          if (role === "BOTTOM" || role === "UTILITY") {
            const partnerRole = role === "BOTTOM" ? "UTILITY" : "BOTTOM";
            
            const partner = matchData.info.participants.find(
              (ap: any) => ap.teamPosition === partnerRole && ap.teamId === p.teamId
            );
            if (partner) partnerChampionName = partner.championName;

            const enemyPartner = matchData.info.participants.find(
              (ep: any) => ep.teamPosition === partnerRole && ep.teamId !== p.teamId
            );
            if (enemyPartner) enemyPartnerChampionName = enemyPartner.championName;
          }
        }

        await prisma.match.create({
          data: {
            matchId,
            userId: session.user.id,
            puuid: riotAccount.puuid,
            season: 16, // Hardcoded season 16 as requested
            gameCreation: new Date(matchData.info.gameCreation),
            gameDuration: matchData.info.gameDuration,
            queueId: matchData.info.queueId,
            championId: p.championId,
            championName: p.championName,
            role,
            win: p.win,
            kills: p.kills,
            deaths: p.deaths,
            assists: p.assists,
            cs: (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0),
            enemyChampionName,
            partnerChampionName,
            enemyPartnerChampionName
          }
        });

        syncedCount++;
      } catch (e) {
        console.error(`Failed to process match ${matchId}:`, e);
        // Continue to the next match even if one fails
      }
    }

    await prisma.riotAccount.update({
      where: { id: riotAccount.id },
      data: { lastSyncedAt: new Date() }
    });

    return NextResponse.json({ success: true, syncedCount });
  } catch (error: any) {
    console.error("Sync API Error:", error);
    return NextResponse.json({ message: "Failed to sync matches" }, { status: 500 });
  }
}
