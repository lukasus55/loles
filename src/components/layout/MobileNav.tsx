"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
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
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in slide-in-from-right-8 duration-300">
          <div className="flex items-center justify-between p-4 h-16 border-b border-neutral-800/50">
            <span className="text-2xl font-bold text-white tracking-tight ml-2">
              LOL<span className="text-red-500">ES</span>
            </span>
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
