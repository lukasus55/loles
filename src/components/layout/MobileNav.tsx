"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navLinks = [
    { name: "Notes", href: "/notes" },
    { name: "Match History", href: "/history" },
    { name: "Stats", href: "/stats" },
  ];

  return (
    <div className="md:hidden ml-2 flex items-center">
      <button
        onClick={() => setIsOpen(true)}
        className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed top-0 left-0 w-screen h-[100dvh] z-[100] bg-black flex flex-col animate-in fade-in slide-in-from-right-8 duration-300">
          <div className="flex items-center justify-between p-4 h-16 border-b border-neutral-800/50">
            <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center space-x-1 ml-2">
              <Image src="/icon.svg" alt="MatchNotes Icon" width={16} height={16} />
              <span className="flex h-full items-center pb-1 text-xl font-bold text-white tracking-tight">
                LOLES
              </span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex flex-col p-8 space-y-8 mt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-3xl font-bold text-neutral-300 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};
