"use client";
import React, { useEffect, useState } from "react";

const SECTIONS = [
  { id: "profile", label: "Profile Preferences" },
  { id: "riot", label: "Riot Connection" },
  { id: "security", label: "Security" },
  { id: "danger", label: "Danger Zone" },
];

export const AccountSidebar = () => {
  const [activeSection, setActiveSection] = useState("profile");

  useEffect(() => {
    const handleScroll = () => {
      let current = "profile";
      let minDistance = Infinity;

      SECTIONS.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const distance = Math.abs(rect.top - 140);
          if (distance < minDistance && rect.top < window.innerHeight / 2) {
            minDistance = distance;
            current = s.id;
          }
        }
      });
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <nav className="w-48 shrink-0 hidden md:block sticky top-20 self-start">
      <div className="pl-3.5 border-l border-neutral-800/80">
        <ul className="space-y-2.5">
          {SECTIONS.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <li key={section.id} className="relative">
                {isActive && (
                  <div className="absolute -left-[15px] top-0.5 bottom-0.5 w-[2px] bg-accent rounded-full transition-all duration-200" />
                )}
                <button
                  type="button"
                  onClick={() => handleClick(section.id)}
                  className={`text-left w-full transition-colors font-medium text-sm cursor-pointer ${
                    isActive ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {section.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
