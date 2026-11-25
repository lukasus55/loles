import { describe, it, expect, vi, beforeEach } from "vitest";
import { getShopItems } from "@/lib/riot/ddragon";

const mockFetch = vi.fn();

describe("ddragon getShopItems", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();
  });

  it("marks standard SR items as isSummonersRift: true and separates mode-specific items", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ["16.5.1"],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            "3031": {
              name: "Infinity Edge",
              plaintext: "Crit AD",
              description: "",
              image: { full: "3031.png" },
              gold: { total: 3500, purchasable: true },
              tags: ["Damage", "CriticalStrike"],
              maps: { "11": true, "12": true },
            },
            "663056": {
              name: "Demon King's Crown",
              plaintext: "Arena item",
              description: "",
              image: { full: "663056.png" },
              gold: { total: 2500, purchasable: true },
              tags: ["Damage"],
              maps: { "11": true, "30": true },
            },
            "323070": {
              name: "Tear of the Goddess",
              plaintext: "ARAM variant",
              description: "",
              image: { full: "323070.png" },
              gold: { total: 400, purchasable: true },
              tags: ["Mana"],
              maps: { "11": true },
            },
            "3070": {
              name: "Tear of the Goddess",
              plaintext: "SR Tear",
              description: "",
              image: { full: "3070.png" },
              gold: { total: 400, purchasable: true },
              tags: ["Mana"],
              maps: { "11": true },
            },
            "220001": {
              name: "Legendary Fighter Item",
              plaintext: "Anvil placeholder",
              description: "",
              image: { full: "220001.png" },
              gold: { total: 2500, purchasable: true },
              tags: [],
              maps: { "30": true },
            },
            "3112": {
              name: "Guardian's Orb",
              plaintext: "ARAM starter",
              description: "",
              image: { full: "3112.png" },
              gold: { total: 950, purchasable: true },
              tags: ["SpellDamage"],
              maps: { "11": false, "12": true },
            },
            "3599": {
              name: "Kalista's Black Spear",
              plaintext: "Champ specific",
              description: "",
              image: { full: "3599.png" },
              gold: { total: 0, purchasable: true },
              tags: [],
              maps: { "11": true },
              requiredChampion: "Kalista",
            },
          },
        }),
      });

    const items = await getShopItems();
    const byId = Object.fromEntries(items.map((i) => [i.id, i]));

    expect(byId[3031]?.isSummonersRift).toBe(true);
    expect(byId[3070]?.isSummonersRift).toBe(true);
    // 323070 should be deduplicated in favor of standard SR 3070
    expect(byId[323070]).toBeUndefined();
    // Arena/mode items with id >= 10000 or !maps["11"] are preserved for "Show all items" toggle, marked non-SR
    expect(byId[663056]?.isSummonersRift).toBe(false);
    expect(byId[3112]?.isSummonersRift).toBe(false);
    // Anvil placeholders and 0-gold items are excluded
    expect(byId[220001]).toBeUndefined();
    expect(byId[3599]).toBeUndefined();
  });
});
