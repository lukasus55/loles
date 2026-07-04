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
    where: { userId: session.user.id, role: "TOP" },
    orderBy: { updatedAt: 'desc' },
    take: 13
  });

  const hasMore = notes.length > 12;
  const initialNotes = hasMore ? notes.slice(0, 12) : notes;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <DashboardClient champions={champions} initialNotes={initialNotes} initialHasMore={hasMore} />
    </div>
  );
}
