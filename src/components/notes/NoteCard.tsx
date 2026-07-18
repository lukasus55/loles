import React from 'react';
import Link from 'next/link';
import { ChampionData } from '@/lib/riot/ddragon';

// Defining it here since Prisma types on client can sometimes be tricky with dates
export interface MatchupNoteDTO {
  id: string;
  role: string;
  myChampion: string;
  enemyChampion: string;
  mySupport: string | null;
  enemySupport: string | null;
  prio: string | null;
  notes: string | null;
  updatedAt: Date | string;
}

interface NoteCardProps {
  note: MatchupNoteDTO;
  champions: ChampionData[];
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, champions }) => {
  const getChampIcon = (id: string | null) => {
    if (!id) return null;
    return champions.find(c => c.id === id)?.iconUrl;
  };

  const isBotLane = note.role === "ADC" || note.role === "SUPP";

  const renderSide = (primaryId: string, suppId: string | null, isMyPick: boolean) => (
    <div className="flex items-center gap-1.5">
      <img 
        src={getChampIcon(primaryId) || ""} 
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border shadow-sm ${isMyPick ? 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)] ring-2 ring-red-500/20' : 'border-neutral-700'}`} 
        alt="Champ" 
        title={primaryId} 
      />
      {isBotLane && suppId && (
        <img 
          src={getChampIcon(suppId) || ""} 
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg border opacity-80 ${isMyPick ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-neutral-700'}`} 
          alt="Supp" 
          title={suppId} 
        />
      )}
    </div>
  );

  return (
    <Link href={`/note/${note.id}/edit`} className="block group h-full">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-red-900/80 transition-all shadow-sm hover:shadow-[0_0_20px_rgba(239,68,68,0.05)] h-full flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3 sm:gap-4">
            {renderSide(note.myChampion, note.mySupport, true)}
            <span className="text-red-600 font-black italic text-sm opacity-50 px-1">VS</span>
            {renderSide(note.enemyChampion, note.enemySupport, false)}
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 font-bold text-neutral-400 uppercase tracking-wider min-w-12 flex justify-center">{note.role}</span>
            {note.prio && note.prio !== "N/A" && (
              <span className={`text-[10px] px-2 py-0.5 mt-1.5 rounded uppercase font-bold tracking-wider min-w-12 flex justify-center ${note.prio === 'Yes' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                note.prio === 'No' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                  'bg-neutral-800 text-neutral-300 border border-neutral-700'
                }`}>
                {`${note.prio}`}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 bg-neutral-950 rounded-lg p-3 border border-neutral-800/50">
          <p className="text-neutral-400 text-sm line-clamp-3">
            {note.notes ? note.notes.replace(/[#*_>]/g, '') : "No written notes for this matchup."}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-neutral-500 font-medium">
          <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
          <span className="text-red-500 group-hover:text-red-400 group-hover:underline transition-colors flex items-center gap-1">
            Edit Note
          </span>
        </div>
      </div>
    </Link>
  );
};

export const NoteCardSkeleton: React.FC = () => {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 h-full flex flex-col animate-pulse min-h-[220px]">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-800 rounded-lg"></div>
          <div className="w-6 h-3 bg-neutral-800 rounded"></div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-800 rounded-lg"></div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="w-10 h-4 bg-neutral-800 rounded"></div>
          <div className="w-14 h-4 bg-neutral-800 rounded"></div>
        </div>
      </div>
      
      <div className="flex-1 bg-neutral-950 rounded-lg p-3 border border-neutral-800/50 space-y-2.5">
        <div className="w-full h-3 bg-neutral-800 rounded"></div>
        <div className="w-11/12 h-3 bg-neutral-800 rounded"></div>
        <div className="w-4/5 h-3 bg-neutral-800 rounded"></div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="w-20 h-3 bg-neutral-800 rounded"></div>
        <div className="w-16 h-3 bg-neutral-800 rounded"></div>
      </div>
    </div>
  );
};
