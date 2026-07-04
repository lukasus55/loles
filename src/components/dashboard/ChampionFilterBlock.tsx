"use client";
import React from "react";
import { Role, RoleFilter } from "./RoleFilter";
import { ChampionData } from "@/lib/riot/ddragon";
import { ChampionSelect } from "../ui/ChampionSelect";

export interface MatchupFilters {
  myPick: string | null;
  enemyPick: string | null;
  mySupp: string | null;
  enemySupp: string | null;
}

interface ChampionFilterBlockProps {
  role: Role;
  onRoleChange?: (role: Role) => void;
  champions: ChampionData[];
  filters: MatchupFilters;
  onChange: (newFilters: MatchupFilters) => void;
}

export const ChampionFilterBlock: React.FC<ChampionFilterBlockProps> = ({
  role,
  onRoleChange,
  champions,
  filters,
  onChange,
}) => {
  const isBotLane = role === "ADC" || role === "SUPP";

  const updateFilter = (key: keyof MatchupFilters, value: string | null) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-4 border-b border-neutral-800/50 pb-4">
        <h3 className="text-lg font-bold text-white flex items-center tracking-tight">
          <span className="w-1.5 h-5 bg-red-600 rounded-full mr-3 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
          Matchup Configuration
        </h3>

        {onRoleChange && (
          <RoleFilter selectedRole={role} onChange={onRoleChange} />
        )}
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 ${isBotLane ? 'lg:grid-cols-4' : ''}`}>
        {/* Highlighted "My Pick" block */}
        <div className="space-y-4 relative">
          <ChampionSelect
            label="My Pick (Primary)"
            champions={champions}
            value={filters.myPick}
            onChange={(val) => updateFilter("myPick", val)}
            placeholder={`Select ${role === 'ADC' ? 'ADC' : role === 'SUPP' ? 'Support' : 'Pick'}`}
            buttonClassName="border-red-900/80 bg-gradient-to-br from-red-950/40 to-neutral-900 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
          />
        </div>

        {isBotLane && (
          <div className="space-y-4 relative">
            <ChampionSelect
              label={`My ${role === 'ADC' ? 'Support' : 'ADC'}`}
              champions={champions}
              value={filters.mySupp}
              onChange={(val) => updateFilter("mySupp", val)}
              placeholder={`Select ${role === 'ADC' ? 'Support' : 'ADC'}`}
            />
          </div>
        )}

        <div className="space-y-4 relative">
          <ChampionSelect
            label={`Enemy ${role === 'ADC' ? 'ADC' : role === 'SUPP' ? 'Support' : 'Pick'}`}
            champions={champions}
            value={filters.enemyPick}
            onChange={(val) => updateFilter("enemyPick", val)}
            placeholder={`Select ${role === 'ADC' ? 'ADC' : role === 'SUPP' ? 'Support' : 'champion'}`}
          />
        </div>

        {isBotLane && (
          <div className="space-y-4 relative">
            <ChampionSelect
              label={`Enemy ${role === 'ADC' ? 'Support' : 'ADC'}`}
              champions={champions}
              value={filters.enemySupp}
              onChange={(val) => updateFilter("enemySupp", val)}
              placeholder={`Select ${role === 'ADC' ? 'Support' : 'ADC'}`}
            />
          </div>
        )}
      </div>
    </div>
  );
};
