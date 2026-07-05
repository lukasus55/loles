import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    if (name && !/^[a-zA-Z0-9 _-]+$/.test(name)) {
      return NextResponse.json({ message: "Invalid characters in name" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name || null },
    });

    return NextResponse.json({ message: "Name updated successfully" });
  } catch (error) {
    console.error("Change name error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
