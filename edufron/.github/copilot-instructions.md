# Copilot Instructions for EduCap Frontend

## Project Overview
- **Stack:** React + TypeScript + Vite, using Tailwind CSS for styling and ESLint for linting.
- **Structure:**
  - `src/pages/` — Main route pages (e.g., `Home.tsx`, `Login.tsx`, `admin/` for admin views)
  - `src/components/` — Reusable UI components, with subfolders for `admin` and `ui` widgets
  - `src/hooks/` — Custom React hooks
  - `src/lib/` — Utility functions
  - `public/` — Static assets

## Key Patterns & Conventions
- **Component Organization:**
  - UI primitives in `src/components/ui/` (e.g., `button.tsx`, `card.tsx`)
  - Admin-specific layouts and cards in `src/components/admin/`
  - Pages import components from `components/` and hooks from `hooks/`
- **Styling:**
  - Use Tailwind CSS utility classes in JSX. Global styles in `src/index.css` and `src/App.css`.
- **Routing:**
  - Page files in `src/pages/` represent routes. Admin routes are under `src/pages/admin/`.
- **State & Data:**
  - No global state manager (e.g., Redux) detected; use React state/hooks.
  - Data flow is top-down via props; lift state up as needed.
- **Testing:**
  - No explicit test setup found. If adding tests, follow colocated or `__tests__` folder convention.
- **Build & Dev:**
  - Start dev server: `npm run dev`
  - Build for production: `npm run build`
  - Preview build: `npm run preview`
- **Linting:**
  - Run `npx eslint .` to check code style. ESLint config in `eslint.config.js`.

## Integration & Extensibility
- **External Libraries:**
  - Vite plugins for React, Tailwind, and PostCSS.
  - Add new UI primitives to `src/components/ui/` and import as needed.
- **Adding Pages/Routes:**
  - Create new file in `src/pages/` or `src/pages/admin/` for new route.
- **Assets:**
  - Place images in `src/assets/` or `public/` for static serving.

## Examples
- To add a new admin dashboard widget:
  1. Create a component in `src/components/admin/`
  2. Import and use it in `src/pages/admin/AdminDashboard.tsx`
- To add a new form input:
  1. Add to `src/components/ui/` (e.g., `input.tsx`)
  2. Import in your page/component

## References
- See `README.md` for Vite/React/Tailwind setup details.
- ESLint config: `eslint.config.js`
- Main entry: `src/main.tsx`, App root: `src/App.tsx`

---
If conventions or structure are unclear, check similar files or ask for clarification before introducing new patterns.
