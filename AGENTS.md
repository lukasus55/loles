<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# LOLES - AI Agents Guidelines

> Quick system overview for developers and AI agents: see `docs/ARCHITECTURE.md`.

## 1. ABSOLUTELY CRITICAL: Use Existing Shared UI Components
**DO NOT CREATE RAW HTML ELEMENTS** (like raw `<button>`, `<input>`, native `alert()` or `confirm()`) unless absolutely necessary and no equivalent component exists.

Whenever you add or modify a view, you **MUST FIRST check the `src/components/ui/` directory** (and domain-shared components like `src/components/match/`) for reusable components. We already have robust, styled abstractions that you **MUST use**, including:
- **Buttons** (`src/components/ui/Button.tsx` — DO NOT use raw `<button>` for standard actions)
- **Confirmation Dialogs** (`src/components/ui/ConfirmDialog.tsx` — DO NOT use browser native `confirm()`)
- **Notifications / Alerts** (`src/components/ui/ToastProvider.tsx` via `useToast()` — DO NOT use browser native `alert()`)
- **Inputs** (`src/components/ui/Input.tsx` for text/passwords)
- **Dropdowns & Selects** (`src/components/ui/Dropdown.tsx`, `src/components/ui/ChampionSelect.tsx`)
- **Tooltips** (`src/components/ui/Tooltip.tsx` — portal-based, viewport- & navbar-aware; DO NOT rely on native `title=""` for rich UI tooltips)
- **Loading Indicators** (`src/components/ui/Spinner.tsx`)

**MANDATORY RULE:** Every future AI agent is explicitly forbidden from generating new raw buttons, native alerts, or native confirmation popups if a UI component can do the job. The primary goal of this architecture is DRY (Don't Repeat Yourself) and 100% visual consistency.

## 2. Popup / Modal Closing Rules
Every newly created or refactored popup/modal/dialog must adhere to the following 3 closing rules:
1. Close via a visible button (e.g., an "X" in the corner or a "Cancel/Close" button).
2. Close by clicking outside the popup window (clicking on the darkened background/backdrop).
3. Close by pressing the "ESC" key on the keyboard.

## 3. Backend Testing and Documentation
When you edit, modify, or create any backend file (App Router API Route Handlers in `src/app/api/**/route.ts` or backend libraries in `src/lib/**`), **you must always**:
1. **Write or update rigorous unit tests FIRST (before writing or modifying the implementation code).**
   - **MANDATORY TDD PRINCIPLE:** Always write or update the test suite before writing the production code. *"If you must test a system in isolation, first write down all the ways it could fail, then write the code."* Writing tests after the fact defeats the purpose of rigorous validation.
   - Tests are located in `src/__tests__/api/` (for Route Handlers) and `src/__tests__/lib/` (for backend/Riot/DDragon utilities).
   - Use **`vitest`** and standard Web `Request` objects to invoke App Router handlers directly (`GET`, `POST`, `PUT`, `DELETE`).
   - Mock external dependencies cleanly: Prisma (`vi.mock('@/lib/prisma')`), NextAuth (`vi.mock('next-auth')`), and Riot API calls (`vi.mock('@/lib/riot/api')`).
   - Carefully check *edge cases* (unauthorized `401`, missing/invalid body `400`, missing Riot account, Riot API `404`/errors, ownership checks).
   - **After any backend modifications, run `npm test` (or `npx vitest run`) in the terminal to verify backend integrity. DO NOT run vitest for frontend-only or UI/styling changes where no backend files were modified.**
2. **Document API endpoints concisely via JSDoc** at the top of every created/modified `route.ts` file (HTTP method, auth requirement, expected query/body parameters, and returned status codes).

## 4. Database Structure
`prisma/schema.prisma` is the single source of truth for the PostgreSQL database structure (models, enums, relations, unique constraints, and indexes).
- Always inspect `prisma/schema.prisma` before writing queries or adding fields.
- After modifying `prisma/schema.prisma`, run `npx prisma generate` and `npx prisma db push` (the project uses Prisma 7 with `@prisma/adapter-pg` via `src/lib/prisma.ts`).

## 5. Always Use `cursor-pointer` for Clickables
Whenever creating or modifying a clickable UI element (e.g., buttons, interactive cards, table rows, toggles), always explicitly add the `cursor-pointer` class to ensure the user's mouse cursor changes to a pointer on hover, clearly indicating interactivity. Conversely, disabled elements should use `cursor-not-allowed`.

## 6. React File Length & Component Modularity
Aim for clean, modular, and easy-to-maintain React components:
- **Target (<150 lines)**: Aim to keep React component files under 150 lines. Extract subcomponents, custom hooks, helper utilities, and constants into dedicated files.
- **Acceptable (150-300 lines)**: Files in this range are acceptable, but you must actively consider whether subcomponents, hooks, or pure helper functions can be cleanly split out.
- **Strict Limit (>300 lines)**: Components exceeding 300 lines are an absolute last resort. Whenever a file approaches or exceeds this limit, you must refactor and decompose it into smaller, focused modules.

## 7. Typography: Avoid Monospace Fonts in General UI
**DO NOT use `font-mono` (monospace font)** for general UI elements, including KDA, win rates, CS, gold diffs, rankings, LP, summoner names, badges, and status labels. Monospace styling makes numbers and ordinary text look disjointed and typewriter-like.
Always use the default sans-serif font family (`Outfit`) across all UI components and dashboard cards. Monospace is reserved exclusively for code blocks or technical hashes if explicitly needed.
