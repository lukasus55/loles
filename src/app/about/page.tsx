import React from 'react';
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "About - LOLES",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-black">
      <div className="flex-1 w-full max-w-3xl mx-auto px-6 py-20 md:py-32">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-8">
          About <span className="text-red-500">LOLES</span>
        </h1>
        
        <div className="space-y-6 text-lg text-neutral-400 leading-relaxed font-medium">
          <p>
            Hey there! LOLES started as a simple idea: playing League of Legends is complicated enough, and keeping track of how to play against 160+ champions shouldn't require a messy Notepad file or keeping a dozen browser tabs open.
          </p>
          
          <p>
            I built this app to solve my own problem. I wanted a clean, fast way to sync my recent matches straight from the Riot API, see exactly who I played against, and jot down quick notes about the matchup. Did I win because I abused their cooldowns early? Did I lose because I didn't respect their level 6 spike? I wanted a place to vault that information.
          </p>

          <p>
            Over time, it grew into a full dashboard. Now it tracks your win rates, averages out your CS, Damage, and Vision scores, and gives you a clear picture of which champions you actually play well against, and which ones are your kryptonite.
          </p>

          <p>
            This isn't a massive corporate tool backed by millions of dollars. It's a passion project built for the community, aiming to be the absolute best personal companion app for League of Legends players who want to improve their game.
          </p>

          <p>
            Thanks for using it, and good luck on the Rift!
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
