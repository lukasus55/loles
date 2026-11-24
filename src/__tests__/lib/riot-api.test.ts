import { describe, it, expect } from "vitest";
import { getContinentalRouting } from "@/lib/riot/api";

describe("getContinentalRouting", () => {
  it("maps platform regions to their Riot continental cluster", () => {
    expect(getContinentalRouting("euw1")).toBe("europe");
    expect(getContinentalRouting("EUN1")).toBe("europe");
    expect(getContinentalRouting("na1")).toBe("americas");
    expect(getContinentalRouting("BR1")).toBe("americas");
    expect(getContinentalRouting("kr")).toBe("asia");
    expect(getContinentalRouting("JP1")).toBe("asia");
    expect(getContinentalRouting("oc1")).toBe("sea");
  });

  it("defaults to europe for unknown regions", () => {
    expect(getContinentalRouting("unknown")).toBe("europe");
  });
});
