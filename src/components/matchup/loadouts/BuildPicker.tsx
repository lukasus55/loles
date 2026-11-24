"use client";

import React, { useState } from "react";
import { ArrowRight, Plus, X } from "lucide-react";
import {
  ItemSummary,
  ShopItemData,
  getItemFallbackIconUrl,
} from "@/lib/riot/assets";
import { BuildDraft, addItemToList, removeItemAtIndex } from "@/lib/matchup/loadouts";
import { Tooltip } from "@/components/ui/Tooltip";
import { RiotItemTooltipContent } from "@/components/match/RiotItemTooltip";
import { ItemPickerModal } from "./ItemPickerModal";

type BuildSectionKey = "starterItems" | "coreItems" | "situational";

const SECTIONS: {
  key: BuildSectionKey;
  label: string;
  hint: string;
  max: number;
  showArrows?: boolean;
}[] = [
  { key: "starterItems", label: "Starter Items", hint: "Doran's, Cull, Potions", max: 4 },
  {
    key: "coreItems",
    label: "Core Build",
    hint: "Primary build path & boots",
    max: 6,
    showArrows: true,
  },
  { key: "situational", label: "Situational", hint: "Armor pen, QSS, defensive tech", max: 6 },
];

interface BuildPickerProps {
  value: BuildDraft;
  onChange: (next: BuildDraft) => void;
  itemsById: Record<number, ItemSummary>;
  shopItems: ShopItemData[];
  ddragonVersion: string;
}

export const BuildPicker: React.FC<BuildPickerProps> = ({
  value,
  onChange,
  itemsById,
  shopItems,
  ddragonVersion,
}) => {
  const [activeSection, setActiveSection] = useState<BuildSectionKey | null>(null);

  const activeSectionMeta = SECTIONS.find((s) => s.key === activeSection) ?? null;

  const handleAddItem = (itemId: number) => {
    if (!activeSection || !activeSectionMeta) return;
    const nextList = addItemToList(value[activeSection], itemId, activeSectionMeta.max);
    onChange({ ...value, [activeSection]: nextList });
    if (nextList.length >= activeSectionMeta.max) {
      setActiveSection(null);
    }
  };

  const handleRemoveItem = (section: BuildSectionKey, index: number) => {
    onChange({
      ...value,
      [section]: removeItemAtIndex(value[section], index),
    });
  };

  return (
    <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-4 space-y-4 flex flex-col justify-between">
      {SECTIONS.map((section) => {
        const list = value[section.key];
        const canAddMore = list.length < section.max;

        return (
          <div key={section.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                  {section.label}
                </p>
                <p className="text-[10px] text-neutral-500">{section.hint}</p>
              </div>
              <span className="text-[10px] text-neutral-500 font-medium">
                {list.length}/{section.max}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 min-h-[46px] p-2 rounded-lg bg-neutral-900/50 border border-neutral-800/60">
              {list.map((itemId, idx) => {
                const itemInfo = itemsById[itemId];
                const iconUrl =
                  itemInfo?.iconUrl || getItemFallbackIconUrl(itemId, ddragonVersion);

                return (
                  <React.Fragment key={`${section.key}-${idx}-${itemId}`}>
                    {section.showArrows && idx > 0 && (
                      <ArrowRight className="w-3 h-3 text-neutral-600 shrink-0" />
                    )}
                    <div className="relative group">
                      <Tooltip
                        cardClassName="p-3.5"
                        content={
                          <RiotItemTooltipContent
                            item={itemInfo}
                            itemId={itemId}
                            iconUrl={iconUrl}
                          />
                        }
                        position="top"
                      >
                        <div className="w-10 h-10 rounded-md overflow-hidden border border-neutral-700 bg-neutral-950 group-hover:border-amber-500/60 transition-colors">
                          <img
                            src={iconUrl}
                            alt={itemInfo?.name || `Item #${itemId}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Tooltip>

                      <div
                        role="button"
                        tabIndex={0}
                        aria-label="Remove item"
                        onClick={() => handleRemoveItem(section.key, idx)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleRemoveItem(section.key, idx);
                          }
                        }}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-neutral-950 border border-neutral-700 text-neutral-400 hover:bg-red-600 hover:border-red-500 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer shadow-md"
                      >
                        <X className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}

              {canAddMore && (
                <Tooltip compact content={`Add item to ${section.label}`} position="top">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveSection(section.key)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveSection(section.key);
                      }
                    }}
                    className="w-10 h-10 rounded-md border border-dashed border-neutral-700 bg-neutral-950/60 hover:border-red-500/70 hover:bg-red-950/20 text-neutral-500 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </div>
                </Tooltip>
              )}
            </div>
          </div>
        );
      })}

      <ItemPickerModal
        isOpen={activeSection !== null}
        title={activeSectionMeta ? `Add to ${activeSectionMeta.label}` : "Add Item"}
        shopItems={shopItems}
        onSelect={handleAddItem}
        onClose={() => setActiveSection(null)}
      />
    </div>
  );
};
