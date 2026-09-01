# treva-broker

The TREVA real-estate CRM panel — one Next.js app serving all three roles
(**Broker**, **Top Broker**, **Admin**) from the Figma file
[TREVA Real Estate Admin CRM](https://www.figma.com/design/SJRCdsOsEa1DCArrbghoPr/TREVA-Real-Estate-Admin-Crm).

## Why one app and not three

The three Figma sections are the same product. Every screen (News Feed, Clients,
Broker Role, Finance, Projects, Floor Plan) is pixel-identical across them; what
changes is:

- **the sidebar** — Admin additionally sees the Admin Panel group
- **the affordances** — a Broker has no `Add news` / `Edit` / delete buttons

So the app has **one route tree** and a **permission matrix**. A screen is
written once; `can("news:create")` decides whether the button renders. Adding a
fourth role means adding a row to `src/lib/auth/permissions.ts` — not copying
eight pages.

## Running it

```bash
# from the monorepo root
npm install
npm run dev --workspace treva-broker     # http://localhost:10040
```

Ports in this monorepo: treva-web `10010`, treva-api `10011`, treva-inventory
`10030`, **treva-broker `10040`**, treva-broker-api `10041` (not built yet).

### Signing in

`NEXT_PUBLIC_USE_MOCK=1` (the default in `.env.development`) means there is no
backend yet, so `auth.mock.ts` stands in for the API's user table. **The role
belongs to the account, never to the login form** — sign in with a different
address to review a different role:

| Email | Role |
| --- | --- |
| `admin@treva.az` | Admin |
| `top.broker@treva.az` | Top Broker |
| `broker@treva.az` | Broker |

Any password is accepted, and an unrecognised address falls back to the
least-privileged role. Once the NestJS API is live it returns the role the same
way and nothing on the client changes.

## Layout of the code

```
src/
  app/[locale]/          route tree — (auth) and (dashboard) groups
  components/ui/         design-system primitives (Button, Input, Table, …)
  components/layout/     Sidebar, AppHeader, LogoCell, LanguageSwitcher, UserMenu
  components/common/     cross-feature pieces (PermissionGate, ComingSoon)
  features/<domain>/     api/ + hooks/ + components/ + types.ts per domain
  lib/api/               fetch wrapper, ApiError, mock helpers
  lib/auth/              roles, permission matrix, session cookie, server guards
  lib/i18n/              locales, dictionaries, server-side loader
  lib/query/             QueryClient factory and the query-key factory
  config/                routes, navigation, endpoints, page titles, env
  mocks/                 fixtures the *.mock.ts adapters serve
  stores/                zustand — client-only UI state
```

### The data layer

Each domain exposes three files:

| File | Role |
| --- | --- |
| `news.service.ts` | the interface + the adapter switch |
| `news.mock.ts` | fixtures, filtering, pagination, artificial latency |
| `news.http.ts` | the real NestJS calls |

Components and hooks import **only** `newsService`. When the API is ready, set
`NEXT_PUBLIC_USE_MOCK=0` — no component changes.

Both adapters are typed against the same `NewsService` interface, so the mock
cannot drift from the contract without failing `npm run check-types`.

### Design tokens

Every colour, radius, type step and shadow comes from the Figma variable set and
lives in `src/app/globals.css` under `@theme`, with the Figma name in a comment.
**Do not put raw hex or px values in components** — add the missing token first.

### i18n

Locale-prefixed routes (`/en`, `/az`, `/ru`), same as treva-web. English is the
source of truth: `lib/i18n/get-dictionary.ts` types `az.json` and `ru.json`
against `en.json`, so a missing translation is a type error, not a blank string.

## What is built

- ✅ Shell: sidebar (collapsible, permission-filtered), app header, language
  switcher, user menu, sign in / sign out
- ✅ RBAC end to end: middleware → server guard (`forbidden.tsx`) → UI gating
- ✅ Design system primitives and the token layer
- ✅ **News Feed** — the reference screen, fully wired: list, pagination,
  pinned rail, quick stats, delete, role-gated actions
- 🚧 Clients, Broker Role, Finance, Projects, Floor Plan, Users, Listings,
  Language — routed and guarded, content pending. Each placeholder links
  straight to its Figma node for all three roles.

## Known gaps

- The session cookie is base64, **not signed**. That is fine against the mock
  adapter; it must become a signed token validated by the API before this ships.
  Everything that touches the encoding is in `lib/auth/session-cookie.ts`.
- Delete uses `window.confirm`. A shared `ConfirmDialog` should replace it.
- `Background/Negative Subtle` is derived, not a published Figma token.
