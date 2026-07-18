import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { primaryRole, iconPreference } = body;

    // Validate enum and string options
    const validRoles = ["TOP", "JGL", "MID", "ADC", "SUPP"];
    if (primaryRole && !validRoles.includes(primaryRole)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    const validIcons = ["NONE", "RIOT", "SOCIAL"];
    if (iconPreference && !validIcons.includes(iconPreference)) {
      return NextResponse.json({ message: "Invalid icon preference" }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (primaryRole !== undefined) dataToUpdate.primaryRole = primaryRole;
    if (iconPreference !== undefined) dataToUpdate.iconPreference = iconPreference;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (e: any) {
    console.error("Preferences Update Error:", e);
    return NextResponse.json({ message: "Failed to update preferences" }, { status: 500 });
  }
}
