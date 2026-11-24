# LOLES

Personal League of Legends matchup playbook, match history tracker, and botlane analytics dashboard.

> For technical architecture, domain conventions, and AI/developer onboarding, see **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** and **[AGENTS.md](AGENTS.md)**.

## Features

- **Riot Account Verification & Match Sync** — Link your Riot ID and sync ranked matches with early-game `@15` lane diffs, items, trinkets, summoner spells, runes, and stat shards.
- **Match History** — View synced games with League-style rich item tooltips, full rune page previews, KDA/CS stats, and lane opponents.
- **Analytics (`/stats`)** — Filter performance by season, role, and champion combinations.
- **Matchup Notes** — Track lane priority, markdown matchup strategies, and live win/loss stats per matchup.

## Tech Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **PostgreSQL 15** + **Prisma 7** (`@prisma/adapter-pg`)
- **NextAuth v4** (Discord, Google, Credentials)
- **Vitest** (unit tests) + **GitHub Actions CI**

## Setup

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- Node.js 22+ (for local development outside Docker)
- A [Riot Developer API Key](https://developer.riotgames.com/)

### Running Locally (Recommended for Development)

1. **Start PostgreSQL via Docker**
   ```bash
   docker compose up db -d
   ```
   *Maps PostgreSQL 15 to host port `5434`.*

2. **Configure `.env`**
   Create a `.env` file in the root directory (see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#5-environment-variables) for all variables):
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5434/loles?schema=public
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-random-secret
   RIOT_API_KEY=RGAPI-your-key
   ```

3. **Install Dependencies & Sync Database**
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   ```

4. **Start Dev Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

### Running with Full Docker Compose

```bash
docker compose up -d --build
```
Starts Postgres (`5434`), pushes the Prisma schema, and exposes the app on [http://localhost:3055](http://localhost:3055).

## Testing & Verification

```bash
npm test             # Run unit tests (Vitest)
npm run typecheck    # TypeScript type check
npm run lint         # ESLint
```
