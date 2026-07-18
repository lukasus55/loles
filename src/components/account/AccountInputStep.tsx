"use client";
import React from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Dropdown } from "@/components/ui/Dropdown";

interface AccountInputStepProps {
  gameName: string;
  setGameName: (val: string) => void;
  tagLine: string;
  setTagLine: (val: string) => void;
  region: string;
  setRegion: (val: string) => void;
  onLink: () => void;
  isLoading: boolean;
}

export const AccountInputStep: React.FC<AccountInputStepProps> = ({
  gameName,
  setGameName,
  tagLine,
  setTagLine,
  region,
  setRegion,
  onLink,
  isLoading
}) => {
  const REGIONS = [
    { value: "EUW1", label: "EUW" },
    { value: "EUN1", label: "EUNE" },
    { value: "NA1", label: "NA" },
    { value: "KR", label: "KR" },
    { value: "BR1", label: "BR" },
    { value: "LA1", label: "LAN" },
    { value: "LA2", label: "LAS" },
    { value: "OC1", label: "OCE" },
    { value: "TR1", label: "TR" },
    { value: "RU", label: "RU" },
    { value: "JP1", label: "JP" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Game Name</label>
          <input 
            type="text" 
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="e.g. Faker" 
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-shadow"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Tagline</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">#</span>
            <input 
              type="text" 
              value={tagLine}
              onChange={(e) => setTagLine(e.target.value)}
              placeholder="e.g. T1" 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-shadow"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Region</label>
          <Dropdown
            options={REGIONS}
            value={region}
            onChange={setRegion}
            className="w-full py-3"
            wrapperClassName="block w-full"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onLink} disabled={isLoading} className="px-8 min-w-[160px] flex items-center justify-center">
          {isLoading ? <Spinner size="sm" className="mr-2" /> : "Link Account"}
        </Button>
      </div>
    </div>
  );
};
