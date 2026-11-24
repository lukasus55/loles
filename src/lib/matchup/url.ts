import { Role } from "@/components/notes/RoleFilter";

export type MatchupOrigin = "matchups" | "stats" | "history";
export type MatchupTab = "strategy" | "history";

export interface MatchupTarget {
  role: Role;
  myPick: string;
  enemyPick: string;
  mySupp?: string | null;
  enemySupp?: string | null;
}

export interface ParsedMatchupParams {
  role: Role;
  myPick: string;
  enemyPick: string;
  mySupp: string | null;
  enemySupp: string | null;
  from: MatchupOrigin;
  tab: MatchupTab;
}

const VALID_ROLES: ReadonlySet<string> = new Set(["TOP", "JGL", "MID", "ADC", "SUPP"]);

export function isValidRole(value: unknown): value is Role {
  return typeof value === "string" && VALID_ROLES.has(value.toUpperCase());
}

export function isBotRole(role: Role): boolean {
  return role === "ADC" || role === "SUPP";
}

export function mapAppRoleToRiotRole(role: Role): string {
  switch (role) {
    case "TOP":
      return "TOP";
    case "JGL":
      return "JUNGLE";
    case "MID":
      return "MIDDLE";
    case "ADC":
      return "BOTTOM";
    case "SUPP":
      return "UTILITY";
  }
}

export function mapRiotRoleToAppRole(riotRole: string): Role | null {
  switch (riotRole.toUpperCase()) {
    case "TOP":
      return "TOP";
    case "JUNGLE":
    case "JGL":
      return "JGL";
    case "MIDDLE":
    case "MID":
      return "MID";
    case "BOTTOM":
    case "ADC":
      return "ADC";
    case "UTILITY":
    case "SUPP":
      return "SUPP";
    default:
      return null;
  }
}

export function buildMatchupUrl(
  target: MatchupTarget,
  options?: { from?: MatchupOrigin; tab?: MatchupTab }
): string {
  const params = new URLSearchParams({
    role: target.role,
    my: target.myPick,
    enemy: target.enemyPick,
  });

  if (isBotRole(target.role)) {
    if (target.mySupp) params.set("ally", target.mySupp);
    if (target.enemySupp) params.set("enemyPartner", target.enemySupp);
  }

  if (options?.from) params.set("from", options.from);
  if (options?.tab) params.set("tab", options.tab);

  return `/matchup?${params.toString()}`;
}

function getStringParam(
  raw: Record<string, string | string[] | undefined>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const val = raw[key];
    if (typeof val === "string" && val.trim().length > 0) {
      return val.trim();
    }
  }
  return null;
}

export function parseMatchupSearchParams(
  raw: Record<string, string | string[] | undefined>
): ParsedMatchupParams | null {
  const rawRole = getStringParam(raw, "role");
  if (!rawRole || !isValidRole(rawRole)) return null;

  const role = rawRole.toUpperCase() as Role;
  const myPick = getStringParam(raw, "my", "myPick");
  const enemyPick = getStringParam(raw, "enemy", "enemyPick");

  if (!myPick || !enemyPick) return null;

  const isBot = isBotRole(role);
  const mySupp = isBot ? getStringParam(raw, "ally", "mySupp") : null;
  const enemySupp = isBot ? getStringParam(raw, "enemyPartner", "enemySupp") : null;

  const rawFrom = getStringParam(raw, "from");
  const from: MatchupOrigin =
    rawFrom === "stats" || rawFrom === "history" || rawFrom === "matchups"
      ? rawFrom
      : "matchups";

  const rawTab = getStringParam(raw, "tab");
  const tab: MatchupTab = rawTab === "history" ? "history" : "strategy";

  return {
    role,
    myPick,
    enemyPick,
    mySupp,
    enemySupp,
    from,
    tab,
  };
}

export function getBackUrl(from?: string): string {
  if (from === "stats") return "/stats";
  if (from === "history") return "/history";
  return "/matchups";
}
