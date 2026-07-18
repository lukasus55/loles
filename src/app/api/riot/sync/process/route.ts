import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { fetchMatchDetails, fetchMatchTimeline } from "@/lib/riot/api";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const matchIds: string[] = body.matchIds;

    if (!matchIds || !Array.isArray(matchIds) || matchIds.length === 0) {
      return NextResponse.json({ message: "No matchIds provided" }, { status: 400 });
    }

    const riotAccount = await prisma.riotAccount.findUnique({
      where: { userId: session.user.id }
    });

    if (!riotAccount) {
      return NextResponse.json({ message: "No Riot account linked" }, { status: 400 });
    }

    let syncedCount = 0;

    // Process exactly the matches requested
    for (const matchId of matchIds) {
      try {
        // Double check it doesn't already exist to be completely safe
        const existing = await prisma.match.findUnique({
          where: { 
            matchId_userId: {
              matchId,
              userId: session.user.id
            }
          }
        });
        if (existing) continue;

        const matchData = await fetchMatchDetails(matchId, riotAccount.region);
        
        // Ensure it's a valid match with participants
        if (!matchData?.info?.participants) continue;

        const p = matchData.info.participants.find((p: any) => p.puuid === riotAccount.puuid);
        if (!p) continue;

        const role = p.teamPosition || "UNKNOWN";

        // Find enemy opponent
        let enemyChampionName = null;
        let partnerChampionName = null;
        let enemyPartnerChampionName = null;

        if (role !== "UNKNOWN") {
          const enemy = matchData.info.participants.find(
            (ep: any) => ep.teamPosition === role && ep.teamId !== p.teamId
          );
          if (enemy) {
            enemyChampionName = enemy.championName;
          }

          // Bot lane specific: extract support/adc partners
          if (role === "BOTTOM" || role === "UTILITY") {
            const partnerRole = role === "BOTTOM" ? "UTILITY" : "BOTTOM";
            
            const partner = matchData.info.participants.find(
              (ap: any) => ap.teamPosition === partnerRole && ap.teamId === p.teamId
            );
            if (partner) partnerChampionName = partner.championName;

            const enemyPartner = matchData.info.participants.find(
              (ep: any) => ep.teamPosition === partnerRole && ep.teamId !== p.teamId
            );
            if (enemyPartner) enemyPartnerChampionName = enemyPartner.championName;
          }
        }

        let csAt15 = null;
        let goldAt15 = null;
        let laneKills = null;
        let enemyCsAt15 = null;
        let enemyGoldAt15 = null;
        let enemyLaneKills = null;

        if (enemyChampionName && matchData.info.gameDuration >= 15 * 60) {
          try {
            const timelineData = await fetchMatchTimeline(matchId, riotAccount.region);
            if (timelineData?.info?.frames) {
              const frames = timelineData.info.frames;
              const frame15 = frames[15];
              
              if (frame15?.participantFrames) {
                const enemy = matchData.info.participants.find(
                  (ep: any) => ep.teamPosition === role && ep.teamId !== p.teamId
                );
                
                if (enemy) {
                  const myFrame = frame15.participantFrames[p.participantId.toString()];
                  const enemyFrame = frame15.participantFrames[enemy.participantId.toString()];
                  
                  if (myFrame) {
                    csAt15 = (myFrame.minionsKilled || 0) + (myFrame.jungleMinionsKilled || 0);
                    goldAt15 = myFrame.totalGold || 0;
                  }
                  if (enemyFrame) {
                    enemyCsAt15 = (enemyFrame.minionsKilled || 0) + (enemyFrame.jungleMinionsKilled || 0);
                    enemyGoldAt15 = enemyFrame.totalGold || 0;
                  }

                  let myKills = 0;
                  let oppKills = 0;

                  const myTeamIds = [p.participantId];
                  const enemyTeamIds = [enemy.participantId];

                  if (role === "BOTTOM" || role === "UTILITY") {
                    const partnerRole = role === "BOTTOM" ? "UTILITY" : "BOTTOM";
                    const partner = matchData.info.participants.find((ap: any) => ap.teamPosition === partnerRole && ap.teamId === p.teamId);
                    const enemyPartner = matchData.info.participants.find((ep: any) => ep.teamPosition === partnerRole && ep.teamId !== p.teamId);
                    if (partner) myTeamIds.push(partner.participantId);
                    if (enemyPartner) enemyTeamIds.push(enemyPartner.participantId);
                  }

                  const maxFrames = Math.min(15, frames.length);
                  for (let i = 0; i < maxFrames; i++) {
                    const events = frames[i].events || [];
                    for (const event of events) {
                      if (event.type === "CHAMPION_KILL") {
                        if (myTeamIds.includes(event.killerId) && enemyTeamIds.includes(event.victimId)) {
                          myKills++;
                        } else if (enemyTeamIds.includes(event.killerId) && myTeamIds.includes(event.victimId)) {
                          oppKills++;
                        }
                      }
                    }
                  }

                  laneKills = myKills;
                  enemyLaneKills = oppKills;
                }
              }
            }
          } catch (e) {
             console.error(`Timeline fetch failed for ${matchId}`, e);
          }
        }

        await prisma.match.create({
          data: {
            matchId,
            userId: session.user.id,
            puuid: riotAccount.puuid,
            season: 16, // Hardcoded season 16 as requested
            gameCreation: new Date(matchData.info.gameCreation),
            gameDuration: matchData.info.gameDuration,
            queueId: matchData.info.queueId,
            championId: p.championId,
            championName: p.championName,
            role,
            win: p.win,
            kills: p.kills,
            deaths: p.deaths,
            assists: p.assists,
            cs: (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0),
            goldEarned: p.goldEarned || null,
            totalDamageDealtToChampions: p.totalDamageDealtToChampions || null,
            visionScore: p.visionScore || null,
            enemyChampionName,
            partnerChampionName,
            enemyPartnerChampionName,
            csAt15,
            goldAt15,
            laneKills,
            enemyCsAt15,
            enemyGoldAt15,
            enemyLaneKills
          }
        });

        syncedCount++;
      } catch (e) {
        console.error(`Failed to process match ${matchId}:`, e);
      }
    }

    return NextResponse.json({ success: true, processedCount: syncedCount });
  } catch (error: any) {
    console.error("Sync Process API Error:", error);
    return NextResponse.json({ message: "Failed to process matches" }, { status: 500 });
  }
}
