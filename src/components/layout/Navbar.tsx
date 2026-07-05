import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserNav } from './UserNav';
import { MobileNav } from './MobileNav';

export const Navbar = async () => {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-black/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <Image src="/icon.svg" alt="MatchNotes Icon" width={32} height={32} />
          <Link href="/" className="text-2xl font-bold text-white tracking-tight">
            LOL<span className="text-red-500">ES</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center justify-center space-x-6">
          <Link href="/notes" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
            Notes
          </Link>
          <Link href="/history" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
            Match History
          </Link>
          <Link href="/stats" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
            Stats
          </Link>
        </nav>

        <div className="flex items-center justify-end space-x-4 flex-1">
          {session?.user ? (
            <UserNav user={session.user} />
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors hidden sm:block">
                Log in
              </Link>
              <Link href="/signup" className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors shadow-sm shadow-red-900/50">
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
