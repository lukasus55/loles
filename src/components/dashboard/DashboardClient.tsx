"use client";
import React, { useState } from "react";
import { ChampionData } from "@/lib/riot/ddragon";
import { RoleFilter, Role } from "./RoleFilter";
import { ChampionFilterBlock, MatchupFilters } from "./ChampionFilterBlock";
import { NotebookPen, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface DashboardClientProps {
  champions: ChampionData[];
}

export const DashboardClient: React.FC<DashboardClientProps> = ({ champions }) => {
  const [role, setRole] = useState<Role>("TOP");
  const [filters, setFilters] = useState<MatchupFilters>({
    myPick: null,
    enemyPick: null,
    mySupp: null,
    enemySupp: null,
  });

  const handleRoleChange = (newRole: Role) => {
    if (role === newRole) return;
    setRole(newRole);
    // Reset champion filters when switching roles
    setFilters({ myPick: null, enemyPick: null, mySupp: null, enemySupp: null });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Filters Section */}
      <div className="flex flex-col gap-6">
        <ChampionFilterBlock
          role={role}
          onRoleChange={handleRoleChange}
          champions={champions}
          filters={filters}
          onChange={setFilters}
        />
      </div>

      {/* Notes List Section */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden min-h-[400px] shadow-sm">
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/40">
          <h2 className="text-xl font-bold text-white flex items-center tracking-tight">
            <span className="w-1.5 h-6 bg-red-600 rounded-full mr-3 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
            Your Notes
          </h2>
          <Link href="/note/new">
            <Button className="flex items-center gap-2 shadow-sm" size="sm">
              <Plus className="w-4 h-4" />
              Add Note
            </Button>
          </Link>
        </div>

        <div className="p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-neutral-950 border border-neutral-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <span className="text-3xl opacity-50"><NotebookPen /></span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No notes found</h3>
          <p className="text-neutral-400 max-w-sm mb-8">
            You haven&apos;t added any notes matching these filters yet. Start tracking your matchups!
          </p>
          <Link href="/note/new">
            <Button variant="outline" className="px-8">Create your first note</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
