"use client";
import React, { useState } from "react";
import { ChampionData } from "@/lib/riot/ddragon";
import { RoleFilter, Role } from "./RoleFilter";
import { ChampionFilterBlock, MatchupFilters } from "./ChampionFilterBlock";
import { NotebookPen, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { NoteCard, MatchupNoteDTO } from "./NoteCard";

interface DashboardClientProps {
  champions: ChampionData[];
  initialNotes: MatchupNoteDTO[];
}

export const DashboardClient: React.FC<DashboardClientProps> = ({ champions, initialNotes }) => {
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

  const filteredNotes = initialNotes.filter((note) => {
    if (note.role !== role) return false;
    if (filters.myPick && note.myChampion !== filters.myPick) return false;
    if (filters.enemyPick && note.enemyChampion !== filters.enemyPick) return false;
    if (role === "ADC" || role === "SUPP") {
      if (filters.mySupp && note.mySupport !== filters.mySupp) return false;
      if (filters.enemySupp && note.enemySupport !== filters.enemySupp) return false;
    }
    return true;
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden min-h-[400px] shadow-sm">
        {/* Top Header Row */}
        <div className="p-4 sm:px-6 border-b border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/40">
          <h2 className="text-xl font-bold text-white flex items-center tracking-tight">
            <span className="w-1.5 h-6 bg-red-600 rounded-full mr-3 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
            Your Notes
          </h2>
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full md:w-auto">
            <RoleFilter selectedRole={role} onChange={handleRoleChange} />
            <Link href="/note/new" className="shrink-0">
              <Button className="flex items-center gap-2 shadow-sm" size="sm">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Note</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Configuration Row */}
        <div className="p-4 sm:px-6 border-b border-neutral-800 bg-neutral-950/30">
          <ChampionFilterBlock
            role={role}
            champions={champions}
            filters={filters}
            onChange={setFilters}
          />
        </div>

        <div className="p-6">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20">
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in">
              {filteredNotes.map((note) => (
                <NoteCard key={note.id} note={note} champions={champions} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
