import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";
import { isBotRole, isValidRole, mapAppRoleToRiotRole } from "@/lib/matchup/url";

/**
 * POST /api/notes/list
 *
 * Requires an authenticated session.
 * Body parameters:
 *   - role: "TOP" | "JGL" | "MID" | "ADC" | "SUPP" (required)
 *   - myPick?: string
 *   - enemyPick?: string
 *   - mySupp?: string (botlane only)
 *   - enemySupp?: string (botlane only)
 *   - page?: number (1-based, defaults to 1, 12 items per page)
 *
 * Returns:
 *   - 200: `{ notes, hasMore }` where each note includes `wins` and `losses` computed from synced non-remake matches
 *   - 400: Missing or invalid role parameter
 *   - 401: Unauthorized
 *   - 500: Internal Server Error
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role, myPick, enemyPick, mySupp, enemySupp, page = 1 } = body;

    if (!isValidRole(role)) {
      return NextResponse.json({ message: "Invalid or missing role" }, { status: 400 });
    }

    const normalizedRole = role.toUpperCase() as Role;
    const safePage = Number.isInteger(page) && page > 0 ? page : 1;
    const limit = 12;
    const skip = (safePage - 1) * limit;

    const whereClause: Prisma.MatchupNoteWhereInput = {
      userId: session.user.id,
      role: normalizedRole,
    };

    if (myPick) whereClause.myChampion = myPick;
    if (enemyPick) whereClause.enemyChampion = enemyPick;

    if (isBotRole(normalizedRole)) {
      if (mySupp) whereClause.mySupport = mySupp;
      if (enemySupp) whereClause.enemySupport = enemySupp;
    }

    const notes = await prisma.matchupNote.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" },
      take: limit + 1,
      skip,
    });

    const hasMore = notes.length > limit;
    const returnedNotes = hasMore ? notes.slice(0, limit) : notes;

    if (returnedNotes.length === 0) {
      return NextResponse.json({ notes: [], hasMore }, { status: 200 });
    }

    const pairKeys = new Set<string>();
    const pairFilters: Prisma.MatchWhereInput[] = [];
    for (const note of returnedNotes) {
      const key = `${note.myChampion}::${note.enemyChampion}`;
      if (!pairKeys.has(key)) {
        pairKeys.add(key);
        pairFilters.push({
          championName: note.myChampion,
          enemyChampionName: note.enemyChampion,
        });
      }
    }

    const matches = await prisma.match.findMany({
      where: {
        userId: session.user.id,
        role: mapAppRoleToRiotRole(normalizedRole),
        gameDuration: { gte: 240 },
        OR: pairFilters,
      },
      select: {
        championName: true,
        enemyChampionName: true,
        partnerChampionName: true,
        enemyPartnerChampionName: true,
        win: true,
      },
    });

    const isBot = isBotRole(normalizedRole);
    const enrichedNotes = returnedNotes.map((note) => {
      let wins = 0;
      let losses = 0;

      for (const m of matches) {
        if (m.championName !== note.myChampion || m.enemyChampionName !== note.enemyChampion) {
          continue;
        }
        if (isBot) {
          if (note.mySupport && m.partnerChampionName !== note.mySupport) continue;
          if (note.enemySupport && m.enemyPartnerChampionName !== note.enemySupport) continue;
        }
        if (m.win) {
          wins += 1;
        } else {
          losses += 1;
        }
      }

      return { ...note, wins, losses };
    });

    return NextResponse.json({ notes: enrichedNotes, hasMore }, { status: 200 });
  } catch (error) {
    console.error("Fetch notes list error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
