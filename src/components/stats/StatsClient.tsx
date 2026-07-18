"use client";

import React, { useState, useMemo } from "react";
import { LinkAccountPrompt } from "@/components/account/LinkAccountPrompt";
import { StatsFilters, StatsFilterState } from "./StatsFilters";
import { StatsTable, StatRowData } from "./StatsTable";
import { useRouter } from "next/navigation";
import { MatchupHeader } from "@/components/notes/editor/MatchupHeader";
import { EnemyChampionsTable } from "./EnemyChampionsTable";
import { GeneralInfo } from "./GeneralInfo";
import { ChampionData } from "@/lib/riot/ddragon";
import { FileEdit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const StatsClient = ({ matches, champions, riotAccount }: { matches: any[], champions: ChampionData[], riotAccount: any }) => {
  const router = useRouter();
  const [isOpeningNote, setIsOpeningNote] = useState(false);

  const [filters, setFilters] = useState<StatsFilterState>({
    season: null,
    role: null,
    champions: {
      myPick: null,
      enemyPick: null,
      mySupp: null,
      enemySupp: null,
    }
  });

  const isExactMatchup = filters.champions.myPick && filters.champions.enemyPick;

  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      if (filters.season && m.season !== filters.season) return false;
      if (filters.role) {
        const dbRoleMap: Record<string, string> = { "TOP": "TOP", "JGL": "JUNGLE", "MID": "MIDDLE", "ADC": "BOTTOM", "SUPP": "UTILITY" };
        if (m.role !== dbRoleMap[filters.role]) return false;
      }
      return true;
    });
  }, [matches, filters.season, filters.role]);

  const { tableData, tableTitle } = useMemo(() => {
    const dataMap: Record<string, StatRowData> = {};

    if (!filters.champions.myPick && !filters.champions.enemyPick) {
      // Focus: Your Champions
      filteredMatches.forEach(m => {
        if (!m.championName) return;
        if (!dataMap[m.championName]) {
          dataMap[m.championName] = { championName: m.championName, played: 0, wins: 0, kills: 0, deaths: 0, assists: 0, cs: 0, gameDuration: 0 };
        }
        dataMap[m.championName].played++;
        if (m.win) dataMap[m.championName].wins++;
        dataMap[m.championName].kills += m.kills || 0;
        dataMap[m.championName].deaths += m.deaths || 0;
        dataMap[m.championName].assists += m.assists || 0;
        dataMap[m.championName].cs += m.cs || 0;
        dataMap[m.championName].gameDuration += m.gameDuration || 0;
      });
      return { tableData: Object.values(dataMap), tableTitle: "Your Champions" };

    } else if (filters.champions.myPick && !filters.champions.enemyPick) {
      // Focus: Matchups FOR your pick (Group by enemy)
      filteredMatches.forEach(m => {
        if (m.championName !== filters.champions.myPick || !m.enemyChampionName) return;
        if (!dataMap[m.enemyChampionName]) {
          dataMap[m.enemyChampionName] = { championName: m.enemyChampionName, played: 0, wins: 0, kills: 0, deaths: 0, assists: 0, cs: 0, gameDuration: 0 };
        }
        dataMap[m.enemyChampionName].played++;
        if (m.win) dataMap[m.enemyChampionName].wins++;
        dataMap[m.enemyChampionName].kills += m.kills || 0;
        dataMap[m.enemyChampionName].deaths += m.deaths || 0;
        dataMap[m.enemyChampionName].assists += m.assists || 0;
        dataMap[m.enemyChampionName].cs += m.cs || 0;
        dataMap[m.enemyChampionName].gameDuration += m.gameDuration || 0;
      });
      return { tableData: Object.values(dataMap), tableTitle: `Matchups playing as ${filters.champions.myPick}` };

    } else if (!filters.champions.myPick && filters.champions.enemyPick) {
      // Focus: Your Champions VS enemy pick (Group by my pick)
      filteredMatches.forEach(m => {
        if (m.enemyChampionName !== filters.champions.enemyPick || !m.championName) return;
        if (!dataMap[m.championName]) {
          dataMap[m.championName] = { championName: m.championName, played: 0, wins: 0, kills: 0, deaths: 0, assists: 0, cs: 0, gameDuration: 0 };
        }
        dataMap[m.championName].played++;
        if (m.win) dataMap[m.championName].wins++;
        dataMap[m.championName].kills += m.kills || 0;
        dataMap[m.championName].deaths += m.deaths || 0;
        dataMap[m.championName].assists += m.assists || 0;
        dataMap[m.championName].cs += m.cs || 0;
        dataMap[m.championName].gameDuration += m.gameDuration || 0;
      });
      return { tableData: Object.values(dataMap), tableTitle: `Your Champions vs ${filters.champions.enemyPick}` };
    }

    return { tableData: [], tableTitle: "" };
  }, [filteredMatches, filters.champions.myPick, filters.champions.enemyPick]);

  if (!riotAccount) {
    return (
      <div className="flex-1 flex flex-col justify-center p-8 w-full max-w-3xl mx-auto">
        <LinkAccountPrompt />
      </div>
    );
  }

  const handleRowClick = (championName: string) => {
    if (!filters.champions.myPick && !filters.champions.enemyPick) {
      setFilters({ ...filters, champions: { ...filters.champions, myPick: championName } });
    } else if (filters.champions.myPick && !filters.champions.enemyPick) {
      setFilters({ ...filters, champions: { ...filters.champions, enemyPick: championName } });
    } else if (!filters.champions.myPick && filters.champions.enemyPick) {
      setFilters({ ...filters, champions: { ...filters.champions, myPick: championName } });
    }
  };

  const calculateTotalWinsLosses = () => {
    if (!isExactMatchup) return { wins: 0, losses: 0 };
    let w = 0, l = 0;
    filteredMatches.forEach(m => {
      if (m.championName === filters.champions.myPick && m.enemyChampionName === filters.champions.enemyPick) {
        if (m.win) w++; else l++;
      }
    });
    return { wins: w, losses: l };
  };

  const handleOpenNote = async () => {
    if (!filters.role || !filters.champions.myPick || !filters.champions.enemyPick) return;
    setIsOpeningNote(true);
    try {
      const res = await fetch("/api/notes/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: filters.role,
          myPick: filters.champions.myPick,
          enemyPick: filters.champions.enemyPick,
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          router.push(`/note/${data.noteId}/edit?from=stats`);
        } else {
          const params = new URLSearchParams({
            role: filters.role,
            myPick: filters.champions.myPick,
            enemyPick: filters.champions.enemyPick,
            from: "stats",
          });
          router.push(`/note/new?${params.toString()}`);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsOpeningNote(false);
    }
  };

  const enemyTableData = useMemo(() => {
    const dataMap: Record<string, { championName: string, played: number, wins: number }> = {};
    matches.forEach(m => {
      if (!m.enemyChampionName) return;
      if (!dataMap[m.enemyChampionName]) {
        dataMap[m.enemyChampionName] = { championName: m.enemyChampionName, played: 0, wins: 0 };
      }
      dataMap[m.enemyChampionName].played++;
      if (m.win) dataMap[m.enemyChampionName].wins++;
    });
    return Object.values(dataMap);
  }, [matches]);

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500 space-y-8">
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Your Analytics</h1>
        <p className="text-neutral-400">Total tracked matches: <strong>{matches.length}</strong></p>
      </div>

      <StatsFilters filters={filters} onChange={setFilters} championsData={champions} />

      <div className="mt-8 h-[520px]">
        {isExactMatchup ? (
          <div className="max-w-4xl mx-auto h-full flex flex-col justify-center items-center">
            <div className="w-full">
              <MatchupHeader
                filters={filters.champions}
                role={filters.role}
                champions={champions}
                initialData={calculateTotalWinsLosses()}
              />
            </div>
            <div className="mt-12">
              <Button
                onClick={handleOpenNote}
                disabled={isOpeningNote || !filters.role}
                variant="primary"
                size="lg"
                className="group w-full max-w-sm mx-auto flex items-center justify-center gap-2"
              >
                {isOpeningNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileEdit className="w-4 h-4" />}
                {isOpeningNote ? "Opening..." : "Open Note for this Matchup"}
              </Button>
              {!filters.role && (
                <p className="text-xs text-neutral-500 text-center mt-3 font-medium">Select a role to open note</p>
              )}
            </div>
          </div>
        ) : (
          <StatsTable
            data={tableData}
            championsData={champions}
            title={tableTitle}
            onRowClick={handleRowClick}
          />
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-[70%] shrink-0 h-[400px]">
          <GeneralInfo />
        </div>
        <div className="flex-1 h-[400px]">
          <EnemyChampionsTable data={enemyTableData} championsData={champions} />
        </div>
      </div>
    </div>
  );
};
