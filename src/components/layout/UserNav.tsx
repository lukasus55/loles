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
  }
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors p-1 pr-2 rounded-full hover:bg-neutral-900 cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-red-950 border border-red-900 flex items-center justify-center text-red-500 overflow-hidden">
          {user.image ? (
            <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-4 h-4" />
          )}
        </div>
        <span className="max-w-[100px] truncate">{user.name || user.email?.split('@')[0]}</span>
        <ChevronDown className="w-4 h-4 text-neutral-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-md shadow-lg overflow-hidden py-1 z-50">
          <div className="px-4 py-3 border-b border-neutral-800 mb-1">
            <p className="text-sm font-medium text-white truncate">{user.name || "Summoner"}</p>
            <p className="text-xs text-neutral-400 truncate">{user.email}</p>
          </div>

          <Link
            href="/account"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 mr-2" />
            My account
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center px-4 py-2 text-sm text-red-500 hover:bg-neutral-800 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};
