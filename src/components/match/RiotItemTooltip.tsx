"use client";

import React from "react";
import { ItemSummary } from "@/lib/riot/assets";

interface StatVisual {
  iconSrc: string | null;
  alt: string;
}

/**
 * Maps Riot DDragon <stats> labels to official League of Legends colored stat icons
 * stored locally in /public/stats/. Specific matches precede general ones.
 */
function getStatVisual(label: string): StatVisual {
  const lower = label.toLowerCase();

  if (lower.includes("ability power")) return { iconSrc: "/stats/ability-power.png", alt: "Ability Power" };
  if (lower.includes("attack damage")) return { iconSrc: "/stats/attack-damage.png", alt: "Attack Damage" };
  if (lower.includes("attack speed")) return { iconSrc: "/stats/attack-speed.png", alt: "Attack Speed" };
  if (lower.includes("critical strike damage")) return { iconSrc: "/stats/crit-damage.png", alt: "Crit Damage" };
  if (lower.includes("critical")) return { iconSrc: "/stats/crit-chance.png", alt: "Crit Chance" };
  if (lower.includes("move speed")) return { iconSrc: "/stats/move-speed.png", alt: "Move Speed" };
  if (lower.includes("heal and shield")) return { iconSrc: "/stats/heal-shield-power.png", alt: "Heal & Shield Power" };
  if (lower.includes("health regen")) return { iconSrc: "/stats/health-regen.png", alt: "Health Regen" };
  if (lower.includes("health")) return { iconSrc: "/stats/health.png", alt: "Health" };
  if (lower.includes("armor penetration") || lower.includes("lethality")) return { iconSrc: "/stats/armor-pen.png", alt: "Armor Penetration" };
  if (lower.includes("armor")) return { iconSrc: "/stats/armor.png", alt: "Armor" };
  if (lower.includes("magic penetration")) return { iconSrc: "/stats/magic-pen.png", alt: "Magic Penetration" };
  if (lower.includes("magic resist")) return { iconSrc: "/stats/magic-resist.png", alt: "Magic Resist" };
  if (lower.includes("mana regen")) return { iconSrc: "/stats/mana-regen.png", alt: "Mana Regen" };
  if (lower.includes("mana")) return { iconSrc: "/stats/mana.png", alt: "Mana" };
  if (lower.includes("haste")) return { iconSrc: "/stats/ability-haste.png", alt: "Ability Haste" };
  if (lower.includes("life steal")) return { iconSrc: "/stats/life-steal.png", alt: "Life Steal" };
  if (lower.includes("omnivamp")) return { iconSrc: "/stats/omnivamp.png", alt: "Omnivamp" };
  if (lower.includes("tenacity") || lower.includes("slow resist")) return { iconSrc: "/stats/tenacity.png", alt: "Tenacity" };
  if (lower.includes("gold")) return { iconSrc: "/stats/gold.png", alt: "Gold" };

  return { iconSrc: null, alt: label };
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
        const nextNode = nodes[i + 1];
        const nextIsBr = nextNode?.type === "br";
        const isActive = node.tag === "active";
        out.push(
          <span
            key={key}
            className={`inline-block font-bold ${isActive ? "text-amber-300" : "text-[#F0E6D2]"
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

  let working = rawDescription.replace(/<\/?mainText>/gi, "").trim();

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

  working = working.replace(/^(<br\s*\/?>|\s)+/i, "").replace(/(<br\s*\/?>|\s)+$/i, "");

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
      {/* League-style Header: Icon + Item Name + Official Gold Icon */}
      <div className="flex items-center gap-3 pb-2.5 border-b border-neutral-800/90">
        <div className="w-10 h-10 rounded-md overflow-hidden border border-neutral-600 bg-neutral-950 shrink-0 shadow-md">
          <img src={iconUrl} alt={name} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-[#F0E6D2] leading-snug truncate">{name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <img
              src="/stats/gold.png"
              alt="Gold"
              className="w-3.5 h-3.5 object-contain shrink-0"
            />
            <span className="text-xs font-semibold text-[#C89B3C]">
              {gold > 0 ? gold : "Free"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Section with Official Colored LoL Stat Icons */}
      {stats.length > 0 && (
        <div className="py-2.5 space-y-1.5 border-b border-neutral-800/70 last:border-b-0">
          {stats.map((stat, idx) => {
            const visual = getStatVisual(stat.label);
            return (
              <div key={idx} className="flex items-center gap-2 text-[12px] leading-tight">
                {visual.iconSrc ? (
                  <img
                    src={visual.iconSrc}
                    alt={visual.alt}
                    className="w-3.5 h-3.5 object-contain shrink-0"
                  />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0 mx-1" />
                )}
                <span className="text-[#C8C3B3]">
                  {stat.value && (
                    <span className="font-semibold text-[#F0E6D2] mr-1">{stat.value}</span>
                  )}
                  <span>{stat.label}</span>
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
