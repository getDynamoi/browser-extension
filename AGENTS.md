# Chrome Extension Agent Rules

This folder contains the WXT-based Dynamoi Chrome extension. Keep this file scoped to implementation rules; product copy, screenshots, and store-facing content belong in marketing docs, package metadata, or store assets.

- The extension is zero-tracking; imports are guarded by AST-grep.
- Keep Spotify DOM parsing resilient to missing elements; fail closed instead of breaking `open.spotify.com`.
- Run `bun --cwd apps/chrome-extension typecheck` and `bun --cwd apps/chrome-extension build` before reporting code changes complete.

