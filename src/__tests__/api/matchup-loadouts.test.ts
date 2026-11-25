import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockGetServerSession,
  mockNoteFindFirst,
  mockNoteCreate,
  mockNoteUpdate,
  mockSetupFindUnique,
  mockSetupCreate,
  mockSetupUpdate,
  mockSetupDelete,
  mockRuneFindUnique,
  mockRuneCreate,
  mockRuneUpdate,
  mockRuneDelete,
  mockBuildFindUnique,
  mockBuildCreate,
  mockBuildUpdate,
  mockBuildDelete,
} = vi.hoisted(() => ({
  mockGetServerSession: vi.fn(),
  mockNoteFindFirst: vi.fn(),
  mockNoteCreate: vi.fn(),
  mockNoteUpdate: vi.fn(),
  mockSetupFindUnique: vi.fn(),
  mockSetupCreate: vi.fn(),
  mockSetupUpdate: vi.fn(),
  mockSetupDelete: vi.fn(),
  mockRuneFindUnique: vi.fn(),
  mockRuneCreate: vi.fn(),
  mockRuneUpdate: vi.fn(),
  mockRuneDelete: vi.fn(),
  mockBuildFindUnique: vi.fn(),
  mockBuildCreate: vi.fn(),
  mockBuildUpdate: vi.fn(),
  mockBuildDelete: vi.fn(),
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
      create: mockNoteCreate,
      update: mockNoteUpdate,
    },
    matchupSetup: {
      findUnique: mockSetupFindUnique,
      create: mockSetupCreate,
      update: mockSetupUpdate,
      delete: mockSetupDelete,
    },
    matchupRunePreset: {
      findUnique: mockRuneFindUnique,
      create: mockRuneCreate,
      update: mockRuneUpdate,
      delete: mockRuneDelete,
    },
    matchupBuildPreset: {
      findUnique: mockBuildFindUnique,
      create: mockBuildCreate,
      update: mockBuildUpdate,
      delete: mockBuildDelete,
    },
  },
}));

import { POST } from "@/app/api/matchup/loadouts/route";

const BASE_MATCHUP = {
  role: "ADC",
  myPick: "Xayah",
  enemyPick: "Vayne",
  mySupp: null,
  enemySupp: null,
};

describe("POST /api/matchup/loadouts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const req = new Request("http://localhost/api/matchup/loadouts", {
      method: "POST",
      body: JSON.stringify({ action: "toggleDetach", matchup: BASE_MATCHUP, detachLoadouts: true }),
    });
    expect((await POST(req)).status).toBe(401);
  });

  it("returns 400 for invalid action", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
    const req = new Request("http://localhost/api/matchup/loadouts", {
      method: "POST",
      body: JSON.stringify({ action: "unknownAction" }),
    });
    expect((await POST(req)).status).toBe(400);
  });

  it("toggleDetach auto-creates MatchupNote if missing and updates detachLoadouts", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
    mockNoteFindFirst.mockResolvedValue(null);
    mockNoteCreate.mockResolvedValue({ id: "note-1", detachLoadouts: false });
    mockNoteUpdate.mockResolvedValue({ id: "note-1", detachLoadouts: true });

    const req = new Request("http://localhost/api/matchup/loadouts", {
      method: "POST",
      body: JSON.stringify({ action: "toggleDetach", matchup: BASE_MATCHUP, detachLoadouts: true }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.detachLoadouts).toBe(true);
    expect(mockNoteCreate).toHaveBeenCalledTimes(1);
    expect(mockNoteUpdate).toHaveBeenCalledWith({
      where: { id: "note-1" },
      data: { detachLoadouts: true },
    });
  });

  it("saveSetup creates linked runePreset, buildPreset, and setup on a matchup", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
    mockNoteFindFirst.mockResolvedValue({ id: "note-1" });
    mockRuneCreate.mockResolvedValue({ id: "rp-1", name: "With Prio" });
    mockBuildCreate.mockResolvedValue({ id: "bp-1", name: "With Prio" });
    mockSetupCreate.mockResolvedValue({
      id: "setup-1",
      name: "With Prio",
      note: "Push wave 1",
      runePresetId: "rp-1",
      buildPresetId: "bp-1",
      runePreset: { id: "rp-1", name: "With Prio" },
      buildPreset: { id: "bp-1", name: "With Prio" },
    });

    const req = new Request("http://localhost/api/matchup/loadouts", {
      method: "POST",
      body: JSON.stringify({
        action: "saveSetup",
        matchup: BASE_MATCHUP,
        name: "With Prio",
        note: "Push wave 1",
        runes: {
          primaryRuneStyle: 8000,
          subRuneStyle: 8300,
          primaryRunes: [8008, 9111, 9104, 8014],
          subRunes: [8304, 8345],
          statShards: [5005, 5008, 5011],
        },
        build: {
          starterItems: [1055, 2003],
          coreItems: [3508, 3006, 6675],
          situational: [3036],
        },
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.setup.id).toBe("setup-1");
    expect(mockRuneCreate).toHaveBeenCalledTimes(1);
    expect(mockBuildCreate).toHaveBeenCalledTimes(1);
    expect(mockSetupCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          matchupNoteId: "note-1",
          name: "With Prio",
          runePresetId: "rp-1",
          buildPresetId: "bp-1",
        }),
      })
    );
  });

  it("deleteSetup returns 404 if setup belongs to another user", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
    mockSetupFindUnique.mockResolvedValue({
      id: "setup-other",
      runePresetId: null,
      buildPresetId: null,
      matchupNote: { userId: "other-user" },
    });

    const req = new Request("http://localhost/api/matchup/loadouts", {
      method: "POST",
      body: JSON.stringify({ action: "deleteSetup", setupId: "setup-other" }),
    });
    expect((await POST(req)).status).toBe(404);
    expect(mockSetupDelete).not.toHaveBeenCalled();
  });

  it("saveRunePreset creates an independent rune preset in detached mode", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
    mockNoteFindFirst.mockResolvedValue({ id: "note-1" });
    mockRuneCreate.mockResolvedValue({ id: "rp-2", name: "Fleet Sustain" });

    const req = new Request("http://localhost/api/matchup/loadouts", {
      method: "POST",
      body: JSON.stringify({
        action: "saveRunePreset",
        matchup: BASE_MATCHUP,
        name: "Fleet Sustain",
        runes: {
          primaryRuneStyle: 8000,
          subRuneStyle: 8400,
          primaryRunes: [8021, 9111, 9103, 8014],
          subRunes: [8473, 8451],
          statShards: [5005, 5008, 5011],
        },
      }),
    });

    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.runePreset.id).toBe("rp-2");
  });

  it("deleteBuildPreset deletes preset when owned by user", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
    mockBuildFindUnique.mockResolvedValue({
      id: "bp-1",
      matchupNote: { userId: "u1" },
    });
    mockBuildDelete.mockResolvedValue({ id: "bp-1" });

    const req = new Request("http://localhost/api/matchup/loadouts", {
      method: "POST",
      body: JSON.stringify({ action: "deleteBuildPreset", presetId: "bp-1" }),
    });
    expect((await POST(req)).status).toBe(200);
    expect(mockBuildDelete).toHaveBeenCalledWith({ where: { id: "bp-1" } });
  });
});
