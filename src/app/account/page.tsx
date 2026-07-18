import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { RiotAccountBox } from "@/components/account/RiotAccountBox";
import { ChangePasswordBox } from "@/components/account/ChangePasswordBox";
import { ChangeNameBox } from "@/components/account/ChangeNameBox";
import { DangerZoneBox } from "@/components/account/DangerZoneBox";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { ProfilePreferencesBox } from "@/components/account/ProfilePreferencesBox";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, passwordHash: true, riotAccount: true, image: true }
  });

  const riotAccount = user?.riotAccount || null;
  const initialName = user?.name || null;
  const hasPassword = !!user?.passwordHash;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl pb-96">
      <div className="mb-12 border-b border-neutral-800 pb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <span className="w-1.5 h-8 bg-red-600 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.6)]"></span>
          Account Settings
        </h1>
        <p className="text-neutral-400 mt-2 ml-4">
          Manage your account connections, preferences, and security.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-12 items-start relative">
        <AccountSidebar />

        <div className="flex-1 w-full grid gap-12 min-w-0">
          <section id="profile" className="space-y-12 scroll-mt-24">
            <ChangeNameBox initialName={initialName} />
            <ProfilePreferencesBox userImage={user?.image || null} riotAccount={riotAccount} />
          </section>

          <section id="riot" className="scroll-mt-24">
            <RiotAccountBox initialRiotAccount={riotAccount} />
          </section>

          <section id="security" className="scroll-mt-24">
            {hasPassword ? (
              <ChangePasswordBox />
            ) : (
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-white mb-2">Password & Security</h2>
                <p className="text-neutral-400">Your account is connected via a third-party provider (e.g. Google/Discord). You do not need a password.</p>
              </div>
            )}
          </section>
          
          <section id="danger" className="scroll-mt-24">
            <DangerZoneBox hasPassword={hasPassword} />
          </section>
        </div>
      </div>
    </div>
  );
}
