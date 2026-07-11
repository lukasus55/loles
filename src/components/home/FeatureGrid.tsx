"use client";
import React from "react";
import { motion, Variants } from "framer-motion";
import { BookOpen, LineChart, Swords } from "lucide-react";
import Image from "next/image";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const FeatureRow = ({
  title,
  description,
  icon,
  imageSrc,
  isReversed = false
}: {
  title: string,
  description: string,
  icon: React.ReactNode,
  imageSrc: string,
  isReversed?: boolean
}) => {
  return (
    <motion.div variants={itemVariants} className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 group`}>
      <div className={`flex-1 space-y-6 w-full ${isReversed ? 'lg:pl-12' : 'lg:pr-12'}`}>
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
          {icon}
        </div>
        <h3 className="text-4xl font-bold text-white tracking-tight">{title}</h3>
        <p className="text-xl text-neutral-400 leading-relaxed max-w-lg">
          {description}
        </p>
      </div>
      <div className="flex-1 w-full relative">
        <div className={`absolute inset-0 bg-red-500/10 rounded-2xl transform ${isReversed ? '-translate-x-3' : 'translate-x-3'} translate-y-3 transition-transform duration-500 group-hover:translate-x-0 group-hover:translate-y-0`} />
        <div className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden aspect-[16/10] relative shadow-2xl z-10 transition-transform duration-500 group-hover:-translate-y-1">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover object-left-top"
          />
        </div>
      </div>
    </motion.div>
  );
};

export const FeatureGrid = () => {
  return (
    <div className="flex flex-col gap-32 mt-32 w-full max-w-6xl mx-auto px-4 pb-24">
      <FeatureRow
        title="Private Matchup Notes"
        description="Never forget how you won that lane. Save personal strategies, power spikes, and reminders against specific champions right from your match history."
        icon={<BookOpen className="w-7 h-7 text-red-500" />}
        imageSrc="/screenshots/matchup-notes.webp"
      />

      <FeatureRow
        title="Deep Analytics"
        description="Visualize your win rates, average KDA, CS per minute, and gold. Instantly identify your best and worst champion matchups to refine your champion pool."
        icon={<LineChart className="w-7 h-7 text-red-500" />}
        imageSrc="/screenshots/analytics.webp"
        isReversed={true}
      />

      <FeatureRow
        title="Automatic Syncing"
        description="Link your Riot Account once and sync your matches with a single click. We securely fetch your live ranked tier and detailed match performance data instantly."
        icon={<Swords className="w-7 h-7 text-red-500" />}
        imageSrc="/screenshots/syncing.webp"
      />
    </div>
  );
};
