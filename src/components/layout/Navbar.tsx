import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { UserNav } from './UserNav';
import { MobileNav } from './MobileNav';

export const Navbar = async () => {
  const session = await getServerSession(authOptions);

  let resolvedImage = null;
  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true, iconPreference: true, riotAccount: { select: { profileIconId: true } } }
    });

    if (dbUser) {
      if (dbUser.iconPreference === "RIOT" && dbUser.riotAccount?.profileIconId) {
        resolvedImage = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${dbUser.riotAccount.profileIconId}.jpg`;
      } else if (dbUser.iconPreference === "SOCIAL" && dbUser.image) {
        resolvedImage = dbUser.image;
      }
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800/80 bg-black/80 backdrop-blur-md">
      <div className="container mx-auto px-4 max-w-5xl h-14 flex items-center justify-between">
        <div className="flex items-center space-x-1 flex-1">
          <Image src="/icon.svg" alt="LOLES Icon" width={15} height={15} />
          <Link href="/" className="flex h-full items-center pb-0.5 text-lg font-bold text-white tracking-tight">
            LOLES
          </Link>
        </div>

        <nav className="hidden md:flex items-center justify-center space-x-6">
          <Link href="/matchups" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
            Matchups
          </Link>
          <Link href="/stats" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
            Stats
          </Link>
          <Link href="/history" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
            Match History
          </Link>
        </nav>

        <div className="flex items-center justify-end space-x-3 flex-1">
          {session?.user ? (
            <UserNav user={{ ...session.user, image: resolvedImage }} />
          ) : (
            <>
              <Link href="/login" className="text-xs sm:text-sm font-medium text-neutral-300 hover:text-white transition-colors hidden sm:block">
                Log in
              </Link>
              <Link href="/signup" className="px-3.5 py-1.5 text-xs sm:text-sm font-medium bg-accent-dark hover:bg-accent-hover text-white rounded-md transition-colors">
                Sign up
              </Link>
            </>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  );
};
