"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Plus, X } from "lucide-react";
import {
  ItemSummary,
  ShopItemData,
  getItemFallbackIconUrl,
} from "@/lib/riot/assets";
import { BuildDraft, addItemToList, removeItemAtIndex } from "@/lib/matchup/loadouts";
import { Tooltip } from "@/components/ui/Tooltip";
import { RiotItemTooltipContent } from "@/components/match/RiotItemTooltip";
import { ItemCategoryId, ItemPickerModal } from "./ItemPickerModal";

type BuildSectionKey = "starterItems" | "coreItems" | "situational";

const SECTIONS: {
  key: BuildSectionKey;
  label: string;
  max: number;
  defaultCategory: ItemCategoryId;
  showArrows?: boolean;
}[] = [
  { key: "starterItems", label: "Starter Items", max: 4, defaultCategory: "starter" },
  { key: "coreItems", label: "Core Build", max: 6, defaultCategory: "all", showArrows: true },
  { key: "situational", label: "Situational", max: 6, defaultCategory: "all" },
];

function reorderList(items: number[], fromIndex: number, toIndex: number): number[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

interface DragState {
  section: BuildSectionKey;
  fromIndex: number;
  insertIndex: number;
  pointerId: number;
  startX: number;
  startY: number;
  active: boolean;
}

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
  const [drag, setDrag] = useState<DragState | null>(null);
  const slotRefs = useRef<Record<string, (HTMLDivElement | null)[]>>({});

  const activeSectionMeta = SECTIONS.find((s) => s.key === activeSection) ?? null;

  useEffect(() => {
    if (!drag?.active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrag(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drag?.active]);

  const computeInsertIndex = (section: BuildSectionKey, clientX: number): number => {
    const count = value[section].length;
    const els = (slotRefs.current[section] || []).slice(0, count);
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      if (clientX < midX) return i;
    }
    return count;
  };

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    section: BuildSectionKey,
    index: number,
    listLength: number
  ) => {
    if (listLength < 2 || e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return;

    setDrag({
      section,
      fromIndex: index,
      insertIndex: index,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      active: false,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag || e.pointerId !== drag.pointerId) return;

    if (!drag.active) {
      if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 5) return;
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    const insertIndex = computeInsertIndex(drag.section, e.clientX);
    setDrag((prev) => (prev ? { ...prev, active: true, insertIndex } : null));
  };

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag || e.pointerId !== drag.pointerId) return;

    if (drag.active) {
      const { section, fromIndex, insertIndex } = drag;
      const targetIndex = insertIndex > fromIndex ? insertIndex - 1 : insertIndex;
      if (targetIndex !== fromIndex) {
        onChange({
          ...value,
          [section]: reorderList(value[section], fromIndex, targetIndex),
        });
      }
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    }
    setDrag(null);
  };

  const handleKeyboardReorder = (
    e: React.KeyboardEvent<HTMLDivElement>,
    section: BuildSectionKey,
    index: number,
    listLength: number
  ) => {
    if (listLength < 2) return;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

    const delta = e.key === "ArrowLeft" ? -1 : 1;
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= listLength) return;

    e.preventDefault();
    onChange({
      ...value,
      [section]: reorderList(value[section], index, nextIndex),
    });
    requestAnimationFrame(() => {
      slotRefs.current[section]?.[nextIndex]?.focus();
    });
  };

  const handleAddItem = (itemId: number) => {
    if (!activeSection || !activeSectionMeta) return;
    const nextList = addItemToList(value[activeSection], itemId, activeSectionMeta.max);
    onChange({ ...value, [activeSection]: nextList });
    setActiveSection(null);
  };

  const handleRemoveItem = (section: BuildSectionKey, index: number) => {
    onChange({
      ...value,
      [section]: removeItemAtIndex(value[section], index),
    });
  };

  return (
    <div
      className={`bg-neutral-950/50 border border-neutral-800/75 rounded-lg p-4 space-y-3.5 ${
        drag?.active ? "cursor-grabbing select-none" : ""
      }`}
    >
      {SECTIONS.map((section) => {
        const list = value[section.key];
        const canAddMore = list.length < section.max;
        const canReorder = list.length > 1;
        const isSectionDragging = drag?.active && drag.section === section.key;
        const showInsertMarker =
          isSectionDragging &&
          drag.insertIndex !== drag.fromIndex &&
          drag.insertIndex !== drag.fromIndex + 1;

        return (
          <div key={section.key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-300">
                {section.label}
              </p>
              <span className="text-[10px] text-neutral-500 tabular-nums">
                {list.length}/{section.max}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-neutral-900/40 border border-neutral-800/60">
              {list.map((itemId, idx) => {
                const itemInfo = itemsById[itemId];
                const iconUrl =
                  itemInfo?.iconUrl || getItemFallbackIconUrl(itemId, ddragonVersion);
                const isDraggedItem = isSectionDragging && drag.fromIndex === idx;

                return (
                  <React.Fragment key={`${section.key}-${idx}-${itemId}`}>
                    {section.showArrows && idx > 0 && (
                      <ArrowRight className="w-3 h-3 text-neutral-600 shrink-0" />
                    )}

                    {showInsertMarker && drag.insertIndex === idx && (
                      <span
                        aria-hidden="true"
                        className="w-0.5 h-8 bg-accent rounded-full shrink-0"
                      />
                    )}

                    <div
                      ref={(el) => {
                        if (!slotRefs.current[section.key]) {
                          slotRefs.current[section.key] = [];
                        }
                        slotRefs.current[section.key][idx] = el;
                      }}
                      tabIndex={canReorder ? 0 : undefined}
                      aria-label={
                        canReorder
                          ? `${itemInfo?.name || `Item ${itemId}`}, use arrow keys or drag to reorder`
                          : itemInfo?.name || `Item ${itemId}`
                      }
                      onPointerDown={(e) => handlePointerDown(e, section.key, idx, list.length)}
                      onPointerMove={handlePointerMove}
                      onPointerUp={finishDrag}
                      onPointerCancel={finishDrag}
                      onKeyDown={(e) => handleKeyboardReorder(e, section.key, idx, list.length)}
                      style={{ WebkitUserSelect: "none", userSelect: "none" }}
                      className={`relative group inline-flex items-center shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                        canReorder
                          ? isDraggedItem
                            ? "cursor-grabbing opacity-45 scale-95"
                            : "cursor-grab touch-none"
                          : ""
                      }`}
                    >
                      <Tooltip
                        disabled={Boolean(drag?.active)}
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
                        <div className="w-10 h-10 rounded-md overflow-hidden border border-neutral-700/80 bg-neutral-950 group-hover:border-neutral-400 transition-colors">
                          <img
                            src={iconUrl}
                            alt={itemInfo?.name || `Item #${itemId}`}
                            draggable={false}
                            className="w-full h-full object-cover pointer-events-none"
                          />
                        </div>
                      </Tooltip>

                      {!drag?.active && (
                        <button
                          type="button"
                          aria-label="Remove item"
                          onClick={() => handleRemoveItem(section.key, idx)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-neutral-950 border border-neutral-700 text-neutral-400 hover:bg-accent-dark hover:border-accent hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all cursor-pointer shadow-md"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}

              {showInsertMarker && drag.insertIndex === list.length && (
                <span
                  aria-hidden="true"
                  className="w-0.5 h-8 bg-accent rounded-full shrink-0"
                />
              )}

              {canAddMore && (
                <Tooltip compact content={`Add item to ${section.label}`} position="top">
                  <button
                    type="button"
                    onClick={() => setActiveSection(section.key)}
                    aria-label={`Add item to ${section.label}`}
                    className="w-10 h-10 rounded-md border border-dashed border-neutral-700/80 bg-neutral-950/50 hover:border-accent/60 hover:bg-accent/10 text-neutral-500 hover:text-accent-soft flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        );
      })}

      {activeSectionMeta && (
        <ItemPickerModal
          key={activeSectionMeta.key}
          isOpen={true}
          title={`Add to ${activeSectionMeta.label}`}
          shopItems={shopItems}
          defaultCategory={activeSectionMeta.defaultCategory}
          onSelect={handleAddItem}
          onClose={() => setActiveSection(null)}
        />
      )}
    </div>
  );
};
