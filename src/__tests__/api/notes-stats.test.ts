import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetServerSession, mockFindMany } = vi.hoisted(() => ({
  mockGetServerSession: vi.fn(),
  mockFindMany: vi.fn(),
}));

vi.mock("next-auth", () => ({
  getServerSession: mockGetServerSession,
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    match: {
      findMany: mockFindMany,
    },
  },
}));

import { GET } from "@/app/api/notes/stats/route";

describe("GET /api/notes/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = new Request("http://localhost/api/notes/stats?myPick=Xayah&enemyPick=Vayne");
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it("returns 400 when required champion params are missing", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });

    const req = new Request("http://localhost/api/notes/stats?myPick=Xayah");
    const res = await GET(req);

    expect(res.status).toBe(400);
  });

  it("returns hasData: false when no matching games exist", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindMany.mockResolvedValue([]);

    const req = new Request(
      "http://localhost/api/notes/stats?role=ADC&myPick=Xayah&enemyPick=Vayne"
    );
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.hasData).toBe(false);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "user-1",
          role: "BOTTOM",
          championName: "Xayah",
          enemyChampionName: "Vayne",
        }),
      })
    );
  });

  it("computes winRate, killRate, csDiffAt15, and goldDiffAt15 including botlane partner filters", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindMany.mockResolvedValue([
      {
        win: true,
        csAt15: 130,
        enemyCsAt15: 110,
        goldAt15: 6000,
        enemyGoldAt15: 5200,
        laneKills: 3,
        enemyLaneKills: 1,
      },
      {
        win: false,
        csAt15: 100,
        enemyCsAt15: 110,
        goldAt15: 4800,
        enemyGoldAt15: 5000,
        laneKills: 0,
        enemyLaneKills: 2,
      },
      // Match without timeline data (e.g. <15 min game) still counts for winRate but not @15 averages
      {
        win: true,
        csAt15: null,
        enemyCsAt15: null,
        goldAt15: null,
        enemyGoldAt15: null,
        laneKills: null,
        enemyLaneKills: null,
      },
    ]);

    const req = new Request(
      "http://localhost/api/notes/stats?role=ADC&myPick=Xayah&enemyPick=Vayne&mySupp=Rakan&enemySupp=Lulu"
    );
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          partnerChampionName: "Rakan",
          enemyPartnerChampionName: "Lulu",
        }),
      })
    );
    expect(body.hasData).toBe(true);
    expect(body.totalGames).toBe(3);
    expect(body.validEarlyGameMatches).toBe(2);
    expect(body.stats.winRate).toBeCloseTo((2 / 3) * 100);
    expect(body.stats.killRate).toBeCloseTo(50); // 3 / (3 + 3)
    expect(body.stats.csDiffAt15).toBeCloseTo(5); // (+20 + -10) / 2
    expect(body.stats.goldDiffAt15).toBeCloseTo(300); // (+800 + -200) / 2
  });
});
