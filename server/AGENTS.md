# Server — Agent Instructions

## Architecture

Vertical Slice organization, not full Clean Architecture — this is a
small solo-freelance build, not an enterprise system. Deliberate
choice, not a shortcut.

```
server/
├── models/        Mongoose schemas, shared across features
│   (Product, Order, User, Category, Settings, HomepageContent)
├── features/
│   ├── orders/    controller.ts, service.ts (state machine lives
│   │              here — see below), routes.ts
│   ├── products/
│   ├── auth/
│   ├── settings/
│   └── shipping/
│       ├── service.ts        orchestration + fallback handling
│       ├── routes.ts
│       └── providers/
│           ├── ShippingProvider.ts   interface
│           └── jtProvider.ts         J&T implementation only
└── lib/           cross-cutting utilities (jwt.ts, cloudinary.ts)
```

Rules:

- New features get their own folder under `features/`. Don't add new
  top-level folders without discussing it first.
- Never call `jtProvider.ts` directly from `orders/service.ts` —
  always go through `shipping/service.ts`, so the shipping backend
  can change without touching order logic.
- Never mutate `order.status` directly. Always go through the
  transition helpers below so side effects and validation aren't
  bypassed.

## Order State Machine

States: PENDING_DEPOSIT → RESERVED → PACKED → FULLY_PAID →
CONFIRMED_SHIPPED, with CANCELLED reachable from any pre-shipped
state.

Helpers (single source of truth — don't duplicate this logic
elsewhere):

- `canTransition(from, to)` — is this transition legal?
- `requiresRefund(fromStatus)` — did money change hands before this
  cancellation? Returns `'not_required'` if cancelled from
  PENDING_DEPOSIT, `'pending'` otherwise — never `null`, always one
  of the three enum strings: `not_required | pending | completed`.
- `hasDecrementedStock(fromStatus)` — was stock already decremented
  before this point? (true from RESERVED onward)

Side effects by transition:

- → RESERVED: decrement stock atomically, snapshot price onto the
  order. Re-check stock availability at this exact moment (not just
  at order creation) — two customers can both pass the initial
  availability check for the same last unit.
- → CONFIRMED_SHIPPED: call `shipping/service.ts`, which calls J&T.
  On failure, set `shippingStatus: 'manual_required'` and do NOT let
  the admin retry-spam the call — surface it as needing manual entry
  in J&T's own system instead.
- Cancellation: restore stock only if `hasDecrementedStock(prevStatus)`
  was true; set `refundStatus` per `requiresRefund`.

## Bilingual fields

Use the shared `LocalizedString` type (`src/types/localized.ts`) and
`localizedField` Mongoose fragment (`src/models/_fragments.ts`) for
any new bilingual field. Don't invent a new shape (e.g. separate
`nameAr`/`nameEn` fields) — the embedded `{ar, en}` object was a
deliberate decision, not an oversight.

## Featured products

Navbar-featured products are regular `Product` records marked with
`isFeatured: true`. Lower `featuredOrder` values render earlier inside
their category branch; gaps are fine, and duplicate order values fall
back to creation order.

## Environment / tooling

- Native ESM (`"type": "module"` in package.json). Dev server runs
  via `tsx watch src/index.ts` — NOT `ts-node/esm` (that loader
  crashes on modern Node; this was already debugged once, don't
  reintroduce it).
- Verify with: `npx tsc --noEmit`, `npm test`, and actually running
  `npm run dev` + hitting `/health` — a passing build is not the same
  as a working dev server; confirm both.
- The MongoDB Atlas connection string password is env-based
  (`MONGODB_URI` in `.env`). If you see a literal `<db_password>` in
  any connection string or error output, that's an unresolved
  placeholder, not a real credential — flag it, don't try to work
  around it.
