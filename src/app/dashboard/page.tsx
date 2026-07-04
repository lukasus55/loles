import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getChampions } from "@/lib/riot/ddragon";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const displayName = session.user.name || session.user.email?.split('@')[0] || "Summoner";
  const champions = await getChampions();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <DashboardClient champions={champions} />
    </div>
  );
}
