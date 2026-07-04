import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getChampions } from "@/lib/riot/ddragon";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const champions = await getChampions();
  
  const notes = await prisma.matchupNote.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <DashboardClient champions={champions} initialNotes={notes} />
    </div>
  );
}
