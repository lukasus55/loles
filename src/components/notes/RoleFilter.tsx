"use client";
import React from "react";
import Image from "next/image";
import { Tooltip } from "@/components/ui/Tooltip";

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

export const RoleFilter: React.FC<RoleFilterProps> = ({
  selectedRole,
  onChange,
  allowClear = false,
}) => {
  return (
    <div className="inline-flex items-center gap-1 bg-neutral-900/60 border border-neutral-800/80 p-1 rounded-lg w-fit">
      {ROLES.map((role) => {
        const isSelected = selectedRole === role.id;
        return (
          <Tooltip key={role.id} compact content={role.label} position="top">
            <button
              type="button"
              aria-label={role.label}
              aria-pressed={isSelected}
              onClick={() => {
                if (allowClear && isSelected) {
                  onChange(null);
                } else {
                  onChange(role.id);
                }
              }}
              className={`relative p-2 rounded-md transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 ${
                isSelected
                  ? "bg-accent/15 border border-accent/40"
                  : "hover:bg-neutral-800/70 border border-transparent"
              }`}
            >
              <div
                className={`w-5 h-5 relative transition-opacity ${
                  isSelected ? "opacity-100" : "opacity-50 group-hover:opacity-95"
                }`}
              >
                <Image src={role.icon} alt={role.label} fill className="object-contain" />
              </div>

              {isSelected && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-accent rounded-full" />
              )}
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
};
