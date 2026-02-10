<p align="center">
  <a href="https://dynamoi.com">
    <img src="public/dynamoi-wordmark.png" height="28" alt="Dynamoi">
  </a>
</p>

<h3 align="center">See the data behind the music.</h3>

<p align="center">
  A free Chrome extension that overlays hidden Spotify metadata &mdash; popularity scores, audio features, genre tags, labels, ISRC codes, and more &mdash; right on <code>open.spotify.com</code>.
</p>

<p align="center">
  <a href="https://dynamoi.com">Website</a>
  &middot;
  <a href="https://github.com/getDynamoi/browser-extension/issues">Report Bug</a>
  &middot;
  <a href="https://github.com/getDynamoi/browser-extension/issues">Request Feature</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/manifest-v3-blue?style=flat-square" alt="Manifest V3">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT License">
  <img src="https://img.shields.io/badge/react-19-61dafb?style=flat-square&logo=react&logoColor=white" alt="React 19">
  <img src="https://img.shields.io/badge/tailwind-4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind 4">
  <img src="https://img.shields.io/badge/typescript-strict-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
</p>

<br>

<p align="center">
  <img src=".github/screenshot.png" width="720" alt="Dynamoi extension overlay on a Spotify track page">
</p>

---

## What It Does

Browse Spotify like normal. When you open a **track**, **album**, or **artist** page, a sleek overlay appears with enriched metadata that Spotify doesn't surface in its UI.

### Track Pages

- Popularity score with color-coded meter
- Duration, track number, explicit badge
- Artist genres as pill tags
- Audio features chart (danceability, energy, valence, and more)
- ISRC code (copyable)

### Album Pages

- Record label
- Artist names, release date, track count, album type
- Popularity score
- UPC code (copyable)
- Copyright info

### Artist Pages

- Follower count (formatted)
- Popularity score
- Genre tags

---

## Design

- **Glass-card dark UI** with OKLCH color tokens matching Dynamoi's design system
- **Shadow DOM isolation** &mdash; zero style leakage into or from Spotify
- **SPA-aware** &mdash; detects navigation via History API interception + MutationObserver (no polling)
- **Smooth fade-in** animation on mount

---

## Install

### Chrome Web Store

> Coming soon.

### Manual (Developer Mode)

1. Download or clone this repository
2. Install dependencies and build:
   ```sh
   npm install
   npm run build
   ```
3. Open **chrome://extensions** in Chrome
4. Enable **Developer mode** (top right)
5. Click **Load unpacked** and select the `.output/chrome-mv3` directory

---

## Development

```sh
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Create distributable .zip for Chrome Web Store
npm run zip
```

The dev server launches Chrome with the extension auto-loaded. Changes hot-reload instantly.

---

## How It Works

```
open.spotify.com          Extension (content script)         Dynamoi API
  ┌──────────┐           ┌─────────────────────┐          ┌──────────────┐
  │ /track/x │  ──URL──> │  Detect Spotify URL  │          │              │
  │ /album/x │           │  Extract item type   │ ──GET──> │  Spotify     │
  │ /artist/x│           │  + Spotify ID        │          │  Web API     │
  └──────────┘           │                      │ <──JSON── │  (server)    │
                         │  Render overlay in   │          │              │
                         │  Shadow DOM          │          └──────────────┘
                         └─────────────────────┘
```

The extension never touches your Spotify credentials. It extracts the item ID from the URL and queries the Dynamoi API, which calls the Spotify Web API server-side with its own credentials. Rate limited to 10 requests/minute per IP.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [WXT](https://wxt.dev) &mdash; Manifest V3, Shadow DOM, HMR |
| UI | [React 19](https://react.dev) |
| Styles | [Tailwind CSS 4](https://tailwindcss.com) with OKLCH design tokens |
| Language | [TypeScript](https://www.typescriptlang.org) (strict) |

---

## Project Structure

```
entrypoints/
  background.ts              Service worker: API relay
  content/
    index.tsx                 Shadow DOM mount + SPA navigation
    style.css                 Tailwind + OKLCH design tokens
    components/
      App.tsx                 Root: URL detection, data fetching
      TrackOverlay.tsx        Track metadata display
      AlbumOverlay.tsx        Album metadata display
      ArtistOverlay.tsx       Artist metadata display
      PopularityMeter.tsx     Color-coded progress bar
      AudioFeatures.tsx       Horizontal bar chart
      GenreTags.tsx           Pill-shaped genre chips
      OverlayHeader.tsx       Logo + close button
      PoweredBy.tsx           Footer link
  popup/
    Popup.tsx                 Extension popup UI
lib/
  api-client.ts              Fetch wrapper for Dynamoi API
  messages.ts                Typed message passing
  rate-limiter.ts            Client-side throttle
  spotify-url.ts             URL parser
  types.ts                   TypeScript types
```

---

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT &mdash; see [LICENSE](LICENSE) for details.

---

<p align="center">
  <sub>Built by <a href="https://dynamoi.com">Dynamoi</a> &mdash; Music marketing, powered by data.</sub>
</p>
