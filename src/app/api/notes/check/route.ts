/**
 * POST /api/notes/check
 * - Auth: Required
 * - Body: { role: Role, myPick: string, enemyPick: string, mySupp?: string | null, enemySupp?: string | null }
 * - Checks whether a MatchupNote exists for the exact champion configuration (explicitly matching null partners).
 * - Responses: 200 { exists: boolean, noteId?: string } | 400 | 401 | 500
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role, myPick, enemyPick, mySupp, enemySupp } = body;

    if (!role || !myPick || !enemyPick) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const isBot = role === "ADC" || role === "SUPP";

    const existingNote = await prisma.matchupNote.findFirst({
      where: {
        userId: session.user.id,
        role: role as Role,
        myChampion: myPick,
        enemyChampion: enemyPick,
        mySupport: isBot ? mySupp || null : null,
        enemySupport: isBot ? enemySupp || null : null,
      },
      select: { id: true },
    });

    if (existingNote) {
      return NextResponse.json({ exists: true, noteId: existingNote.id });
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error("Collision check error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
