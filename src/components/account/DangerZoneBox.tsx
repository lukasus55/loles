"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Trash2 } from "lucide-react";
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
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleInitiateAction = (action: ActionType) => {
    setActiveAction(action);
    if (hasPassword) {
      setPassword("");
      setIsPasswordModalOpen(true);
    } else {
      setIsConfirmOpen(true);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password) {
      toast({ type: "error", title: "Password Required", message: "Please enter your password to continue." });
      return;
    }
    
    // We don't actually verify the password on the frontend to a separate endpoint (though we could).
    // Instead, we just pass the password to the final DELETE request.
    // So if they enter a password, we just close the modal and open the confirm dialog.
    setIsPasswordModalOpen(false);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!activeAction) return;
    setIsDeleting(true);

    try {
      const endpoint = activeAction === "account" ? "/api/account" : "/api/account/matches";
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        if (activeAction === "account") {
          toast({ type: "success", title: "Account Deleted", message: "Your account has been successfully deleted." });
          await signOut({ callbackUrl: "/" });
        } else {
          toast({ type: "success", title: "History Deleted", message: "Your match history has been wiped." });
          setIsConfirmOpen(false);
          setActiveAction(null);
          router.refresh();
        }
      } else {
        const data = await res.json();
        toast({ type: "error", title: "Action Failed", message: data.message || "Failed to perform action." });
        setIsConfirmOpen(false);
        setActiveAction(null);
      }
    } catch (e) {
      toast({ type: "error", title: "Error", message: "An unexpected error occurred." });
      setIsConfirmOpen(false);
      setActiveAction(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-6 shadow-sm mt-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-900/50 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Danger Zone</h2>
            <p className="text-sm text-red-400">Irreversible and destructive actions.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-neutral-950/50 border border-red-900/30 rounded-lg gap-4">
            <div>
              <h3 className="font-bold text-white">Delete Match History</h3>
              <p className="text-sm text-neutral-400">Wipe all your synced matches. Your account and notes remain intact.</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => handleInitiateAction("matches")}
              className="border-red-900/50 text-red-500 hover:bg-red-950/40 shrink-0"
            >
              Delete History
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-neutral-950/50 border border-red-900/30 rounded-lg gap-4">
            <div>
              <h3 className="font-bold text-white">Delete Account</h3>
              <p className="text-sm text-neutral-400">Permanently delete your account and all associated data (matches, notes, connections).</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => handleInitiateAction("account")}
              className="border-red-900 text-red-500 hover:bg-red-900/20 shrink-0"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Custom Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#151518] border border-[#232328] rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-2">Verify Password</h2>
              <p className="text-sm text-neutral-400 mb-6">
                Please enter your password to continue with this destructive action.
              </p>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-6"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePasswordSubmit();
                }}
              />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePasswordSubmit}>
                  Verify
                </Button>
              </div>
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
            ? "Are you absolutely sure you want to permanently delete your account? All your match history, notes, and Riot connection will be wiped. Note: If you just want to reset your matches, you can delete your match history or unlink your Riot account and link a new one to keep your history intact."
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
