import React from 'react';

interface MatchupRecordBoxProps {
  wins: number;
  losses: number;
}

export const MatchupRecordBox: React.FC<MatchupRecordBoxProps> = ({ wins, losses }) => {
  const total = wins + losses;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 shadow-sm">
      <h3 className="text-md font-bold text-white mb-4">Matchup Record</h3>
      <div className="flex items-center gap-5">
        <div className="flex-shrink-0 relative w-16 h-16 flex items-center justify-center bg-neutral-950 rounded-full border border-neutral-800 shadow-inner">
          <span className={`text-lg font-bold ${total === 0 ? 'text-neutral-500' : winRate >= 50 ? 'text-blue-500' : 'text-red-500'}`}>
            {winRate}%
          </span>
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-400 font-medium">Wins</span>
            <span className="text-blue-500 font-bold">{wins}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-400 font-medium">Losses</span>
            <span className="text-red-500 font-bold">{losses}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-400 font-medium">Total Games</span>
            <span className="text-white font-bold">{total}</span>
          </div>
        </div>
      </div>
      
      {/* Win/Loss Progress Bar */}
      <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-5 overflow-hidden flex shadow-inner">
        {total > 0 ? (
          <>
            <div style={{ width: `${winRate}%` }} className="h-full bg-blue-500 transition-all duration-500" />
            <div style={{ width: `${100 - winRate}%` }} className="h-full bg-red-500 transition-all duration-500" />
          </>
        ) : (
          <div className="w-full h-full bg-neutral-800" />
        )}
      </div>
    </div>
  );
};
