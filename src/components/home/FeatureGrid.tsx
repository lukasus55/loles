"use client";
import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

interface FeatureItem {
  badgeText: string;
  title: string;
  description: string;
  imageSrc: string;
  width: number;
  height: number;
}

const FEATURES: FeatureItem[] = [
  {
    badgeText: "Matchup Playbook",
    title: "Personal Matchup Vault",
    description:
      "Organize lane-by-lane notes, priority calls, and real W/L records for every 1v1 and botlane 2v2 matchup.",
    imageSrc: "/screenshots/matchup-notes.png",
    width: 1038,
    height: 598,
  },
  {
    badgeText: "Matchup Hub",
    title: "Lane Diffs & Gameplans",
    description:
      "Track your exact win rate, early kill rate, and @15 CS and gold differentials right above your strategy editor.",
    imageSrc: "/screenshots/matchup-hub.png",
    width: 1857,
    height: 888,
  },
  {
    badgeText: "Loadout Presets",
    title: "Custom Runes & Builds",
    description:
      "Save named setups pairing rune pages with drag-ordered item paths — or import loadouts straight from past games.",
    imageSrc: "/screenshots/loadouts.png",
    width: 506,
    height: 429,
  },
  {
    badgeText: "Match History",
    title: "Games With Full Context",
    description:
      "Review items, runes, summoner spells, and lane opponents at a glance, then jump straight into any matchup hub.",
    imageSrc: "/screenshots/match-history.png",
    width: 1919,
    height: 1079,
  },
  {
    badgeText: "Analytics Engine",
    title: "Deep Analytics",
    description:
      "Filter by season, role, champion, or botlane duo to uncover your strongest picks and toughest matchups.",
    imageSrc: "/screenshots/analytics.png",
    width: 1919,
    height: 1079,
  },
  {
    badgeText: "Riot Integration",
    title: "Automatic Syncing",
    description:
      "Link and verify your Riot Account once to sync your Solo/Duo and Flex matches automatically.",
    imageSrc: "/screenshots/syncing.png",
    width: 780,
    height: 243,
  },
];

const FeatureRow = ({
  title,
  description,
  badgeText,
  imageSrc,
  width,
  height,
  isReversed = false,
}: FeatureItem & { isReversed?: boolean }) => {
  return (
    <motion.div
      variants={itemVariants}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center w-full"
    >
      {/* Text Side */}
      <div
        className={`lg:col-span-5 space-y-2.5 text-center lg:text-left ${
          isReversed ? "lg:order-2" : "lg:order-1"
        }`}
      >
        <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-soft">
          {badgeText}
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">{title}</h2>
        <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-md mx-auto lg:mx-0">
          {description}
        </p>
      </div>

      {/* Screenshot Side */}
      <div
        className={`lg:col-span-7 flex justify-center relative ${
          isReversed ? "lg:order-1" : "lg:order-2"
        }`}
      >
        <div className="relative w-fit max-w-full">
          <div className="absolute -inset-2 bg-accent/10 rounded-2xl blur-2xl opacity-60 pointer-events-none" />
          <div className="relative rounded-xl border border-neutral-800/90 bg-[#09090b] overflow-hidden shadow-2xl shadow-black/80">
            <Image
              src={imageSrc}
              alt={title}
              width={width}
              height={height}
              className="block w-auto max-w-full h-auto max-h-[380px] object-contain"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const FeatureGrid = () => {
  return (
    <div className="flex flex-col gap-20 md:gap-28 mt-24 w-full pb-16">
      {FEATURES.map((feature, idx) => (
        <FeatureRow
          key={feature.badgeText}
          {...feature}
          isReversed={idx % 2 === 1}
        />
      ))}
    </div>
  );
};
