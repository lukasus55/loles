"use client";

import React from "react";
import { ItemSummary } from "@/lib/riot/assets";

interface StatVisual {
  color: string;
  symbol: React.ReactNode;
}

function getStatVisual(label: string): StatVisual {
  const lower = label.toLowerCase();

  // Ability Power
  if (lower.includes("ability power")) {
    return {
      color: "text-[#9B7BFF]",
      symbol: (
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0 text-[#9B7BFF]" fill="currentColor">
          <path d="M11.8 1.5l2.7 2.7-1.6 1.6-2.7-2.7 1.6-1.6zM9.2 4.1l2.7 2.7-6.4 6.4-3.3.6.6-3.3 6.4-6.4z" />
        </svg>
      ),
    };
  }
  // Attack Damage
  if (lower.includes("attack damage")) {
    return {
      color: "text-[#FF8C42]",
      symbol: (
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0 text-[#FF8C42]" fill="currentColor">
          <path d="M13.5 2.5L12 6l-5 5 1 1-1.2 1.2-1.5-1.5-1.6 1.6-1-1 1.6-1.6-1.5-1.5L4 8l1 1 5-5 3.5-1.5z" />
        </svg>
      ),
    };
  }
  // Attack Speed
  if (lower.includes("attack speed")) {
    return {
      color: "text-[#FDE047]",
      symbol: (
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0 text-[#FDE047]" fill="currentColor">
          <path d="M9.5 1.5L4 8.5h4l-1.5 6L12 7.5H8l1.5-6z" />
        </svg>
      ),
    };
  }
  // Critical Strike
  if (lower.includes("critical")) {
    return {
      color: "text-[#F87171]",
      symbol: (
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0 text-[#F87171]" fill="currentColor">
          <path d="M8 1l1.8 4.4L14.5 6l-3.6 3.1 1.1 4.6L8 11.2 4 13.7l1.1-4.6L1.5 6l4.7-.6L8 1z" />
        </svg>
      ),
    };
  }
  // Move Speed
  if (lower.includes("move speed")) {
    return {
      color: "text-[#E2E8F0]",
      symbol: (
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0 text-[#FCD34D]" fill="currentColor">
          <path d="M2 10.5c3.5 0 5.5-2 7-5.5l2 1.5c-.6 1.8-.3 3 1.5 3.5l1.5.5v2H2v-2z" />
        </svg>
      ),
    };
  }
  // Health / Health Regen
  if (lower.includes("health") || lower.includes("heal")) {
    return {
      color: "text-[#4ADE80]",
      symbol: (
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0 text-[#4ADE80]" fill="currentColor">
          <path d="M8 13.8l-1-.9C3.6 9.8 1.8 8.1 1.8 5.8 1.8 3.9 3.3 2.5 5.1 2.5c1.1 0 2.2.5 2.9 1.4.7-.9 1.8-1.4 2.9-1.4 1.8 0 3.3 1.4 3.3 3.3 0 2.3-1.8 4-5.2 7.1l-1 .9z" />
        </svg>
      ),
    };
  }
  // Armor
  if (lower.includes("armor") && !lower.includes("penetration")) {
    return {
      color: "text-[#FBBF24]",
      symbol: (
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0 text-[#FBBF24]" fill="currentColor">
          <path d="M8 1.5L2.5 3.8v4.1c0 3.3 2.3 5.7 5.5 6.6 3.2-.9 5.5-3.3 5.5-6.6V3.8L8 1.5z" />
        </svg>
      ),
    };
  }
  // Magic Resist
  if (lower.includes("magic resist")) {
    return {
      color: "text-[#38BDF8]",
      symbol: (
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0 text-[#38BDF8]" fill="currentColor">
          <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zm0 2.2a4.3 4.3 0 110 8.6 4.3 4.3 0 010-8.6z" />
        </svg>
      ),
    };
  }
  // Mana
  if (lower.includes("mana")) {
    return {
      color: "text-[#60A5FA]",
      symbol: (
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0 text-[#60A5FA]" fill="currentColor">
          <path d="M8 1.8C8 1.8 3.5 6.7 3.5 10a4.5 4.5 0 009 0c0-3.3-4.5-8.2-4.5-8.2z" />
        </svg>
      ),
    };
  }
  // Ability Haste
  if (lower.includes("haste")) {
    return {
      color: "text-[#2DD4BF]",
      symbol: (
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0 text-[#2DD4BF]" fill="currentColor">
          <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm.7 3v3.3l2.4 1.4-.7 1.2L7.3 9V5h1.4z" />
        </svg>
      ),
    };
  }
  // Lethality / Armor Pen / Life Steal / Omnivamp
  if (
    lower.includes("lethality") ||
    lower.includes("penetration") ||
    lower.includes("life steal") ||
    lower.includes("vamp")
  ) {
    return {
      color: "text-[#FB7185]",
      symbol: (
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0 text-[#FB7185]" fill="currentColor">
          <path d="M12.5 2L3 11.5l1.5 1.5L14 3.5 12.5 2zM3.5 4L6 6.5 4.8 7.7 2.3 5.2 3.5 4z" />
        </svg>
      ),
    };
  }

  // Generic stat fallback
  return {
    color: "text-neutral-300",
    symbol: <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0 mx-1" />,
  };
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function getTagClassName(tag: string): string {
  switch (tag.toLowerCase()) {
    case "passive":
    case "active":
      return "text-[#F0E6D2] font-bold";
    case "raritymythic":
    case "raritylegendary":
    case "raritygeneric":
      return "text-[#E5C76B] font-semibold";
    case "attention":
      return "text-white font-semibold";
    case "scaleap":
    case "magicdamage":
      return "text-[#A78BFA] font-medium";
    case "scalead":
    case "physicaldamage":
      return "text-[#FB923C] font-medium";
    case "truedamage":
      return "text-white font-semibold";
    case "scalehealth":
    case "healing":
      return "text-[#4ADE80] font-medium";
    case "scalearmor":
      return "text-[#FBBF24] font-medium";
    case "scalemr":
    case "shield":
    case "scalemana":
      return "text-[#38BDF8] font-medium";
    case "attackspeed":
    case "speed":
      return "text-[#FDE047] font-medium";
    case "scalelethality":
    case "lifesteal":
    case "onhit":
      return "text-[#FB7185] font-medium";
    case "status":
    case "keywordmajor":
    case "keywordstealth":
    case "keyword":
    case "ornnbonus":
      return "text-[#E5C76B] font-medium";
    case "rules":
      return "text-neutral-400 italic text-[11px]";
    case "flavortext":
      return "text-neutral-500 italic text-[11px]";
    default:
      return "";
  }
}

interface ParsedNode {
  type: "text" | "br" | "element";
  tag?: string;
  text?: string;
  children?: ParsedNode[];
}

/**
 * Safely tokenizes Riot DDragon's XML-like markup into a lightweight AST
 * without using dangerouslySetInnerHTML.
 */
function parseRiotMarkup(input: string): ParsedNode[] {
  const tokenRegex = /<(\/?)([a-zA-Z0-9_]+)(?:\s[^>]*)?(\/?)>/g;
  const root: ParsedNode = { type: "element", tag: "root", children: [] };
  const stack: ParsedNode[] = [root];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      const text = decodeEntities(input.slice(lastIndex, match.index));
      if (text) {
        stack[stack.length - 1].children!.push({ type: "text", text });
      }
    }

    const isClosing = match[1] === "/";
    const tagName = match[2].toLowerCase();
    const isSelfClosing = match[3] === "/" || tagName === "br";

    if (tagName === "br") {
      stack[stack.length - 1].children!.push({ type: "br" });
    } else if (isClosing) {
      // Pop up to matching tag if present
      for (let i = stack.length - 1; i >= 1; i--) {
        if (stack[i].tag === tagName) {
          stack.length = i;
          break;
        }
      }
    } else if (!isSelfClosing) {
      const node: ParsedNode = { type: "element", tag: tagName, children: [] };
      stack[stack.length - 1].children!.push(node);
      stack.push(node);
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < input.length) {
    const tail = decodeEntities(input.slice(lastIndex));
    if (tail) {
      stack[stack.length - 1].children!.push({ type: "text", text: tail });
    }
  }

  return root.children || [];
}

function renderAstNodes(nodes: ParsedNode[], keyPrefix = "n"): React.ReactNode[] {
  const out: React.ReactNode[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const key = `${keyPrefix}-${i}`;

    if (node.type === "text") {
      out.push(<React.Fragment key={key}>{node.text}</React.Fragment>);
    } else if (node.type === "br") {
      out.push(<br key={key} />);
    } else if (node.type === "element" && node.tag) {
      const children = renderAstNodes(node.children || [], key);

      if (node.tag === "li") {
        out.push(
          <span key={key} className="block pl-2.5 relative mt-1">
            <span className="absolute left-0 text-neutral-500">•</span>
            {children}
          </span>
        );
      } else if (node.tag === "passive" || node.tag === "active") {
        // Ensure a passive/active title stands out cleanly with a small line break after it if followed by text
        const nextNode = nodes[i + 1];
        const nextIsBr = nextNode?.type === "br";
        const isActive = node.tag === "active";
        out.push(
          <span
            key={key}
            className={`inline-block font-bold ${
              isActive ? "text-amber-300" : "text-[#F0E6D2]"
            } ${nextIsBr ? "" : "mr-1"}`}
          >
            {isActive ? "Active - " : ""}
            {children}
          </span>
        );
      } else {
        const cls = getTagClassName(node.tag);
        if (cls) {
          out.push(
            <span key={key} className={cls}>
              {children}
            </span>
          );
        } else {
          out.push(<React.Fragment key={key}>{children}</React.Fragment>);
        }
      }
    }
  }

  return out;
}

interface ParsedStatLine {
  value: string;
  label: string;
}

function extractStatsAndBody(rawDescription: string): {
  stats: ParsedStatLine[];
  bodyParagraphs: string[];
} {
  if (!rawDescription) return { stats: [], bodyParagraphs: [] };

  let working = rawDescription
    .replace(/<\/?mainText>/gi, "")
    .trim();

  const stats: ParsedStatLine[] = [];
  const statsMatch = working.match(/<stats>([\s\S]*?)<\/stats>/i);

  if (statsMatch) {
    const statsInner = statsMatch[1];
    const lines = statsInner
      .split(/<br\s*\/?>/i)
      .map((l) => l.trim())
      .filter(Boolean);

    for (const line of lines) {
      const attMatch = line.match(/<attention>([\s\S]*?)<\/attention>\s*([\s\S]*)/i);
      if (attMatch) {
        const value = decodeEntities(attMatch[1].replace(/<[^>]+>/g, "")).trim();
        const label = decodeEntities(attMatch[2].replace(/<[^>]+>/g, "")).trim();
        if (value || label) {
          stats.push({ value, label });
        }
      } else {
        const plain = decodeEntities(line.replace(/<[^>]+>/g, "")).trim();
        if (plain) {
          stats.push({ value: "", label: plain });
        }
      }
    }

    working = working.replace(statsMatch[0], "").trim();
  }

  // Strip leading/trailing <br> tags left after removing <stats>
  working = working.replace(/^(<br\s*\/?>|\s)+/i, "").replace(/(<br\s*\/?>|\s)+$/i, "");

  // Split double <br> into distinct paragraphs for clean League-style spacing between passives
  const bodyParagraphs = working
    ? working
        .split(/(?:<br\s*\/?>\s*){2,}/i)
        .map((p) => p.replace(/^(<br\s*\/?>|\s)+/i, "").replace(/(<br\s*\/?>|\s)+$/i, ""))
        .filter(Boolean)
    : [];

  return { stats, bodyParagraphs };
}

interface RiotItemTooltipContentProps {
  item?: ItemSummary | null;
  itemId: number;
  iconUrl: string;
}

export const RiotItemTooltipContent: React.FC<RiotItemTooltipContentProps> = ({
  item,
  itemId,
  iconUrl,
}) => {
  const name = item?.name || `Item #${itemId}`;
  const gold = item?.gold ?? 0;
  const { stats, bodyParagraphs } = extractStatsAndBody(item?.description || "");

  return (
    <div className="w-[290px] sm:w-[310px] text-left">
      {/* League-style Header: Icon + Item Name + Gold */}
      <div className="flex items-center gap-3 pb-2.5 border-b border-neutral-800/90">
        <div className="w-10 h-10 rounded-md overflow-hidden border border-[#C89B3C]/50 bg-neutral-950 shrink-0 shadow-md">
          <img src={iconUrl} alt={name} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-[#F0E6D2] leading-snug truncate">{name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {/* Gold coin icon */}
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-[#C89B3C] shrink-0" fill="currentColor">
              <circle cx="8" cy="8" r="6.5" opacity="0.25" />
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1.6a4.4 4.4 0 110 8.8 4.4 4.4 0 010-8.8zm-.7 2v4.8h1.4V5.6H7.3z" />
            </svg>
            <span className="text-xs font-semibold text-[#C89B3C]">
              {gold > 0 ? gold : "Free"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {stats.length > 0 && (
        <div className="py-2.5 space-y-1 border-b border-neutral-800/70 last:border-b-0">
          {stats.map((stat, idx) => {
            const visual = getStatVisual(stat.label);
            return (
              <div key={idx} className="flex items-center gap-2 text-[12px] leading-tight">
                {visual.symbol}
                <span className="text-neutral-200">
                  {stat.value && (
                    <span className="font-semibold text-white mr-1">{stat.value}</span>
                  )}
                  <span className={visual.color}>{stat.label}</span>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Passives / Actives / Effects */}
      {bodyParagraphs.length > 0 ? (
        <div className="pt-2.5 space-y-2.5 text-[11.5px] leading-relaxed text-[#A09B8C]">
          {bodyParagraphs.map((para, idx) => (
            <p key={idx} className="m-0">
              {renderAstNodes(parseRiotMarkup(para), `p-${idx}`)}
            </p>
          ))}
        </div>
      ) : (
        stats.length === 0 &&
        item?.plaintext && (
          <p className="pt-2.5 text-[11.5px] leading-relaxed text-neutral-400">
            {item.plaintext}
          </p>
        )
      )}
    </div>
  );
};
