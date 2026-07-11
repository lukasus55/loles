"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Database, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console for debugging
    console.error("Next.js Error Boundary Caught:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-black px-4 text-center">
      <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-red-500/10 blur-xl" />
        <Database className="w-12 h-12 text-red-500 relative z-10" />
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
        Connection Lost
      </h1>

      <p className="text-neutral-400 max-w-lg mx-auto mb-10 text-lg leading-relaxed">
        We encountered a problem. Please try again later.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Button
          size="lg"
          onClick={() => reset()}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white min-w-[160px] justify-center"
        >
          <RotateCcw className="w-5 h-5" />
          Try Again
        </Button>

        <Link href="/">
          <Button
            size="lg"
            variant="outline"
            className="flex items-center gap-2 border-neutral-700 text-white hover:bg-neutral-800 min-w-[160px] justify-center"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Button>
        </Link>
      </div>

      {/* Development-only error details */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-12 p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-left max-w-2xl w-full overflow-auto">
          <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold mb-2">Dev Only Error Log</p>
          <pre className="text-red-400 text-xs font-mono whitespace-pre-wrap">
            {error.message || "Unknown error occurred"}
          </pre>
        </div>
      )}
    </div>
  );
}
