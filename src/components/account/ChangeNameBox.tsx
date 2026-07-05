"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { User } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { Spinner } from "@/components/ui/Spinner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export const ChangeNameBox = ({ initialName }: { initialName: string | null }) => {
  const [name, setName] = useState(initialName || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { update } = useSession();

  const validateName = (val: string) => {
    if (!val) return true; // Name can be empty/optional
    return /^[a-zA-Z0-9 _-]+$/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateName(name)) {
      toast({ type: "warning", title: "Invalid Name", message: "Name contains invalid characters." });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/account/name", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ type: "success", title: "Name Changed", message: "Your name has been successfully updated!" });
        await update({ name });
        router.refresh();
      } else {
        toast({ type: "error", title: "Update Failed", message: data.message || "Failed to update name" });
      }
    } catch (error) {
      toast({ type: "error", title: "Connection Error", message: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 md:p-8 shadow-sm animate-in fade-in duration-500 flex flex-col items-center text-center">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-start gap-2 w-full text-left">
        <User className="w-5 h-5 text-red-600" /> Change Name
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 w-full text-left">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-300">Nickname (Optional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={32}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neutral-600 transition-colors"
            placeholder="Enter new nickname"
          />
          <p className="text-xs text-neutral-500">Only letters, numbers, spaces, underscores, and hyphens are allowed.</p>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full mt-2">
          {isLoading ? <><Spinner size="sm" className="mr-2" /> Updating...</> : "Update Name"}
        </Button>
      </form>
    </div>
  );
};
