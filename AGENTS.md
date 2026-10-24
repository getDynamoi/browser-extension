# Chrome Extension Agent Rules

This folder contains the WXT-based Dynamoi Chrome extension. Keep this file scoped to implementation rules; `README.md` is the public mirror's front page (positioning-checked by `scripts/public/static/validate-agent-discovery-assets.ts`); other product copy and store assets belong in marketing docs, package metadata, or store assets.

- The extension is zero-tracking; imports are guarded by AST-grep.
- Read only the Spotify ID from the page URL; never parse the Spotify DOM. Never name upstream data providers in shipped code, copy or comments. Strings live in `public/_locales` (16 locales, same keys); styles use `styles/theme.css` tokens, mirroring the dashboard design system.
- Run `bun --cwd apps/chrome-extension typecheck` and `bun --cwd apps/chrome-extension build` before reporting code changes complete.

