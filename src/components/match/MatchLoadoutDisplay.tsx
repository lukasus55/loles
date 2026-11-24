"use client";

import React, { useMemo } from "react";
import {
  MatchAssetsData,
  STAT_SHARDS_BY_ID,
  buildRuneLookup,
  getItemFallbackIconUrl,
} from "@/lib/riot/assets";
import { Tooltip } from "@/components/ui/Tooltip";
import { RiotItemTooltipContent } from "./RiotItemTooltip";

export interface MatchLoadoutFields {
  items?: number[];
  trinketId?: number | null;
  summoner1Id?: number | null;
  summoner2Id?: number | null;
  primaryRuneStyle?: number | null;
  subRuneStyle?: number | null;
  keystoneId?: number | null;
  primaryRunes?: number[];
  subRunes?: number[];
  statShards?: number[];
  loadoutSynced?: boolean;
}

interface MatchSpellsAndRunesProps {
  match: MatchLoadoutFields;
  assets: MatchAssetsData;
  size?: "sm" | "md";
}

export const MatchSpellsAndRunes: React.FC<MatchSpellsAndRunesProps> = ({
  match,
  assets,
  size = "md",
}) => {
  const { stylesById, runesById } = useMemo(
    () => buildRuneLookup(assets.runes),
    [assets.runes]
  );

  const spell1 = match.summoner1Id ? assets.summonerSpells[match.summoner1Id] : null;
  const spell2 = match.summoner2Id ? assets.summonerSpells[match.summoner2Id] : null;

  const keystoneId = match.keystoneId || match.primaryRunes?.[0] || null;
  const keystone = keystoneId ? runesById[keystoneId] : null;
  const primaryStyle = match.primaryRuneStyle ? stylesById[match.primaryRuneStyle] : null;
  const subStyle = match.subRuneStyle ? stylesById[match.subRuneStyle] : null;

  const hasAnyRune = Boolean(keystone || primaryStyle || subStyle);
  const hasAnySpell = Boolean(spell1 || spell2);

  if (!match.loadoutSynced && !hasAnyRune && !hasAnySpell) {
    return null;
  }

  const boxSize = size === "sm" ? "w-5 h-5" : "w-6 h-6";
  const runeTooltipContent = (
    <div className="space-y-2.5 min-w-[210px]">
      {primaryStyle && (
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-200 mb-1">
            <img src={primaryStyle.iconUrl} alt={primaryStyle.name} className="w-3.5 h-3.5" />
            <span>{primaryStyle.name}</span>
          </div>
          <div className="space-y-1 pl-1">
            {(match.primaryRunes || []).map((perkId, idx) => {
              const r = runesById[perkId];
              if (!r) return null;
              return (
                <div key={`${perkId}-${idx}`} className="flex items-center gap-1.5">
                  <img
                    src={r.iconUrl}
                    alt={r.name}
                    className={idx === 0 ? "w-4 h-4 rounded-full bg-neutral-900" : "w-3.5 h-3.5 rounded-full bg-neutral-900"}
                  />
                  <span className={idx === 0 ? "text-neutral-100 font-semibold" : "text-neutral-400"}>
                    {r.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subStyle && (match.subRunes?.length || 0) > 0 && (
        <div className="pt-1.5 border-t border-neutral-800/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-200 mb-1">
            <img src={subStyle.iconUrl} alt={subStyle.name} className="w-3.5 h-3.5" />
            <span>{subStyle.name}</span>
          </div>
          <div className="space-y-1 pl-1">
            {(match.subRunes || []).map((perkId, idx) => {
              const r = runesById[perkId];
              if (!r) return null;
              return (
                <div key={`${perkId}-${idx}`} className="flex items-center gap-1.5">
                  <img src={r.iconUrl} alt={r.name} className="w-3.5 h-3.5 rounded-full bg-neutral-900" />
                  <span className="text-neutral-400">{r.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(match.statShards?.length || 0) > 0 && (
        <div className="pt-1.5 border-t border-neutral-800/80">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
            Stat Shards
          </p>
          <div className="flex flex-wrap gap-2">
            {(match.statShards || []).map((shardId, idx) => {
              const shard = STAT_SHARDS_BY_ID[shardId];
              if (!shard) return null;
              return (
                <div key={`${shardId}-${idx}`} className="flex items-center gap-1 text-[10px] text-neutral-300">
                  <img
                    src={shard.iconUrl}
                    alt={shard.name}
                    className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-neutral-700"
                  />
                  <span>{shard.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex items-center gap-1 shrink-0">
      {/* Summoner Spells Column */}
      <div className="flex flex-col gap-1">
        {[spell1, spell2].map((spell, idx) =>
          spell ? (
            <Tooltip
              key={`${spell.id}-${idx}`}
              title={spell.name}
              content={spell.description}
              position="top"
            >
              <div
                className={`${boxSize} rounded overflow-hidden border border-neutral-700/80 bg-neutral-950`}
              >
                <img
                  src={spell.iconUrl}
                  alt={spell.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </Tooltip>
          ) : (
            <div
              key={`empty-spell-${idx}`}
              className={`${boxSize} rounded border border-neutral-800/60 bg-neutral-950/60`}
            />
          )
        )}
      </div>

      {/* Runes Column (Keystone + Secondary Tree with full page tooltip) */}
      {hasAnyRune ? (
        <Tooltip title="Runes" content={runeTooltipContent} position="top">
          <div className="flex flex-col gap-1">
            <div
              className={`${boxSize} rounded-full overflow-hidden border border-neutral-700 bg-neutral-950 flex items-center justify-center p-0.5`}
            >
              {keystone ? (
                <img
                  src={keystone.iconUrl}
                  alt={keystone.name}
                  className="w-full h-full object-contain"
                />
              ) : primaryStyle ? (
                <img
                  src={primaryStyle.iconUrl}
                  alt={primaryStyle.name}
                  className="w-4 h-4 object-contain"
                />
              ) : null}
            </div>
            <div
              className={`${boxSize} rounded-full overflow-hidden border border-neutral-800 bg-neutral-950/90 flex items-center justify-center p-1`}
            >
              {subStyle ? (
                <img
                  src={subStyle.iconUrl}
                  alt={subStyle.name}
                  className="w-full h-full object-contain opacity-90"
                />
              ) : null}
            </div>
          </div>
        </Tooltip>
      ) : (
        <div className="flex flex-col gap-1">
          <div className={`${boxSize} rounded-full border border-neutral-800/60 bg-neutral-950/60`} />
          <div className={`${boxSize} rounded-full border border-neutral-800/60 bg-neutral-950/60`} />
        </div>
      )}
    </div>
  );
};

interface MatchItemsRowProps {
  match: MatchLoadoutFields;
  assets: MatchAssetsData;
  size?: "sm" | "md";
}

export const MatchItemsRow: React.FC<MatchItemsRowProps> = ({
  match,
  assets,
  size = "md",
}) => {
  const items = match.items || [];
  const trinketId = match.trinketId || null;

  if (!match.loadoutSynced && items.length === 0 && !trinketId) {
    return (
      <span className="text-[11px] text-neutral-600 italic">
        Build not synced
      </span>
    );
  }

  const slotSize = size === "sm" ? "w-6 h-6" : "w-7 h-7";
  const trinketSize = size === "sm" ? "w-5 h-5" : "w-6 h-6";

  // Pad to 6 inventory slots for crisp alignment
  const slots: (number | null)[] = Array.from({ length: 6 }, (_, i) => items[i] ?? null);

  const renderItemSlot = (itemId: number | null, key: string, isTrinket = false) => {
    const dimClass = isTrinket
      ? `${trinketSize} rounded-full`
      : `${slotSize} rounded-md`;

    if (!itemId) {
      return (
        <div
          key={key}
          className={`${dimClass} border border-neutral-800/60 bg-neutral-950/50 shrink-0`}
        />
      );
    }

    const itemInfo = assets.items[itemId];
    const iconUrl = itemInfo?.iconUrl || getItemFallbackIconUrl(itemId, assets.version);
    const title = itemInfo?.name || `Item #${itemId}`;

    return (
      <Tooltip
        key={key}
        cardClassName="p-3.5"
        content={
          <RiotItemTooltipContent item={itemInfo} itemId={itemId} iconUrl={iconUrl} />
        }
        position="top"
      >
        <div
          className={`${dimClass} overflow-hidden border border-neutral-700/80 bg-neutral-950 shrink-0 hover:border-amber-500/60 transition-colors`}
        >
          <img
            src={iconUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
      </Tooltip>
    );
  };

  return (
    <div className="flex items-center gap-1 shrink-0">
      <div className="flex items-center gap-1">
        {slots.map((id, idx) => renderItemSlot(id, `item-${idx}-${id ?? "empty"}`))}
      </div>
      <div className="w-px h-5 bg-neutral-800 mx-0.5" />
      {renderItemSlot(trinketId, `trinket-${trinketId ?? "empty"}`, true)}
    </div>
  );
};
