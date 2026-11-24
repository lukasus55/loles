import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { fetchMatchDetails } from "@/lib/riot/api";
import { extractParticipantLoadout, RiotParticipantLike } from "@/lib/riot/loadout";

/**
 * GET: Returns list of matchIds for the current user that have not yet synced items & runes.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const pendingMatches = await prisma.match.findMany({
      where: {
        userId: session.user.id,
        loadoutSynced: false,
      },
      orderBy: { gameCreation: "desc" },
      select: { matchId: true },
    });

    const matchIds = pendingMatches.map((m) => m.matchId);
    return NextResponse.json({ matchIds, total: matchIds.length });
  } catch (error) {
    console.error("Backfill GET Error:", error);
    return NextResponse.json({ message: "Failed to check pending backfill" }, { status: 500 });
  }
}

/**
 * POST: Fetches Riot Match-v5 details (without timeline) for a chunk of matchIds
 * and backfills items, trinket, summoner spells, runes, and stat shards.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const matchIds: string[] = body.matchIds;

    if (!matchIds || !Array.isArray(matchIds) || matchIds.length === 0) {
      return NextResponse.json({ message: "No matchIds provided" }, { status: 400 });
    }

    const riotAccount = await prisma.riotAccount.findUnique({
      where: { userId: session.user.id },
    });

    if (!riotAccount) {
      return NextResponse.json({ message: "No Riot account linked" }, { status: 400 });
    }

    // Cap chunk size for safety against timeouts / rate limits
    const chunk = matchIds.slice(0, 10);
    let updatedCount = 0;
    let failedCount = 0;

    for (const matchId of chunk) {
      try {
        const existing = await prisma.match.findUnique({
          where: {
            matchId_userId: {
              matchId,
              userId: session.user.id,
            },
          },
          select: { id: true, loadoutSynced: true, puuid: true },
        });

        if (!existing || existing.loadoutSynced) continue;

        const matchData = await fetchMatchDetails(matchId, riotAccount.region);
        if (!matchData?.info?.participants) {
          failedCount++;
          continue;
        }

        const participants: RiotParticipantLike[] = matchData.info.participants;
        const p = participants.find(
          (participant) =>
            participant.puuid === existing.puuid || participant.puuid === riotAccount.puuid
        );

        if (!p) {
          failedCount++;
          continue;
        }

        const loadout = extractParticipantLoadout(p);

        await prisma.match.update({
          where: { id: existing.id },
          data: loadout,
        });

        updatedCount++;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e || "");
        // If Riot returns 404 (expired / purged match), mark synced so it doesn't loop forever
        if (msg.includes("404")) {
          await prisma.match
            .update({
              where: {
                matchId_userId: {
                  matchId,
                  userId: session.user.id,
                },
              },
              data: { loadoutSynced: true },
            })
            .catch(() => {});
        } else {
          console.error(`Failed to backfill match ${matchId}:`, e);
          failedCount++;
        }
      }
    }

    return NextResponse.json({ success: true, updatedCount, failedCount });
  } catch (error) {
    console.error("Backfill POST Error:", error);
    return NextResponse.json({ message: "Failed to backfill matches" }, { status: 500 });
  }
}
