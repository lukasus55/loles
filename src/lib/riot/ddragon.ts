import {
  ChampionData,
  ItemData,
  ItemSummary,
  MatchAssetsData,
  RuneTreeData,
  ShopItemData,
  SummonerSpellData,
  stripDDragonHtml,
} from "./assets";

export type {
  ChampionData,
  ItemData,
  ItemSummary,
  MatchAssetsData,
  RuneTreeData,
  ShopItemData,
  SummonerSpellData,
};

const DDRAGON_BASE = "https://ddragon.leagueoflegends.com";
const FALLBACK_VERSION = "16.1.1";

export async function getLatestDDragonVersion(): Promise<string> {
  try {
    const versionRes = await fetch(`${DDRAGON_BASE}/api/versions.json`, {
      next: { revalidate: 86400 },
    });
    if (!versionRes.ok) throw new Error("Failed to fetch DDragon versions");
    const versions: string[] = await versionRes.json();
    return versions[0] || FALLBACK_VERSION;
  } catch (error) {
    console.error("Error fetching DDragon version:", error);
    return FALLBACK_VERSION;
  }
}

export async function getChampions(): Promise<ChampionData[]> {
  try {
    const latestVersion = await getLatestDDragonVersion();

    const champsRes = await fetch(
      `${DDRAGON_BASE}/cdn/${latestVersion}/data/en_US/champion.json`,
      { next: { revalidate: 86400 } }
    );

    if (!champsRes.ok) throw new Error("Failed to fetch DDragon champions");

    const champsData = await champsRes.json();
    const championsObj = champsData.data;

    const championsList: ChampionData[] = Object.keys(championsObj).map((key) => {
      const champ = championsObj[key];
      return {
        id: champ.id,
        name: champ.name,
        iconUrl: `${DDRAGON_BASE}/cdn/${latestVersion}/img/champion/${champ.image.full}`,
      };
    });

    return championsList.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching champions:", error);
    return [];
  }
}

interface RawDDragonRune {
  id: number;
  key: string;
  name: string;
  icon: string;
  shortDesc?: string;
}

interface RawDDragonRuneTree {
  id: number;
  key: string;
  name: string;
  icon: string;
  slots?: { runes?: RawDDragonRune[] }[];
}

interface RawDDragonItem {
  name?: string;
  plaintext?: string;
  description?: string;
  image?: { full?: string };
  gold?: { total?: number; purchasable?: boolean };
  tags?: string[];
  maps?: Record<string, boolean>;
  inStore?: boolean;
  requiredChampion?: string;
}

interface RawDDragonSummonerSpell {
  id: string;
  key: string;
  name: string;
  description?: string;
  image?: { full?: string };
}

export async function getRunes(): Promise<RuneTreeData[]> {
  try {
    const latestVersion = await getLatestDDragonVersion();

    const res = await fetch(
      `${DDRAGON_BASE}/cdn/${latestVersion}/data/en_US/runesReforged.json`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) throw new Error("Failed to fetch DDragon runes");

    const rawTrees: RawDDragonRuneTree[] = await res.json();

    return rawTrees.map((tree) => ({
      id: tree.id,
      key: tree.key,
      name: tree.name,
      // Rune icons on DDragon live under /cdn/img/ (not versioned)
      iconUrl: `${DDRAGON_BASE}/cdn/img/${tree.icon}`,
      slots: (tree.slots || []).map((slot) => ({
        runes: (slot.runes || []).map((rune) => ({
          id: rune.id,
          key: rune.key,
          name: rune.name,
          iconUrl: `${DDRAGON_BASE}/cdn/img/${rune.icon}`,
          shortDesc: stripDDragonHtml(rune.shortDesc),
        })),
      })),
    }));
  } catch (error) {
    console.error("Error fetching runes:", error);
    return [];
  }
}

