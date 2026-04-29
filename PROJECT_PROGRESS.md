# Project Progress

## Current Goal
- Fix Treva web step by step without bloating notes.

## Done
- Restored `apps/treva-web/app/[locale]/page.tsx` with a valid default export.
- Wired locale page to render `apps/treva-web/components/home`.
- Moved home global CSS import into `apps/treva-web/app/globals.css`.
- Verified `npm run check-types` passes.
- Verified `npm run build` passes.
- Added `/cdn-assets/[...asset]` route to redirect Webflow export asset paths to remote CDN URLs.
- Tested sample asset redirects for logo, burger logo, and pulse image.
- Added the live Webflow stylesheet because local `home.css` only contains custom overrides, not the full exported design CSS.
- Fixed `Home` locale prop typing and a boolean `alt` attribute in `HomeLogos`.
- Verified `npm run check-types` passes after CSS fixes.
- Verified `npm run build` passes after CSS fixes.

## Next
- Then fix lint warnings in small batches.

## Open Questions
- Which lint batch should be fixed first: external link security, JSX attributes, or image handling?
