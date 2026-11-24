import { describe, it, expect } from "vitest";
import {
  StatsMatchRecord,
  aggregateByPerspective,
  buildTableTitle,
  computeSummaryStats,
  filterMatches,
  getAvailablePerspectives,
  resolveActivePerspective,
} from "@/lib/stats/analytics";

const SAMPLE_MATCHES: StatsMatchRecord[] = [
  {
    id: "m1",
    season: 16,
    role: "BOTTOM",
    championName: "Xayah",
    enemyChampionName: "Vayne",
    partnerChampionName: "Rakan",
    enemyPartnerChampionName: "Lulu",
    win: true,
    kills: 10,
    deaths: 2,
    assists: 8,
    cs: 240,
    gameDuration: 1800, // 30m
    csAt15: 130,
    enemyCsAt15: 115,
    goldAt15: 5900,
    enemyGoldAt15: 5200,
  },
  {
    id: "m2",
    season: 16,
    role: "BOTTOM",
    championName: "Xayah",
    enemyChampionName: "Jinx",
    partnerChampionName: "Nautilus",
    enemyPartnerChampionName: "Thresh",
    win: false,
    kills: 4,
    deaths: 6,
    assists: 4,
    cs: 180,
    gameDuration: 1800, // 30m
    csAt15: 105,
    enemyCsAt15: 110,
    goldAt15: 4800,
    enemyGoldAt15: 5100,
  },
  {
    id: "m3",
    season: 16,
    role: "BOTTOM",
    championName: "Xayah",
    enemyChampionName: "Vayne",
    partnerChampionName: "Nautilus",
    enemyPartnerChampionName: "Thresh",
    win: true,
    kills: 8,
    deaths: 2,
    assists: 6,
    cs: 210,
    gameDuration: 1500, // 25m
    csAt15: null,
    enemyCsAt15: null,
    goldAt15: null,
    enemyGoldAt15: null,
  },
  {
    id: "m4",
    season: 16,
    role: "UTILITY",
    championName: "Rakan",
    enemyChampionName: "Lulu",
    partnerChampionName: "Xayah",
    enemyPartnerChampionName: "Vayne",
    win: true,
    kills: 1,
    deaths: 2,
    assists: 18,
    cs: 30,
    gameDuration: 1800,
  },
  {
    id: "m5",
    season: 15,
    role: "TOP",
    championName: "Aatrox",
    enemyChampionName: "Darius",
    partnerChampionName: null,
    enemyPartnerChampionName: null,
    win: false,
    kills: 3,
    deaths: 5,
    assists: 2,
    cs: 190,
    gameDuration: 1800,
  },
];

