"use client";
import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const FeatureRow = ({
  title,
  description,
  badgeText,
  imageSrc,
  isReversed = false
}: {
  title: string,
  description: string,
  badgeText: string,
  imageSrc: string,
  isReversed?: boolean
}) => {
  return (
    <motion.div variants={itemVariants} className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center w-full group`}>

      {/* Text Card Side */}
      <div className={`w-full lg:w-[45%] flex z-0 ${isReversed ? 'lg:-ml-12 justify-start' : 'lg:-mr-12 justify-end'}`}>
        <div className={`bg-[#151518] border border-[#232328] py-8 px-8 md:py-12 md:px-12 w-full max-w-xl transition-colors duration-500
          ${isReversed
            ? 'rounded-3xl lg:rounded-l-none lg:rounded-r-3xl lg:pl-16'
            : 'rounded-3xl lg:rounded-r-none lg:rounded-l-3xl lg:pr-16'}
        `}>
          <h3 className="text-2xl md:text-3xl font-bold text-red-500 tracking-tight mb-3">{title}</h3>
          <p className="text-[15px] md:text-[16px] text-normal leading-relaxed font-medium">
            {description}
          </p>
        </div>
      </div>

      {/* Image Side */}
      <div className={`w-full lg:w-[55%] relative z-10 mt-8 lg:mt-0`}>
        {/* Glow effect behind the image */}
        <div className="absolute -inset-1.5 bg-red-600/30 rounded-[2rem] blur-xl opacity-60 transition duration-700" />

        <div className="w-full rounded-2xl border border-neutral-700/50 bg-[#09090b] overflow-hidden aspect-[16/10] relative shadow-2xl transition-transform duration-700">
          {/* Subtle inner ring to match screenshot polish */}
          <div className="absolute inset-0 border border-white/5 rounded-2xl z-20 pointer-events-none" />
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover object-left-top z-10"
          />
        </div>
      </div>

    </motion.div>
  );
};

export const FeatureGrid = () => {
  return (
    <div className="flex flex-col gap-24 md:gap-32 mt-32 w-full max-w-6xl mx-auto px-4 pb-24">
      <FeatureRow
        title="Profile & Match History"
        description="Track all your stats, review your past performances, and add private notes to any match."
        badgeText="Match Vault"
        imageSrc="/screenshots/matchup-notes.webp"
      />

      <FeatureRow
        title="Deep Analytics"
        description="Visualize your win rates and instantly identify your best champion matchups."
        badgeText="Analytics Engine"
        imageSrc="/screenshots/analytics.webp"
        isReversed={true}
      />

      <FeatureRow
        title="Automatic Syncing"
        description="Link your Riot Account once to sync all your matches instantly."
        badgeText="Riot Integration"
        imageSrc="/screenshots/syncing.webp"
      />
    </div>
  );
};
