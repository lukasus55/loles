import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { fetchRiotAccount, fetchSummonerByPuuid } from "@/lib/riot/api";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action, gameName, tagLine, region, targetIconId } = body;

    if (!gameName || !tagLine || !region) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (action === "LINK") {
      const accountData = await fetchRiotAccount(gameName, tagLine, region);
      const summonerData = await fetchSummonerByPuuid(accountData.puuid, region);
      
      await prisma.riotAccount.deleteMany({
        where: { userId: session.user.id }
      });

      const newRiotAccount = await prisma.riotAccount.create({
        data: {
          userId: session.user.id,
          puuid: accountData.puuid,
          gameName: accountData.gameName || gameName,
          tagLine: accountData.tagLine || tagLine,
          region,
          profileIconId: summonerData.profileIconId,
          isVerified: false
        }
      });
      return NextResponse.json({ success: true, account: newRiotAccount });
    }

    if (action === "START_VERIFY") {
      const accountData = await fetchRiotAccount(gameName, tagLine, region);
      const summonerData = await fetchSummonerByPuuid(accountData.puuid, region);
      
      let newTargetIconId = Math.floor(Math.random() * 28) + 1;
      if (newTargetIconId === summonerData.profileIconId) {
         newTargetIconId = (newTargetIconId % 28) + 1;
      }
      
      return NextResponse.json({ 
        puuid: accountData.puuid,
        currentIconId: summonerData.profileIconId,
        expectedIconId: newTargetIconId
      });
    }

    if (action === "VERIFY") {
      const accountData = await fetchRiotAccount(gameName, tagLine, region);
      const summonerData = await fetchSummonerByPuuid(accountData.puuid, region);
      
      if (summonerData.profileIconId === targetIconId) {
        // Verified!
        const updatedAccount = await prisma.riotAccount.update({
          where: { userId: session.user.id },
          data: {
            isVerified: true,
            profileIconId: summonerData.profileIconId
          }
        });

        return NextResponse.json({ success: true, account: updatedAccount });
      } else {
        return NextResponse.json({ 
          success: false, 
          message: "Icon does not match.",
          foundIconId: summonerData.profileIconId,
          expectedIconId: targetIconId
        }, { status: 400 });
      }
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    console.error("Riot Verification Error:", e);
    return NextResponse.json({ message: e.message || "Failed to communicate with Riot API" }, { status: 500 });
  }
}
