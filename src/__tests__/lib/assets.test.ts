import { describe, it, expect } from "vitest";
import {
  STAT_SHARD_ROWS,
  STAT_SHARDS_BY_ID,
  buildRuneLookup,
  getItemFallbackIconUrl,
  stripDDragonHtml,
  RuneTreeData,
} from "@/lib/riot/assets";

describe("riot/assets helpers", () => {
  describe("stripDDragonHtml", () => {
    it("removes HTML/XML tags and normalizes line breaks and whitespace", () => {
      const raw =
        "<mainText><stats><attention>140</attention> Ability Power</stats><br><br>Increases   AP.</mainText>";
      expect(stripDDragonHtml(raw)).toBe("140 Ability Power Increases AP.");
    });

    it("returns empty string for nullish input", () => {
      expect(stripDDragonHtml(null)).toBe("");
      expect(stripDDragonHtml(undefined)).toBe("");
      expect(stripDDragonHtml("")).toBe("");
    });
  });

  describe("buildRuneLookup", () => {
    it("indexes rune trees and nested runes by numeric id", () => {
      const trees: RuneTreeData[] = [
        {
          id: 8000,
          key: "Precision",
          name: "Precision",
          iconUrl: "https://example.com/precision.png",
          slots: [
            {
              runes: [
                {
                  id: 8008,
                  key: "LethalTempo",
                  name: "Lethal Tempo",
                  iconUrl: "https://example.com/lt.png",
                  shortDesc: "Attack speed on hit",
                },
              ],
            },
          ],
        },
      ];

      const { stylesById, runesById } = buildRuneLookup(trees);
      expect(stylesById[8000]?.name).toBe("Precision");
      expect(runesById[8008]?.name).toBe("Lethal Tempo");
      expect(runesById[9999]).toBeUndefined();
    });
  });

  describe("stat shard definitions", () => {
    it("provides 3 rows with 3 shards each plus legacy shard lookup entries", () => {
      expect(STAT_SHARD_ROWS).toHaveLength(3);
      for (const row of STAT_SHARD_ROWS) {
        expect(row).toHaveLength(3);
      }
      expect(STAT_SHARDS_BY_ID[5008]?.name).toBe("Adaptive Force");
      expect(STAT_SHARDS_BY_ID[5005]?.name).toBe("Attack Speed");
      expect(STAT_SHARDS_BY_ID[5002]?.name).toBe("Armor");
      expect(STAT_SHARDS_BY_ID[5003]?.name).toBe("Magic Resist");
    });
  });

  describe("getItemFallbackIconUrl", () => {
    it("builds a valid versioned DDragon item icon URL", () => {
      expect(getItemFallbackIconUrl(3089, "16.5.1")).toBe(
        "https://ddragon.leagueoflegends.com/cdn/16.5.1/img/item/3089.png"
      );
    });
  });
});
