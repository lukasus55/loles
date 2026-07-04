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
    const { role, myPick, enemyPick, mySupp, enemySupp, page = 1 } = body;
    
    const limit = 12;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      userId: session.user.id,
      role: role as Role,
    };

    if (myPick) whereClause.myChampion = myPick;
    if (enemyPick) whereClause.enemyChampion = enemyPick;
    
    if (role === "ADC" || role === "SUPP") {
      if (mySupp) whereClause.mySupport = mySupp;
      if (enemySupp) whereClause.enemySupport = enemySupp;
    }

    const notes = await prisma.matchupNote.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      take: limit + 1, // Fetch one extra to determine if there are more
      skip,
    });

    const hasMore = notes.length > limit;
    const returnedNotes = hasMore ? notes.slice(0, limit) : notes;

    return NextResponse.json({ notes: returnedNotes, hasMore }, { status: 200 });
  } catch (error) {
    console.error("Fetch notes list error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
