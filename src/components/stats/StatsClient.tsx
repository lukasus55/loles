"use client";

import React, { useEffect, useState } from "react";
import { GeneralStatsCards } from "./GeneralStatsCards";
import { ChampionPerformanceTable } from "./ChampionPerformanceTable";
import { MatchupInsights } from "./MatchupInsights";
import { Spinner } from "@/components/ui/Spinner";
import { AlertCircle } from "lucide-react";

export const StatsClient = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then(r => {
        if (!r.ok) throw new Error("Failed to load stats");
        return r.json();
      })
      .then(d => {
        setData(d);
        setIsLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[50vh]">
        <Spinner size="lg" className="text-red-600 mb-4" />
        <p className="text-neutral-400">Crunching your numbers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Stats</h2>
          <p className="text-neutral-400">{error}</p>
        </div>
      </div>
    );
  }

  if (data?.totalMatches === 0 || !data?.riotAccount) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-white mb-4">No Data Available</h2>
        <p className="text-neutral-400">You need to link your Riot Account and sync your matches in the Match History tab before viewing stats.</p>
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
