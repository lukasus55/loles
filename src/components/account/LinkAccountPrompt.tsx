import React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const LinkAccountPrompt = () => {
  return (
    <div className="bg-neutral-900/35 border border-neutral-800/75 rounded-lg p-8 text-center">
      <ShieldAlert className="w-11 h-11 text-neutral-500 mx-auto mb-3 opacity-70" />
      <h2 className="text-lg font-semibold text-white mb-1.5">No Riot Account Linked</h2>
      <p className="text-neutral-400 text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
        You need to link your League of Legends account before you can sync and view your match
        history.
      </p>
      <Link href="/account">
        <Button size="sm" className="px-6">
          Link Account
        </Button>
      </Link>
    </div>
  );
};
