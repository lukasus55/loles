"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "OAuthSignin") {
      setError("OAuth login failed. Please try again later.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
        setLoading(false);
      } else if (res?.ok) {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-red-600 blur-[8px] opacity-50"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">WELCOME BACK</h1>
          <p className="text-neutral-400 text-sm">Enter your details to access your notes.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <div className="w-full h-px bg-neutral-800"></div>
          <span className="text-xs text-neutral-500 uppercase tracking-widest px-4">OR</span>
          <div className="w-full h-px bg-neutral-800"></div>
        </div>

        <div className="mt-6 space-y-3">
          <Button variant="outline" fullWidth onClick={() => signIn("discord", { callbackUrl: "/dashboard" })} className="flex items-center justify-center gap-2">
            <Image src="/discord.svg" alt="Discord" width={20} height={20} />
            Continue with Discord
          </Button>
          <Button variant="outline" fullWidth onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="flex items-center justify-center gap-2">
            <Image src="/google.svg" alt="Google" width={20} height={20} />
            Continue with Google
          </Button>
        </div>

        <p className="mt-8 text-center text-sm text-neutral-400">
          Don&apos;t have an account? <Link href="/signup" className="text-red-500 hover:text-red-400 font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
