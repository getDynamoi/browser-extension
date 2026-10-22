# Chrome Extension Agent Rules

This folder contains the WXT-based Dynamoi Chrome extension. Keep this file scoped to implementation rules; `README.md` is the public mirror's front page (positioning-checked by `scripts/public/static/validate-agent-discovery-assets.ts`); other product copy and store assets belong in marketing docs, package metadata, or store assets.

- The extension is zero-tracking; imports are guarded by AST-grep.
- Keep Spotify DOM parsing resilient to missing elements; fail closed instead of breaking `open.spotify.com`.
- Run `bun --cwd apps/chrome-extension typecheck` and `bun --cwd apps/chrome-extension build` before reporting code changes complete.

