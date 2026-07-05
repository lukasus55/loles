import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { AccountClient } from "@/components/account/AccountClient";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const riotAccount = await prisma.riotAccount.findUnique({
    where: { userId: session.user.id }
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <span className="w-1.5 h-8 bg-red-600 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.6)]"></span>
          Account Settings
        </h1>
        <p className="text-neutral-400 mt-2 ml-4">
          Manage your account connections and preferences.
        </p>
      </div>

      <div className="grid gap-8">
        <AccountClient initialRiotAccount={riotAccount} />
      </div>
    </div>
  );
}
