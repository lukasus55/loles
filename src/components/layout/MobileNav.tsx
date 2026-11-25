"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const navLinks = [
    { name: "Matchups", href: "/matchups" },
    { name: "Stats", href: "/stats" },
    { name: "Match History", href: "/history" },
  ];

  return (
    <div className="md:hidden ml-1 flex items-center">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-0 w-full h-[100dvh] z-[100] bg-black/98 backdrop-blur-md flex flex-col animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between px-4 h-14 border-b border-neutral-800/70">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-1"
            >
              <Image src="/icon.svg" alt="LOLES Icon" width={16} height={16} />
              <span className="flex h-full items-center pb-0.5 text-lg font-bold text-white tracking-tight">
                LOLES
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex flex-col p-6 space-y-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-xl font-semibold text-neutral-300 hover:text-white transition-colors py-1"
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
