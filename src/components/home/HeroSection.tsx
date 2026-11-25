"use client";
import React from "react";
import { motion, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export const HeroSection = () => {
  return (
    <div className="w-full flex flex-col items-center text-center">
      <motion.h1
        variants={itemVariants}
        className="text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight mb-5 leading-[1.06]"
      >
        Master Your
        <br />
        <span className="text-accent">Matchups.</span>
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="text-base md:text-lg text-neutral-400 max-w-lg mb-8 leading-relaxed"
      >
        Your private League of Legends playbook. Sync your matches, track lane stats, and keep
        your runes, builds, and matchup notes in one place.
      </motion.p>

      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
      >
        <Link href="/signup" className="w-full sm:w-auto">
          <Button
            size="lg"
            className="w-full sm:w-auto px-7 h-11 text-sm font-semibold rounded-lg gap-2 group"
          >
            Start Tracking Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
        <Link href="/login" className="w-full sm:w-auto">
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-neutral-800 bg-neutral-950/60 text-neutral-200 hover:bg-neutral-900 hover:text-white px-7 h-11 text-sm rounded-lg"
          >
            Sign In
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};
