# Frontend Static

## Scope
- Phase 1: static frontend only
- No backend dependency in UI flow
- Keep API/i18n logic out of first visual pass

## Current
- `apps/treva-web` is Next 16 app
- Main UI entry: `app/layout.tsx`, `app/page.tsx`, `app/[locale]/page.tsx`
- Shared UI: `packages/ui`
- Current pages still call API for languages/translations

## Risks
- Home pages are data-coupled
- Layout metadata depends on env-backed config
- Static-first flow is not separated yet

## Next
- Replace API-driven page data with local mock/static data
- Build base layout: navbar, hero, sections, footer
- Keep language switcher visual-first
- Reconnect real data in later phase

## Work Rules
- Write concise updates here when scope changes
- Keep notes short
- Prefer decisions over long explanations

## Decisions
- Start from frontend shell, not API
- Keep `app/[locale]` flow
- Static languages live in project settings
- Phase 1 locales: `az`, `en`, `ru`
- Root path redirects to default locale
- `app/[locale]` now uses static content
- Custom navbar integrated into `app/components/Navbar`
- Custom container integrated into `app/components/Container`
