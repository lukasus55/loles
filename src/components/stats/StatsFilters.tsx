"use client";
import React from "react";
import { Role, RoleFilter } from "@/components/notes/RoleFilter";
import { ChampionFilterBlock, MatchupFilters } from "@/components/notes/ChampionFilterBlock";
import { ChampionData } from "@/lib/riot/assets";
import { Dropdown } from "@/components/ui/Dropdown";
import { Button } from "@/components/ui/Button";
import { RotateCcw } from "lucide-react";
import { isBotLaneRole } from "@/lib/stats/analytics";

export interface StatsFilterState {
  season: number | null;
  role: Role | null;
  champions: MatchupFilters;
}

interface StatsFiltersProps {
  filters: StatsFilterState;
  onChange: (newFilters: StatsFilterState) => void;
  championsData: ChampionData[];
  totalMatches: number;
  matchingMatches: number;
}

const SEASONS = [
  { value: null, label: "All Seasons" },
  { value: 16, label: "Season 16" },
  { value: 15, label: "Season 15" },
  { value: 14, label: "Season 14" },
];

export const StatsFilters: React.FC<StatsFiltersProps> = ({
  filters,
  onChange,
  championsData,
  totalMatches,
  matchingMatches,
}) => {
  const hasAnyFilter =
    filters.season !== null ||
    filters.role !== null ||
    filters.champions.myPick !== null ||
    filters.champions.enemyPick !== null ||
    filters.champions.mySupp !== null ||
    filters.champions.enemySupp !== null;

  const handleRoleChange = (nextRole: Role | null) => {
    const switchingBetweenConcreteRoles =
      filters.role !== null && nextRole !== null && filters.role !== nextRole;

    if (switchingBetweenConcreteRoles) {
      onChange({
        ...filters,
        role: nextRole,
        champions: { myPick: null, enemyPick: null, mySupp: null, enemySupp: null },
      });
      return;
    }

    if (!isBotLaneRole(nextRole)) {
      onChange({
        ...filters,
        role: nextRole,
        champions: {
          ...filters.champions,
          mySupp: null,
          enemySupp: null,
        },
      });
      return;
    }

    onChange({ ...filters, role: nextRole });
  };

  const handleReset = () => {
    onChange({
      season: null,
      role: null,
      champions: { myPick: null, enemyPick: null, mySupp: null, enemySupp: null },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-neutral-800/70">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Your Analytics
          </h1>
          <p className="text-xs text-neutral-500 mt-1 tabular-nums">
            <span className="text-neutral-300 font-medium">{totalMatches}</span> tracked matches
            {matchingMatches !== totalMatches && (
              <span>
                {" "}
                · <span className="text-neutral-300 font-medium">{matchingMatches}</span> matching
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {hasAnyFilter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-9 px-2.5 text-xs text-neutral-400 hover:text-white gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
          )}

          <Dropdown
            options={SEASONS.map((s) => ({
              value: s.value === null ? "all" : String(s.value),
              label: s.label,
            }))}
            value={filters.season === null ? "all" : String(filters.season)}
            onChange={(val) =>
              onChange({ ...filters, season: val === "all" ? null : parseInt(val, 10) })
            }
            className="h-9 min-w-[130px] bg-neutral-900/60 border-neutral-800/80 text-xs"
          />

          <RoleFilter
            selectedRole={filters.role}
            onChange={handleRoleChange}
            allowClear={true}
          />
        </div>
      </div>

      <div className="pb-4 border-b border-neutral-800/60">
        <ChampionFilterBlock
          role={filters.role}
          champions={championsData}
          filters={filters.champions}
          onChange={(cFilters) => onChange({ ...filters, champions: cFilters })}
        />
      </div>
    </div>
  );
};
