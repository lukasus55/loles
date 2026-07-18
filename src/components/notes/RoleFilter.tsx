"use client";
import React from "react";
import Image from "next/image";

export type Role = "TOP" | "JGL" | "MID" | "ADC" | "SUPP";

interface RoleFilterProps {
  selectedRole: Role | null;
  onChange: (role: Role | null) => void;
  allowClear?: boolean;
}

const ROLES: { id: Role; label: string; icon: string }[] = [
  { id: "TOP", label: "Top", icon: "/roles/top.webp" },
  { id: "JGL", label: "Jungle", icon: "/roles/jg.webp" },
  { id: "MID", label: "Mid", icon: "/roles/mid.webp" },
  { id: "ADC", label: "ADC", icon: "/roles/adc.webp" },
  { id: "SUPP", label: "Support", icon: "/roles/supp.webp" },
];

export const RoleFilter: React.FC<RoleFilterProps> = ({ selectedRole, onChange, allowClear = false }) => {
  return (
    <div className="flex items-center space-x-2 bg-neutral-900 border border-neutral-800 p-2 rounded-xl w-fit shadow-sm">
      {ROLES.map((role) => (
        <button
          key={role.id}
          onClick={() => {
            if (allowClear && selectedRole === role.id) {
              onChange(null);
            } else {
              onChange(role.id);
            }
          }}
          title={role.label}
          className={`relative p-3 rounded-lg transition-all duration-200 cursor-pointer group ${selectedRole === role.id
              ? "bg-red-950/40 border border-red-900/50"
              : "hover:bg-neutral-800 border border-transparent"
            }`}
        >
          {/* Icons should be placed in public/roles/ */}
          <div className={`w-6 h-6 relative transition-opacity duration-200 ${selectedRole === role.id ? "opacity-100" : "opacity-50 group-hover:opacity-100"}`}>
            <Image src={role.icon} alt={role.label} fill className="object-contain" />
          </div>

          {selectedRole === role.id && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-1 bg-red-500 rounded-t-full shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-in fade-in zoom-in duration-200"></div>
          )}
        </button>
      ))}
    </div>
  );
};
