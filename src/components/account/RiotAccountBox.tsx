"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Link as LinkIcon, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Tooltip } from "@/components/ui/Tooltip";
import Image from "next/image";
import { AccountInputStep } from "./AccountInputStep";
import { AccountVerifyStep } from "./AccountVerifyStep";
import { useToast } from "@/components/ui/ToastProvider";
import { Spinner } from "@/components/ui/Spinner";

interface RiotAccount {
  id: string;
  gameName: string;
  tagLine: string;
  region: string;
  profileIconId: number;
  isVerified?: boolean;
}

export const RiotAccountBox = ({
  initialRiotAccount,
}: {
  initialRiotAccount: RiotAccount | null;
}) => {
  const [account, setAccount] = useState<RiotAccount | null>(initialRiotAccount);

  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [region, setRegion] = useState("EUW1");

  const [step, setStep] = useState<"INPUT" | "VERIFY">("INPUT");
  const [targetIconId, setTargetIconId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingState, setIsVerifyingState] = useState(false);
  const [isUnlinkDialogOpen, setIsUnlinkDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(0);
  const { toast } = useToast();

  const handleLink = async () => {
    if (!gameName || !tagLine) {
      toast({
        type: "warning",
        title: "Missing Fields",
        message: "Please enter both Game Name and Tagline",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/riot/verify", {
        method: "POST",
        body: JSON.stringify({ action: "LINK", gameName, tagLine, region }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok && data.account) {
        setAccount(data.account);
        toast({
          type: "success",
          title: "Account Linked",
          message: "Successfully linked your Riot account!",
        });
      } else {
        toast({
          type: "error",
          title: "Linking Failed",
          message: data.message || "Account not found in Riot system",
        });
      }
    } catch {
      toast({ type: "error", title: "Connection Error", message: "Failed to connect to server" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartVerify = async () => {
    if (!account) return;
    setIsVerifyingState(true);
    try {
      const res = await fetch("/api/riot/verify", {
        method: "POST",
        body: JSON.stringify({
          action: "START_VERIFY",
          gameName: account.gameName,
          tagLine: account.tagLine,
          region: account.region,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok) {
        setTargetIconId(data.expectedIconId);
        setStep("VERIFY");
      } else {
        toast({
          type: "error",
          title: "Verification Error",
          message: data.message || "Could not start verification",
        });
      }
    } catch {
      toast({ type: "error", title: "Connection Error", message: "Failed to connect to server" });
    } finally {
      setIsVerifyingState(false);
    }
  };

  const handleRefresh = async () => {
    if (Date.now() - lastRefresh < 120000) {
      const remaining = Math.ceil((120000 - (Date.now() - lastRefresh)) / 1000);
      toast({
        type: "warning",
        title: "Cooldown Active",
        message: `Please wait ${remaining} seconds before refreshing again.`,
      });
      return;
    }
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/riot/refresh", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.account) {
        setAccount(data.account);
        setLastRefresh(Date.now());
        toast({
          type: "success",
          title: "Refreshed",
          message: "Successfully updated profile icon and name!",
        });
      } else {
        toast({ type: "error", title: "Refresh Failed", message: data.message });
      }
    } catch {
      toast({ type: "error", title: "Error", message: "Failed to connect to server" });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (account && step === "INPUT") {
    return (
      <div
        key="linked-state"
        className="bg-neutral-900/35 border border-neutral-800/75 rounded-lg p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-accent-soft" />
            <span>Linked Riot Account</span>
          </h2>

          {account.isVerified ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded uppercase tracking-wider">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-neutral-800/70 text-neutral-400 border border-neutral-700/70 rounded uppercase tracking-wider">
              <AlertCircle className="w-3 h-3" /> Unverified
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 p-3.5 bg-neutral-950/45 border border-neutral-800/60 rounded-lg">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-neutral-700/80 shrink-0 relative">
            <Image
              src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${account.profileIconId}.jpg`}
              alt="Profile Icon"
              fill
              className="object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight truncate">
                {account.gameName}{" "}
                <span className="text-neutral-500 font-normal text-sm">#{account.tagLine}</span>
              </h3>
              <Tooltip compact content="Refresh profile" position="top">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  aria-label="Refresh profile"
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800/80 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRefreshing ? (
                    <Spinner size="sm" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                </button>
              </Tooltip>
            </div>
            <p className="text-neutral-500 uppercase font-medium tracking-wider text-xs">
              {account.region}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2.5">
          {!account.isVerified && (
            <Button
              size="sm"
              onClick={handleStartVerify}
              disabled={isVerifyingState}
              className="flex-1 sm:flex-none px-4"
            >
              {isVerifyingState ? (
                <>
                  <Spinner size="sm" className="mr-1.5" /> Starting...
                </>
              ) : (
                "Verify Account"
              )}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="border-red-900/50 text-red-400 hover:bg-red-950/40 hover:text-red-300 flex-1 sm:flex-none px-4"
            onClick={() => setIsUnlinkDialogOpen(true)}
          >
            Unlink Account
          </Button>
        </div>

        <ConfirmDialog
          isOpen={isUnlinkDialogOpen}
          title="Unlink Riot Account"
          description="Are you sure you want to unlink your Riot Account? This will not delete your saved notes, but will prevent syncing new matches."
          confirmText="Unlink"
          cancelText="Cancel"
          isDestructive={true}
          onConfirm={async () => {
            setIsUnlinkDialogOpen(false);
            try {
              const res = await fetch("/api/account/riot/unlink", { method: "POST" });
              if (res.ok) {
                setAccount(null);
                setStep("INPUT");
                toast({
                  type: "success",
                  title: "Unlinked",
                  message: "Account unlinked successfully",
                });
              } else {
                toast({ type: "error", title: "Error", message: "Failed to unlink account" });
              }
            } catch {
              toast({ type: "error", title: "Error", message: "Failed to connect to server" });
            }
          }}
          onCancel={() => setIsUnlinkDialogOpen(false)}
        />
      </div>
    );
  }

  return (
    <div
      key="unlinked-state"
      className="bg-neutral-900/35 border border-neutral-800/75 rounded-lg p-5 animate-in fade-in duration-300"
    >
      <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
        <LinkIcon className="w-4 h-4 text-accent-soft" />
        <span>{step === "VERIFY" ? "Verify Riot Account" : "Link Riot Account"}</span>
      </h2>

      {step === "INPUT" && (
        <AccountInputStep
          gameName={gameName}
          setGameName={setGameName}
          tagLine={tagLine}
          setTagLine={setTagLine}
          region={region}
          setRegion={setRegion}
          onLink={handleLink}
          isLoading={isLoading}
        />
      )}

      {step === "VERIFY" && account && (
        <AccountVerifyStep
          gameName={account.gameName}
          tagLine={account.tagLine}
          region={account.region}
          targetIconId={targetIconId}
          onBack={() => setStep("INPUT")}
          onSuccess={(updatedAccount) => {
            setAccount(updatedAccount as RiotAccount);
            setStep("INPUT");
          }}
        />
      )}
    </div>
  );
};
