"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { ShopItemData } from "@/lib/riot/assets";
import { Input } from "@/components/ui/Input";
import { Tooltip } from "@/components/ui/Tooltip";
import { RiotItemTooltipContent } from "@/components/match/RiotItemTooltip";

export type ItemCategoryId =
  | "all"
  | "ad"
  | "crit"
  | "ap"
  | "def"
  | "supp"
  | "boots"
  | "starter";

interface ItemPickerModalProps {
  isOpen: boolean;
  title: string;
  shopItems: ShopItemData[];
  defaultCategory?: ItemCategoryId;
  onSelect: (itemId: number) => void;
  onClose: () => void;
}

const CATEGORIES: { id: ItemCategoryId; label: string; tags: string[] }[] = [
  { id: "all", label: "All", tags: [] },
  { id: "ad", label: "AD", tags: ["Damage", "ArmorPenetration", "LifeSteal"] },
  { id: "crit", label: "Crit / AS", tags: ["CriticalStrike", "AttackSpeed"] },
  { id: "ap", label: "AP", tags: ["SpellDamage", "MagicPenetration"] },
  { id: "def", label: "Defense", tags: ["Health", "Armor", "SpellBlock"] },
  { id: "supp", label: "Support", tags: ["GoldPer", "Aura", "Vision", "ManaRegen"] },
  { id: "boots", label: "Boots", tags: ["Boots"] },
  { id: "starter", label: "Starter", tags: ["Lane", "Jungle", "Consumable"] },
];

export const ItemPickerModal: React.FC<ItemPickerModalProps> = ({
  isOpen,
  title,
  shopItems,
  defaultCategory = "all",
  onSelect,
  onClose,
}) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ItemCategoryId>(defaultCategory);
  const [showAllItems, setShowAllItems] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 40);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      clearTimeout(focusTimer);
    };
  }, [isOpen, onClose]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cat = CATEGORIES.find((c) => c.id === category);

    return shopItems.filter((item) => {
      if (!showAllItems && item.isSummonersRift === false) {
        return false;
      }
      if (category === "starter") {
        const isStarter =
          (item.tags.some((t) => ["Lane", "Jungle", "Consumable"].includes(t)) ||
            item.id === 3070) &&
          item.gold <= 500;
        if (!isStarter) return false;
      } else if (cat && cat.tags.length > 0) {
        const matchesTag = item.tags.some((t) => cat.tags.includes(t));
        if (!matchesTag) return false;
      }
      if (q && !item.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [shopItems, query, category, showAllItems]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-2xl h-[min(600px,84vh)] bg-[#0c0d11] border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-800/80 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
            <span className="text-[11px] text-neutral-500 tabular-nums">
              {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close item picker"
            className="h-9 w-9 rounded-lg border border-neutral-800 bg-neutral-900/70 text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search, Mode Toggle & Category Filters */}
        <div className="p-4 border-b border-neutral-800/70 space-y-3 bg-neutral-900/35 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search item by name (e.g. Infinity Edge, Doran, Berserker)..."
                className="pl-9 h-9 text-sm"
              />
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={showAllItems}
              onClick={() => setShowAllItems((v) => !v)}
              className="inline-flex items-center justify-between sm:justify-start gap-2.5 px-3 h-9 rounded-md border border-neutral-800 bg-neutral-950/80 hover:bg-neutral-900 text-xs text-neutral-300 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              <span>Show all items</span>
              <span
                aria-hidden="true"
                className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                  showAllItems ? "bg-accent" : "bg-neutral-700"
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${
                    showAllItems ? "translate-x-3.5" : "translate-x-0.5"
                  }`}
                />
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((c) => {
              const isActive = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`h-7 px-2.5 rounded-md text-xs font-medium border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                    isActive
                      ? "bg-accent/15 border-accent/50 text-white"
                      : "bg-transparent border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800/70"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fixed-container Scrollable Item Grid */}
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar overscroll-contain">
          {filteredItems.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-neutral-500">
              {query
                ? `No items match "${query}".`
                : "No items found in this category."}
            </div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-8 gap-2">
              {filteredItems.map((item) => (
                <Tooltip
                  key={item.id}
                  cardClassName="p-3.5"
                  content={
                    <RiotItemTooltipContent
                      item={item}
                      itemId={item.id}
                      iconUrl={item.iconUrl}
                    />
                  }
                  position="top"
                >
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    aria-label={item.name}
                    className="w-full flex flex-col items-center gap-1 p-1.5 rounded-lg border border-neutral-800/75 bg-neutral-900/45 hover:border-accent/60 hover:bg-neutral-800/70 transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                  >
                    <div className="w-10 h-10 rounded-md overflow-hidden border border-neutral-700/80 bg-neutral-950">
                      <img
                        src={item.iconUrl}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[10px] text-[#C89B3C] font-semibold tabular-nums">
                      {item.gold}
                    </span>
                  </button>
                </Tooltip>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
