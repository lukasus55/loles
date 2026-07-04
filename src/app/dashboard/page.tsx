import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const displayName = session.user.name || session.user.email?.split('@')[0] || "Summoner";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, <span className="text-red-500">{displayName}</span></h1>
          <p className="text-neutral-400">Here is an overview of your recent matchups and stats.</p>
        </div>
        <Link href="/note/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Matchup Note
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 h-48 flex items-center justify-center text-neutral-500 hover:bg-neutral-900 transition-colors">
          Recent Notes will appear here
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 h-48 flex items-center justify-center text-neutral-500 hover:bg-neutral-900 transition-colors">
          Win/Loss Stats
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 h-48 flex items-center justify-center text-neutral-500 hover:bg-neutral-900 transition-colors">
          Riot Account Linking
        </div>
      </div>
    </div>
  );
}
