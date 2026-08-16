# AGENTS.md

This repository is a Vite + React 19 + TypeScript ecommerce app for pet food. Keep changes aligned with the existing app architecture and product flows rather than introducing broad framework churn.

## Project overview
- App entry: `src/App.tsx`
- Global state: `src/context/` (`AuthContext`, `AppContext`, `CartContext`)
- API client: `src/api/axios.ts`
- Route/view composition: `src/pages/`
- UI and feature components: `src/components/` with subfolders for `layout`, `ui`, and `cart`
- Reusable logic: `src/hooks/` and `src/utils/`
- Business/domain models: `src/types/`
- Design system: Tailwind v4 via `src/styles/globals.css`

## Commands
- Install: `npm install`
- Start dev server: `npm run dev`
- Production build: `npm run build`
- Local preview: `npm run preview`

Use the existing build command to validate changes before finishing work. There is no dedicated test runner in this repo, so build verification is the main correctness check.

## Architecture conventions
- Prefer the existing React Context pattern for global state. Do not replace `CartContext`, `AuthContext`, or `AppContext` with a new state library unless the task explicitly requires it.
- Keep styling in Tailwind classes and the central CSS layer. Avoid introducing a second styling system or ad hoc CSS files unless the task is specifically about styling.
- Respect the app’s lazy-loaded routing pattern in `src/App.tsx` and the `Outlet` layout structure. Route changes should remain compatible with the current SPA navigation flow.
- Preserve the `@/src/...` alias conventions used throughout the project. Prefer existing import patterns over new relative paths.
- Follow the current organization: layout components under `src/components/layout`, reusable UI atoms under `src/components/ui`, cart-specific UI under `src/components/cart`.

## Data and API rules
- Centralize HTTP behavior in `src/api/axios.ts`.
- Environment variables are expected via Vite (`import.meta.env.*`). Relevant examples: `VITE_API_BASE_URL` and `VITE_WHATSAPP_NUMBER`.
- Be careful with localStorage keys and persistence flows. Existing keys include `pulso_cart`, `pulso_guest_id`, and `pulso_token`.
- Keep API response handling consistent with the `src/types/` interfaces and the current mapper/validator approach in `src/utils/`.

## Working style for AI agents
- Prefer targeted edits that match the current file and component patterns instead of broad refactors.
- When adding UI behavior, keep accessibility and mobile-first patterns in mind; this app emphasizes responsive ecommerce layouts and conversion flows.
- If you need to modify cart, checkout, auth, or product filters, read the nearby context first and preserve the existing state semantics.
- Try to avoid adding new dependencies or large abstraction layers unless the task truly requires them.
- Keep the codebase language consistent: TypeScript interfaces, React function components, and current naming conventions in Spanish/Latin business naming.

## Relevant references
- Project README: [README.md](README.md)
- Environment example: [.env.example](.env.example)
- Core app shell: [src/App.tsx](src/App.tsx)
- Axios config: [src/api/axios.ts](src/api/axios.ts)
- Cart flow: [src/context/CartContext.tsx](src/context/CartContext.tsx)

## Gemini-focused note
For Gemini-driven work in this repo, prioritize product correctness, route compatibility, and the existing ecommerce conventions over “clean slate” rewrites. Preserve the current architecture while moving the task forward with the smallest valid change.
