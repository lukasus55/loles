"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { KeyRound, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { Spinner } from "@/components/ui/Spinner";

const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
  <div
    className={`flex items-center text-[11px] gap-1.5 ${
      met ? "text-emerald-400" : "text-neutral-500"
    }`}
  >
    {met ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
    <span>{text}</span>
  </div>
);

export const ChangePasswordBox = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validatePassword = (pass: string) => {
    if (pass.length < 14 || pass.length > 128) return false;
    if (/^\d+$/.test(pass)) return false;
    return true;
  };

  const isLengthValid = newPassword.length >= 14 && newPassword.length <= 128;
  const isNotNumbersOnly = newPassword.length > 0 && !/^[0-9]+$/.test(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast({
        type: "warning",
        title: "Missing Fields",
        message: "Please fill in all fields",
      });
      return;
    }

    if (!validatePassword(newPassword)) {
      toast({
        type: "warning",
        title: "Invalid Password",
        message: "New password must be 14-128 characters and cannot contain only numbers.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          type: "success",
          title: "Password Changed",
          message: "Your password has been successfully updated!",
        });
        setCurrentPassword("");
        setNewPassword("");
      } else {
        toast({
          type: "error",
          title: "Update Failed",
          message: data.message || "Failed to change password",
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
        <KeyRound className="w-4 h-4 text-accent-soft" />
        Change Password
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            className="bg-neutral-950/70"
          />

          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min 14 characters"
            className="bg-neutral-950/70"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <RequirementItem met={isLengthValid} text="14–128 characters" />
            <RequirementItem met={isNotNumbersOnly} text="Cannot be numbers only" />
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !isLengthValid || !isNotNumbersOnly}
            className="px-4 shrink-0"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" className="mr-1.5" /> Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
