"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
    if (!val) return true;
    return /^[a-zA-Z0-9 _-]+$/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateName(name)) {
      toast({
        type: "warning",
        title: "Invalid Name",
        message: "Name contains invalid characters.",
      });
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
        toast({
          type: "success",
          title: "Name Changed",
          message: "Your name has been successfully updated!",
        });
        await update({ name });
        router.refresh();
      } else {
        toast({
          type: "error",
          title: "Update Failed",
          message: data.message || "Failed to update name",
        });
      }
    } catch {
      toast({
        type: "error",
        title: "Connection Error",
        message: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900/35 border border-neutral-800/75 rounded-lg p-5">
      <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
        <User className="w-4 h-4 text-accent-soft" />
        Change Name
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Nickname (Optional)"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={32}
          placeholder="Enter new nickname"
          className="bg-neutral-950/70"
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[11px] text-neutral-500">
            Letters, numbers, spaces, underscores, and hyphens only.
          </p>
          <Button type="submit" size="sm" disabled={isLoading} className="px-4 shrink-0">
            {isLoading ? (
              <>
                <Spinner size="sm" className="mr-1.5" /> Updating...
              </>
            ) : (
              "Update Name"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
