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
    select: {
      name: true,
      passwordHash: true,
      riotAccount: true,
      image: true,
      primaryRole: true,
      iconPreference: true,
    },
  });

  const riotAccount = user?.riotAccount || null;
  const initialName = user?.name || null;
  const hasPassword = !!user?.passwordHash;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl pb-24">
      <div className="mb-6 border-b border-neutral-800/70 pb-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Manage your account connections, preferences, and security.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start relative">
        <AccountSidebar />

        <div className="flex-1 w-full space-y-5 min-w-0">
          <section id="profile" className="space-y-5 scroll-mt-20">
            <ChangeNameBox initialName={initialName} />
            <ProfilePreferencesBox
              userImage={user?.image || null}
              riotAccount={riotAccount}
              initialRole={user?.primaryRole || null}
              initialIconPreference={user?.iconPreference || "NONE"}
            />
          </section>

          <section id="riot" className="scroll-mt-20">
            <RiotAccountBox initialRiotAccount={riotAccount} />
          </section>

          <section id="security" className="scroll-mt-20">
            {hasPassword ? (
              <ChangePasswordBox />
            ) : (
              <div className="bg-neutral-900/35 border border-neutral-800/75 rounded-lg p-5">
                <h2 className="text-base font-semibold text-white mb-1.5">
                  Password &amp; Security
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400">
                  Your account is connected via a third-party provider (e.g. Google/Discord). You
                  do not need a password.
                </p>
              </div>
            )}
          </section>

          <section id="danger" className="scroll-mt-20">
            <DangerZoneBox hasPassword={hasPassword} />
          </section>
        </div>
      </div>
    </div>
  );
}
