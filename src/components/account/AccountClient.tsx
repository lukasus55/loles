"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, AlertTriangle, Link as LinkIcon } from "lucide-react";
import Image from "next/image";
import { AccountInputStep } from "./AccountInputStep";
import { AccountVerifyStep } from "./AccountVerifyStep";
import { useToast } from "@/components/ui/ToastProvider";

interface RiotAccount {
  id: string;
  gameName: string;
  tagLine: string;
  region: string;
  profileIconId: number;
}

export const AccountClient = ({ initialRiotAccount }: { initialRiotAccount: RiotAccount | null }) => {
  const [account, setAccount] = useState<RiotAccount | null>(initialRiotAccount);
  
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [region, setRegion] = useState("EUW1");
  
  const [step, setStep] = useState<"INPUT" | "VERIFY">("INPUT");
  const [targetIconId, setTargetIconId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheck = async () => {
    if (!gameName || !tagLine) {
      toast({ type: "warning", title: "Missing Fields", message: "Please enter both Game Name and Tagline" });
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/riot/verify", {
        method: "POST",
        body: JSON.stringify({ action: "CHECK", gameName, tagLine, region }),
        headers: { "Content-Type": "application/json" }
      });
      
      const data = await res.json();
      if (res.ok) {
        setTargetIconId(data.expectedIconId);
        setStep("VERIFY");
      } else {
        toast({ type: "error", title: "Account Not Found", message: data.message || "Account not found in Riot system" });
      }
    } catch (e) {
      toast({ type: "error", title: "Connection Error", message: "Failed to connect to server" });
    } finally {
      setIsLoading(false);
    }
  };

  if (account) {
    return (
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-red-500" /> Linked Riot Account
        </h2>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 bg-neutral-950/50 border border-neutral-800/50 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded uppercase tracking-wider">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </span>
          </div>

          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-neutral-800 shrink-0 relative shadow-xl">
            <Image 
              src={`https://ddragon.leagueoflegends.com/cdn/14.13.1/img/profileicon/${account.profileIconId}.png`} 
              alt="Profile Icon" 
              fill
              className="object-cover"
            />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {account.gameName} <span className="text-neutral-500 text-lg">#{account.tagLine}</span>
            </h3>
            <p className="text-neutral-400 uppercase font-bold tracking-wider text-sm">{account.region}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" className="border-red-900/50 text-red-500 hover:bg-red-950/40 hover:text-red-400" onClick={() => {
            if(window.confirm("Are you sure you want to unlink your Riot Account? This will not delete your saved notes, but will prevent syncing new matches.")) {
               alert("Unlink feature coming soon");
            }
          }}>
            Unlink Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 md:p-8 shadow-sm animate-in fade-in duration-500">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <LinkIcon className="w-5 h-5 text-red-500" /> Link Riot Account
      </h2>

      {step === "INPUT" && (
        <AccountInputStep
          gameName={gameName}
          setGameName={setGameName}
          tagLine={tagLine}
          setTagLine={setTagLine}
          region={region}
          setRegion={setRegion}
          onCheck={handleCheck}
          isLoading={isLoading}
        />
      )}

      {step === "VERIFY" && (
        <AccountVerifyStep
          gameName={gameName}
          tagLine={tagLine}
          region={region}
          targetIconId={targetIconId}
          onBack={() => setStep("INPUT")}
          onSuccess={(newAccount) => {
             setAccount(newAccount);
             setStep("INPUT");
          }}
        />
      )}
    </div>
  );
};
