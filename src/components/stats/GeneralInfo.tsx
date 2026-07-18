import React from "react";
import { Info } from "lucide-react";

export const GeneralInfo: React.FC = () => {
  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full min-h-[200px]">
      <div className="p-4 border-b border-neutral-800/50">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          General Info
        </h3>
      </div>
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-neutral-800/50 flex items-center justify-center mb-4">
          <Info className="w-6 h-6 text-neutral-500" />
        </div>
        <h4 className="text-white font-semibold mb-1">Coming Soon</h4>
      </div>
    </div>
  );
};
