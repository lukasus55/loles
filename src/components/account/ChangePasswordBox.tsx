"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { KeyRound, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { Spinner } from "@/components/ui/Spinner";

export const ChangePasswordBox = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validatePassword = (pass: string) => {
    if (pass.length < 14 || pass.length > 128) return false;
    if (/^\d+$/.test(pass)) return false; // Not only numbers
    return true;
  };

  const isLengthValid = newPassword.length >= 14 && newPassword.length <= 128;
  const isNotNumbersOnly = newPassword.length > 0 && !/^[0-9]+$/.test(newPassword);

  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center text-xs space-x-2 ${met ? 'text-green-500' : 'text-neutral-500'}`}>
      {met ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      <span>{text}</span>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast({ type: "warning", title: "Missing Fields", message: "Please fill in all fields" });
      return;
    }

    if (!validatePassword(newPassword)) {
      toast({ 
        type: "warning", 
        title: "Invalid Password", 
        message: "New password must be 14-128 characters and cannot contain only numbers." 
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
        toast({ type: "success", title: "Password Changed", message: "Your password has been successfully updated!" });
        setCurrentPassword("");
        setNewPassword("");
      } else {
        toast({ type: "error", title: "Update Failed", message: data.message || "Failed to change password" });
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
        <KeyRound className="w-5 h-5 text-red-600" /> Change Password
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 w-full text-left">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-300">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neutral-600 transition-colors"
            placeholder="Enter current password"
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-300">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neutral-600 transition-colors"
            placeholder="Min 14 characters"
          />
          <div className="bg-black/50 rounded-md p-3 space-y-1.5 border border-neutral-800 mt-2">
            <RequirementItem met={isLengthValid} text="Between 14 and 128 characters" />
            <RequirementItem met={isNotNumbersOnly} text="Cannot be numbers only" />
          </div>
        </div>

        <Button type="submit" disabled={isLoading || !isLengthValid || !isNotNumbersOnly} className="w-full mt-2">
          {isLoading ? <><Spinner size="sm" className="mr-2" /> Updating...</> : "Update Password"}
        </Button>
      </form>
    </div>
  );
};
