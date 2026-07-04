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
    
    if ((role === "ADC" || role === "SUPP") && (!mySupp || !enemySupp)) {
      return NextResponse.json({ message: "Missing support fields for bot lane" }, { status: 400 });
    }

    const whereClause: any = {
      userId: session.user.id,
      role: role as Role,
      myChampion: myPick,
      enemyChampion: enemyPick,
    };

    if (role === "ADC" || role === "SUPP") {
      whereClause.mySupport = mySupp;
      whereClause.enemySupport = enemySupp;
    } else {
      whereClause.mySupport = null;
      whereClause.enemySupport = null;
    }

    const existingNote = await prisma.matchupNote.findFirst({
      where: whereClause,
      select: { id: true }
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
