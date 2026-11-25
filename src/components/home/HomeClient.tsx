"use client";

import React from "react";
import { motion } from "framer-motion";
import { HeroSection } from "./HeroSection";
import { FeatureGrid } from "./FeatureGrid";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

export const HomeClient = () => {
  return (
    <div className="flex-1 flex flex-col bg-black">
      <div className="relative min-h-[calc(100dvh-3.5rem)] flex flex-col items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-25"
          >
            <source src="/videos/montage.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-black to-transparent" />
        </div>

        {/* Subtle Brand Ambient Glow */}
        <div className="absolute top-0 inset-x-0 h-full pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-accent-dark/25 blur-[130px]" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-accent/15 blur-[110px]" />
        </div>

        <motion.div
          className="w-full max-w-5xl px-4 py-20 mx-auto relative z-10 flex flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <HeroSection />
        </motion.div>
      </div>

      {/* Feature Grid Container */}
      <div className="relative z-10 bg-black w-full pb-20">
        <motion.div
          className="w-full max-w-5xl px-4 mx-auto flex flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <FeatureGrid />
        </motion.div>
      </div>
    </div>
  );
};
