import React from "react";

export const WinRateIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

export const KillRateIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 17.5L19 5" />
    <path d="M16 4h4v4" />
    <path d="M4 20l3.5-3.5" />
    <path d="M3.5 16.5L7.5 20.5" fill="currentColor" fillOpacity="0.2" />
    <path d="M17.5 17.5L5 5" />
    <path d="M8 4H4v4" />
    <path d="M20 20l-3.5-3.5" />
    <path d="M20.5 16.5L16.5 20.5" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

export const CSIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 10c0-4.5 2.5-8 6-8s6 3.5 6 8v7c0 1.5-1 3-3 3H9c-2 0-3-1.5-3-3v-7z" fill="currentColor" fillOpacity="0.1" />
    <path d="M8.5 12h7" strokeWidth="2.5" />
    <path d="M12 12v5" strokeWidth="2.5" />
    <path d="M4 22h16" />
  </svg>
);

export const GoldIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="7" rx="6" ry="3" fill="currentColor" fillOpacity="0.2" />
    <path d="M6 7v4c0 1.7 2.7 3 6 3s6-1.3 6-3V7" />
    <path d="M6 11v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4" fill="currentColor" fillOpacity="0.1" />
    <path d="M6 15v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4" />
  </svg>
);
