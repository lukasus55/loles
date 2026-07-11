"use client";
import React from "react";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export const HeroSection = () => {
  return (
    <div className="w-full flex flex-col items-center text-center">

      <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-extrabold text-white tracking-tight mb-6">
        Master Your<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
          Matchups.
        </span>
      </motion.h1>

      <motion.p variants={itemVariants} className="text-lg md:text-xl text-neutral-400 max-w-xl mb-10 leading-relaxed">
        Your private vault for League of Legends. Document your personal strategies and never forget how you won that lane.
      </motion.p>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link href="/signup" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-8 h-14 text-lg rounded-xl flex items-center justify-center gap-2 group">
            Start Tracking Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
        <Link href="/login" className="w-full sm:w-auto">
          <Button size="lg" variant="outline" className="w-full sm:w-auto border-neutral-700 text-white hover:bg-neutral-800 px-8 h-14 text-lg rounded-xl">
            Sign In
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};
