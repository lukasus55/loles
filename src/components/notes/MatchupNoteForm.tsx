"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/components/dashboard/RoleFilter";
import { ChampionFilterBlock, MatchupFilters } from "@/components/dashboard/ChampionFilterBlock";
import { ChampionData } from "@/lib/riot/ddragon";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Save, AlertTriangle, Trash2 } from "lucide-react";
import Link from "next/link";
import dynamic from 'next/dynamic';
import { Spinner } from "@/components/ui/Spinner";
import { RoleFilter } from "@/components/dashboard/RoleFilter";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface MatchupNoteFormProps {
  mode: "create" | "edit";
  champions: ChampionData[];
  initialData?: {
    id: string;
    role: Role;
    myChampion: string;
    enemyChampion: string;
    mySupport: string | null;
    enemySupport: string | null;
    prio: string | null;
    notes: string;
  };
  initialFilters?: MatchupFilters & { role?: Role };
}

const PRIO_OPTIONS = ["Yes", "50/50", "No", "N/A"];

export const MatchupNoteForm: React.FC<MatchupNoteFormProps> = ({ mode, champions, initialData, initialFilters }) => {
  const router = useRouter();
  const [role, setRole] = useState<Role>(initialData?.role || initialFilters?.role || "TOP");
  const [filters, setFilters] = useState<MatchupFilters>({
    myPick: initialData?.myChampion || initialFilters?.myPick || null,
    enemyPick: initialData?.enemyChampion || initialFilters?.enemyPick || null,
    mySupp: initialData?.mySupport || initialFilters?.mySupp || null,
    enemySupp: initialData?.enemySupport || initialFilters?.enemySupp || null,
  });

  const [prio, setPrio] = useState<string>(initialData?.prio || "N/A");
  const [notes, setNotes] = useState<string>(initialData?.notes || "");
  const [collisionId, setCollisionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [error, setError] = useState("");

  const handleRoleChange = (newRole: Role) => {
    if (mode === "edit") return;
    setRole(newRole);
    setFilters({ myPick: null, enemyPick: null, mySupp: null, enemySupp: null });
  };

  useEffect(() => {
    if (mode === "edit") return;

    const isBotLane = role === "ADC" || role === "SUPP";
    const hasRequired = filters.myPick && filters.enemyPick &&
      (!isBotLane || (filters.mySupp && filters.enemySupp));

    if (!hasRequired) {
      setCollisionId(null);
      return;
    }

    const checkCollision = async () => {
      try {
        const res = await fetch("/api/notes/check", {
          method: "POST",
          body: JSON.stringify({ role, ...filters }),
          headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        if (data.exists) {
          setCollisionId(data.noteId);
        } else {
          setCollisionId(null);
        }
      } catch (e) {
        console.error("Failed to check collision", e);
      }
    };

    const timeout = setTimeout(checkCollision, 400);
    return () => clearTimeout(timeout);
  }, [mode, role, filters]);

  const handleSave = async () => {
    const isBotLane = role === "ADC" || role === "SUPP";
    const hasRequired = filters.myPick && filters.enemyPick &&
      (!isBotLane || (filters.mySupp && filters.enemySupp));

    if (!hasRequired) {
      setError("Please fill out all required champion fields for this matchup.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      if (mode === "create") {
        const res = await fetch("/api/notes", {
          method: "POST",
          body: JSON.stringify({ role, ...filters, prio, notes }),
          headers: { "Content-Type": "application/json" }
        });

        if (res.ok) {
          router.push("/dashboard");
          router.refresh();
        } else {
          const data = await res.json();
          setError(data.message || "Failed to create note");
        }
      } else {
        const res = await fetch(`/api/notes/${initialData?.id}`, {
          method: "PUT",
          body: JSON.stringify({ prio, notes }),
          headers: { "Content-Type": "application/json" }
        });

        if (res.ok) {
          router.push("/dashboard");
          router.refresh();
        } else {
          const data = await res.json();
          setError(data.message || "Failed to update note");
        }
      }
    } catch (e) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!initialData?.id) return;
    
    setIsDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/notes/${initialData.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete note");
        setIsDeleting(false);
      }
    } catch (e) {
      setError("An unexpected error occurred while deleting.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-400" />
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {mode === "create" ? "Create Matchup Note" : "Edit Matchup Note"}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {mode === "edit" && (
            <Button 
              onClick={handleDeleteClick} 
              disabled={isDeleting || isSaving} 
              variant="outline"
              className="flex items-center gap-2 border-red-900/50 text-red-500 hover:bg-red-950/40 hover:text-red-400 px-4"
            >
              {isDeleting ? (
                <Spinner size="sm" className="mr-1" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Delete Note</span>
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving || collisionId !== null || isDeleting} className="flex items-center gap-2 px-6 min-w-[140px] justify-center">
            {isSaving ? (
              <>
                <Spinner size="sm" className="mr-1" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {mode === "create" ? "Save Note" : "Update Note"}
              </>
            )}
          </Button>
        </div>
      </div>

      {collisionId && mode === "create" && (
        <div className="bg-red-950/50 border border-red-900 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg animate-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-900/50 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Matchup Already Exists</h3>
              <p className="text-red-400 text-sm mt-1">You have already created a note for this exact champion configuration.</p>
            </div>
          </div>
          <Link href={`/note/${collisionId}/edit`} className="shrink-0">
            <Button variant="outline" className="border-red-900 text-red-500 hover:bg-red-900/20">
              Edit Existing Note Instead
            </Button>
          </Link>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className={`bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 shadow-sm transition-opacity duration-300 ${mode === "edit" ? "opacity-60 pointer-events-none select-none" : ""}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-4 border-b border-neutral-800/50 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center tracking-tight">
            <span className="w-1.5 h-5 bg-red-600 rounded-full mr-3 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
            Matchup Configuration
          </h3>

          {mode === "edit" ? (
            <div className="text-sm text-neutral-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Cannot be changed in edit mode.
            </div>
          ) : (
            <RoleFilter selectedRole={role} onChange={handleRoleChange} />
          )}
        </div>

        <ChampionFilterBlock
          role={role}
          champions={champions}
          filters={filters}
          onChange={setFilters}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center tracking-tight">
            <span className="w-1.5 h-5 bg-red-600 rounded-full mr-3"></span>
            Matchup Strategy
          </h3>
          <div data-color-mode="dark" className="rounded-xl overflow-hidden border border-neutral-800">
            <MDEditor
              value={notes}
              onChange={(val) => setNotes(val || "")}
              height={500}
              preview="edit"
              className="!bg-neutral-950 !border-0"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-md font-bold text-white mb-4">Lane Priority</h3>
            <div className="flex flex-col space-y-2">
              {PRIO_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setPrio(option)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border text-left cursor-pointer ${prio === option
                      ? "bg-red-950/40 border-red-900 text-white shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-md font-bold text-white mb-2">Match History</h3>
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg text-center mt-4">
              <span className="text-xl opacity-50 mb-2 block">⚔️</span>
              <p className="text-xs text-neutral-500">
                Riot API automated match fetching for specific matchups is coming in Phase 4.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Delete Matchup Note"
        description="Are you sure you want to delete this note? All data and strategies written for this specific matchup will be permanently erased. This action cannot be undone."
        confirmText="Delete Note"
        cancelText="Keep Note"
        isDestructive={true}
        onConfirm={executeDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
