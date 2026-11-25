# LOLES — Architecture & Developer Guide

Minimal technical reference for future maintainers and AI agents working on **LOLES**.

---

## 1. Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack) + React 19 + TypeScript (strict)
- **Styling:** Tailwind CSS v4 + Lucide icons + Framer Motion
- **Database:** PostgreSQL 15 + Prisma 7 (`@prisma/adapter-pg` driver adapter)
- **Auth:** NextAuth v4 (JWT session strategy, PrismaAdapter; Discord, Google, Credentials)
- **External Data:** Riot Games API (Account-v1, Summoner-v4, League-v4, Match-v5) + Riot Data Dragon (`ddragon.leagueoflegends.com`) + CommunityDragon (profile icons & stat shard icons)
- **Testing:** Vitest (`npm test`)

---

## 2. Project Structure

```text
prisma/
  schema.prisma            # Single source of truth for PostgreSQL models, enums, indexes
src/
  app/                     # Next.js App Router pages & API Route Handlers
    api/                   # Backend Route Handlers (route.ts -> GET/POST/PUT/DELETE)
      auth/                # NextAuth + register
      account/             # Profile preferences, name/password, Riot unlink
      matchup/             # Matchup Hub upsert/delete & loadouts (runes/builds presets)
      notes/               # Legacy matchup notes list, collision check, matchup stats
      riot/                # Verify, refresh, matches list, sync (init/process/backfill)
      stats/               # Aggregated stats endpoint
    history/               # Match History page
    matchups/              # Matchups Playbook (legacy /notes redirects here)
    matchup/               # Unified Matchup Hub (/matchup?role=...&my=...&enemy=...)
    stats/                 # Multi-perspective Analytics & Botlane Draft Helper
  components/
    ui/                    # Shared UI primitives (Button, ConfirmDialog, Dropdown, Input, Tooltip, Spinner, ToastProvider, ChampionSelect)
    match/                 # Reusable match display components (MatchLoadoutDisplay, RiotItemTooltip)
    matchup/               # MatchupHubClient, MatchupStrategyTab, MatchupHistoryTab, loadouts/ (RunePicker, BuildPicker, ItemPickerModal)
    history/               # HistoryClient, MatchCard
    notes/                 # DashboardClient (Playbook), MatchupHeader, RoleFilter, ChampionFilterBlock
    stats/                 # StatsClient, StatsFilters, StatsTable, GeneralInfo, EnemyChampionsTable
    layout/                # Navbar, MobileNav, UserNav, Footer
  lib/
    prisma.ts              # Singleton PrismaClient using PrismaPg adapter
    auth.ts                # NextAuth configuration (authOptions)
    matchup/               # url.ts (Matchup Hub routing) & loadouts.ts (rune/build pure rules)
    stats/                 # analytics.ts (multi-perspective botlane filtering & aggregation)
    riot/
      api.ts               # Riot API fetchers & continental routing
      ddragon.ts           # Server-side 24h-cached DDragon fetchers (champions, runes, items, spells)
      assets.ts            # Client-safe types, stat shard definitions, lookup helpers
      loadout.ts           # Riot Match-v5 participant -> items/runes/spells extractor
  __tests__/
    lib/                   # Unit tests for pure libs & utilities
    api/                   # Unit tests for App Router API Route Handlers
```

---

## 3. Critical Domain Conventions & Gotchas

### Role Naming Mismatch (App Enum vs Riot Match-v5)
The app's Prisma `Role` enum differs from Riot Match-v5 `teamPosition` stored on `Match.role`:

| App (`MatchupNote.role`, UI) | Riot (`Match.role`) |
| :--- | :--- |
| `TOP` | `TOP` |
| `JGL` | `JUNGLE` |
| `MID` | `MIDDLE` |
| `ADC` | `BOTTOM` |
| `SUPP` | `UTILITY` |

Always convert between the two when querying `Match` using UI/Note roles.

### Botlane Partner Columns on `Match`
`Match` stores lane opponents relative to the player's own role:
- `championName` = player's pick
- `enemyChampionName` = direct lane opponent (same `teamPosition`)
- `partnerChampionName` = ally botlane partner (Support if player is `BOTTOM`, ADC if player is `UTILITY`)
- `enemyPartnerChampionName` = enemy botlane partner

### Remake Filtering
Games shorter than **240 seconds** (`gameDuration < 240`) are treated as **Remakes** and excluded from win-rate / analytics aggregations (`gameDuration: { gte: 240 }`).

### Riot Match Sync & Backfill Pipeline
1. `POST /api/riot/sync/init` — enforces 2-minute sync cooldown (`lastSyncedAt`), refreshes rank/profile metadata, fetches up to 100 recent match IDs, and returns only `newMatchIds` missing from DB.
2. `POST /api/riot/sync/process` — called in chunks of 5 from client; fetches Match-v5 details + timeline (if `gameDuration >= 900s` for `@15` lane diffs), extracts items/runes/spells via `extractParticipantLoadout`, and inserts `Match` rows with `loadoutSynced: true`.
3. `GET/POST /api/riot/sync/backfill` — backfills items/runes/spells for pre-v1.1 matches where `loadoutSynced: false` without fetching timelines. Purged `404` matches are marked `loadoutSynced: true` so they do not loop; transient errors (e.g. `429`) remain unsynced for retry.

### Data Dragon & Rich Tooltips
- `getMatchAssets()` fetches DDragon `versions.json`, `runesReforged.json`, `item.json` (filtered to Summoner's Rift map `"11"`), and `summoner.json` with 24h Next.js revalidation.
- **Gotcha:** DDragon rune icons live under `/cdn/img/<icon>` (unversioned), whereas champion/item/spell icons live under `/cdn/<version>/img/...`.
- Stat shard icons are not in `runesReforged.json` and are defined statically in `src/lib/riot/assets.ts` using CommunityDragon URLs.
- Item tooltips parse official DDragon `item.description` XML-like tags safely into React nodes in `src/components/match/RiotItemTooltip.tsx` (no `dangerouslySetInnerHTML`).

---

## 4. Database & Prisma 7 Notes

- Prisma 7 uses `prisma.config.ts` and the `@prisma/adapter-pg` driver adapter in `src/lib/prisma.ts`.
- This repo uses schema push workflow (no `prisma/migrations` directory):
  ```bash
  npx prisma generate
  npx prisma db push
  ```
- Local Docker Postgres binds to host port **`5434`** (`docker compose up db -d`).

---

## 5. Environment Variables

| Variable | Required | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | Yes | PostgreSQL connection string (host `localhost:5434` locally, `db:5432` in Docker) |
| `NEXTAUTH_URL` | Yes | Base URL of the app (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Yes | Secret for signing NextAuth JWTs |
| `RIOT_API_KEY` | Yes | Riot Developer API key (`X-Riot-Token`) |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | Optional | Discord OAuth login |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth login |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Docker | Credentials for Docker Compose Postgres container |

---

## 6. Common Commands

```bash
npm run dev          # Start Next.js dev server (http://localhost:3000)
npm test             # Run Vitest unit test suite once
npm run test:watch   # Run Vitest in watch mode
npm run typecheck    # Run TypeScript check (tsc --noEmit)
npm run lint         # Run ESLint
npm run build        # Production Next.js build
npx prisma generate  # Regenerate Prisma Client after schema changes
npx prisma db push   # Push prisma/schema.prisma changes to PostgreSQL
```
