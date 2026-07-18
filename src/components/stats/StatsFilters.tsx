"use client";
import React from "react";
import { Role, RoleFilter } from "@/components/notes/RoleFilter";
import { ChampionFilterBlock, MatchupFilters } from "@/components/notes/ChampionFilterBlock";
import { ChampionData } from "@/lib/riot/ddragon";
import { Dropdown } from "@/components/ui/Dropdown";

export interface StatsFilterState {
  season: number | null;
  role: Role | null;
  champions: MatchupFilters;
}

interface StatsFiltersProps {
  filters: StatsFilterState;
  onChange: (newFilters: StatsFilterState) => void;
  championsData: ChampionData[];
}

const SEASONS = [
  { value: null, label: "All Seasons" },
  { value: 16, label: "Season 16" },
  { value: 15, label: "Season 15" },
  { value: 14, label: "Season 14" },
];

export const StatsFilters: React.FC<StatsFiltersProps> = ({ filters, onChange, championsData }) => {
  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/50 pb-5">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-white flex items-center tracking-tight">
            <span className="w-1.5 h-5 bg-red-600 rounded-full mr-3 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
            Filters
          </h3>
          <Dropdown
            options={SEASONS.map(s => ({ value: s.value === null ? "all" : String(s.value), label: s.label }))}
            value={filters.season === null ? "all" : String(filters.season)}
            onChange={(val) => onChange({ ...filters, season: val === "all" ? null : parseInt(val) })}
            className="min-w-[140px]"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <span className="text-sm font-medium text-neutral-400">Role:</span>
          <RoleFilter
            selectedRole={filters.role}
            onChange={(r) => onChange({ ...filters, role: r })}
            allowClear={true}
          />
        </div>
      </div>

      <ChampionFilterBlock
        role={filters.role}
        champions={championsData}
        filters={filters.champions}
        onChange={(cFilters) => onChange({ ...filters, champions: cFilters })}
      />
    </div>
  );
};
