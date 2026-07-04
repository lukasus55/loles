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
    const { role, myPick, enemyPick, mySupp, enemySupp, prio, notes } = body;

    if (!role || !myPick || !enemyPick) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const whereClause: any = {
      userId: session.user.id,
      role: role as Role,
      myChampion: myPick,
      enemyChampion: enemyPick,
      mySupport: (role === "ADC" || role === "SUPP") ? mySupp : null,
      enemySupport: (role === "ADC" || role === "SUPP") ? enemySupp : null,
    };

    const existingNote = await prisma.matchupNote.findFirst({ where: whereClause });
    if (existingNote) {
      return NextResponse.json({ message: "A note for this matchup already exists." }, { status: 409 });
    }

    const newNote = await prisma.matchupNote.create({
      data: {
        userId: session.user.id,
        role: role as Role,
        myChampion: myPick,
        enemyChampion: enemyPick,
        mySupport: whereClause.mySupport,
        enemySupport: whereClause.enemySupport,
        prio,
        notes,
      }
    });

    return NextResponse.json({ note: newNote }, { status: 201 });
  } catch (error) {
    console.error("Create note error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
