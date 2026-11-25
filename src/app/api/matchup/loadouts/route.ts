/**
 * Matchup Loadouts (Runes & Builds Presets) Route Handler
 *
 * POST /api/matchup/loadouts
 * - Auth: Required (NextAuth session; ownership strictly enforced on all mutations)
 * - Supported `action` values:
 *   - `toggleDetach`: { matchup, detachLoadouts: boolean } -> 200 { noteId, detachLoadouts }
 *   - `saveSetup`: { matchup, setupId?, name, note?, runes, build } -> 200/201 { noteId, setup }
 *   - `deleteSetup`: { setupId } -> 200 { success: true }
 *   - `saveRunePreset`: { matchup, presetId?, name, runes } -> 200/201 { noteId, runePreset }
 *   - `deleteRunePreset`: { presetId } -> 200 { success: true }
 *   - `saveBuildPreset`: { matchup, presetId?, name, build } -> 200/201 { noteId, buildPreset }
 *   - `deleteBuildPreset`: { presetId } -> 200 { success: true }
 * - Responses: 200 | 201 | 400 | 401 | 404 | 500
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { isBotRole, isValidRole } from "@/lib/matchup/url";
import { normalizeBuildDraft, normalizeRuneDraft } from "@/lib/matchup/loadouts";

interface MatchupPayload {
  role?: unknown;
  myPick?: unknown;
  enemyPick?: unknown;
  mySupp?: unknown;
  enemySupp?: unknown;
}

async function ensureMatchupNote(userId: string, matchup?: MatchupPayload) {
  if (
    !matchup ||
    !isValidRole(matchup.role) ||
    typeof matchup.myPick !== "string" ||
    !matchup.myPick.trim() ||
    typeof matchup.enemyPick !== "string" ||
    !matchup.enemyPick.trim()
  ) {
    return null;
  }

  const role = matchup.role.toUpperCase() as Role;
  const isBot = isBotRole(role);
  const myChampion = matchup.myPick.trim();
  const enemyChampion = matchup.enemyPick.trim();
  const mySupport =
    isBot && typeof matchup.mySupp === "string" && matchup.mySupp.trim()
      ? matchup.mySupp.trim()
      : null;
  const enemySupport =
    isBot && typeof matchup.enemySupp === "string" && matchup.enemySupp.trim()
      ? matchup.enemySupp.trim()
      : null;

  const existing = await prisma.matchupNote.findFirst({
    where: {
      userId,
      role,
      myChampion,
      enemyChampion,
      mySupport,
      enemySupport,
    },
    select: { id: true, detachLoadouts: true },
  });

  if (existing) return existing;

  return prisma.matchupNote.create({
    data: {
      userId,
      role,
      myChampion,
      enemyChampion,
      mySupport,
      enemySupport,
      prio: "N/A",
      notes: "",
    },
    select: { id: true, detachLoadouts: true },
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await req.json();
    const action = body?.action;

    switch (action) {
      case "toggleDetach": {
        const note = await ensureMatchupNote(userId, body.matchup);
        if (!note) {
          return NextResponse.json({ message: "Invalid matchup payload" }, { status: 400 });
        }
        const detachLoadouts = Boolean(body.detachLoadouts);
        const updated = await prisma.matchupNote.update({
          where: { id: note.id },
          data: { detachLoadouts },
        });
        return NextResponse.json({ noteId: updated.id, detachLoadouts: updated.detachLoadouts });
      }

      case "saveSetup": {
        const name = typeof body.name === "string" ? body.name.trim() : "";
        if (!name) {
          return NextResponse.json({ message: "Preset name is required" }, { status: 400 });
        }

        const runes = normalizeRuneDraft(body.runes);
        const build = normalizeBuildDraft(body.build);
        const setupNote = typeof body.note === "string" ? body.note.trim() || null : null;

        if (typeof body.setupId === "string" && body.setupId) {
          const existing = await prisma.matchupSetup.findUnique({
            where: { id: body.setupId },
            include: { matchupNote: { select: { id: true, userId: true } } },
          });
          if (!existing || existing.matchupNote.userId !== userId) {
            return NextResponse.json({ message: "Setup not found" }, { status: 404 });
          }

          let runePresetId = existing.runePresetId;
          if (runePresetId) {
            await prisma.matchupRunePreset.update({
              where: { id: runePresetId },
              data: { name, ...runes },
            });
          } else {
            const rp = await prisma.matchupRunePreset.create({
              data: { matchupNoteId: existing.matchupNoteId, name, ...runes },
            });
            runePresetId = rp.id;
          }

          let buildPresetId = existing.buildPresetId;
          if (buildPresetId) {
            await prisma.matchupBuildPreset.update({
              where: { id: buildPresetId },
              data: { name, ...build },
            });
          } else {
            const bp = await prisma.matchupBuildPreset.create({
              data: { matchupNoteId: existing.matchupNoteId, name, ...build },
            });
            buildPresetId = bp.id;
          }

          const updated = await prisma.matchupSetup.update({
            where: { id: existing.id },
            data: { name, note: setupNote, runePresetId, buildPresetId },
            include: { runePreset: true, buildPreset: true },
          });

          return NextResponse.json({ noteId: existing.matchupNoteId, setup: updated }, { status: 200 });
        }

        const note = await ensureMatchupNote(userId, body.matchup);
        if (!note) {
          return NextResponse.json({ message: "Invalid matchup payload" }, { status: 400 });
        }

        const runePreset = await prisma.matchupRunePreset.create({
          data: { matchupNoteId: note.id, name, ...runes },
        });
        const buildPreset = await prisma.matchupBuildPreset.create({
          data: { matchupNoteId: note.id, name, ...build },
        });
        const created = await prisma.matchupSetup.create({
          data: {
            matchupNoteId: note.id,
            name,
            note: setupNote,
            runePresetId: runePreset.id,
            buildPresetId: buildPreset.id,
          },
          include: { runePreset: true, buildPreset: true },
        });

        return NextResponse.json({ noteId: note.id, setup: created }, { status: 201 });
      }

      case "deleteSetup": {
        if (typeof body.setupId !== "string" || !body.setupId) {
          return NextResponse.json({ message: "setupId is required" }, { status: 400 });
        }
        const existing = await prisma.matchupSetup.findUnique({
          where: { id: body.setupId },
          include: { matchupNote: { select: { userId: true } } },
        });
        if (!existing || existing.matchupNote.userId !== userId) {
          return NextResponse.json({ message: "Setup not found" }, { status: 404 });
        }

        await prisma.matchupSetup.delete({ where: { id: existing.id } });
        if (existing.runePresetId) {
          await prisma.matchupRunePreset.delete({ where: { id: existing.runePresetId } }).catch(() => {});
        }
        if (existing.buildPresetId) {
          await prisma.matchupBuildPreset.delete({ where: { id: existing.buildPresetId } }).catch(() => {});
        }
        return NextResponse.json({ success: true });
      }

      case "saveRunePreset": {
        const name = typeof body.name === "string" ? body.name.trim() : "";
        if (!name) {
          return NextResponse.json({ message: "Rune preset name is required" }, { status: 400 });
        }
        const runes = normalizeRuneDraft(body.runes);

        if (typeof body.presetId === "string" && body.presetId) {
          const existing = await prisma.matchupRunePreset.findUnique({
            where: { id: body.presetId },
            include: { matchupNote: { select: { userId: true } } },
          });
          if (!existing || existing.matchupNote.userId !== userId) {
            return NextResponse.json({ message: "Rune preset not found" }, { status: 404 });
          }
          const updated = await prisma.matchupRunePreset.update({
            where: { id: existing.id },
            data: { name, ...runes },
          });
          return NextResponse.json({ noteId: existing.matchupNoteId, runePreset: updated }, { status: 200 });
        }

        const note = await ensureMatchupNote(userId, body.matchup);
        if (!note) {
          return NextResponse.json({ message: "Invalid matchup payload" }, { status: 400 });
        }
        const created = await prisma.matchupRunePreset.create({
          data: { matchupNoteId: note.id, name, ...runes },
        });
        return NextResponse.json({ noteId: note.id, runePreset: created }, { status: 201 });
      }

      case "deleteRunePreset": {
        if (typeof body.presetId !== "string" || !body.presetId) {
          return NextResponse.json({ message: "presetId is required" }, { status: 400 });
        }
        const existing = await prisma.matchupRunePreset.findUnique({
          where: { id: body.presetId },
          include: { matchupNote: { select: { userId: true } } },
        });
        if (!existing || existing.matchupNote.userId !== userId) {
          return NextResponse.json({ message: "Rune preset not found" }, { status: 404 });
        }
        await prisma.matchupRunePreset.delete({ where: { id: existing.id } });
        return NextResponse.json({ success: true });
      }

      case "saveBuildPreset": {
        const name = typeof body.name === "string" ? body.name.trim() : "";
        if (!name) {
          return NextResponse.json({ message: "Build preset name is required" }, { status: 400 });
        }
        const build = normalizeBuildDraft(body.build);

        if (typeof body.presetId === "string" && body.presetId) {
          const existing = await prisma.matchupBuildPreset.findUnique({
            where: { id: body.presetId },
            include: { matchupNote: { select: { userId: true } } },
          });
          if (!existing || existing.matchupNote.userId !== userId) {
            return NextResponse.json({ message: "Build preset not found" }, { status: 404 });
          }
          const updated = await prisma.matchupBuildPreset.update({
            where: { id: existing.id },
            data: { name, ...build },
          });
          return NextResponse.json({ noteId: existing.matchupNoteId, buildPreset: updated }, { status: 200 });
        }

        const note = await ensureMatchupNote(userId, body.matchup);
        if (!note) {
          return NextResponse.json({ message: "Invalid matchup payload" }, { status: 400 });
        }
        const created = await prisma.matchupBuildPreset.create({
          data: { matchupNoteId: note.id, name, ...build },
        });
        return NextResponse.json({ noteId: note.id, buildPreset: created }, { status: 201 });
      }

      case "deleteBuildPreset": {
        if (typeof body.presetId !== "string" || !body.presetId) {
          return NextResponse.json({ message: "presetId is required" }, { status: 400 });
        }
        const existing = await prisma.matchupBuildPreset.findUnique({
          where: { id: body.presetId },
          include: { matchupNote: { select: { userId: true } } },
        });
        if (!existing || existing.matchupNote.userId !== userId) {
          return NextResponse.json({ message: "Build preset not found" }, { status: 404 });
        }
        await prisma.matchupBuildPreset.delete({ where: { id: existing.id } });
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ message: "Unsupported action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Matchup Loadouts API Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
