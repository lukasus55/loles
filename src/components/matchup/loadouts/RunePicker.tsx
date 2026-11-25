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
  8000: "border-amber-400/85", // Precision
  8100: "border-accent/85", // Domination
  8200: "border-indigo-400/85", // Sorcery
  8300: "border-sky-400/85", // Inspiration
  8400: "border-emerald-400/85", // Resolve
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
  const primaryAccent = (activePrimaryId && TREE_ACCENT[activePrimaryId]) || "border-amber-400/85";
  const subAccent =
    (value.subRuneStyle && TREE_ACCENT[value.subRuneStyle]) || "border-sky-400/85";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-neutral-950/50 border border-neutral-800/75 rounded-lg p-4">
      {/* LEFT: PRIMARY TREE */}
      <div className="space-y-3.5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2.5">
            Primary Path
          </p>
          <div className="flex items-center justify-between gap-1.5">
            {trees.map((tree) => {
              const isSelected = value.primaryRuneStyle === tree.id;
              return (
                <Tooltip key={tree.id} compact content={tree.name} position="top">
                  <button
                    type="button"
                    onClick={() => onChange(selectPrimaryStyle(value, tree.id))}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                      isSelected
                        ? `bg-neutral-900 ${TREE_ACCENT[tree.id] || "border-amber-400"}`
                        : "bg-neutral-950 border-neutral-800/90 opacity-45 grayscale hover:opacity-90 hover:grayscale-0"
                    }`}
                  >
                    <img src={tree.iconUrl} alt={tree.name} className="w-6 h-6 object-contain" />
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Fixed-height container eliminates layout shift when switching or clearing primary path */}
        <div className="h-[208px] pt-3 border-t border-neutral-800/60 flex flex-col justify-between">
          {activePrimaryId && primaryTree ? (
            primaryTree.slots.map((slot, slotIdx) => {
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
                        <button
                          type="button"
                          onClick={() => onChange(selectPrimaryRune(value, slotIdx, rune.id))}
                          className={`${
                            isKeystone ? "w-11 h-11" : "w-9 h-9"
                          } rounded-full flex items-center justify-center border-2 transition-all cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                            isSelected
                              ? `bg-neutral-900 ${primaryAccent}`
                              : "bg-neutral-950 border-neutral-800/80 opacity-35 grayscale hover:opacity-85 hover:grayscale-0"
                          }`}
                        >
                          <img
                            src={rune.iconUrl}
                            alt={rune.name}
                            className="w-full h-full object-contain p-0.5"
                          />
                        </button>
                      </Tooltip>
                    );
                  })}
                </div>
              );
            })
          ) : (
            <div className="relative h-full flex flex-col justify-between">
              {[0, 1, 2, 3].map((row) => (
                <div
                  key={row}
                  className={`flex items-center justify-around gap-1.5 opacity-25 ${
                    row === 0 ? "pb-2 border-b border-neutral-800/40" : ""
                  }`}
                  aria-hidden="true"
                >
                  {(row === 0 ? [0, 1, 2, 3] : [0, 1, 2]).map((col) => (
                    <span
                      key={col}
                      className={`${
                        row === 0 ? "w-11 h-11" : "w-9 h-9"
                      } rounded-full border border-dashed border-neutral-700 bg-neutral-900/40`}
                    />
                  ))}
                </div>
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="px-3 py-1 rounded-md bg-neutral-950/90 border border-neutral-800/80 text-xs text-neutral-400">
                  Pick a primary path
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: SECONDARY TREE + STAT SHARDS */}
      <div className="space-y-3.5 sm:border-l sm:border-neutral-800/70 sm:pl-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2.5">
            Secondary Path
          </p>
          <div className="flex items-center gap-2.5 h-10">
            {secondaryTrees.map((tree) => {
              const isSelected = value.subRuneStyle === tree.id;
              return (
                <Tooltip key={tree.id} compact content={tree.name} position="top">
                  <button
                    type="button"
                    onClick={() => onChange(selectSubStyle(value, tree.id))}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                      isSelected
                        ? `bg-neutral-900 ${TREE_ACCENT[tree.id] || "border-sky-400"}`
                        : "bg-neutral-950 border-neutral-800/90 opacity-45 grayscale hover:opacity-90 hover:grayscale-0"
                    }`}
                  >
                    <img src={tree.iconUrl} alt={tree.name} className="w-5 h-5 object-contain" />
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Fixed-height container keeps Stat Shards locked in place with 0px shift */}
        <div className="h-[132px] pt-3 border-t border-neutral-800/60 flex flex-col justify-between">
          {subTree ? (
            subTree.slots.slice(1).map((slot, offsetIdx) => {
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
                        <button
                          type="button"
                          onClick={() => onChange(toggleSubRune(value, slotIdx, rune.id, trees))}
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                            isSelected
                              ? `bg-neutral-900 ${subAccent}`
                              : "bg-neutral-950 border-neutral-800/80 opacity-35 grayscale hover:opacity-85 hover:grayscale-0"
                          }`}
                        >
                          <img
                            src={rune.iconUrl}
                            alt={rune.name}
                            className="w-full h-full object-contain p-0.5"
                          />
                        </button>
                      </Tooltip>
                    );
                  })}
                </div>
              );
            })
          ) : (
            <div className="relative h-full flex flex-col justify-between">
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className="flex items-center justify-around gap-1.5 opacity-25"
                  aria-hidden="true"
                >
                  {[0, 1, 2].map((col) => (
                    <span
                      key={col}
                      className="w-8 h-8 rounded-full border border-dashed border-neutral-700 bg-neutral-900/40"
                    />
                  ))}
                </div>
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="px-3 py-1 rounded-md bg-neutral-950/90 border border-neutral-800/80 text-xs text-neutral-400">
                  Pick a secondary path
                </span>
              </div>
            </div>
          )}
        </div>

        {/* STAT SHARDS */}
        <div className="pt-3 border-t border-neutral-800/60 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
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
                      <button
                        type="button"
                        onClick={() => onChange(selectStatShard(value, rowIdx, shard.id))}
                        className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                          isSelected
                            ? "bg-neutral-900 border-amber-400/90"
                            : "bg-neutral-950 border-neutral-800/80 opacity-40 grayscale hover:opacity-90 hover:grayscale-0"
                        }`}
                      >
                        <img
                          src={shard.iconUrl}
                          alt={shard.name}
                          className="w-5 h-5 object-contain"
                        />
                      </button>
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
