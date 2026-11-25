import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Bug } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full border-t border-neutral-800/75 bg-black py-10 mt-auto">
      <div className="container mx-auto px-4 max-w-5xl flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left: Logo & Legal */}
        <div className="flex flex-col items-center lg:items-start space-y-2.5 text-center lg:text-left max-w-sm">
          <div className="flex items-center space-x-1">
            <Image src="/icon.svg" alt="LOLES Icon" width={15} height={15} />
            <Link
              href="/"
              className="flex h-full items-center pb-0.5 text-lg font-bold text-white tracking-tight"
            >
              LOLES
            </Link>
          </div>
          <p className="text-[11px] text-neutral-600 leading-relaxed">
            LOLES isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions
            of Riot Games or anyone officially involved in producing or managing League of Legends.
          </p>
        </div>

        {/* Center: Navigation Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          <Link
            href="/about"
            className="text-xs sm:text-sm font-medium text-neutral-400 hover:text-white transition-colors"
          >
            About Us
          </Link>
          <Link
            href="/privacy"
            className="text-xs sm:text-sm font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Privacy Policy
          </Link>
          <a
            href="https://github.com/lukasus55/loles/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Bug size={14} />
            Report Issue
          </a>
        </div>

        {/* Right: Contact */}
        <div className="flex flex-col items-center lg:items-end space-y-1">
          <p className="text-neutral-500 text-xs">Created by</p>
          <a
            href="mailto:loles@lkostyk.com"
            className="text-accent-soft hover:text-accent font-medium text-xs sm:text-sm transition-colors"
          >
            loles@lkostyk.com
          </a>
        </div>
      </div>
    </footer>
  );
};
