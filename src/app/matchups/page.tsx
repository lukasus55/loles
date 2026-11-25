import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getChampions } from "@/lib/riot/ddragon";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/notes/DashboardClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Matchups Playbook",
};

export default async function MatchupsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const [dbUser, champions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { primaryRole: true },
    }),
    getChampions(),
  ]);

  const preferredRole = dbUser?.primaryRole || undefined;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl">
      <DashboardClient champions={champions} preferredRole={preferredRole} />
    </div>
  );
}
