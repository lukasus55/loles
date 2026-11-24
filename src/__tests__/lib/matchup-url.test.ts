import { describe, it, expect } from "vitest";
import {
  buildMatchupUrl,
  getBackUrl,
  mapAppRoleToRiotRole,
  parseMatchupSearchParams,
} from "@/lib/matchup/url";

describe("matchup/url helpers", () => {
  describe("buildMatchupUrl", () => {
    it("builds a clean URL for solo lane matchups and omits partner params", () => {
      const url = buildMatchupUrl(
        {
          role: "TOP",
          myPick: "Aatrox",
          enemyPick: "Darius",
          mySupp: "Rakan", // ignored for non-botlane
          enemySupp: "Lulu",
        },
        { from: "stats" }
      );
      expect(url).toBe("/matchup?role=TOP&my=Aatrox&enemy=Darius&from=stats");
    });

    it("includes ally and enemyPartner params for ADC and SUPP matchups", () => {
      const url = buildMatchupUrl(
        {
          role: "ADC",
          myPick: "Xayah",
          enemyPick: "Vayne",
          mySupp: "Rakan",
          enemySupp: "Lulu",
        },
        { from: "history", tab: "history" }
      );
      expect(url).toBe(
        "/matchup?role=ADC&my=Xayah&enemy=Vayne&ally=Rakan&enemyPartner=Lulu&from=history&tab=history"
      );
    });

    it("omits null/empty partner params on botlane 1v1 matchups", () => {
      const url = buildMatchupUrl({
        role: "ADC",
        myPick: "Xayah",
        enemyPick: "Vayne",
        mySupp: null,
        enemySupp: "",
      });
      expect(url).toBe("/matchup?role=ADC&my=Xayah&enemy=Vayne");
    });
  });

  describe("parseMatchupSearchParams", () => {
    it("parses canonical matchup query params", () => {
      const parsed = parseMatchupSearchParams({
        role: "ADC",
        my: "Xayah",
        enemy: "Vayne",
        ally: "Rakan",
        enemyPartner: "Lulu",
        from: "stats",
        tab: "history",
      });
      expect(parsed).toEqual({
        role: "ADC",
        myPick: "Xayah",
        enemyPick: "Vayne",
        mySupp: "Rakan",
        enemySupp: "Lulu",
        from: "stats",
        tab: "history",
      });
    });

    it("accepts legacy /note/new query parameter names (myPick, enemyPick, mySupp, enemySupp)", () => {
      const parsed = parseMatchupSearchParams({
        role: "supp",
        myPick: "Rakan",
        enemyPick: "Lulu",
        mySupp: "Xayah",
        enemySupp: "Vayne",
      });
      expect(parsed).toEqual({
        role: "SUPP",
        myPick: "Rakan",
        enemyPick: "Lulu",
        mySupp: "Xayah",
        enemySupp: "Vayne",
        from: "matchups",
        tab: "strategy",
      });
    });

    it("strips partner params for non-botlane roles", () => {
      const parsed = parseMatchupSearchParams({
        role: "MID",
        my: "Ahri",
        enemy: "Orianna",
        ally: "LeeSin",
      });
      expect(parsed?.mySupp).toBeNull();
      expect(parsed?.enemySupp).toBeNull();
    });

    it("returns null when role, my, or enemy is missing or invalid", () => {
      expect(parseMatchupSearchParams({ role: "ADC", my: "Xayah" })).toBeNull();
      expect(parseMatchupSearchParams({ role: "INVALID", my: "Xayah", enemy: "Vayne" })).toBeNull();
      expect(parseMatchupSearchParams({})).toBeNull();
    });
  });

  describe("getBackUrl & mapAppRoleToRiotRole", () => {
    it("resolves back URLs safely", () => {
      expect(getBackUrl("stats")).toBe("/stats");
      expect(getBackUrl("history")).toBe("/history");
      expect(getBackUrl("matchups")).toBe("/matchups");
      expect(getBackUrl("unknown")).toBe("/matchups");
      expect(getBackUrl(undefined)).toBe("/matchups");
    });

    it("maps app role enums to Riot Match-v5 teamPosition strings", () => {
      expect(mapAppRoleToRiotRole("TOP")).toBe("TOP");
      expect(mapAppRoleToRiotRole("JGL")).toBe("JUNGLE");
      expect(mapAppRoleToRiotRole("MID")).toBe("MIDDLE");
      expect(mapAppRoleToRiotRole("ADC")).toBe("BOTTOM");
      expect(mapAppRoleToRiotRole("SUPP")).toBe("UTILITY");
    });
  });
});
