import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetServerSession, mockFindManyNotes, mockFindManyMatches } = vi.hoisted(() => ({
  mockGetServerSession: vi.fn(),
  mockFindManyNotes: vi.fn(),
  mockFindManyMatches: vi.fn(),
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
      findMany: mockFindManyNotes,
    },
    match: {
      findMany: mockFindManyMatches,
    },
  },
}));

import { POST } from "@/app/api/notes/list/route";

describe("POST /api/notes/list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = new Request("http://localhost/api/notes/list", {
      method: "POST",
      body: JSON.stringify({ role: "TOP" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("returns 400 when role is missing or invalid", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });

    const req = new Request("http://localhost/api/notes/list", {
      method: "POST",
      body: JSON.stringify({ role: "INVALID" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("skips match query when no notes are returned", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindManyNotes.mockResolvedValue([]);

    const req = new Request("http://localhost/api/notes/list", {
      method: "POST",
      body: JSON.stringify({ role: "MID" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ notes: [], hasMore: false });
    expect(mockFindManyMatches).not.toHaveBeenCalled();
  });

  it("attaches wins and losses from non-remake matches including botlane partner matching", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindManyNotes.mockResolvedValue([
      {
        id: "note-exact",
        role: "ADC",
        myChampion: "Aphelios",
        enemyChampion: "Zeri",
        mySupport: "Velkoz",
        enemySupport: "Lulu",
        prio: "Yes",
        notes: "Play around level 2",
        updatedAt: "2026-11-24T00:00:00.000Z",
      },
      {
        id: "note-general",
        role: "ADC",
        myChampion: "Aphelios",
        enemyChampion: "Zeri",
        mySupport: null,
        enemySupport: null,
        prio: "N/A",
        notes: null,
        updatedAt: "2026-11-23T00:00:00.000Z",
      },
    ]);

    mockFindManyMatches.mockResolvedValue([
      {
        championName: "Aphelios",
        enemyChampionName: "Zeri",
        partnerChampionName: "Velkoz",
        enemyPartnerChampionName: "Lulu",
        win: true,
      },
      {
        championName: "Aphelios",
        enemyChampionName: "Zeri",
        partnerChampionName: "Velkoz",
        enemyPartnerChampionName: "Lulu",
        win: false,
      },
      {
        championName: "Aphelios",
        enemyChampionName: "Zeri",
        partnerChampionName: "Thresh",
        enemyPartnerChampionName: "Nami",
        win: true,
      },
    ]);

    const req = new Request("http://localhost/api/notes/list", {
      method: "POST",
      body: JSON.stringify({ role: "ADC", myPick: "Aphelios" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.hasMore).toBe(false);
    expect(mockFindManyMatches).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "user-1",
          role: "BOTTOM",
          gameDuration: { gte: 240 },
        }),
      })
    );
    expect(body.notes[0]).toMatchObject({ id: "note-exact", wins: 1, losses: 1 });
    expect(body.notes[1]).toMatchObject({ id: "note-general", wins: 2, losses: 1 });
  });

  it("handles pagination with hasMore when more than 12 notes exist", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    const fakeNotes = Array.from({ length: 13 }, (_, idx) => ({
      id: `note-${idx}`,
      role: "TOP",
      myChampion: "Aatrox",
      enemyChampion: `Champ${idx}`,
      mySupport: null,
      enemySupport: null,
      prio: "N/A",
      notes: null,
      updatedAt: "2026-11-24T00:00:00.000Z",
    }));
    mockFindManyNotes.mockResolvedValue(fakeNotes);
    mockFindManyMatches.mockResolvedValue([]);

    const req = new Request("http://localhost/api/notes/list", {
      method: "POST",
      body: JSON.stringify({ role: "TOP", page: 1 }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.hasMore).toBe(true);
    expect(body.notes).toHaveLength(12);
    expect(body.notes[0]).toMatchObject({ wins: 0, losses: 0 });
  });
});
