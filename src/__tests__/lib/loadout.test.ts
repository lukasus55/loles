import { describe, it, expect } from "vitest";
import { extractParticipantLoadout } from "@/lib/riot/loadout";

describe("extractParticipantLoadout", () => {
  it("extracts full items, trinket, summoner spells, runes, and stat shards", () => {
    const loadout = extractParticipantLoadout({
      item0: 3508,
      item1: 3006,
      item2: 6675,
      item3: 3031,
      item4: 0,
      item5: 0,
      item6: 3363,
      summoner1Id: 4,
      summoner2Id: 21,
      perks: {
        statPerks: {
          offense: 5005,
          flex: 5008,
          defense: 5011,
        },
        styles: [
          {
            description: "primaryStyle",
            style: 8000,
            selections: [
              { perk: 8008 },
              { perk: 9111 },
              { perk: 9104 },
              { perk: 8014 },
            ],
          },
          {
            description: "subStyle",
            style: 8300,
            selections: [{ perk: 8304 }, { perk: 8345 }],
          },
        ],
      },
    });

    expect(loadout).toEqual({
      items: [3508, 3006, 6675, 3031],
      trinketId: 3363,
      summoner1Id: 4,
      summoner2Id: 21,
      primaryRuneStyle: 8000,
      subRuneStyle: 8300,
      keystoneId: 8008,
      primaryRunes: [8008, 9111, 9104, 8014],
      subRunes: [8304, 8345],
      statShards: [5005, 5008, 5011],
      loadoutSynced: true,
    });
  });

  it("handles empty inventory, missing trinket, and missing perks gracefully", () => {
    const loadout = extractParticipantLoadout({
      item0: 0,
      item1: 0,
      item6: 0,
    });

    expect(loadout).toEqual({
      items: [],
      trinketId: null,
      summoner1Id: null,
      summoner2Id: null,
      primaryRuneStyle: null,
      subRuneStyle: null,
      keystoneId: null,
      primaryRunes: [],
      subRunes: [],
      statShards: [],
      loadoutSynced: true,
    });
  });

  it("falls back to positional styles when description is omitted", () => {
    const loadout = extractParticipantLoadout({
      perks: {
        styles: [
          { style: 8200, selections: [{ perk: 8214 }, { perk: 8226 }] },
          { style: 8400, selections: [{ perk: 8473 }] },
        ],
      },
    });

    expect(loadout.primaryRuneStyle).toBe(8200);
    expect(loadout.subRuneStyle).toBe(8400);
    expect(loadout.keystoneId).toBe(8214);
    expect(loadout.primaryRunes).toEqual([8214, 8226]);
    expect(loadout.subRunes).toEqual([8473]);
  });

  it("ignores zero or non-numeric perk and item values", () => {
    const loadout = extractParticipantLoadout({
      item0: 1055,
      item1: "invalid",
      item2: -5,
      summoner1Id: 0,
      summoner2Id: 4,
      perks: {
        statPerks: { offense: 5008, flex: 0, defense: null },
        styles: [
          {
            description: "primaryStyle",
            style: 8000,
            selections: [{ perk: 8021 }, { perk: 0 }, { perk: "bad" }],
          },
        ],
      },
    });

    expect(loadout.items).toEqual([1055]);
    expect(loadout.summoner1Id).toBeNull();
    expect(loadout.summoner2Id).toBe(4);
    expect(loadout.primaryRunes).toEqual([8021]);
    expect(loadout.statShards).toEqual([5008]);
  });
});
