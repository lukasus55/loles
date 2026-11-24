"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { LinkAccountPrompt } from "@/components/account/LinkAccountPrompt";
import { StatsFilters, StatsFilterState } from "./StatsFilters";
import { StatsTable } from "./StatsTable";
import { EnemyChampionsTable } from "./EnemyChampionsTable";
import { GeneralInfo } from "./GeneralInfo";
import { MatchupHeader } from "@/components/notes/editor/MatchupHeader";
import { Role } from "@/components/notes/RoleFilter";
import { ChampionData } from "@/lib/riot/assets";
import { Button } from "@/components/ui/Button";
import { buildMatchupUrl } from "@/lib/matchup/url";
import {
  StatsGroupBy,
  StatsMatchRecord,
  aggregateByPerspective,
  buildTableTitle,
  computeSummaryStats,
  filterMatches,
  getAvailablePerspectives,
  resolveActivePerspective,
} from "@/lib/stats/analytics";

interface StatsClientProps {
  matches: StatsMatchRecord[];
  champions: ChampionData[];
  riotAccount: {
    id: string;
    gameName: string;
    tagLine: string;
    region: string;
  } | null;
  preferredRole?: Role | null;
}

export const StatsClient: React.FC<StatsClientProps> = ({
  matches,
  champions,
  riotAccount,
  preferredRole = null,
}) => {
  const router = useRouter();

  const [filters, setFilters] = useState<StatsFilterState>({
    season: null,
    role: preferredRole,
    champions: {
      myPick: null,
      enemyPick: null,
      mySupp: null,
      enemySupp: null,
    },
  });

  const [requestedPerspective, setRequestedPerspective] = useState<StatsGroupBy | null>(null);

  const isExactMatchup = Boolean(filters.champions.myPick && filters.champions.enemyPick);

  const filteredMatches = useMemo(
    () => filterMatches(matches, filters),
    [matches, filters]
  );

  const roleOnlyMatches = useMemo(
    () =>
      filterMatches(matches, {
        season: filters.season,
        role: filters.role,
        champions: { myPick: null, enemyPick: null, mySupp: null, enemySupp: null },
      }),
    [matches, filters.season, filters.role]
  );

  const availablePerspectives = useMemo(
    () => getAvailablePerspectives(filters.role, filters.champions),
    [filters.role, filters.champions]
  );

  const activePerspective = useMemo(
    () => resolveActivePerspective(requestedPerspective, availablePerspectives),
    [requestedPerspective, availablePerspectives]
  );

  const activePerspectiveMeta = useMemo(
    () => availablePerspectives.find((p) => p.id === activePerspective) ?? null,
    [availablePerspectives, activePerspective]
  );

  const tableData = useMemo(() => {
    if (!activePerspective) return [];
    return aggregateByPerspective(filteredMatches, activePerspective);
  }, [filteredMatches, activePerspective]);

  const tableTitle = useMemo(() => {
    if (!activePerspective) return "";
    return buildTableTitle(activePerspective, filters.role, filters.champions);
  }, [activePerspective, filters.role, filters.champions]);

  const summaryStats = useMemo(
    () => computeSummaryStats(filteredMatches),
    [filteredMatches]
  );

  const enemyTableData = useMemo(() => {
    const dataMap: Record<string, { championName: string; played: number; wins: number }> = {};
    for (const m of roleOnlyMatches) {
      if (!m.enemyChampionName) continue;
      if (!dataMap[m.enemyChampionName]) {
        dataMap[m.enemyChampionName] = {
          championName: m.enemyChampionName,
          played: 0,
          wins: 0,
        };
      }
      dataMap[m.enemyChampionName].played++;
      if (m.win) dataMap[m.enemyChampionName].wins++;
    }
    return Object.values(dataMap);
  }, [roleOnlyMatches]);

  if (!riotAccount) {
    return (
      <div className="flex-1 flex flex-col justify-center p-8 w-full max-w-3xl mx-auto">
        <LinkAccountPrompt />
      </div>
    );
  }

  const handleRowClick = (championName: string) => {
    if (!activePerspective) return;
    setFilters((prev) => ({
      ...prev,
      champions: {
        ...prev.champions,
        [activePerspective]: championName,
      },
    }));
  };

  const handleEnemyQuickPick = (championName: string) => {
    setFilters((prev) => ({
      ...prev,
      champions: {
        ...prev.champions,
        enemyPick: championName,
      },
    }));
  };

  const handleOpenMatchupHub = () => {
    if (!filters.role || !filters.champions.myPick || !filters.champions.enemyPick) return;
    const url = buildMatchupUrl(
      {
        role: filters.role,
        myPick: filters.champions.myPick,
        enemyPick: filters.champions.enemyPick,
        mySupp: filters.champions.mySupp,
        enemySupp: filters.champions.enemySupp,
      },
      { from: "stats" }
    );
    router.push(url);
  };

  const enemySidebarTitle =
    filters.role === "ADC"
      ? "Most Faced Enemy ADCs"
      : filters.role === "SUPP"
      ? "Most Faced Enemy Supports"
      : "Most Faced Opponents";

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500 space-y-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold text-white tracking-tight">Your Analytics</h1>
        <p className="text-neutral-400 text-sm">
          Total tracked matches: <strong className="text-neutral-200">{matches.length}</strong>
          {filteredMatches.length !== matches.length && (
            <span className="ml-2 text-neutral-500">
              • Matching current filters:{" "}
              <strong className="text-neutral-300">{filteredMatches.length}</strong>
            </span>
          )}
        </p>
      </div>

      <StatsFilters filters={filters} onChange={setFilters} championsData={champions} />

      {/* Main Analytics Stage: Exact Matchup Preview + Optional Botlane Partner Breakdown OR Multi-Perspective Table */}
      {isExactMatchup ? (
        <div className="space-y-6">
          <div className="max-w-4xl mx-auto space-y-5">
            <MatchupHeader
              filters={filters.champions}
              role={filters.role}
              champions={champions}
              initialData={{ wins: summaryStats.wins, losses: summaryStats.losses }}
            />
            <div className="flex flex-col items-center">
              <Button
                onClick={handleOpenMatchupHub}
                disabled={!filters.role}
                variant="primary"
                size="lg"
                className="w-full max-w-sm flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                <span>Open Matchup Hub</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              {!filters.role && (
                <p className="text-xs text-neutral-500 text-center mt-2 font-medium">
                  Select a role to open Matchup Hub
                </p>
              )}
            </div>
          </div>

          {/* Botlane partner breakdown directly under 1v1 Matchup Preview */}
          {activePerspective && (
            <div className="h-[420px]">
              <StatsTable
                data={tableData}
                championsData={champions}
                title={tableTitle}
                columnLabel={activePerspectiveMeta?.columnLabel}
                perspectives={availablePerspectives}
                activePerspective={activePerspective}
                onPerspectiveChange={setRequestedPerspective}
                onRowClick={handleRowClick}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="h-[520px]">
          <StatsTable
            data={tableData}
            championsData={champions}
            title={tableTitle}
            columnLabel={activePerspectiveMeta?.columnLabel}
            perspectives={availablePerspectives}
            activePerspective={activePerspective}
            onPerspectiveChange={setRequestedPerspective}
            onRowClick={handleRowClick}
          />
        </div>
      )}

      {/* Bottom Summary & Most Faced Opponents */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-[68%] shrink-0 min-h-[340px]">
          <GeneralInfo
            summary={summaryStats}
            tableData={tableData}
            championsData={champions}
            perspectiveLabel={activePerspectiveMeta?.columnLabel}
            onHighlightClick={activePerspective ? handleRowClick : undefined}
          />
        </div>
        <div className="flex-1 min-h-[340px]">
          <EnemyChampionsTable
            data={enemyTableData}
            championsData={champions}
            title={enemySidebarTitle}
            onRowClick={handleEnemyQuickPick}
          />
        </div>
      </div>
    </div>
  );
};
