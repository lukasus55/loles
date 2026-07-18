import React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const LinkAccountPrompt = () => {
  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-10 text-center shadow-sm">
      <ShieldAlert className="w-16 h-16 text-neutral-500 mx-auto mb-4 opacity-50" />
      <h2 className="text-2xl font-bold text-white mb-2">No Riot Account Linked</h2>
      <p className="text-neutral-400 max-w-md mx-auto mb-8">
        You need to link your League of Legends account before you can sync and view your match history.
      </p>
      <Link href="/account">
        <Button className="px-8 bg-red-600 hover:bg-red-700 text-white">Link Account</Button>
      </Link>
    </div>
  );
};
