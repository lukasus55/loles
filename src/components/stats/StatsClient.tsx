"use client";

import React from "react";
import { GeneralStatsCards } from "./GeneralStatsCards";
import { ChampionPerformanceTable } from "./ChampionPerformanceTable";
import { MatchupInsights } from "./MatchupInsights";
import { LinkAccountPrompt } from "@/components/account/LinkAccountPrompt";

export const StatsClient = ({ data }: { data: any }) => {

  if (!data?.riotAccount) {
    return (
      <div className="flex-1 flex flex-col justify-center p-8 w-full max-w-3xl mx-auto">
        <LinkAccountPrompt />
      </div>
    );
  }

  if (data.totalMatches === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-white mb-4">No Matches Synced</h2>
        <p className="text-neutral-400">You need to sync your matches in the Match History tab before viewing stats.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500 space-y-8">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Your Analytics</h1>
        <p className="text-neutral-400">Stats based on <strong>{data.totalMatches}</strong> matches.</p>
      </div>

      <GeneralStatsCards data={data} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ChampionPerformanceTable champions={data.champions} />
        </div>
        <div className="space-y-8">
          <MatchupInsights matchups={data.matchups} />
        </div>
      </div>
    </div>
  );
};
