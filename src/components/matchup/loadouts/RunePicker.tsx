"use client";

import React, { useMemo } from "react";
import { RuneTreeData, STAT_SHARD_ROWS } from "@/lib/riot/assets";
import {
  RunePageDraft,
  selectPrimaryRune,
  selectPrimaryStyle,
  selectStatShard,
  selectSubStyle,
  toggleSubRune,
} from "@/lib/matchup/loadouts";
import { Tooltip } from "@/components/ui/Tooltip";

interface RunePickerProps {
  trees: RuneTreeData[];
  value: RunePageDraft;
  onChange: (next: RunePageDraft) => void;
}

const TREE_ACCENT: Record<number, string> = {
  8000: "border-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.3)]", // Precision
  8100: "border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.3)]", // Domination
  8200: "border-indigo-400/80 shadow-[0_0_12px_rgba(129,140,248,0.3)]", // Sorcery
  8300: "border-sky-400/80 shadow-[0_0_12px_rgba(56,189,248,0.3)]", // Inspiration
  8400: "border-emerald-400/80 shadow-[0_0_12px_rgba(52,211,153,0.3)]", // Resolve
};

const SHARD_ROW_LABELS = ["Offense", "Flex", "Defense"] as const;

export const RunePicker: React.FC<RunePickerProps> = ({ trees, value, onChange }) => {
  const primaryTree = useMemo(
    () => trees.find((t) => t.id === value.primaryRuneStyle) ?? trees[0] ?? null,
    [trees, value.primaryRuneStyle]
  );

  const secondaryTrees = useMemo(
    () => trees.filter((t) => t.id !== (value.primaryRuneStyle ?? primaryTree?.id)),
    [trees, value.primaryRuneStyle, primaryTree]
  );

  const subTree = useMemo(
    () => secondaryTrees.find((t) => t.id === value.subRuneStyle) ?? null,
    [secondaryTrees, value.subRuneStyle]
  );

  const activePrimaryId = value.primaryRuneStyle;
  const primaryAccent = (activePrimaryId && TREE_ACCENT[activePrimaryId]) || "border-amber-400/80";
  const subAccent =
    (value.subRuneStyle && TREE_ACCENT[value.subRuneStyle]) || "border-sky-400/80";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-4">
      {/* LEFT: PRIMARY TREE */}
      <div className="space-y-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
            Primary Path
          </p>
          <div className="flex items-center justify-between gap-1.5">
            {trees.map((tree) => {
              const isSelected = value.primaryRuneStyle === tree.id;
              return (
                <Tooltip key={tree.id} compact content={tree.name} position="top">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onChange(selectPrimaryStyle(value, tree.id))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onChange(selectPrimaryStyle(value, tree.id));
                      }
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer ${
                      isSelected
                        ? `bg-neutral-900 ${TREE_ACCENT[tree.id] || "border-amber-400"} scale-105`
                        : "bg-neutral-950 border-neutral-800 opacity-45 grayscale hover:opacity-90 hover:grayscale-0"
                    }`}
                  >
                    <img src={tree.iconUrl} alt={tree.name} className="w-6 h-6 object-contain" />
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {activePrimaryId && primaryTree ? (
          <div className="space-y-3 pt-2 border-t border-neutral-800/70">
            {primaryTree.slots.map((slot, slotIdx) => {
              const isKeystone = slotIdx === 0;
              const selectedId = value.primaryRunes[slotIdx] ?? 0;

              return (
                <div
                  key={`${primaryTree.id}-slot-${slotIdx}`}
                  className={`flex items-center justify-around gap-1.5 ${
                    isKeystone ? "pb-2 border-b border-neutral-800/50" : ""
                  }`}
                >
                  {slot.runes.map((rune) => {
                    const isSelected = selectedId === rune.id;
                    return (
                      <Tooltip
                        key={rune.id}
                        title={rune.name}
                        content={rune.shortDesc || rune.name}
                        position="top"
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => onChange(selectPrimaryRune(value, slotIdx, rune.id))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onChange(selectPrimaryRune(value, slotIdx, rune.id));
                            }
                          }}
                          className={`${
                            isKeystone ? "w-11 h-11" : "w-9 h-9"
                          } rounded-full flex items-center justify-center border-2 transition-all cursor-pointer overflow-hidden ${
                            isSelected
                              ? `bg-neutral-900 ${primaryAccent} scale-105`
                              : "bg-neutral-950 border-neutral-800/80 opacity-35 grayscale hover:opacity-85 hover:grayscale-0"
                          }`}
                        >
                          <img
                            src={rune.iconUrl}
                            alt={rune.name}
                            className="w-full h-full object-contain p-0.5"
                          />
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-neutral-500 border-t border-neutral-800/60">
            Select a primary path above
          </div>
        )}
      </div>

      {/* RIGHT: SECONDARY TREE + STAT SHARDS */}
      <div className="space-y-4 sm:border-l sm:border-neutral-800/70 sm:pl-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
            Secondary Path
          </p>
          <div className="flex items-center gap-2.5">
            {secondaryTrees.map((tree) => {
              const isSelected = value.subRuneStyle === tree.id;
              return (
                <Tooltip key={tree.id} compact content={tree.name} position="top">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onChange(selectSubStyle(value, tree.id))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onChange(selectSubStyle(value, tree.id));
                      }
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer ${
                      isSelected
                        ? `bg-neutral-900 ${TREE_ACCENT[tree.id] || "border-sky-400"} scale-105`
                        : "bg-neutral-950 border-neutral-800 opacity-45 grayscale hover:opacity-90 hover:grayscale-0"
                    }`}
                  >
                    <img src={tree.iconUrl} alt={tree.name} className="w-5 h-5 object-contain" />
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {subTree ? (
          <div className="space-y-2.5 pt-2 border-t border-neutral-800/70">
            {subTree.slots.slice(1).map((slot, offsetIdx) => {
              const slotIdx = offsetIdx + 1;
              return (
                <div
                  key={`${subTree.id}-sub-${slotIdx}`}
                  className="flex items-center justify-around gap-1.5"
                >
                  {slot.runes.map((rune) => {
                    const isSelected = value.subRunes.includes(rune.id);
                    return (
                      <Tooltip
                        key={rune.id}
                        title={rune.name}
                        content={rune.shortDesc || rune.name}
                        position="top"
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => onChange(toggleSubRune(value, slotIdx, rune.id, trees))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onChange(toggleSubRune(value, slotIdx, rune.id, trees));
                            }
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer overflow-hidden ${
                            isSelected
                              ? `bg-neutral-900 ${subAccent} scale-105`
                              : "bg-neutral-950 border-neutral-800/80 opacity-35 grayscale hover:opacity-85 hover:grayscale-0"
                          }`}
                        >
                          <img
                            src={rune.iconUrl}
                            alt={rune.name}
                            className="w-full h-full object-contain p-0.5"
                          />
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-5 text-center text-xs text-neutral-500 border-t border-neutral-800/60">
            Select a secondary path
          </div>
        )}

        {/* STAT SHARDS */}
        <div className="pt-3 border-t border-neutral-800/70 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Stat Shards
          </p>
          {STAT_SHARD_ROWS.map((row, rowIdx) => {
            const selectedShard = value.statShards[rowIdx] ?? 0;
            return (
              <div
                key={SHARD_ROW_LABELS[rowIdx]}
                className="flex items-center justify-around gap-2"
              >
                {row.map((shard) => {
                  const isSelected = selectedShard === shard.id;
                  return (
                    <Tooltip
                      key={`${rowIdx}-${shard.id}`}
                      compact
                      content={shard.shortDesc}
                      position="top"
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => onChange(selectStatShard(value, rowIdx, shard.id))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onChange(selectStatShard(value, rowIdx, shard.id));
                          }
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer overflow-hidden ${
                          isSelected
                            ? "bg-neutral-900 border-amber-400/90 shadow-[0_0_8px_rgba(251,191,36,0.3)] scale-105"
                            : "bg-neutral-950 border-neutral-800 opacity-40 grayscale hover:opacity-90 hover:grayscale-0"
                        }`}
                      >
                        <img
                          src={shard.iconUrl}
                          alt={shard.name}
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
