"use client";
import React, { useState } from "react";
import Image from "next/image";
import { User as UserIcon, Settings2, Info } from "lucide-react";

interface ProfilePreferencesBoxProps {
  userImage: string | null;
  riotAccount: {
    profileIconId: number;
    gameName: string;
  } | null;
}

export const ProfilePreferencesBox = ({ userImage, riotAccount }: ProfilePreferencesBoxProps) => {
  const [selectedRole, setSelectedRole] = useState<string>("MID");
  
  // Initialize default icon source based on availability
  const defaultIconSource = userImage ? "SOCIAL" : riotAccount ? "RIOT" : "NONE";
  const [iconSource, setIconSource] = useState<string>(defaultIconSource);

  const roles = [
    { id: "TOP", icon: "/roles/top.webp", label: "Top" },
    { id: "JGL", icon: "/roles/jg.webp", label: "Jungle" },
    { id: "MID", icon: "/roles/mid.webp", label: "Mid" },
    { id: "ADC", icon: "/roles/adc.webp", label: "ADC" },
    { id: "SUPP", icon: "/roles/supp.webp", label: "Support" },
  ];

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 md:p-8 shadow-sm">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Settings2 className="w-5 h-5 text-red-500" /> Profile Preferences
      </h2>

      <div className="space-y-8">
        {/* Primary Role Selector */}
        <div>
          <label className="block text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">
            Primary Role
          </label>
          <div className="flex flex-wrap gap-4">
            {roles.map((role) => {
              const isActive = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  title={role.label}
                  onClick={() => setSelectedRole(role.id)}
                  className={`relative w-14 h-14 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isActive 
                      ? "bg-neutral-800 shadow-[0_0_12px_rgba(239,68,68,0.4)] border border-red-500" 
                      : "bg-neutral-950 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900"
                  }`}
                >
                  <div className={`relative w-8 h-8 transition-opacity ${isActive ? "opacity-100" : "opacity-60"}`}>
                    <Image src={role.icon} alt={role.label} fill className="object-contain" />
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-neutral-500 mt-3">
            This role will be selected by default when you add new matchup notes or view your stats.
          </p>
        </div>

        {/* Profile Icon Source */}
        <div>
          <label className="block text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">
            Profile Icon Preference
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* NO ICON */}
            <button
              onClick={() => setIconSource("NONE")}
              className={`flex items-start text-left p-4 rounded-xl border transition-all cursor-pointer ${
                iconSource === "NONE" 
                  ? "bg-red-950/20 border-red-500 text-white" 
                  : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-600"
              }`}
            >
              <div className="w-10 h-10 shrink-0 rounded-full bg-red-950 border border-red-900 flex items-center justify-center text-red-500 overflow-hidden mr-4 shadow-md">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="font-bold mb-1 block">Default Icon</span>
                <span className="text-xs opacity-70 leading-relaxed block mt-1">Generic avatar</span>
              </div>
            </button>

            {/* RIOT ICON */}
            <button
              disabled={!riotAccount}
              onClick={() => setIconSource("RIOT")}
              className={`flex items-start text-left p-4 rounded-xl border transition-all ${
                !riotAccount ? "opacity-50 cursor-not-allowed bg-neutral-950 border-neutral-900" :
                iconSource === "RIOT" 
                  ? "bg-red-950/20 border-red-500 text-white cursor-pointer" 
                  : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-600 cursor-pointer"
              }`}
            >
              <div className="w-10 h-10 shrink-0 rounded-full border border-neutral-800 flex items-center justify-center overflow-hidden mr-4 bg-neutral-900 relative shadow-md">
                {riotAccount ? (
                  <Image 
                    src={`https://ddragon.leagueoflegends.com/cdn/14.13.1/img/profileicon/${riotAccount.profileIconId}.png`} 
                    alt="Riot Icon" 
                    fill 
                  />
                ) : (
                  <Info className="w-4 h-4 text-neutral-600" />
                )}
              </div>
              <div className="flex-1">
                <span className="font-bold mb-1 block">Riot Icon</span>
                <span className="text-xs opacity-70 leading-relaxed block mt-1">
                  {riotAccount ? "Linked account" : "No Riot account linked"}
                </span>
              </div>
            </button>

            {/* SOCIAL ICON */}
            <button
              disabled={!userImage}
              onClick={() => setIconSource("SOCIAL")}
              className={`flex items-start text-left p-4 rounded-xl border transition-all ${
                !userImage ? "opacity-50 cursor-not-allowed bg-neutral-950 border-neutral-900" :
                iconSource === "SOCIAL" 
                  ? "bg-red-950/20 border-red-500 text-white cursor-pointer" 
                  : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-600 cursor-pointer"
              }`}
            >
              <div className="w-10 h-10 shrink-0 rounded-full border border-neutral-800 flex items-center justify-center overflow-hidden mr-4 bg-neutral-900 relative shadow-md">
                {userImage ? (
                  <Image src={userImage} alt="Social Icon" fill className="object-cover" />
                ) : (
                  <Info className="w-4 h-4 text-neutral-600" />
                )}
              </div>
              <div className="flex-1">
                <span className="font-bold mb-1 block">Social Icon</span>
                <span className="text-xs opacity-70 leading-relaxed block mt-1">
                  {userImage ? "Discord / Google" : "Not connected via social"}
                </span>
              </div>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};
