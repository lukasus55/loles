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
  role: Role | null;
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
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 ${isBotLane ? 'lg:grid-cols-4' : ''}`}>
      {/* Highlighted "My Pick" block */}
      <div className="space-y-4 relative">
        <ChampionSelect 
          label="My Pick (Primary)"
          champions={champions}
          value={filters.myPick}
          onChange={(val) => updateFilter("myPick", val)}
          placeholder={`Select ${role === 'ADC' ? 'ADC' : role === 'SUPP' ? 'Support' : 'Pick'}`}
          buttonClassName="border-red-900/80 bg-gradient-to-br from-red-950/40 to-neutral-900 shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20"
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
  );
};