export async function getItems(options?: { srOnly?: boolean }): Promise<Record<number, ItemData>> {
  try {
    const latestVersion = await getLatestDDragonVersion();

    const res = await fetch(
      `${DDRAGON_BASE}/cdn/${latestVersion}/data/en_US/item.json`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) throw new Error("Failed to fetch DDragon items");

    const raw = (await res.json()) as { data?: Record<string, RawDDragonItem> };
    const dataObj = raw.data || {};
    const result: Record<number, ItemData> = {};

    for (const [idStr, item] of Object.entries(dataObj)) {
      const id = Number(idStr);
      if (Number.isNaN(id)) continue;

      const maps: Record<string, boolean> = item.maps || {};
      const purchasable = Boolean(item.gold?.purchasable);

      if (options?.srOnly && (!maps["11"] || !purchasable || item.inStore === false)) {
        continue;
      }

      result[id] = {
        id,
        name: item.name || `Item #${id}`,
        plaintext: item.plaintext || "",
        description: item.description || "",
        iconUrl: `${DDRAGON_BASE}/cdn/${latestVersion}/img/item/${item.image?.full || `${id}.png`}`,
        gold: item.gold?.total ?? 0,
        tags: item.tags || [],
        purchasable,
        maps,
        inStore: item.inStore,
        requiredChampion: item.requiredChampion,
      };
    }

    return result;
  } catch (error) {
    console.error("Error fetching items:", error);
    return {};
  }
}

export async function getSummonerSpells(): Promise<Record<number, SummonerSpellData>> {
  try {
    const latestVersion = await getLatestDDragonVersion();

    const res = await fetch(
      `${DDRAGON_BASE}/cdn/${latestVersion}/data/en_US/summoner.json`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) throw new Error("Failed to fetch DDragon summoner spells");

    const raw = (await res.json()) as { data?: Record<string, RawDDragonSummonerSpell> };
    const dataObj = raw.data || {};
    const result: Record<number, SummonerSpellData> = {};

    for (const spell of Object.values(dataObj)) {
      const id = Number(spell.key);
      if (Number.isNaN(id)) continue;

      result[id] = {
        id,
        key: spell.id,
        name: spell.name,
        description: stripDDragonHtml(spell.description),
        iconUrl: `${DDRAGON_BASE}/cdn/${latestVersion}/img/spell/${spell.image?.full || `${spell.id}.png`}`,
      };
    }

    return result;
  } catch (error) {
    console.error("Error fetching summoner spells:", error);
    return {};
  }
}

/**
 * Slim bundle of assets needed to render match cards (runes, items, summoner spells)
 * with minimal serialized RSC payload size.
 */
export async function getMatchAssets(): Promise<MatchAssetsData> {
  const [version, runes, allItems, summonerSpells] = await Promise.all([
    getLatestDDragonVersion(),
    getRunes(),
    getItems(),
    getSummonerSpells(),
  ]);

  const items: Record<number, ItemSummary> = {};
  for (const [idStr, item] of Object.entries(allItems)) {
    // Keep Summoner's Rift items (including trinkets, starter items, quest items, boots)
    if (item.maps["11"]) {
      const id = Number(idStr);
      items[id] = {
        id,
        name: item.name,
        plaintext: item.plaintext,
        description: item.description,
        iconUrl: item.iconUrl,
        gold: item.gold,
      };
    }
  }

  return {
    version,
    runes,
    items,
    summonerSpells,
  };
}

/**
 * Purchasable items sorted for the interactive Build Picker.
 * Standard Summoner's Rift items (`maps["11"]`, `id < 10000`, `inStore !== false`)
 * are prioritized during deduplication and flagged with `isSummonersRift: true`.
 */
export async function getShopItems(): Promise<ShopItemData[]> {
  const allItems = await getItems();
  const seen = new Set<string>();
  const list: ShopItemData[] = [];

  const sortedEntries = Object.values(allItems).sort((a, b) => {
    const aIsSr = Boolean(a.maps["11"] && a.id < 10000 && a.inStore !== false);
    const bIsSr = Boolean(b.maps["11"] && b.id < 10000 && b.inStore !== false);
    if (aIsSr !== bIsSr) return aIsSr ? -1 : 1;
    return a.id - b.id;
  });

  for (const item of sortedEntries) {
    if (!item.name || item.gold <= 0 || !item.purchasable || item.inStore === false) continue;
    if (item.requiredChampion) continue;
    // Exclude Arena stat-anvil / random-item placeholders (220000-220099)
    if (item.id >= 220000 && item.id <= 220099) continue;

    const dedupKey = `${item.name.toLowerCase()}::${item.gold}`;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);

    const isSummonersRift = Boolean(item.maps["11"] && item.id < 10000);

    list.push({
      id: item.id,
      name: item.name,
      plaintext: item.plaintext,
      description: item.description,
      iconUrl: item.iconUrl,
      gold: item.gold,
      tags: item.tags,
      isSummonersRift,
    });
  }

  return list.sort((a, b) => b.gold - a.gold || a.name.localeCompare(b.name));
}
