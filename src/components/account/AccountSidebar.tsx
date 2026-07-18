"use client";
import React, { useEffect, useState } from "react";

export const AccountSidebar = () => {
  const [activeSection, setActiveSection] = useState("profile");

  const sections = [
    { id: "profile", label: "Profile Preferences" },
    { id: "riot", label: "Riot Connection" },
    { id: "security", label: "Security" },
    { id: "danger", label: "Danger Zone" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Find the section that is currently most visible
      let current = "profile";
      let minDistance = Infinity;

      sections.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Distance from the top of the viewport to the top of the element
          // Using Math.abs to find which section's top is closest to the top third of the viewport
          const distance = Math.abs(rect.top - 150); 
          if (distance < minDistance && rect.top < window.innerHeight / 2) {
            minDistance = distance;
            current = s.id;
          }
        }
      });
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initially
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100; // Offset for header
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <nav className="w-64 shrink-0 hidden md:block sticky top-24 self-start">
      <div className="pl-4 border-l-2 border-neutral-800">
        <ul className="space-y-4">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <li key={section.id} className="relative">
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute -left-[18px] top-0 bottom-0 w-[2px] bg-white rounded-r-md transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                )}
                <button
                  onClick={() => handleClick(section.id)}
                  className={`text-left w-full transition-colors font-medium text-lg cursor-pointer ${
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
