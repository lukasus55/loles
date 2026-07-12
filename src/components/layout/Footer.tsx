import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bug } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-neutral-800/80 bg-black py-12 mt-auto">
      <div className="container mx-auto px-4 max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-8">

        {/* Left: Logo & Legal */}
        <div className="flex flex-col items-center lg:items-start space-y-4 text-center lg:text-left max-w-sm">
          <div className="flex items-center space-x-1">
            <Image src="/icon.svg" alt="MatchNotes Icon" width={16} height={16} />
            <Link href="/" className="flex h-full items-center pb-1 text-xl font-bold text-white tracking-tight">
              LOLES
            </Link>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            LOLES isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends.
          </p>
        </div>

        {/* Center: Navigation Links */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          <Link href="/about" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
            About Us
          </Link>
          <Link href="/privacy" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <a
            href="https://github.com/lukasus55/loles/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <Bug size={16} />
            Report Issue
          </a>
        </div>

        {/* Right: Author / Contact */}
        <div className="flex flex-col items-center lg:items-end space-y-2">
          <p className="text-neutral-400 text-sm">
            Created by:
          </p>
          <a
            href="mailto:loles@lkostyk.com"
            className="text-red-500 hover:text-red-400 font-semibold text-sm transition-colors"
          >
            loles@lkostyk.com
          </a>
        </div>

      </div>
    </footer>
  );
};
