import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "20");

    const matches = await prisma.match.findMany({
      where: { userId: session.user.id },
      orderBy: { gameCreation: 'desc' },
      skip,
      take,
    });

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Match fetch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
