/**
 * Matchup Hub Note Upsert & Delete Route Handler
 *
 * PUT /api/matchup
 * - Auth: Required (NextAuth session)
 * - Body: { role: Role, myPick: string, enemyPick: string, mySupp?: string | null, enemySupp?: string | null, prio?: string, notes?: string }
 * - Behavior: Finds exact matchup note (matching null partners explicitly on botlane) and updates it, or creates it automatically.
 * - Responses: 200 { note, created: false } | 201 { note, created: true } | 400 | 401 | 500
 *
 * DELETE /api/matchup?id=<noteId>
 * - Auth: Required (ownership enforced)
 * - Responses: 200 { success: true } | 400 | 401 | 404 | 500
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { isBotRole, isValidRole } from "@/lib/matchup/url";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role: rawRole, myPick, enemyPick, mySupp, enemySupp, prio, notes } = body ?? {};

    if (!rawRole || !isValidRole(rawRole) || !myPick || !enemyPick) {
      return NextResponse.json(
        { message: "Valid role, myPick, and enemyPick are required" },
        { status: 400 }
      );
    }

    const role = rawRole.toUpperCase() as Role;
    const isBot = isBotRole(role);
    const normalizedMySupp = isBot && typeof mySupp === "string" && mySupp.trim() ? mySupp.trim() : null;
    const normalizedEnemySupp =
      isBot && typeof enemySupp === "string" && enemySupp.trim() ? enemySupp.trim() : null;

    const normalizedPrio = typeof prio === "string" ? prio : "N/A";
    const normalizedNotes = typeof notes === "string" ? notes : "";

    const existing = await prisma.matchupNote.findFirst({
      where: {
        userId: session.user.id,
        role,
        myChampion: myPick,
        enemyChampion: enemyPick,
        mySupport: normalizedMySupp,
        enemySupport: normalizedEnemySupp,
      },
      select: { id: true },
    });

    if (existing) {
      const updated = await prisma.matchupNote.update({
        where: { id: existing.id },
        data: {
          prio: normalizedPrio,
          notes: normalizedNotes,
        },
      });
      return NextResponse.json({ note: updated, created: false }, { status: 200 });
    }

    const created = await prisma.matchupNote.create({
      data: {
        userId: session.user.id,
        role,
        myChampion: myPick,
        enemyChampion: enemyPick,
        mySupport: normalizedMySupp,
        enemySupport: normalizedEnemySupp,
        prio: normalizedPrio,
        notes: normalizedNotes,
      },
    });

    return NextResponse.json({ note: created, created: true }, { status: 201 });
  } catch (error) {
    console.error("Matchup PUT Error:", error);
    return NextResponse.json({ message: "Failed to save matchup" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Missing note id" }, { status: 400 });
    }

    const existing = await prisma.matchupNote.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ message: "Matchup note not found" }, { status: 404 });
    }

    await prisma.matchupNote.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Matchup DELETE Error:", error);
    return NextResponse.json({ message: "Failed to delete matchup note" }, { status: 500 });
  }
}
