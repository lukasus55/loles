"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface MatchupStrategyEditorProps {
  notes: string;
  onChange: (val: string) => void;
}

export const MatchupStrategyEditor: React.FC<MatchupStrategyEditorProps> = ({ notes, onChange }) => {
  const [previewMode, setPreviewMode] = useState<"edit" | "live" | "preview">("edit");

  return (
    <div className="lg:col-span-3 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center tracking-tight">
          <span className="w-1.5 h-5 bg-red-600 rounded-full mr-3"></span>
          Matchup Strategy
        </h3>
        <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-lg">
          <button 
            onClick={() => setPreviewMode("edit")} 
            className={`cursor-pointer px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${previewMode === "edit" ? "bg-neutral-700 text-white shadow-sm" : "text-neutral-400 hover:text-white"}`}
          >
            Edit
          </button>
          <button 
            onClick={() => setPreviewMode("live")} 
            className={`cursor-pointer px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${previewMode === "live" ? "bg-neutral-700 text-white shadow-sm" : "text-neutral-400 hover:text-white"}`}
          >
            Split
          </button>
          <button 
            onClick={() => setPreviewMode("preview")} 
            className={`cursor-pointer px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${previewMode === "preview" ? "bg-neutral-700 text-white shadow-sm" : "text-neutral-400 hover:text-white"}`}
          >
            View
          </button>
        </div>
      </div>
      <div data-color-mode="dark" className="rounded-xl overflow-hidden shadow-sm">
        <MDEditor
          value={notes}
          onChange={(val) => onChange(val || "")}
          height={500}
          preview={previewMode}
        />
      </div>
    </div>
  );
};
