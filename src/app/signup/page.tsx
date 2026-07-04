"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import Image from "next/image";
import { Check, X } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Real-time validation states
  const isLengthValid = password.length >= 14 && password.length <= 128;
  const isNotNumbersOnly = password.length > 0 && !/^[0-9]+$/.test(password);

  const isFormValid = email.length > 0 && isLengthValid && isNotNumbersOnly;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "OAuthSignin") {
      setError("OAuth login failed. Please configure your API keys in the .env file.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError("");

    // Basic frontend safety checks for name
    if (name && !/^[a-zA-Z0-9 _-]+$/.test(name)) {
      setError("Summoner name contains invalid characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid registration details.");
        setLoading(false);
        return;
      }

      // Auto login after signup
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError("Account created, but couldn't log in automatically.");
        setLoading(false);
      } else if (signInRes?.ok) {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center text-xs space-x-2 ${met ? 'text-green-500' : 'text-neutral-500'}`}>
      {met ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-red-600 blur-[8px] opacity-50"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">JOIN LOLES</h1>
          <p className="text-neutral-400 text-sm">Create an account to start tracking matchups.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nickname (Optional)"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={32}
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={255}
          />

          <div className="space-y-2">
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              maxLength={128}
            />
            {/* Password requirements feedback */}
            <div className="bg-black/50 rounded-md p-3 space-y-1.5 border border-neutral-800">
              <RequirementItem met={isLengthValid} text="Between 14 and 128 characters" />
              <RequirementItem met={isNotNumbersOnly} text="Cannot be numbers only" />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <Button type="submit" fullWidth disabled={loading || !isFormValid}>
            {loading ? "Creating Account..." : "Sign Up"}
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
            Sign up with Discord
          </Button>
          <Button variant="outline" fullWidth onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="flex items-center justify-center gap-2">
            <Image src="/google.svg" alt="Google" width={20} height={20} />
            Sign up with Google
          </Button>
        </div>

        <p className="mt-8 text-center text-sm text-neutral-400">
          Already have an account? <Link href="/login" className="text-red-500 hover:text-red-400 font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
