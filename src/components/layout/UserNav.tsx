"use client";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { User as UserIcon, LogOut, Settings, ChevronDown } from "lucide-react";

interface UserNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export const UserNav = ({ user }: UserNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors p-1 pr-2 rounded-full hover:bg-neutral-900/80 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/40 flex items-center justify-center text-accent-soft overflow-hidden">
          {user.image ? (
            <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-3.5 h-3.5" />
          )}
        </div>
        <span className="max-w-[110px] truncate text-xs sm:text-sm">
          {user.name || user.email?.split("@")[0]}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-52 bg-[#0d0e12]/98 backdrop-blur-md border border-neutral-800 rounded-lg shadow-2xl shadow-black/70 py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3.5 py-2.5 border-b border-neutral-800/80 mb-1">
            <p className="text-xs font-semibold text-white truncate">{user.name || "Summoner"}</p>
            <p className="text-[11px] text-neutral-500 truncate mt-0.5">{user.email}</p>
          </div>

          <div className="px-1 space-y-0.5">
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-neutral-300 hover:bg-neutral-800/75 hover:text-white transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-neutral-400" />
              My account
            </Link>

            <button
              type="button"
              role="menuitem"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
