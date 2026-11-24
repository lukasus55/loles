import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockGetServerSession,
  mockMatchFindMany,
  mockMatchFindUnique,
  mockMatchUpdate,
  mockRiotAccountFindUnique,
  mockFetchMatchDetails,
} = vi.hoisted(() => ({
  mockGetServerSession: vi.fn(),
  mockMatchFindMany: vi.fn(),
  mockMatchFindUnique: vi.fn(),
  mockMatchUpdate: vi.fn(),
  mockRiotAccountFindUnique: vi.fn(),
  mockFetchMatchDetails: vi.fn(),
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
      findMany: mockMatchFindMany,
      findUnique: mockMatchFindUnique,
      update: mockMatchUpdate,
    },
    riotAccount: {
      findUnique: mockRiotAccountFindUnique,
    },
  },
}));

vi.mock("@/lib/riot/api", () => ({
  fetchMatchDetails: mockFetchMatchDetails,
}));

import { GET, POST } from "@/app/api/riot/sync/backfill/route";

describe("/api/riot/sync/backfill", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("returns 401 when unauthenticated", async () => {
      mockGetServerSession.mockResolvedValue(null);
      const res = await GET();
      expect(res.status).toBe(401);
    });

    it("returns pending matchIds and total count", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
      mockMatchFindMany.mockResolvedValue([
        { matchId: "EUN1_1" },
        { matchId: "EUN1_2" },
      ]);

      const res = await GET();
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual({ matchIds: ["EUN1_1", "EUN1_2"], total: 2 });
    });
  });

  describe("POST", () => {
    it("returns 401 when unauthenticated", async () => {
      mockGetServerSession.mockResolvedValue(null);
      const req = new Request("http://localhost/api/riot/sync/backfill", {
        method: "POST",
        body: JSON.stringify({ matchIds: ["EUN1_1"] }),
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it("returns 400 when matchIds array is empty", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
      const req = new Request("http://localhost/api/riot/sync/backfill", {
        method: "POST",
        body: JSON.stringify({ matchIds: [] }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 when user has no linked Riot account", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
      mockRiotAccountFindUnique.mockResolvedValue(null);

      const req = new Request("http://localhost/api/riot/sync/backfill", {
        method: "POST",
        body: JSON.stringify({ matchIds: ["EUN1_1"] }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("updates unsynced match with extracted loadout and skips already synced matches", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
      mockRiotAccountFindUnique.mockResolvedValue({ puuid: "puuid-1", region: "eun1" });

      mockMatchFindUnique
        .mockResolvedValueOnce({ id: "db-1", loadoutSynced: false, puuid: "puuid-1" })
        .mockResolvedValueOnce({ id: "db-2", loadoutSynced: true, puuid: "puuid-1" });

      mockFetchMatchDetails.mockResolvedValue({
        info: {
          participants: [
            {
              puuid: "puuid-1",
              item0: 3031,
              item1: 3006,
              item6: 3363,
              summoner1Id: 4,
              summoner2Id: 7,
              perks: {
                statPerks: { offense: 5005, flex: 5008, defense: 5011 },
                styles: [
                  { description: "primaryStyle", style: 8000, selections: [{ perk: 8008 }] },
                  { description: "subStyle", style: 8300, selections: [{ perk: 8304 }] },
                ],
              },
            },
          ],
        },
      });

      const req = new Request("http://localhost/api/riot/sync/backfill", {
        method: "POST",
        body: JSON.stringify({ matchIds: ["EUN1_1", "EUN1_2"] }),
      });
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual({ success: true, updatedCount: 1, failedCount: 0 });
      expect(mockFetchMatchDetails).toHaveBeenCalledTimes(1);
      expect(mockMatchUpdate).toHaveBeenCalledWith({
        where: { id: "db-1" },
        data: expect.objectContaining({
          items: [3031, 3006],
          trinketId: 3363,
          keystoneId: 8008,
          loadoutSynced: true,
        }),
      });
    });

    it("marks purged Riot 404 matches as loadoutSynced so backfill does not loop forever", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
      mockRiotAccountFindUnique.mockResolvedValue({ puuid: "puuid-1", region: "eun1" });
      mockMatchFindUnique.mockResolvedValue({
        id: "db-old",
        loadoutSynced: false,
        puuid: "puuid-1",
      });
      mockFetchMatchDetails.mockRejectedValue(new Error("Riot Match Details API Error: 404"));
      mockMatchUpdate.mockResolvedValue({});

      const req = new Request("http://localhost/api/riot/sync/backfill", {
        method: "POST",
        body: JSON.stringify({ matchIds: ["EUN1_OLD"] }),
      });
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.failedCount).toBe(0);
      expect(mockMatchUpdate).toHaveBeenCalledWith({
        where: { matchId_userId: { matchId: "EUN1_OLD", userId: "u1" } },
        data: { loadoutSynced: true },
      });
    });

    it("does not mark transient 429 errors as synced", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
      mockRiotAccountFindUnique.mockResolvedValue({ puuid: "puuid-1", region: "eun1" });
      mockMatchFindUnique.mockResolvedValue({
        id: "db-rl",
        loadoutSynced: false,
        puuid: "puuid-1",
      });
      mockFetchMatchDetails.mockRejectedValue(new Error("Riot Match Details API Error: 429"));

      const req = new Request("http://localhost/api/riot/sync/backfill", {
        method: "POST",
        body: JSON.stringify({ matchIds: ["EUN1_RL"] }),
      });
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.failedCount).toBe(1);
      expect(mockMatchUpdate).not.toHaveBeenCalled();
    });
  });
});
