"use client";

import React from "react";
import { motion } from "framer-motion";
import { HeroSection } from "./HeroSection";
import { FeatureGrid } from "./FeatureGrid";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export const HomeClient = () => {
  return (
    <div className="flex-1 flex flex-col bg-black">

      <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-30"
          >
            <source src="/videos/montage.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay*/}
          <div className="absolute inset-0 bg-black/50" />

          {/* gradient transition at the bottom of the video */}
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black to-transparent" />
        </div>

        {/* Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-full pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-red-900/40 blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-red-600/20 blur-[100px]" />
        </div>

        <motion.div
          className="w-full max-w-6xl px-6 py-24 mx-auto relative z-10 flex flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <HeroSection />
        </motion.div>
      </div>

      {/* Feature Grid Container (Normal Background) */}
      <div className="relative z-10 bg-black w-full pb-24">
        <motion.div
          className="w-full max-w-6xl px-6 mx-auto flex flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <FeatureGrid />
        </motion.div>
      </div>

    </div>
  );
};
