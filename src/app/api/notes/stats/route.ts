import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const myPick = searchParams.get("myPick");
    const enemyPick = searchParams.get("enemyPick");
    
    if (!role || !myPick || !enemyPick) {
      return NextResponse.json({ message: "Missing required parameters" }, { status: 400 });
    }

    // Role mapping from DB (TOP, JGL, MID, ADC, SUPP) to Riot API roles
    const roleMapping: Record<string, string> = {
      TOP: "TOP",
      JGL: "JUNGLE",
      MID: "MIDDLE",
      ADC: "BOTTOM",
      SUPP: "UTILITY"
    };

    const riotRole = roleMapping[role.toUpperCase()] || "UNKNOWN";

    const whereClause: any = {
      userId: session.user.id,
      role: riotRole,
      championName: myPick,
      enemyChampionName: enemyPick
    };

    if (role === "ADC" || role === "SUPP") {
      const partnerPick = searchParams.get("mySupp");
      const enemyPartnerPick = searchParams.get("enemySupp");
      if (partnerPick) whereClause.partnerChampionName = partnerPick;
      if (enemyPartnerPick) whereClause.enemyPartnerChampionName = enemyPartnerPick;
    }

    const matches = await prisma.match.findMany({
      where: whereClause,
      select: {
        win: true,
        csAt15: true,
        enemyCsAt15: true,
        goldAt15: true,
        enemyGoldAt15: true,
        laneKills: true,
        enemyLaneKills: true
      }
    });

    if (matches.length === 0) {
      return NextResponse.json({ 
        hasData: false, 
        message: "No historical matches found for this specific matchup." 
      });
    }

    const totalGames = matches.length;
    let wins = 0;
    let totalCsDiff = 0;
    let totalGoldDiff = 0;
    let validEarlyGameMatches = 0;
    let totalMyLaneKills = 0;
    let totalEnemyLaneKills = 0;

    matches.forEach(m => {
      if (m.win) wins++;
      
      if (m.csAt15 !== null && m.enemyCsAt15 !== null) {
        validEarlyGameMatches++;
        totalCsDiff += (m.csAt15 - m.enemyCsAt15);
        totalGoldDiff += ((m.goldAt15 || 0) - (m.enemyGoldAt15 || 0));
        totalMyLaneKills += (m.laneKills || 0);
        totalEnemyLaneKills += (m.enemyLaneKills || 0);
      }
    });

    const winRate = (wins / totalGames) * 100;
    const totalLaneKills = totalMyLaneKills + totalEnemyLaneKills;
    const killRate = totalLaneKills > 0 ? (totalMyLaneKills / totalLaneKills) * 100 : 50;
    const avgCsDiff = validEarlyGameMatches > 0 ? (totalCsDiff / validEarlyGameMatches) : 0;
    const avgGoldDiff = validEarlyGameMatches > 0 ? (totalGoldDiff / validEarlyGameMatches) : 0;

    return NextResponse.json({
      hasData: true,
      totalGames,
      validEarlyGameMatches,
      stats: {
        winRate,
        killRate,
        csDiffAt15: avgCsDiff,
        goldDiffAt15: avgGoldDiff
      }
    });

  } catch (error) {
    console.error("Matchup Stats Error:", error);
    return NextResponse.json({ message: "Failed to fetch stats" }, { status: 500 });
  }
}
