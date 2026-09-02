# Kairova — Agent Instructions

## What this project is

Kairova is a bilingual (Arabic/English) luxury e-commerce site for
watches, belts, wallets, accessories, and perfume (men's and women's
lines), targeting the Egyptian market. It does NOT use a payment
gateway. Orders follow a manual deposit flow: customer reserves →
transfers a deposit via Vodafone Cash/InstaPay outside the system →
admin manually confirms via the dashboard → J&T Express shipment is
triggered automatically on final confirmation. If a task description
looks unusual (e.g. "why is there no payment gateway integration"),
this business model is why — it's intentional, not a missing feature.

## Repo layout

- `client/` — Next.js (App Router) + TypeScript frontend.
  See `client/AGENTS.md` for frontend-specific conventions.
- `server/` — Node.js + Express + MongoDB backend.
  See `server/AGENTS.md` for backend-specific conventions.

## Cross-cutting rules (apply to both client and server work)

- The site is bilingual. Any user-facing text change must be made in
  BOTH `client/messages/en.json` and `client/messages/ar.json` — never
  hardcode visible strings, on either the client or in any
  server-generated text (e.g. WhatsApp message templates, upload
  error messages).
- Colors are strictly black/white/grayscale, matching the logo. Do not
  introduce new accent colors without being told to.
- Fonts: Fraunces for English display headings, IBM Plex Sans Arabic
  for Arabic display headings — configured centrally, never override
  per-component.
- Featured product links in `client/src/components/layout/Navbar.tsx`
  depend on real Mongo product records. When adding or changing those
  links, update `server/src/scripts/seedFeaturedProducts.ts`; the
  server seeds them at startup, and `npm run seed:products` is the
  manual backfill command from `server/`.

## Working agreements

- Before writing any code, state your plan and which existing files
  you'll touch.
- Run the project's build and test commands before reporting a task
  done (`npm run build` and `npm test` in whichever of client/server
  you touched). Report the actual command output, not just "done."
- If you can't verify something (e.g. no browser automation available
  in this session), say so explicitly rather than implying it was
  checked.
- If this task establishes a new reusable convention that isn't
  already written down in this file or the nested AGENTS.md for the
  area you worked in, add it there before finishing — don't let
  conventions live only in chat history.
