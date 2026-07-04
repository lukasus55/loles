"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { ChampionData } from "@/lib/riot/ddragon";

interface ChampionSelectProps {
  champions: ChampionData[];
  value: string | null;
  onChange: (championId: string | null) => void;
  placeholder?: string;
  label?: string;
  buttonClassName?: string;
}

export const ChampionSelect: React.FC<ChampionSelectProps> = ({
  champions,
  value,
  onChange,
  placeholder = "Select Champion",
  label,
  buttonClassName
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedChamp = useMemo(() => champions.find(c => c.id === value), [champions, value]);

  const filteredChamps = useMemo(() => {
    if (!search) return champions;
    const lower = search.toLowerCase();
    return champions.filter(c => c.name.toLowerCase().includes(lower));
  }, [champions, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setSearch("");
    }
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="block text-sm font-medium text-neutral-400 mb-1.5">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-neutral-950 border border-neutral-800 rounded-lg h-12 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors hover:bg-neutral-900 cursor-pointer shadow-inner ${buttonClassName || ''}`}
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          {selectedChamp ? (
            <>
              <img src={selectedChamp.iconUrl} alt={selectedChamp.name} className="w-7 h-7 rounded-md object-cover border border-neutral-700" />
              <span className="text-white font-medium truncate">{selectedChamp.name}</span>
            </>
          ) : (
            <span className="text-neutral-500">{placeholder}</span>
          )}
        </div>
        
        <div className="flex items-center">
          {selectedChamp && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="p-1 mr-1 text-neutral-500 hover:text-white rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </div>
          )}
          <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${isOpen ? "rotate-180 text-white" : ""}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search champion..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-md py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-neutral-500"
              />
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
            {filteredChamps.length === 0 ? (
              <div className="p-6 text-center text-sm text-neutral-500">No champions found</div>
            ) : (
              <div className="grid grid-cols-1 gap-1">
                {filteredChamps.map((champ) => (
                  <button
                    key={champ.id}
                    onClick={() => {
                      onChange(champ.id);
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full p-2.5 rounded-md hover:bg-neutral-800 transition-colors cursor-pointer text-left group"
                  >
                    <img src={champ.iconUrl} alt={champ.name} className="w-8 h-8 rounded-md object-cover border border-neutral-700 group-hover:border-red-500/50 transition-colors" />
                    <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">{champ.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
