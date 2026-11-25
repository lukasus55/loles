// Client-safe types and static definitions for League of Legends assets (runes, stat shards, items, summoner spells)

export interface ChampionData {
  id: string;
  name: string;
  iconUrl: string;
}

export interface RuneData {
  id: number;
  key: string;
  name: string;
  iconUrl: string;
  shortDesc: string;
}

export interface RuneSlotData {
  runes: RuneData[];
}

export interface RuneTreeData {
  id: number;
  key: string;
  name: string;
  iconUrl: string;
  slots: RuneSlotData[];
}

export interface StatShardData {
  id: number;
  name: string;
  shortDesc: string;
  iconUrl: string;
}

export interface ItemData {
  id: number;
  name: string;
  plaintext: string;
  description: string;
  iconUrl: string;
  gold: number;
  tags: string[];
  purchasable: boolean;
  maps: Record<string, boolean>;
  inStore?: boolean;
  requiredChampion?: string;
}

export interface ItemSummary {
  id: number;
  name: string;
  plaintext: string;
  description: string;
  iconUrl: string;
  gold: number;
}

export interface ShopItemData extends ItemSummary {
  tags: string[];
  isSummonersRift?: boolean;
}

export interface SummonerSpellData {
  id: number;
  key: string;
  name: string;
  description: string;
  iconUrl: string;
}

export interface MatchAssetsData {
  version: string;
  runes: RuneTreeData[];
  items: Record<number, ItemSummary>;
  summonerSpells: Record<number, SummonerSpellData>;
}

const CDRAGON_STATMOD_BASE =
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods";

/**
 * Current Summoner's Rift stat shard rows (Offense, Flex, Defense).
 * These IDs are fixed in Riot's Match-v5 perks.statPerks and are not included in runesReforged.json.
 */
export const STAT_SHARD_ROWS: StatShardData[][] = [
  // Row 0: Offense
  [
    {
      id: 5008,
      name: "Adaptive Force",
      shortDesc: "+9 Adaptive Force",
      iconUrl: `${CDRAGON_STATMOD_BASE}/statmodsadaptiveforceicon.png`,
    },
    {
      id: 5005,
      name: "Attack Speed",
      shortDesc: "+10% Attack Speed",
      iconUrl: `${CDRAGON_STATMOD_BASE}/statmodsattackspeedicon.png`,
    },
    {
      id: 5007,
      name: "Ability Haste",
      shortDesc: "+8 Ability Haste",
      iconUrl: `${CDRAGON_STATMOD_BASE}/statmodscdrscalingicon.png`,
    },
  ],
  // Row 1: Flex
  [
    {
      id: 5008,
      name: "Adaptive Force",
      shortDesc: "+9 Adaptive Force",
      iconUrl: `${CDRAGON_STATMOD_BASE}/statmodsadaptiveforceicon.png`,
    },
    {
      id: 5010,
      name: "Move Speed",
      shortDesc: "+2% Move Speed",
      iconUrl: `${CDRAGON_STATMOD_BASE}/statmodsmovementspeedicon.png`,
    },
    {
      id: 5001,
      name: "Health Scaling",
      shortDesc: "+10–180 Health (based on level)",
      iconUrl: `${CDRAGON_STATMOD_BASE}/statmodshealthplusicon.png`,
    },
  ],
  // Row 2: Defense
  [
    {
      id: 5011,
      name: "Health",
      shortDesc: "+65 Health",
      iconUrl: `${CDRAGON_STATMOD_BASE}/statmodshealthscalingicon.png`,
    },
    {
      id: 5013,
      name: "Tenacity & Slow Resist",
      shortDesc: "+10% Tenacity and Slow Resist",
      iconUrl: `${CDRAGON_STATMOD_BASE}/statmodstenacityicon.png`,
    },
    {
      id: 5001,
      name: "Health Scaling",
      shortDesc: "+10–180 Health (based on level)",
      iconUrl: `${CDRAGON_STATMOD_BASE}/statmodshealthplusicon.png`,
    },
  ],
];

// Flat lookup including legacy shards (e.g. Armor 5002 / MR 5003) for older matches
export const STAT_SHARDS_BY_ID: Record<number, StatShardData> = {
  ...Object.fromEntries(STAT_SHARD_ROWS.flat().map((s) => [s.id, s])),
  5002: {
    id: 5002,
    name: "Armor",
    shortDesc: "+6 Armor",
    iconUrl: `${CDRAGON_STATMOD_BASE}/statmodsarmoricon.png`,
  },
  5003: {
    id: 5003,
    name: "Magic Resist",
    shortDesc: "+8 Magic Resist",
    iconUrl: `${CDRAGON_STATMOD_BASE}/statmodsmagicresicon.png`,
  },
};

export function stripDDragonHtml(html: string | undefined | null): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildRuneLookup(trees: RuneTreeData[]): {
  stylesById: Record<number, RuneTreeData>;
  runesById: Record<number, RuneData>;
} {
  const stylesById: Record<number, RuneTreeData> = {};
  const runesById: Record<number, RuneData> = {};

  for (const tree of trees) {
    stylesById[tree.id] = tree;
    for (const slot of tree.slots) {
      for (const rune of slot.runes) {
        runesById[rune.id] = rune;
      }
    }
  }

  return { stylesById, runesById };
}

export function getItemFallbackIconUrl(itemId: number, ddragonVersion: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/item/${itemId}.png`;
}
