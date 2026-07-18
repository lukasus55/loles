import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { fetchSummonerByPuuid, fetchRiotAccountByPuuid } from "@/lib/riot/api";

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

    // Fetch up-to-date data using puuid
    const [summonerData, riotAccountData] = await Promise.all([
      fetchSummonerByPuuid(riotAccount.puuid, riotAccount.region).catch(() => null),
      fetchRiotAccountByPuuid(riotAccount.puuid, riotAccount.region).catch(() => null)
    ]);

    if (!summonerData && !riotAccountData) {
      return NextResponse.json({ message: "Could not fetch data from Riot" }, { status: 404 });
    }

    const updatedAccount = await prisma.riotAccount.update({
      where: { id: riotAccount.id },
      data: {
        profileIconId: summonerData?.profileIconId || riotAccount.profileIconId,
        gameName: riotAccountData?.gameName || riotAccount.gameName,
        tagLine: riotAccountData?.tagLine || riotAccount.tagLine,
      }
    });

    return NextResponse.json({ 
      success: true, 
      account: {
        id: updatedAccount.id,
        gameName: updatedAccount.gameName,
        tagLine: updatedAccount.tagLine,
        region: updatedAccount.region,
        profileIconId: updatedAccount.profileIconId,
        isVerified: updatedAccount.isVerified
      } 
    });

  } catch (error: any) {
    console.error("Refresh API Error:", error);
    return NextResponse.json({ message: "Failed to refresh account data" }, { status: 500 });
  }
}
