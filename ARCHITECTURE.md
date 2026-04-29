# Treva Architecture

## Goal
- Scale-friendly Turbo + Next.js monorepo
- Clear split between route, feature, shared UI, and config
- Keep `app/` thin

## Core Rule
- `apps/` = runnable products
- `packages/` = reusable shared layers
- `app/` = routes, layouts, pages only
- feature code does not grow inside `app/`

## Monorepo Shape
```text
apps/
  treva-web/
  treva-api/

packages/
  ui/
  types/
  shared/
  eslint-config/
  typescript-config/
```

## treva-web Rule
```text
apps/treva-web/
  app/
    [locale]/
      page.tsx
      projects/page.tsx
      developers/page.tsx
      brokers/page.tsx
      pulse/page.tsx
      contacts/page.tsx
    layout.tsx
    globals.css

  components/
    shared/
    home/

  features/
    locale/
    home/
    projects/
    developers/
    brokers/
    pulse/
    contacts/

  content/
    nav/
    home/
    shared/

  config/
  lib/
  hooks/
  stores/
  public/
```

## Layer Meaning
- `app/`: route entry only
- `components/shared/`: navbar, footer, container
- `components/home/`: homepage-only visual blocks
- `features/*`: business/domain logic
- `content/*`: static locale content
- `config/*`: app settings
- `lib/*`: helpers, clients, utilities

## Package Meaning
- `packages/ui`: generic reusable UI only
- `packages/types`: shared contracts only
- `packages/shared`: runtime helpers only
- app-specific UI stays in `apps/treva-web`

## Routing Rule
- locale routes stay under `app/[locale]`
- root `/` redirects to default locale
- every major nav item becomes its own route

## Page Rule
- page files stay small
- page files compose sections
- heavy UI moves to `components/` or `features/`

## Growth Path
1. Start with `components/shared` and `components/home`
2. Move domain logic into `features/*`
3. Split large static data into `content/*`
4. Keep generic parts in `packages/ui`

## Current Direction
- Keep `app/[locale]`
- Build static frontend first
- Add real API integration later
