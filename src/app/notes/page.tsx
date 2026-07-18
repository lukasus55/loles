import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getChampions } from "@/lib/riot/ddragon";
import prisma from "@/lib/prisma";
import { DashboardClient } from "@/components/notes/DashboardClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Notes Dashboard',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { primaryRole: true } });
  const preferredRole = dbUser?.primaryRole || undefined;

  const champions = await getChampions();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <DashboardClient champions={champions} preferredRole={preferredRole} />
    </div>
  );
}
