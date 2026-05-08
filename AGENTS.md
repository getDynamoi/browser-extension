# Chrome Extension Agent Rules

This folder contains the WXT-based Dynamoi Chrome extension. Keep this file scoped to implementation rules; product copy, screenshots, and store-facing content belong in marketing docs, package metadata, or store assets.

- Do not add analytics, network capture, or user-data collection without an explicit product/privacy review.
- Keep Spotify page parsing resilient to missing DOM elements; the extension should fail closed instead of breaking `open.spotify.com`.
- Do not put Chrome Web Store claims, screenshots, or listing copy in `AGENTS.md`.
- Run `bun --cwd apps/chrome-extension typecheck` and `bun --cwd apps/chrome-extension build` before reporting code changes complete.
