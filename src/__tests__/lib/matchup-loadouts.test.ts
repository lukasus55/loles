import { describe, it, expect } from "vitest";
import { RuneTreeData } from "@/lib/riot/assets";
import {
  EMPTY_BUILD_DRAFT,
  EMPTY_RUNE_DRAFT,
  addItemToList,
  buildLoadoutFromMatch,
  removeItemAtIndex,
  selectPrimaryRune,
  selectPrimaryStyle,
  selectStatShard,
  selectSubStyle,
  toggleSubRune,
} from "@/lib/matchup/loadouts";

const MOCK_TREES: RuneTreeData[] = [
  {
    id: 8000,
    key: "Precision",
    name: "Precision",
    iconUrl: "",
    slots: [
      { runes: [{ id: 8005, key: "PTA", name: "PTA", iconUrl: "", shortDesc: "" }, { id: 8008, key: "LT", name: "Lethal Tempo", iconUrl: "", shortDesc: "" }] },
      { runes: [{ id: 9111, key: "Triumph", name: "Triumph", iconUrl: "", shortDesc: "" }, { id: 8009, key: "PoM", name: "PoM", iconUrl: "", shortDesc: "" }] },
      { runes: [{ id: 9104, key: "Alacrity", name: "Alacrity", iconUrl: "", shortDesc: "" }, { id: 9103, key: "Bloodline", name: "Bloodline", iconUrl: "", shortDesc: "" }] },
      { runes: [{ id: 8014, key: "Coup", name: "Coup", iconUrl: "", shortDesc: "" }, { id: 8017, key: "CutDown", name: "Cut Down", iconUrl: "", shortDesc: "" }] },
    ],
  },
  {
    id: 8300,
    key: "Inspiration",
    name: "Inspiration",
    iconUrl: "",
    slots: [
      { runes: [{ id: 8351, key: "Glacial", name: "Glacial", iconUrl: "", shortDesc: "" }] },
      { runes: [{ id: 8304, key: "Boots", name: "Magical Footwear", iconUrl: "", shortDesc: "" }, { id: 8306, key: "Hexflash", name: "Hexflash", iconUrl: "", shortDesc: "" }] },
      { runes: [{ id: 8345, key: "Biscuit", name: "Biscuit", iconUrl: "", shortDesc: "" }, { id: 8316, key: "TripleTonic", name: "Triple Tonic", iconUrl: "", shortDesc: "" }] },
      { runes: [{ id: 8347, key: "Cosmic", name: "Cosmic Insight", iconUrl: "", shortDesc: "" }, { id: 8410, key: "Approach", name: "Approach Velocity", iconUrl: "", shortDesc: "" }] },
    ],
  },
];

describe("matchup/loadouts pure helpers", () => {
  it("selectPrimaryStyle resets primaryRunes and clears subStyle if identical", () => {
    const start = {
      ...EMPTY_RUNE_DRAFT,
      primaryRuneStyle: 8000,
      primaryRunes: [8008, 9111, 9104, 8014],
      subRuneStyle: 8300,
      subRunes: [8304, 8345],
    };

    const next = selectPrimaryStyle(start, 8300);
    expect(next.primaryRuneStyle).toBe(8300);
    expect(next.primaryRunes).toEqual([0, 0, 0, 0]);
    expect(next.subRuneStyle).toBeNull();
    expect(next.subRunes).toEqual([]);
  });

  it("selectPrimaryRune updates specific slot without touching other rows", () => {
    let page = selectPrimaryStyle(EMPTY_RUNE_DRAFT, 8000);
    page = selectPrimaryRune(page, 0, 8008);
    page = selectPrimaryRune(page, 2, 9104);
    expect(page.primaryRunes).toEqual([8008, 0, 9104, 0]);
  });

  it("selectSubStyle rejects choosing the same style as primaryRuneStyle", () => {
    const page = selectPrimaryStyle(EMPTY_RUNE_DRAFT, 8000);
    const sameAttempt = selectSubStyle(page, 8000);
    expect(sameAttempt.subRuneStyle).toBeNull();

    const valid = selectSubStyle(page, 8300);
    expect(valid.subRuneStyle).toBe(8300);
    expect(valid.subRunes).toEqual([]);
  });

  it("toggleSubRune enforces League's 2-of-3 distinct secondary rows rule", () => {
    let page = selectSubStyle(selectPrimaryStyle(EMPTY_RUNE_DRAFT, 8000), 8300);

    // Pick row 1 (8304) and row 2 (8345)
    page = toggleSubRune(page, 1, 8304, MOCK_TREES);
    page = toggleSubRune(page, 2, 8345, MOCK_TREES);
    expect(page.subRunes).toEqual([8304, 8345]);

    // Pick another rune in row 2 (8316) -> replaces 8345 in place
    page = toggleSubRune(page, 2, 8316, MOCK_TREES);
    expect(page.subRunes).toEqual([8304, 8316]);

    // Pick rune in row 3 (8347) when 2 already picked -> FIFO replaces oldest (8304)
    page = toggleSubRune(page, 3, 8347, MOCK_TREES);
    expect(page.subRunes).toEqual([8316, 8347]);

    // Clicking an already selected rune toggles it off
    page = toggleSubRune(page, 3, 8347, MOCK_TREES);
    expect(page.subRunes).toEqual([8316]);
  });

  it("selectStatShard updates offense/flex/defense slot independently", () => {
    let page = selectStatShard(EMPTY_RUNE_DRAFT, 0, 5005);
    page = selectStatShard(page, 1, 5008);
    page = selectStatShard(page, 2, 5011);
    expect(page.statShards).toEqual([5005, 5008, 5011]);
  });

  it("addItemToList respects maxItems and removeItemAtIndex removes cleanly", () => {
    let list = addItemToList(EMPTY_BUILD_DRAFT.starterItems, 1055, 2);
    list = addItemToList(list, 2003, 2);
    list = addItemToList(list, 1083, 2); // exceeds max 2
    expect(list).toEqual([1055, 2003]);
    expect(removeItemAtIndex(list, 0)).toEqual([2003]);
  });

  it("buildLoadoutFromMatch converts a played match into a clean preset draft", () => {
    const draft = buildLoadoutFromMatch({
      win: true,
      gameCreation: "2026-11-20T18:00:00.000Z",
      items: [3508, 3006, 6675, 3031],
      primaryRuneStyle: 8000,
      subRuneStyle: 8300,
      primaryRunes: [8008, 9111, 9104, 8014],
      subRunes: [8304, 8345],
      statShards: [5005, 5008, 5011],
    });

    expect(draft.runes.primaryRuneStyle).toBe(8000);
    expect(draft.runes.primaryRunes).toEqual([8008, 9111, 9104, 8014]);
    expect(draft.runes.subRunes).toEqual([8304, 8345]);
    expect(draft.runes.statShards).toEqual([5005, 5008, 5011]);
    expect(draft.build.coreItems).toEqual([3508, 3006, 6675, 3031]);
    expect(draft.suggestedName).toContain("Win");
  });
});
