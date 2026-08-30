# Frontend Architecture

- Component placement: page-specific blocks used by only one route stay co-located next to that page in a local `_components/` subfolder once they grow past roughly 150-200 lines. They do not need to move into `src/components/` unless they are reused elsewhere.
- Component reuse: anything used on 2+ routes belongs under `src/components/{area}/`.
- Auth: always protect client routes with `useAuthGuard`. Do not add new ad hoc auth checks.
- Auth state: fetch the current session through the shared `["auth-me"]` React Query flow and let it populate the persisted auth store.
- i18n: every user-facing string goes through the `next-intl` message files.
- i18n exception: the `Kairova` wordmark stays untranslated by design.
- Styling: any color, spacing, or other style value repeated in 2+ files becomes a shared token, utility, or constant.
- Styling: do not copy-paste repeated literal values across files.
- Navigation: always use `next-intl` locale-aware `Link`, `useRouter`, `redirect`, or related helpers.
- Navigation: do not manually construct `/${locale}/...` path strings.
- Conflicts with this file are frontend architecture bugs to flag, not style preferences to re-litigate.
