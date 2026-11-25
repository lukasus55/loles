"use client";
import React, { ReactNode, useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LucideIcon } from "lucide-react";

interface TooltipProps {
  children: ReactNode;
  content: string | ReactNode;
  title?: string;
  icon?: LucideIcon | React.ElementType;
  iconClassName?: string;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  /** Compact single-line tooltip without large min-width (e.g. champion names) */
  compact?: boolean;
  /** Optional custom width / padding override for rich custom cards (e.g. LoL item tooltips) */
  cardClassName?: string;
  /** Disable tooltip opening (e.g. during active drag) */
  disabled?: boolean;
}

const VIEWPORT_MARGIN = 12;
const GAP = 10;

function getNavbarSafeTop(): number {
  if (typeof document === "undefined") return 76;
  const header = document.querySelector("header");
  if (!header) return VIEWPORT_MARGIN;
  const rect = header.getBoundingClientRect();
  // Only avoid headers pinned near the top of the viewport
  if (rect.top <= 4 && rect.bottom > 0 && rect.bottom < window.innerHeight / 2) {
    return Math.max(VIEWPORT_MARGIN, rect.bottom + 10);
  }
  return VIEWPORT_MARGIN;
}

export const Tooltip = ({
  children,
  content,
  title,
  icon: Icon,
  iconClassName = "text-neutral-400",
  position = "top",
  className = "inline-flex",
  compact = false,
  cardClassName,
  disabled = false,
}: TooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const triggerEl = triggerRef.current;
    const tooltipEl = tooltipRef.current;
    if (!triggerEl || !tooltipEl) return;

    const triggerRect = triggerEl.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const safeTop = getNavbarSafeTop();
    const safeBottom = vh - VIEWPORT_MARGIN;
    const safeLeft = VIEWPORT_MARGIN;
    const safeRight = vw - VIEWPORT_MARGIN;

    const tw = tooltipRect.width;
    const th = tooltipRect.height;

    let top = 0;
    let left = 0;

    if (position === "top" || position === "bottom") {
      const spaceAbove = triggerRect.top - safeTop;
      const spaceBelow = safeBottom - triggerRect.bottom;

      let resolvedVertical: "top" | "bottom" = position;
      if (position === "top" && th + GAP > spaceAbove) {
        if (th + GAP <= spaceBelow || spaceBelow > spaceAbove) {
          resolvedVertical = "bottom";
        }
      } else if (position === "bottom" && th + GAP > spaceBelow) {
        if (th + GAP <= spaceAbove || spaceAbove > spaceBelow) {
          resolvedVertical = "top";
        }
      }

      top =
        resolvedVertical === "top"
          ? triggerRect.top - th - GAP
          : triggerRect.bottom + GAP;

      // Clamp vertically so extraordinarily tall tooltips never slide under the navbar or off-screen
      const maxTop = Math.max(safeTop, safeBottom - th);
      top = Math.min(Math.max(top, safeTop), maxTop);

      // Center horizontally on trigger, then clamp within viewport edges
      left = triggerRect.left + triggerRect.width / 2 - tw / 2;
      const maxLeft = Math.max(safeLeft, safeRight - tw);
      left = Math.min(Math.max(left, safeLeft), maxLeft);
    } else {
      const spaceLeft = triggerRect.left - safeLeft;
      const spaceRight = safeRight - triggerRect.right;

      let resolvedHorizontal: "left" | "right" = position;
      if (position === "left" && tw + GAP > spaceLeft) {
        if (tw + GAP <= spaceRight || spaceRight > spaceLeft) {
          resolvedHorizontal = "right";
        }
      } else if (position === "right" && tw + GAP > spaceRight) {
        if (tw + GAP <= spaceLeft || spaceLeft > spaceRight) {
          resolvedHorizontal = "left";
        }
      }

      left =
        resolvedHorizontal === "left"
          ? triggerRect.left - tw - GAP
          : triggerRect.right + GAP;

      const maxLeft = Math.max(safeLeft, safeRight - tw);
      left = Math.min(Math.max(left, safeLeft), maxLeft);

      top = triggerRect.top + triggerRect.height / 2 - th / 2;
      const maxTop = Math.max(safeTop, safeBottom - th);
      top = Math.min(Math.max(top, safeTop), maxTop);
    }

    tooltipEl.style.left = `${Math.round(left)}px`;
    tooltipEl.style.top = `${Math.round(top)}px`;
    tooltipEl.style.opacity = "1";
    tooltipEl.style.transform = "scale(1)";
  }, [position]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleReposition = () => updatePosition();
    window.addEventListener("scroll", handleReposition, { capture: true, passive: true });
    window.addEventListener("resize", handleReposition, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleReposition, { capture: true });
      window.removeEventListener("resize", handleReposition);
    };
  }, [isOpen, updatePosition]);

  const baseCardStyle = cardClassName
    ? cardClassName
    : compact
      ? "px-2.5 py-1.5 text-xs font-medium text-neutral-100 whitespace-nowrap"
      : "min-w-[220px] max-w-[300px] p-3 flex flex-col gap-2";

  return (
    <div
      ref={triggerRef}
      className={`relative ${className}`}
      onMouseEnter={() => !disabled && setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => !disabled && setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      {children}
      {isOpen &&
        !disabled &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              opacity: 0,
              transform: "scale(0.97)",
            }}
            className={`z-[9999] pointer-events-none transition-[opacity,transform] duration-150 bg-bg-500/95 backdrop-blur-lg border border-neutral-700/80 text-neutral-300 rounded-lg shadow-2xl shadow-black/70 ${baseCardStyle}`}
          >
            {(title || Icon) && (
              <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-2 mb-0.5">
                {Icon && <Icon className={`w-4 h-4 shrink-0 ${iconClassName}`} />}
                {title && <span className="font-bold text-sm text-neutral-100">{title}</span>}
              </div>
            )}
            <div className={compact ? "" : "text-[11px] leading-relaxed text-left text-neutral-300"}>
              {content}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
