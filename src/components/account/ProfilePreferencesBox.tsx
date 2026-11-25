"use client";
import React, { useState } from "react";
import Image from "next/image";
import { User as UserIcon, Settings2, Info } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { Spinner } from "@/components/ui/Spinner";
import { Tooltip } from "@/components/ui/Tooltip";
import { useRouter } from "next/navigation";

interface ProfilePreferencesBoxProps {
  userImage: string | null;
  riotAccount: {
    profileIconId: number;
    gameName: string;
  } | null;
  initialRole: string | null;
  initialIconPreference: string;
}

const ROLES = [
  { id: "TOP", icon: "/roles/top.webp", label: "Top" },
  { id: "JGL", icon: "/roles/jg.webp", label: "Jungle" },
  { id: "MID", icon: "/roles/mid.webp", label: "Mid" },
  { id: "ADC", icon: "/roles/adc.webp", label: "ADC" },
  { id: "SUPP", icon: "/roles/supp.webp", label: "Support" },
];

export const ProfilePreferencesBox = ({
  userImage,
  riotAccount,
  initialRole,
  initialIconPreference,
}: ProfilePreferencesBoxProps) => {
  const [selectedRole, setSelectedRole] = useState<string>(initialRole || "MID");
  const [iconSource, setIconSource] = useState<string>(initialIconPreference);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSavePreference = async (key: "primaryRole" | "iconPreference", value: string) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/account/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });

      if (res.ok) {
        toast({ type: "success", title: "Saved", message: "Preferences updated successfully!" });
        router.refresh();
      } else {
        toast({ type: "error", title: "Error", message: "Failed to update preference" });
        if (key === "primaryRole") setSelectedRole(initialRole || "MID");
        if (key === "iconPreference") setIconSource(initialIconPreference);
      }
    } catch {
      toast({ type: "error", title: "Error", message: "Network error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId);
    handleSavePreference("primaryRole", roleId);
  };

  const handleIconChange = (source: string) => {
    setIconSource(source);
    handleSavePreference("iconPreference", source);
  };

  return (
    <div className="bg-neutral-900/35 border border-neutral-800/75 rounded-lg p-5 relative">
      {isSaving && (
        <div className="absolute top-5 right-5">
          <Spinner size="sm" />
        </div>
      )}
      <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
        <Settings2 className="w-4 h-4 text-accent-soft" />
        Profile Preferences
      </h2>

      <div className="space-y-6">
        {/* Primary Role Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
            Primary Role
          </label>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((role) => {
              const isActive = selectedRole === role.id;
              return (
                <Tooltip key={role.id} compact content={role.label} position="top">
                  <button
                    type="button"
                    aria-label={role.label}
                    aria-pressed={isActive}
                    onClick={() => handleRoleChange(role.id)}
                    disabled={isSaving}
                    className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      isActive
                        ? "bg-accent/15 border border-accent/50"
                        : "bg-neutral-950/60 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900"
                    } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div
                      className={`relative w-6 h-6 transition-opacity ${
                        isActive ? "opacity-100" : "opacity-55"
                      }`}
                    >
                      <Image src={role.icon} alt={role.label} fill className="object-contain" />
                    </div>
                  </button>
                </Tooltip>
              );
            })}
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            Selected by default when opening Matchups or Stats.
          </p>
        </div>

        {/* Profile Icon Source */}
        <div>
          <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
            Profile Icon Preference
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleIconChange("NONE")}
              disabled={isSaving}
              className={`flex items-center text-left p-3.5 rounded-lg border transition-colors cursor-pointer ${
                iconSource === "NONE"
                  ? "bg-accent/10 border-accent/50 text-white"
                  : "bg-neutral-950/50 border-neutral-800/80 text-neutral-400 hover:border-neutral-700"
              } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="w-9 h-9 shrink-0 rounded-full bg-accent/15 border border-accent/40 flex items-center justify-center text-accent-soft mr-3">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold block">Default Icon</span>
                <span className="text-[11px] text-neutral-500 block">Generic avatar</span>
              </div>
            </button>

            <button
              type="button"
              disabled={!riotAccount || isSaving}
              onClick={() => handleIconChange("RIOT")}
              className={`flex items-center text-left p-3.5 rounded-lg border transition-colors ${
                !riotAccount
                  ? "opacity-45 cursor-not-allowed bg-neutral-950/40 border-neutral-900"
                  : iconSource === "RIOT"
                    ? "bg-accent/10 border-accent/50 text-white cursor-pointer"
                    : "bg-neutral-950/50 border-neutral-800/80 text-neutral-400 hover:border-neutral-700 cursor-pointer"
              }`}
            >
              <div className="w-9 h-9 shrink-0 rounded-full border border-neutral-800 flex items-center justify-center overflow-hidden mr-3 bg-neutral-900 relative">
                {riotAccount ? (
                  <Image
                    src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${riotAccount.profileIconId}.jpg`}
                    alt="Riot Icon"
                    fill
                  />
                ) : (
                  <Info className="w-4 h-4 text-neutral-600" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold block">Riot Icon</span>
                <span className="text-[11px] text-neutral-500 block truncate">
                  {riotAccount ? "Linked account" : "Not linked"}
                </span>
              </div>
            </button>

            <button
              type="button"
              disabled={!userImage || isSaving}
              onClick={() => handleIconChange("SOCIAL")}
              className={`flex items-center text-left p-3.5 rounded-lg border transition-colors ${
                !userImage
                  ? "opacity-45 cursor-not-allowed bg-neutral-950/40 border-neutral-900"
                  : iconSource === "SOCIAL"
                    ? "bg-accent/10 border-accent/50 text-white cursor-pointer"
                    : "bg-neutral-950/50 border-neutral-800/80 text-neutral-400 hover:border-neutral-700 cursor-pointer"
              }`}
            >
              <div className="w-9 h-9 shrink-0 rounded-full border border-neutral-800 flex items-center justify-center overflow-hidden mr-3 bg-neutral-900 relative">
                {userImage ? (
                  <Image src={userImage} alt="Social Icon" fill className="object-cover" />
                ) : (
                  <Info className="w-4 h-4 text-neutral-600" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold block">Social Icon</span>
                <span className="text-[11px] text-neutral-500 block truncate">
                  {userImage ? "Discord / Google" : "Not connected"}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
