"use client";
import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface TooltipProps {
  children: ReactNode;
  content: string | ReactNode;
  title?: string;
  icon?: LucideIcon | React.ElementType;
  iconClassName?: string;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const Tooltip = ({ 
  children, 
  content, 
  title,
  icon: Icon,
  iconClassName = "text-neutral-400",
  position = "top", 
  className = "inline-flex" 
}: TooltipProps) => {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2 origin-top",
    left: "right-full top-1/2 -translate-y-1/2 mr-2 origin-right",
    right: "left-full top-1/2 -translate-y-1/2 ml-2 origin-left",
  };

  return (
    <div className={`group/tooltip relative ${className}`}>
      {children}
      <div className={`absolute z-[100] invisible opacity-0 scale-95 group-hover/tooltip:visible group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-200 pointer-events-none bg-neutral-950 border border-neutral-800 text-neutral-300 rounded-lg shadow-xl ${positionClasses[position]} min-w-[220px] max-w-[280px] p-3 flex flex-col gap-2`}>
        {(title || Icon) && (
          <div className="flex items-center gap-2 border-b border-neutral-800/60 pb-2 mb-1">
            {Icon && <Icon className={`w-4 h-4 shrink-0 ${iconClassName}`} />}
            {title && <span className="font-bold text-sm text-neutral-200">{title}</span>}
          </div>
        )}
        <div className="text-[11px] leading-relaxed text-left text-neutral-400">
          {content}
        </div>
      </div>
    </div>
  );
};
