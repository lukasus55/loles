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
  onSuccess: (account: any) => void;
}

export const AccountVerifyStep: React.FC<AccountVerifyStepProps> = ({
  gameName,
  tagLine,
  region,
  targetIconId,
  onBack,
  onSuccess
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
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();
      if (res.ok) {
        toast({ type: "success", title: "Account Verified", message: "Your Riot account has been successfully linked!" });
        onSuccess(data.account);
      } else {
        if (data.foundIconId) {
          setFoundIconId(data.foundIconId);
        }
        toast({ type: "error", title: "Verification Failed", message: data.message || "Verification failed" });
        setCooldown(30);
      }
    } catch (e) {
      toast({ type: "error", title: "Connection Error", message: "Failed to connect to server" });
      setCooldown(10);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-xl text-center space-y-4">
        <h3 className="text-lg font-bold text-white">Manual Verification Required</h3>
        <p className="text-neutral-400 text-sm max-w-md mx-auto leading-relaxed">
          To prove you own <strong className="text-white">{gameName}#{tagLine}</strong>, please open your League of Legends client and change your summoner icon to the exact icon shown below.
        </p>

        {foundIconId !== null ? (
          <div className="py-8 flex flex-col sm:flex-row items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-red-400 font-bold mb-3 text-sm flex items-center justify-center gap-1"><X className="w-4 h-4" /> Found Icon</p>
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-neutral-800 relative mx-auto opacity-75 grayscale hover:grayscale-0 transition-all">
                <Image src={`https://ddragon.leagueoflegends.com/cdn/14.13.1/img/profileicon/${foundIconId}.png`} alt="Found Icon" fill className="object-cover" />
              </div>
            </div>

            <div className="hidden sm:flex text-neutral-600 font-bold text-xl">vs</div>

            <div className="text-center">
              <p className="text-green-500 font-bold mb-3 text-sm flex items-center justify-center gap-1"><Check className="w-4 h-4" /> Expected Icon</p>
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-red-600/50 shadow-[0_0_20px_rgba(239,68,68,0.3)] relative mx-auto">
                <Image src={`https://ddragon.leagueoflegends.com/cdn/14.13.1/img/profileicon/${targetIconId}.png`} alt="Target Icon" fill className="object-cover" />
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 flex justify-center">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-red-600/50 shadow-[0_0_20px_rgba(239,68,68,0.3)] relative">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/14.13.1/img/profileicon/${targetIconId}.png`}
                alt="Target Icon"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        <p className="text-neutral-500 text-xs uppercase tracking-widest font-bold">
          Changes may take up to 5 minutes to sync
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-800">
        <Button variant="outline" onClick={onBack} disabled={isLoading || cooldown > 0} className="w-full sm:w-auto">
          Back
        </Button>
        <Button
          onClick={handleVerify}
          disabled={isLoading || cooldown > 0}
          className="w-full sm:w-auto px-8 flex items-center min-w-[200px] justify-center"
        >
          {isLoading ? (
            <><Spinner size="sm" className="mr-2" /> Checking...</>
          ) : cooldown > 0 ? (
            `Wait ${cooldown}s to retry`
          ) : (
            <><RefreshCw className="w-4 h-4 mr-2" /> I have changed my icon</>
          )}
        </Button>
      </div>
    </div>
  );
};
