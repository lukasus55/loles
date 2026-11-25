"use client";
import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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

export const AccountInputStep: React.FC<AccountInputStepProps> = ({
  gameName,
  setGameName,
  tagLine,
  setTagLine,
  region,
  setRegion,
  onLink,
  isLoading,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        <div className="md:col-span-2">
          <Input
            label="Game Name"
            type="text"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="e.g. Faker"
            className="bg-neutral-950/70"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-300 block">Tagline</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-semibold text-sm pointer-events-none">
              #
            </span>
            <Input
              type="text"
              value={tagLine}
              onChange={(e) => setTagLine(e.target.value)}
              placeholder="e.g. T1"
              className="pl-7 bg-neutral-950/70"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-300 block">Region</label>
          <Dropdown
            options={REGIONS}
            value={region}
            onChange={setRegion}
            className="w-full h-10 bg-neutral-950/70"
            wrapperClassName="block w-full"
          />
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button onClick={onLink} disabled={isLoading} size="sm" className="px-5">
          {isLoading ? <Spinner size="sm" className="mr-1.5" /> : "Link Account"}
        </Button>
      </div>
    </div>
  );
};
