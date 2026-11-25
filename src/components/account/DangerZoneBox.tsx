"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, X } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Input } from "@/components/ui/Input";

interface DangerZoneBoxProps {
  hasPassword: boolean;
}

type ActionType = "matches" | "account" | null;

export function DangerZoneBox({ hasPassword }: DangerZoneBoxProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Rule 2: Close password modal on ESC key
  useEffect(() => {
    if (!isPasswordModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPasswordModalOpen(false);
        setActiveAction(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPasswordModalOpen]);

  const handleInitiateAction = (action: ActionType) => {
    setActiveAction(action);
    if (hasPassword) {
      setPassword("");
      setIsPasswordModalOpen(true);
    } else {
      setIsConfirmOpen(true);
    }
  };

  const handlePasswordSubmit = () => {
    if (!password) {
      toast({
        type: "error",
        title: "Password Required",
        message: "Please enter your password to continue.",
      });
      return;
    }

    setIsPasswordModalOpen(false);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!activeAction) return;

    try {
      const endpoint = activeAction === "account" ? "/api/account" : "/api/account/matches";
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        if (activeAction === "account") {
          toast({
            type: "success",
            title: "Account Deleted",
            message: "Your account has been successfully deleted.",
          });
          await signOut({ callbackUrl: "/" });
        } else {
          toast({
            type: "success",
            title: "History Deleted",
            message: "Your match history has been wiped.",
          });
          setIsConfirmOpen(false);
          setActiveAction(null);
          router.refresh();
        }
      } else {
        const data = await res.json();
        toast({
          type: "error",
          title: "Action Failed",
          message: data.message || "Failed to perform action.",
        });
        setIsConfirmOpen(false);
        setActiveAction(null);
      }
    } catch {
      toast({ type: "error", title: "Error", message: "An unexpected error occurred." });
      setIsConfirmOpen(false);
      setActiveAction(null);
    }
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setActiveAction(null);
  };

  return (
    <>
      <div className="bg-red-950/10 border border-red-900/35 rounded-lg p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Danger Zone</h2>
            <p className="text-xs text-red-400/90">Irreversible and destructive actions.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-neutral-950/45 border border-red-900/25 rounded-lg gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Delete Match History</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Wipe all your synced matches. Your account and notes remain intact.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleInitiateAction("matches")}
              className="border-red-900/50 text-red-400 hover:bg-red-950/40 hover:text-red-300 shrink-0"
            >
              Delete History
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-neutral-950/45 border border-red-900/25 rounded-lg gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Delete Account</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleInitiateAction("account")}
              className="border-red-900/60 text-red-400 hover:bg-red-950/50 hover:text-red-300 shrink-0"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Password Verification Modal (Rule 2: button + backdrop + ESC) */}
      {isPasswordModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={closePasswordModal}
          role="dialog"
          aria-modal="true"
          aria-label="Verify Password"
        >
          <div
            className="bg-[#0d0e12] border border-neutral-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 relative p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closePasswordModal}
              aria-label="Close modal"
              className="absolute top-3.5 right-3.5 h-8 w-8 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/70 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-base font-semibold text-white mb-1 pr-8">Verify Password</h2>
            <p className="text-xs sm:text-sm text-neutral-400 mb-4">
              Please enter your password to continue with this destructive action.
            </p>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-5"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePasswordSubmit();
              }}
            />
            <div className="flex justify-end gap-2.5">
              <Button type="button" size="sm" variant="outline" onClick={closePasswordModal}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handlePasswordSubmit}>
                Verify
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Final Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={activeAction === "account" ? "Delete Account" : "Delete Match History"}
        description={
          activeAction === "account"
            ? "Are you absolutely sure you want to permanently delete your account? All your match history, notes, and Riot connection will be wiped."
            : "Are you sure you want to delete all your synced matches? This cannot be undone."
        }
        confirmText={activeAction === "account" ? "Yes, Delete Account" : "Yes, Delete History"}
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={executeDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setActiveAction(null);
        }}
      />
    </>
  );
}