describe("stats/analytics engine", () => {
  describe("filterMatches", () => {
    it("filters by season and role mapping (ADC -> BOTTOM, SUPP -> UTILITY)", () => {
      const adcS16 = filterMatches(SAMPLE_MATCHES, {
        season: 16,
        role: "ADC",
        champions: { myPick: null, enemyPick: null, mySupp: null, enemySupp: null },
      });
      expect(adcS16.map((m) => m.id)).toEqual(["m1", "m2", "m3"]);

      const supp = filterMatches(SAMPLE_MATCHES, {
        season: null,
        role: "SUPP",
        champions: { myPick: null, enemyPick: null, mySupp: null, enemySupp: null },
      });
      expect(supp.map((m) => m.id)).toEqual(["m4"]);
    });

    it("filters by all 4 botlane champion slots simultaneously", () => {
      const exact2v2 = filterMatches(SAMPLE_MATCHES, {
        season: 16,
        role: "ADC",
        champions: {
          myPick: "Xayah",
          enemyPick: "Vayne",
          mySupp: "Rakan",
          enemySupp: "Lulu",
        },
      });
      expect(exact2v2.map((m) => m.id)).toEqual(["m1"]);
    });

    it("filters support games by ally ADC (mySupp slot)", () => {
      const withXayah = filterMatches(SAMPLE_MATCHES, {
        season: null,
        role: "SUPP",
        champions: {
          myPick: null,
          enemyPick: null,
          mySupp: "Xayah",
          enemySupp: null,
        },
      });
      expect(withXayah.map((m) => m.id)).toEqual(["m4"]);
    });

    it("ignores partner filters when role is non-botlane", () => {
      const top = filterMatches(SAMPLE_MATCHES, {
        season: 15,
        role: "TOP",
        champions: {
          myPick: "Aatrox",
          enemyPick: null,
          mySupp: "Rakan",
          enemySupp: "Lulu",
        },
      });
      expect(top.map((m) => m.id)).toEqual(["m5"]);
    });
  });

  describe("getAvailablePerspectives", () => {
    it("returns all 4 botlane perspectives when ADC role has no picks selected", () => {
      const perspectives = getAvailablePerspectives("ADC", {
        myPick: null,
        enemyPick: null,
        mySupp: null,
        enemySupp: null,
      });
      expect(perspectives.map((p) => p.id)).toEqual([
        "myPick",
        "enemyPick",
        "mySupp",
        "enemySupp",
      ]);
      expect(perspectives.find((p) => p.id === "mySupp")?.label).toBe("With Ally Support");
      expect(perspectives.find((p) => p.id === "enemySupp")?.label).toBe("vs Enemy Support");
    });

    it("returns vs Enemy ADC, With Ally Support, and vs Enemy Support when ADC picked Xayah", () => {
      const perspectives = getAvailablePerspectives("ADC", {
        myPick: "Xayah",
        enemyPick: null,
        mySupp: null,
        enemySupp: null,
      });
      expect(perspectives.map((p) => p.id)).toEqual(["enemyPick", "mySupp", "enemySupp"]);
    });

    it("uses Support-specific labels and puts My Supports first when playing SUPP with Ally ADC selected", () => {
      const perspectives = getAvailablePerspectives("SUPP", {
        myPick: null,
        enemyPick: null,
        mySupp: "Xayah",
        enemySupp: null,
      });
      expect(perspectives.map((p) => p.id)).toEqual(["myPick", "enemyPick", "enemySupp"]);
      expect(perspectives[0].label).toBe("My Supports");
      expect(perspectives[1].label).toBe("vs Enemy Support");
      expect(perspectives[2].label).toBe("vs Enemy ADC");
    });

    it("returns partner breakdown perspectives even when exact 1v1 botlane matchup is selected", () => {
      const perspectives = getAvailablePerspectives("ADC", {
        myPick: "Xayah",
        enemyPick: "Vayne",
        mySupp: null,
        enemySupp: null,
      });
      expect(perspectives.map((p) => p.id)).toEqual(["mySupp", "enemySupp"]);
    });

    it("returns empty array when full 2v2 botlane matchup is selected", () => {
      const perspectives = getAvailablePerspectives("ADC", {
        myPick: "Xayah",
        enemyPick: "Vayne",
        mySupp: "Rakan",
        enemySupp: "Lulu",
      });
      expect(perspectives).toEqual([]);
    });

    it("returns only myPick and enemyPick for solo lanes or All Roles", () => {
      const topPerspectives = getAvailablePerspectives("TOP", {
        myPick: null,
        enemyPick: null,
        mySupp: null,
        enemySupp: null,
      });
      expect(topPerspectives.map((p) => p.id)).toEqual(["myPick", "enemyPick"]);

      const allRolesExact = getAvailablePerspectives(null, {
        myPick: "Xayah",
        enemyPick: "Vayne",
        mySupp: null,
        enemySupp: null,
      });
      expect(allRolesExact).toEqual([]);
    });
  });

  describe("resolveActivePerspective", () => {
    it("keeps requested perspective if still available, else falls back to first available", () => {
      const available = getAvailablePerspectives("ADC", {
        myPick: "Xayah",
        enemyPick: null,
        mySupp: null,
        enemySupp: null,
      });
      expect(resolveActivePerspective("mySupp", available)).toBe("mySupp");
      expect(resolveActivePerspective("myPick", available)).toBe("enemyPick");
      expect(resolveActivePerspective("mySupp", [])).toBeNull();
    });
  });

  describe("aggregateByPerspective", () => {
    it("groups ADC matches by ally support (mySupp) accurately", () => {
      const xayahGames = SAMPLE_MATCHES.slice(0, 3);
      const rows = aggregateByPerspective(xayahGames, "mySupp");

      const nautilus = rows.find((r) => r.championName === "Nautilus");
      const rakan = rows.find((r) => r.championName === "Rakan");

      expect(rows).toHaveLength(2);
      expect(nautilus).toMatchObject({
        championName: "Nautilus",
        played: 2,
        wins: 1,
        kills: 12,
        deaths: 8,
        assists: 10,
      });
      expect(rakan).toMatchObject({
        championName: "Rakan",
        played: 1,
        wins: 1,
      });
    });

    it("groups matches by enemy support (enemySupp) and skips matches with null values", () => {
      const rows = aggregateByPerspective(SAMPLE_MATCHES, "enemySupp");
      expect(rows.map((r) => r.championName).sort()).toEqual(["Lulu", "Thresh", "Vayne"]);
      const thresh = rows.find((r) => r.championName === "Thresh");
      expect(thresh?.played).toBe(2);
      expect(thresh?.wins).toBe(1);
    });
  });

  describe("computeSummaryStats", () => {
    it("computes winRate, KDA, CS/min, duration, and @15 diffs (ignoring null @15 matches)", () => {
      const summary = computeSummaryStats(SAMPLE_MATCHES.slice(0, 3));
      expect(summary.played).toBe(3);
      expect(summary.wins).toBe(2);
      expect(summary.losses).toBe(1);
      expect(summary.winRate).toBeCloseTo((2 / 3) * 100);
      expect(summary.avgKills).toBeCloseTo((10 + 4 + 8) / 3);
      expect(summary.avgDeaths).toBeCloseTo((2 + 6 + 2) / 3);
      expect(summary.avgAssists).toBeCloseTo((8 + 4 + 6) / 3);
      expect(summary.earlyGameCount).toBe(2);
      expect(summary.avgCsDiff15).toBeCloseTo((15 - 5) / 2); // +5
      expect(summary.avgGoldDiff15).toBeCloseTo((700 - 300) / 2); // +200
    });

    it("handles empty match array safely without NaN", () => {
      const summary = computeSummaryStats([]);
      expect(summary).toEqual({
        played: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        avgKills: 0,
        avgDeaths: 0,
        avgAssists: 0,
        kdaRatio: 0,
        avgCsPerMin: 0,
        avgDurationSec: 0,
        avgCsDiff15: null,
        avgGoldDiff15: null,
        earlyGameCount: 0,
      });
    });
  });

  describe("buildTableTitle", () => {
    it("builds clear contextual titles for botlane and solo perspectives", () => {
      expect(
        buildTableTitle("mySupp", "ADC", {
          myPick: "Xayah",
          enemyPick: null,
          mySupp: null,
          enemySupp: null,
        })
      ).toBe("Xayah — With Ally Support");

      expect(
        buildTableTitle("myPick", "SUPP", {
          myPick: null,
          enemyPick: null,
          mySupp: "Xayah",
          enemySupp: null,
        })
      ).toBe("Your Supports with Xayah");

      expect(
        buildTableTitle("enemySupp", "ADC", {
          myPick: "Xayah",
          enemyPick: "Vayne",
          mySupp: null,
          enemySupp: null,
        })
      ).toBe("Xayah vs Vayne — vs Enemy Support");
    });
  });
});
