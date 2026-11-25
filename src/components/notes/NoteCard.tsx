import React from "react";
import Link from "next/link";
import { ChampionData } from "@/lib/riot/assets";
import { buildMatchupUrl } from "@/lib/matchup/url";
import { Role } from "./RoleFilter";

export interface MatchupNoteDTO {
  id: string;
  role: string;
  myChampion: string;
  enemyChampion: string;
  mySupport: string | null;
  enemySupport: string | null;
  prio: string | null;
  notes: string | null;
  wins?: number;
  losses?: number;
  updatedAt: Date | string;
}

interface NoteCardProps {
  note: MatchupNoteDTO;
  champions: ChampionData[];
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, champions }) => {
  const findChamp = (id: string | null) =>
    id ? champions.find((c) => c.id === id || c.name === id) : undefined;

  const myChamp = findChamp(note.myChampion);
  const enemyChamp = findChamp(note.enemyChampion);
  const mySupp = findChamp(note.mySupport);
  const enemySupp = findChamp(note.enemySupport);

  const isBotLane = note.role === "ADC" || note.role === "SUPP";

  const wins = note.wins ?? 0;
  const losses = note.losses ?? 0;
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  const renderSide = (
    primaryUrl: string | undefined,
    primaryAlt: string,
    suppUrl: string | undefined,
    suppAlt: string | null,
    isMyPick: boolean
  ) => (
    <div className="flex items-center">
      <img
        src={primaryUrl || ""}
        className={`w-9 h-9 rounded-full object-cover border relative z-10 ${
          isMyPick ? "border-accent/70" : "border-neutral-700/80"
        }`}
        alt={primaryAlt}
      />
      {isBotLane && suppUrl && (
        <img
          src={suppUrl}
          className="w-6 h-6 rounded-full object-cover border border-neutral-800 -ml-2 relative z-0 opacity-90"
          alt={suppAlt || "Support"}
        />
      )}
    </div>
  );

  const matchupUrl = buildMatchupUrl(
    {
      role: note.role as Role,
      myPick: note.myChampion,
      enemyPick: note.enemyChampion,
      mySupp: note.mySupport,
      enemySupp: note.enemySupport,
    },
    { from: "matchups" }
  );

  const plainNotes = note.notes ? note.notes.replace(/[#*_>`]/g, "").trim() : "";

  const hasPrio = Boolean(note.prio && note.prio !== "N/A");
  const prioStyle =
    note.prio === "Yes"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : note.prio === "No"
        ? "bg-red-500/10 text-red-400 border-red-500/20"
        : "bg-neutral-800/70 text-neutral-300 border-neutral-700/70";

  return (
    <Link
      href={matchupUrl}
      className="group block h-full cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
    >
      <div className="h-full flex flex-col rounded-lg border border-neutral-800/75 bg-neutral-900/35 hover:bg-neutral-900/75 hover:border-neutral-700 p-4 transition-colors">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {renderSide(
              myChamp?.iconUrl,
              myChamp?.name || note.myChampion,
              mySupp?.iconUrl,
              mySupp?.name || note.mySupport,
              true
            )}
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
              vs
            </span>
            {renderSide(
              enemyChamp?.iconUrl,
              enemyChamp?.name || note.enemyChampion,
              enemySupp?.iconUrl,
              enemySupp?.name || note.enemySupport,
              false
            )}
          </div>

          {totalGames > 0 ? (
            <div className="flex items-center gap-1 text-xs font-semibold tabular-nums shrink-0">
              <span className="text-blue-400">{wins}W</span>
              <span className="text-neutral-600 font-normal">–</span>
              <span className="text-red-400">{losses}L</span>
              <span className="text-[11px] font-medium text-neutral-500 ml-0.5">
                ({winRate}%)
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-neutral-600 shrink-0">0 games</span>
          )}
        </div>

        <h3 className="text-sm font-semibold text-neutral-100 mt-3 truncate">
          {myChamp?.name || note.myChampion}{" "}
          <span className="text-neutral-500 font-normal">vs</span>{" "}
          {enemyChamp?.name || note.enemyChampion}
        </h3>

        <p className="text-xs leading-relaxed text-neutral-400 line-clamp-3 mt-1.5 flex-1">
          {plainNotes || "No written notes for this matchup."}
        </p>

        <div className="mt-3.5 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-500">
          <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
          {hasPrio && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded border font-medium tracking-wide ${prioStyle}`}
            >
              Prio: {note.prio}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export const NoteCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-lg border border-neutral-800/75 bg-neutral-900/35 p-4 h-full flex flex-col animate-pulse min-h-[168px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-neutral-800 rounded-full" />
          <div className="w-4 h-2.5 bg-neutral-800 rounded" />
          <div className="w-9 h-9 bg-neutral-800 rounded-full" />
        </div>
        <div className="w-16 h-3.5 bg-neutral-800 rounded" />
      </div>

      <div className="w-36 h-3.5 bg-neutral-800 rounded mt-3.5" />

      <div className="space-y-2 mt-3 flex-1">
        <div className="w-full h-2.5 bg-neutral-800/80 rounded" />
        <div className="w-11/12 h-2.5 bg-neutral-800/80 rounded" />
        <div className="w-3/4 h-2.5 bg-neutral-800/80 rounded" />
      </div>

      <div className="mt-3.5 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between">
        <div className="w-16 h-2.5 bg-neutral-800 rounded" />
        <div className="w-14 h-3.5 bg-neutral-800 rounded" />
      </div>
    </div>
  );
};
