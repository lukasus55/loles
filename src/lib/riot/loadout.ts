export interface ExtractedLoadout {
  items: number[];
  trinketId: number | null;
  summoner1Id: number | null;
  summoner2Id: number | null;
  primaryRuneStyle: number | null;
  subRuneStyle: number | null;
  keystoneId: number | null;
  primaryRunes: number[];
  subRunes: number[];
  statShards: number[];
  loadoutSynced: boolean;
}

interface RiotPerkSelection {
  perk?: unknown;
}

interface RiotPerkStyle {
  description?: string;
  style?: unknown;
  selections?: RiotPerkSelection[];
}

export interface RiotParticipantLike {
  puuid?: string;
  item0?: unknown;
  item1?: unknown;
  item2?: unknown;
  item3?: unknown;
  item4?: unknown;
  item5?: unknown;
  item6?: unknown;
  summoner1Id?: unknown;
  summoner2Id?: unknown;
  perks?: {
    statPerks?: {
      offense?: unknown;
      flex?: unknown;
      defense?: unknown;
    };
    styles?: RiotPerkStyle[];
  };
}

/**
 * Extracts items, trinket, summoner spells, primary/secondary runes, keystone,
 * and stat shards from a Riot Match-v5 participant payload.
 */
export function extractParticipantLoadout(p: RiotParticipantLike): ExtractedLoadout {
  const rawItems = [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5];
  const items = rawItems.filter((id): id is number => typeof id === "number" && id > 0);
  const trinketId = typeof p.item6 === "number" && p.item6 > 0 ? p.item6 : null;

  const summoner1Id =
    typeof p.summoner1Id === "number" && p.summoner1Id > 0 ? p.summoner1Id : null;
  const summoner2Id =
    typeof p.summoner2Id === "number" && p.summoner2Id > 0 ? p.summoner2Id : null;

  const styles: RiotPerkStyle[] = Array.isArray(p.perks?.styles) ? p.perks.styles : [];
  const primary = styles.find((s) => s.description === "primaryStyle") || styles[0];
  const sub = styles.find((s) => s.description === "subStyle") || styles[1];

  const primaryRuneStyle = typeof primary?.style === "number" ? primary.style : null;
  const subRuneStyle = typeof sub?.style === "number" ? sub.style : null;

  const primaryRunes: number[] = Array.isArray(primary?.selections)
    ? primary.selections
        .map((sel) => sel?.perk)
        .filter((id): id is number => typeof id === "number" && id > 0)
    : [];

  const subRunes: number[] = Array.isArray(sub?.selections)
    ? sub.selections
        .map((sel) => sel?.perk)
        .filter((id): id is number => typeof id === "number" && id > 0)
    : [];

  const keystoneId = primaryRunes[0] ?? null;

  const statPerks = p.perks?.statPerks;
  const statShards: number[] = statPerks
    ? [statPerks.offense, statPerks.flex, statPerks.defense].filter(
        (id): id is number => typeof id === "number" && id > 0
      )
    : [];

  return {
    items,
    trinketId,
    summoner1Id,
    summoner2Id,
    primaryRuneStyle,
    subRuneStyle,
    keystoneId,
    primaryRunes,
    subRunes,
    statShards,
    loadoutSynced: true,
  };
}
