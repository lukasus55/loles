import { RuneTreeData } from "@/lib/riot/assets";

export interface RunePageDraft {
  primaryRuneStyle: number | null;
  subRuneStyle: number | null;
  primaryRunes: number[]; // length 4: [keystone, row1, row2, row3], 0 = unset
  subRunes: number[]; // up to 2 runes from 2 distinct secondary rows
  statShards: number[]; // length 3: [offense, flex, defense], 0 = unset
}

export interface BuildDraft {
  starterItems: number[];
  coreItems: number[];
  situational: number[];
}

export interface RunePresetDTO extends RunePageDraft {
  id: string;
  name: string;
  order: number;
}

export interface BuildPresetDTO extends BuildDraft {
  id: string;
  name: string;
  order: number;
}

export interface SetupPresetDTO {
  id: string;
  name: string;
  note: string | null;
  order: number;
  runePresetId: string | null;
  buildPresetId: string | null;
  runePreset: RunePresetDTO | null;
  buildPreset: BuildPresetDTO | null;
}

export const EMPTY_RUNE_DRAFT: RunePageDraft = {
  primaryRuneStyle: null,
  subRuneStyle: null,
  primaryRunes: [0, 0, 0, 0],
  subRunes: [],
  statShards: [0, 0, 0],
};

export const EMPTY_BUILD_DRAFT: BuildDraft = {
  starterItems: [],
  coreItems: [],
  situational: [],
};

export function normalizeRuneDraft(input?: Partial<RunePageDraft> | null): RunePageDraft {
  const primaryRunes = Array.from({ length: 4 }, (_, i) => input?.primaryRunes?.[i] ?? 0);
  const subRunes = (input?.subRunes ?? []).filter((id) => id > 0).slice(0, 2);
  const statShards = Array.from({ length: 3 }, (_, i) => input?.statShards?.[i] ?? 0);

  return {
    primaryRuneStyle: input?.primaryRuneStyle ?? null,
    subRuneStyle: input?.subRuneStyle ?? null,
    primaryRunes,
    subRunes,
    statShards,
  };
}

export function normalizeBuildDraft(input?: Partial<BuildDraft> | null): BuildDraft {
  return {
    starterItems: (input?.starterItems ?? []).filter((id) => id > 0).slice(0, 4),
    coreItems: (input?.coreItems ?? []).filter((id) => id > 0).slice(0, 6),
    situational: (input?.situational ?? []).filter((id) => id > 0).slice(0, 6),
  };
}

export function selectPrimaryStyle(current: RunePageDraft, styleId: number): RunePageDraft {
  const sameAsSub = current.subRuneStyle === styleId;
  return {
    ...current,
    primaryRuneStyle: styleId,
    primaryRunes: [0, 0, 0, 0],
    subRuneStyle: sameAsSub ? null : current.subRuneStyle,
    subRunes: sameAsSub ? [] : current.subRunes,
  };
}

export function selectPrimaryRune(
  current: RunePageDraft,
  slotIndex: number,
  perkId: number
): RunePageDraft {
  if (slotIndex < 0 || slotIndex > 3) return current;
  const next = Array.from({ length: 4 }, (_, i) => current.primaryRunes[i] ?? 0);
  next[slotIndex] = perkId;
  return {
    ...current,
    primaryRunes: next,
  };
}

export function selectSubStyle(current: RunePageDraft, styleId: number): RunePageDraft {
  if (current.primaryRuneStyle === styleId) return current;
  return {
    ...current,
    subRuneStyle: styleId,
    subRunes: [],
  };
}

function findRuneRowInTree(tree: RuneTreeData | undefined, perkId: number): number {
  if (!tree) return -1;
  for (let rowIdx = 1; rowIdx < tree.slots.length; rowIdx++) {
    if (tree.slots[rowIdx].runes.some((r) => r.id === perkId)) {
      return rowIdx;
    }
  }
  return -1;
}

/**
 * Applies the official League of Legends secondary rune selection rule:
 * - Up to 2 runes, each from a different row (slots 1..3 of the secondary tree).
 * - Clicking an already selected rune toggles it off.
 * - Clicking a rune in the same row as a selected rune replaces it in place.
 * - Clicking a rune in a new row when 2 are already selected replaces the oldest selection (FIFO).
 */
export function toggleSubRune(
  current: RunePageDraft,
  slotIndex: number,
  perkId: number,
  trees: RuneTreeData[]
): RunePageDraft {
  if (!current.subRuneStyle || slotIndex < 1 || slotIndex > 3) return current;

  const existing = current.subRunes.filter((id) => id > 0);
  if (existing.includes(perkId)) {
    return {
      ...current,
      subRunes: existing.filter((id) => id !== perkId),
    };
  }

  const subTree = trees.find((t) => t.id === current.subRuneStyle);
  const sameRowIndex = existing.findIndex((id) => findRuneRowInTree(subTree, id) === slotIndex);

  if (sameRowIndex !== -1) {
    const next = [...existing];
    next[sameRowIndex] = perkId;
    return { ...current, subRunes: next };
  }

  if (existing.length < 2) {
    return { ...current, subRunes: [...existing, perkId] };
  }

  // FIFO: keep the second (newer) rune and append the newly clicked rune
  return { ...current, subRunes: [existing[1], perkId] };
}

export function selectStatShard(
  current: RunePageDraft,
  rowIndex: number,
  shardId: number
): RunePageDraft {
  if (rowIndex < 0 || rowIndex > 2) return current;
  const next = Array.from({ length: 3 }, (_, i) => current.statShards[i] ?? 0);
  next[rowIndex] = shardId;
  return { ...current, statShards: next };
}

export function addItemToList(items: number[], itemId: number, maxItems: number): number[] {
  if (items.length >= maxItems || itemId <= 0) return items;
  return [...items, itemId];
}

export function removeItemAtIndex(items: number[], index: number): number[] {
  return items.filter((_, i) => i !== index);
}

export function buildLoadoutFromMatch(match: {
  win: boolean;
  gameCreation: string | Date;
  items?: number[];
  primaryRuneStyle?: number | null;
  subRuneStyle?: number | null;
  primaryRunes?: number[];
  subRunes?: number[];
  statShards?: number[];
}): {
  suggestedName: string;
  runes: RunePageDraft;
  build: BuildDraft;
} {
  const dateLabel = new Date(match.gameCreation).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const outcome = match.win ? "Win" : "Loss";

  return {
    suggestedName: `From ${outcome} (${dateLabel})`,
    runes: normalizeRuneDraft({
      primaryRuneStyle: match.primaryRuneStyle ?? null,
      subRuneStyle: match.subRuneStyle ?? null,
      primaryRunes: match.primaryRunes ?? [],
      subRunes: match.subRunes ?? [],
      statShards: match.statShards ?? [],
    }),
    build: normalizeBuildDraft({
      starterItems: [],
      coreItems: match.items ?? [],
      situational: [],
    }),
  };
}
