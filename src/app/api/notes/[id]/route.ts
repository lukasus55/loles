import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { prio, notes } = body;

    const existingNote = await prisma.matchupNote.findUnique({ where: { id } });
    if (!existingNote || existingNote.userId !== session.user.id) {
      return NextResponse.json({ message: "Not found or unauthorized" }, { status: 404 });
    }

    const updatedNote = await prisma.matchupNote.update({
      where: { id },
      data: { prio, notes }
    });

    return NextResponse.json({ note: updatedNote }, { status: 200 });
  } catch (error) {
    console.error("Update note error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingNote = await prisma.matchupNote.findUnique({ where: { id } });
    if (!existingNote || existingNote.userId !== session.user.id) {
      return NextResponse.json({ message: "Not found or unauthorized" }, { status: 404 });
    }

    await prisma.matchupNote.delete({ where: { id } });

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete note error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
