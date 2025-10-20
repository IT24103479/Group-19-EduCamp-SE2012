## Quick summary — what this project is

- Single-repo React + TypeScript SPA built with Vite. Two entry points are used: the main app (`index.html`) and an admin app (`admin.html`). See `vite.config.ts` for the multi-entry setup and the dev-server SPA fallback for `/admin` paths.

## Important files to read first

- `vite.config.ts` — multi-entry build (main + admin) and custom onwarn rules that turn unresolved imports/missing exports into build failures.
- `package.json` — dev/build/lint scripts (`npm run dev`, `npm run build`, `npm run preview`, `npm run lint`). Note `build` runs `tsc -b` before `vite build`.
- `src/App.tsx` — client routes (React Router v6). Add new pages here so routes match the deployed app.
- `src/main.tsx` — app bootstrap; console and error posting logic used by embedding/preview frames.
- `src/contexts/AuthContext.tsx` — session / auth patterns. Calls backend `GET http://localhost:8081/educamp/api/auth/me` and expects cookie-based sessions (uses axios withCredentials in this file).
- `src/services/*.ts` (example: `src/services/paymentService.ts`) — backend API shape (often full URLs like `http://localhost:8081/api/...`).
- `src/components/ui/` — design primitives and wrappers used across the app (Radix + tailwind patterns). `form.tsx` contains the project's react-hook-form primitives.

## Architecture / big picture

- Frontend: Vite + React (TypeScript). UI primitives live in `src/components/ui/`. Pages are under `src/pages/` with an `admin/` subfolder for admin-specific pages. Shared services for HTTP calls are under `src/services/` and plain axios is used.
- Routing: client-side routing defined in `src/App.tsx` (React Router v6). The admin UI is a separate entry so the dev server maps `/admin` requests to `admin.html` (see `vite.config.ts` rewrites).
- Auth: `AuthContext` fetches `/me` on mount and sets a context-scoped user object. It expects backend sessions/cookies; some services do not set `withCredentials` — preserve or explicitly set `withCredentials` when calling cookie-protected endpoints.

## Conventions and patterns an AI agent should follow

- Component layout: Pages under `src/pages/*`, reusable UI components under `src/components/*`, and small primitives under `src/components/ui/*`.
- Forms: Use the project's `Form`, `FormItem`, `FormField`, `FormControl`, `FormLabel`, `FormMessage` exported from `src/components/ui/form.tsx` instead of recreating ad-hoc wrappers. This keeps consistent aria/id wiring with react-hook-form.
- API clients: Services use axios (see `src/services/paymentService.ts`). Keep base URLs consistent — the code currently contains literal `http://localhost:8081` origins; be conservative modifying these. If you change API base, update all services or introduce a single env-backed constant (e.g. `VITE_API_BASE`) and update callers.
- Styling: Tailwind + Radix UI theme tokens are used. Prefer existing tokens/classes and the `components/ui` primitives for consistent styling.
- Types: Types live in `src/types` (e.g., `payment.ts`). When returning API payloads add or reuse types there.

## Build / dev / debug notes (what to run)

- Dev server (fast feedback):

```powershell
npm run dev
```

- Production build (note: runs the TypeScript build first and will fail on unresolved imports because `vite.config.ts` throws on UNRESOLVED_IMPORT or missing exports):

```powershell
npm run build
```

- Preview the built app:

```powershell
npm run preview
```

- Lint (ESLint):

```powershell
npm run lint
```

Debug hints

- If a route under `/admin` is not loading in dev, check `vite.config.ts` rewrites — `/admin` is routed to `admin.html` by design.
- The build intentionally fails on unresolved imports/missing exports. If the build fails with an exotic rollup warning, inspect `vite.config.ts:onwarn` and fix the import/export or update that config only after confirming the change.
- `src/main.tsx` patches `console` and posts messages to `window.parent`. If you rely on console capture in tests or preview frames, expect messages to be posted to a parent frame.

## Integration points & external dependencies

- Backend API (local dev): `http://localhost:8081` is used in multiple places. Two different paths appear in code:
  - Auth: `http://localhost:8081/educamp/api/auth/*` (see `src/contexts/AuthContext.tsx`)
  - Payments: `http://localhost:8081/api/payments` (see `src/services/paymentService.ts`)

- Important libraries to be familiar with (used across the codebase): React Router v6, axios, react-hook-form, @radix-ui, Tailwind CSS, Recharts, react-query (dependency present), sonner/react-toastify for toasts.

## PR checklist for AI edits

- If you add a new top-level app entry (e.g., a second HTML entry), update `vite.config.ts` input + rewrite rules.
- Run `npm run build` locally after code changes to catch unresolved imports and missing exports early (Vite's custom onwarn throws on those cases).
- Preserve cookie/session behavior: if a change touches API calls that should use cookie auth, set `withCredentials: true` on axios calls.
- Use existing UI primitives under `src/components/ui/` for forms, inputs and buttons to keep consistent IDs/aria roles.

## Where to look for examples in the repo

- Multi-entry & server rewrites: `vite.config.ts` (lines that map `/admin` to `admin.html`).
- Auth session pattern: `src/contexts/AuthContext.tsx` (GET `/me` and logout POST).
- API client pattern: `src/services/paymentService.ts` (straightforward axios wrappers returning res.data).
- Form primitives: `src/components/ui/form.tsx` (Controller + aria wiring).

If any section above is unclear or you want me to surface more granular examples (specific lines or more files), tell me which area you'd like expanded and I'll iterate.
