# Client — Agent Instructions

Full reasoning and audit history: see `client/ARCHITECTURE.md`. This
file is the enforceable checklist — read both, but treat this one as
the rules that must not be re-litigated per task.

## Component placement

- Used on 2+ routes → `src/components/{area}/`.
- Used on exactly one route → co-locate next to that route; once it
  exceeds roughly 150–200 lines, extract to a local `_components/`
  subfolder next to that page rather than leaving a giant `page.tsx`.
- Before adding a new component, check `src/components/` for an
  existing unused one first — dead components have accumulated here
  before (old `Hero.tsx`, `FeaturedSection.tsx`, `CatalogHome.tsx`).
  Don't add a duplicate next to one that already does the job unused.

## Auth

Always use `src/application/hooks/useAuthGuard.ts`
(`useAuthGuard(requiredRole?)`) for any page-level auth check. Never
write a new ad hoc redirect-if-not-logged-in effect — four separate
versions of this existed before this hook was introduced; do not
reintroduce a fifth.

Auth state is fetched via React Query (`["auth-me"]`), not via
scattered `useEffect` + manual store calls.

## i18n

Every user-facing string goes through `next-intl`
(`messages/en.json` / `messages/ar.json`). The only deliberate
exception is the "Kairova" wordmark, kept untranslated by design.
This includes strings generated for WhatsApp prefilled messages,
upload error text, and anything else that reaches the user — not
just visible page copy.

Arabic headings use IBM Plex Sans Arabic; never force the English
display font (`--font-display-en`) onto Arabic text via an inline
override.

## Styling

Any hex color or Tailwind literal repeated in 2+ files becomes a
token in `app/globals.css`'s `@theme` block or a shared
constant/util (e.g. `src/lib/orderStatusStyles.ts` for order-status
colors) — never copy-paste the literal again.

## Navigation

Always use next-intl's locale-aware navigation helpers. Never
manually construct a `/${locale}/...` path string, including inside
non-React code like axios interceptors — derive the locale correctly
for that context instead (e.g. from `window.location.pathname` in an
interceptor, since hooks aren't available there).

## State

- Zustand: client-only state (auth shape post-fetch, cart contents).
- TanStack Query: anything server-backed. If you're tempted to store
  server data in Zustand "for convenience," that's a sign it should
  be a query instead.

## Verification

- Run `npm run test:e2e` in addition to `npm run build` for tasks
  touching browser-only APIs (`window`, scroll, `localStorage`),
  global layout (Navbar, providers), or first-paint rendered UI. A
  route reporting a new console/page error is a real bug unless the
  message is already covered by the smoke test allowlist.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
