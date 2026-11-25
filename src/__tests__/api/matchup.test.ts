import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockGetServerSession,
  mockNoteFindFirst,
  mockNoteFindUnique,
  mockNoteCreate,
  mockNoteUpdate,
  mockNoteDelete,
} = vi.hoisted(() => ({
  mockGetServerSession: vi.fn(),
  mockNoteFindFirst: vi.fn(),
  mockNoteFindUnique: vi.fn(),
  mockNoteCreate: vi.fn(),
  mockNoteUpdate: vi.fn(),
  mockNoteDelete: vi.fn(),
}));

vi.mock("next-auth", () => ({
  getServerSession: mockGetServerSession,
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    matchupNote: {
      findFirst: mockNoteFindFirst,
      findUnique: mockNoteFindUnique,
      create: mockNoteCreate,
      update: mockNoteUpdate,
      delete: mockNoteDelete,
    },
  },
}));

import { PUT, DELETE } from "@/app/api/matchup/route";

describe("/api/matchup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("PUT (upsert matchup note)", () => {
    it("returns 401 when unauthenticated", async () => {
      mockGetServerSession.mockResolvedValue(null);
      const req = new Request("http://localhost/api/matchup", {
        method: "PUT",
        body: JSON.stringify({ role: "ADC", myPick: "Xayah", enemyPick: "Vayne" }),
      });
      const res = await PUT(req);
      expect(res.status).toBe(401);
    });

    it("returns 400 when required fields or valid role are missing", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });

      const missingPick = new Request("http://localhost/api/matchup", {
        method: "PUT",
        body: JSON.stringify({ role: "ADC", myPick: "Xayah" }),
      });
      expect((await PUT(missingPick)).status).toBe(400);

      const invalidRole = new Request("http://localhost/api/matchup", {
        method: "PUT",
        body: JSON.stringify({ role: "INVALID", myPick: "Xayah", enemyPick: "Vayne" }),
      });
      expect((await PUT(invalidRole)).status).toBe(400);
    });

    it("creates a new note with exact null partner keys when none exists for 1v1 botlane", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
      mockNoteFindFirst.mockResolvedValue(null);
      mockNoteCreate.mockResolvedValue({
        id: "note-new",
        role: "ADC",
        myChampion: "Xayah",
        enemyChampion: "Vayne",
        mySupport: null,
        enemySupport: null,
        prio: "Yes",
        notes: "Push wave 1",
      });

      const req = new Request("http://localhost/api/matchup", {
        method: "PUT",
        body: JSON.stringify({
          role: "ADC",
          myPick: "Xayah",
          enemyPick: "Vayne",
          prio: "Yes",
          notes: "Push wave 1",
        }),
      });
      const res = await PUT(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.created).toBe(true);
      expect(mockNoteFindFirst).toHaveBeenCalledWith({
        where: {
          userId: "u1",
          role: "ADC",
          myChampion: "Xayah",
          enemyChampion: "Vayne",
          mySupport: null,
          enemySupport: null,
        },
        select: { id: true },
      });
      expect(mockNoteCreate).toHaveBeenCalledWith({
        data: {
          userId: "u1",
          role: "ADC",
          myChampion: "Xayah",
          enemyChampion: "Vayne",
          mySupport: null,
          enemySupport: null,
          prio: "Yes",
          notes: "Push wave 1",
        },
      });
    });

    it("updates existing note when exact 2v2 matchup already exists", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
      mockNoteFindFirst.mockResolvedValue({ id: "note-2v2" });
      mockNoteUpdate.mockResolvedValue({
        id: "note-2v2",
        prio: "50/50",
        notes: "Updated strat",
      });

      const req = new Request("http://localhost/api/matchup", {
        method: "PUT",
        body: JSON.stringify({
          role: "ADC",
          myPick: "Xayah",
          enemyPick: "Vayne",
          mySupp: "Rakan",
          enemySupp: "Lulu",
          prio: "50/50",
          notes: "Updated strat",
        }),
      });
      const res = await PUT(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.created).toBe(false);
      expect(mockNoteFindFirst).toHaveBeenCalledWith({
        where: {
          userId: "u1",
          role: "ADC",
          myChampion: "Xayah",
          enemyChampion: "Vayne",
          mySupport: "Rakan",
          enemySupport: "Lulu",
        },
        select: { id: true },
      });
      expect(mockNoteUpdate).toHaveBeenCalledWith({
        where: { id: "note-2v2" },
        data: { prio: "50/50", notes: "Updated strat" },
      });
    });
  });

  describe("DELETE", () => {
    it("returns 401 when unauthenticated", async () => {
      mockGetServerSession.mockResolvedValue(null);
      const req = new Request("http://localhost/api/matchup?id=n1", { method: "DELETE" });
      expect((await DELETE(req)).status).toBe(401);
    });

    it("returns 404 when note does not exist or belongs to another user", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
      mockNoteFindUnique.mockResolvedValue({ id: "n1", userId: "other-user" });

      const req = new Request("http://localhost/api/matchup?id=n1", { method: "DELETE" });
      expect((await DELETE(req)).status).toBe(404);
      expect(mockNoteDelete).not.toHaveBeenCalled();
    });

    it("deletes note when owned by current user", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
      mockNoteFindUnique.mockResolvedValue({ id: "n1", userId: "u1" });
      mockNoteDelete.mockResolvedValue({ id: "n1" });

      const req = new Request("http://localhost/api/matchup?id=n1", { method: "DELETE" });
      const res = await DELETE(req);
      expect(res.status).toBe(200);
      expect(mockNoteDelete).toHaveBeenCalledWith({ where: { id: "n1" } });
    });
  });
});
