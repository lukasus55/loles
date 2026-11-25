"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { RefreshCw, X, Check } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/ui/ToastProvider";

interface AccountVerifyStepProps {
  gameName: string;
  tagLine: string;
  region: string;
  targetIconId: number;
  onBack: () => void;
  onSuccess: (account: unknown) => void;
}

export const AccountVerifyStep: React.FC<AccountVerifyStepProps> = ({
  gameName,
  tagLine,
  region,
  targetIconId,
  onBack,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [foundIconId, setFoundIconId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    setIsLoading(true);
    setFoundIconId(null);

    try {
      const res = await fetch("/api/riot/verify", {
        method: "POST",
        body: JSON.stringify({ action: "VERIFY", gameName, tagLine, region, targetIconId }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          type: "success",
          title: "Account Verified",
          message: "Your Riot account has been successfully linked!",
        });
        onSuccess(data.account);
      } else {
        if (data.foundIconId) {
          setFoundIconId(data.foundIconId);
        }
        toast({
          type: "error",
          title: "Verification Failed",
          message: data.message || "Verification failed",
        });
        setCooldown(30);
      }
    } catch {
      toast({ type: "error", title: "Connection Error", message: "Failed to connect to server" });
      setCooldown(10);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="p-5 bg-neutral-950/50 border border-neutral-800/75 rounded-lg text-center space-y-4">
        <h3 className="text-base font-semibold text-white">Manual Verification Required</h3>
        <p className="text-neutral-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
          To prove you own <strong className="text-white">{gameName}#{tagLine}</strong>, open your
          League client and equip the summoner icon shown below.
        </p>

        {foundIconId !== null ? (
          <div className="py-4 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-red-400 font-semibold mb-2 text-xs flex items-center justify-center gap-1">
                <X className="w-3.5 h-3.5" /> Found Icon
              </p>
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-neutral-800 relative mx-auto opacity-75 grayscale">
                <Image
                  src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${foundIconId}.jpg`}
                  alt="Found Icon"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <span className="hidden sm:inline text-neutral-600 font-semibold text-xs uppercase tracking-wider">
              vs
            </span>

            <div className="text-center">
              <p className="text-emerald-400 font-semibold mb-2 text-xs flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5" /> Expected Icon
              </p>
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-accent/60 relative mx-auto">
                <Image
                  src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${targetIconId}.jpg`}
                  alt="Target Icon"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="py-3 flex justify-center">
            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-accent/60 relative">
              <Image
                src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${targetIconId}.jpg`}
                alt="Target Icon"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        <p className="text-neutral-500 text-[11px]">
          Changes may take up to 5 minutes to sync.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-neutral-800/60">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          disabled={isLoading || cooldown > 0}
          className="w-full sm:w-auto px-4"
        >
          Back
        </Button>
        <Button
          size="sm"
          onClick={handleVerify}
          disabled={isLoading || cooldown > 0}
          className="w-full sm:w-auto px-5"
        >
          {isLoading ? (
            <>
              <Spinner size="sm" className="mr-1.5" /> Checking...
            </>
          ) : cooldown > 0 ? (
            `Wait ${cooldown}s to retry`
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> I have changed my icon
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
