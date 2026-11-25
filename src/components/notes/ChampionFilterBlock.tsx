"use client";
import React from "react";
import { Role } from "./RoleFilter";
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
  champions,
  filters,
  onChange,
}) => {
  const isBotLane = role === "ADC" || role === "SUPP";

  const updateFilter = (key: keyof MatchupFilters, value: string | null) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 ${
        isBotLane ? "lg:grid-cols-4" : ""
      }`}
    >
      <ChampionSelect
        label="My Pick"
        champions={champions}
        value={filters.myPick}
        onChange={(val) => updateFilter("myPick", val)}
        placeholder={`Select ${
          role === "ADC" ? "ADC" : role === "SUPP" ? "Support" : "champion"
        }`}
        buttonClassName="border-accent/45 bg-accent/[0.06] hover:bg-accent/[0.09]"
      />

      {isBotLane && (
        <ChampionSelect
          label={`My ${role === "ADC" ? "Support" : "ADC"}`}
          champions={champions}
          value={filters.mySupp}
          onChange={(val) => updateFilter("mySupp", val)}
          placeholder={`Select ${role === "ADC" ? "Support" : "ADC"}`}
        />
      )}

      <ChampionSelect
        label={`Enemy ${role === "ADC" ? "ADC" : role === "SUPP" ? "Support" : "Pick"}`}
        champions={champions}
        value={filters.enemyPick}
        onChange={(val) => updateFilter("enemyPick", val)}
        placeholder={`Select ${
          role === "ADC" ? "ADC" : role === "SUPP" ? "Support" : "champion"
        }`}
      />

      {isBotLane && (
        <ChampionSelect
          label={`Enemy ${role === "ADC" ? "Support" : "ADC"}`}
          champions={champions}
          value={filters.enemySupp}
          onChange={(val) => updateFilter("enemySupp", val)}
          placeholder={`Select ${role === "ADC" ? "Support" : "ADC"}`}
        />
      )}
    </div>
  );
};
