"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { ShopItemData } from "@/lib/riot/assets";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tooltip } from "@/components/ui/Tooltip";
import { RiotItemTooltipContent } from "@/components/match/RiotItemTooltip";

interface ItemPickerModalProps {
  isOpen: boolean;
  title: string;
  shopItems: ShopItemData[];
  onSelect: (itemId: number) => void;
  onClose: () => void;
}

const CATEGORIES = [
  { id: "all", label: "All", tags: [] as string[] },
  { id: "ad", label: "AD", tags: ["Damage", "ArmorPenetration", "LifeSteal"] },
  { id: "crit", label: "Crit / AS", tags: ["CriticalStrike", "AttackSpeed"] },
  { id: "ap", label: "AP", tags: ["SpellDamage", "MagicPenetration"] },
  { id: "def", label: "Defense", tags: ["Health", "Armor", "SpellBlock"] },
  { id: "supp", label: "Support", tags: ["GoldPer", "Aura", "Vision", "ManaRegen"] },
  { id: "boots", label: "Boots", tags: ["Boots"] },
  { id: "starter", label: "Starter", tags: ["Lane", "Consumable"] },
] as const;

export const ItemPickerModal: React.FC<ItemPickerModalProps> = ({
  isOpen,
  title,
  shopItems,
  onSelect,
  onClose,
}) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  // Rule 2: Close on ESC key
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
      if (cat && cat.tags.length > 0) {
        const matchesTag = item.tags.some((t) => (cat.tags as readonly string[]).includes(t));
        if (!matchesTag) return false;
      }
      if (q && !item.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [shopItems, query, category]);

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
        className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with visible Close X button */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between gap-4">
          <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close item picker"
            className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search & Category Filters */}
        <div className="p-4 border-b border-neutral-800/70 space-y-3 bg-neutral-900/40">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search item by name (e.g. Essence Reaver, Navori, Berserker)..."
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((c) => (
              <Button
                key={c.id}
                type="button"
                size="sm"
                variant={category === c.id ? "primary" : "ghost"}
                onClick={() => setCategory(c.id)}
                className="h-7 px-2.5 text-xs"
              >
                {c.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Item Grid */}
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-500">
              No items match &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-8 gap-2.5">
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
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(item.id);
                      }
                    }}
                    className="flex flex-col items-center gap-1 p-1.5 rounded-lg border border-neutral-800/80 bg-neutral-900/60 hover:border-amber-500/70 hover:bg-neutral-800/70 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-md overflow-hidden border border-neutral-700 bg-neutral-950">
                      <img
                        src={item.iconUrl}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[10px] text-[#C89B3C] font-semibold">
                      {item.gold}
                    </span>
                  </div>
                </Tooltip>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
