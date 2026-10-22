# Dynamoi for Chrome

**A free Dynamoi tool for artists: see the data behind any song on Spotify.**

[![Available in the Chrome Web Store](https://img.shields.io/chrome-web-store/v/abagmakkbloofbpnbldkaolinegeklhf?label=Chrome%20Web%20Store&logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/dynamoi/abagmakkbloofbpnbldkaolinegeklhf)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

Open a track, artist or album on [open.spotify.com](https://open.spotify.com)
and a small Dynamoi card shows the details Spotify keeps off the page. Use it
to research comparable artists or check your own release metadata. No account needed, nothing to set up.

<p align="center">
  <img alt="The Dynamoi card on a Spotify track page, showing popularity 89, genre, track number, duration and ISRC" src="./.github/screenshot.png" width="720">
</p>

## What it shows

| Page | Details |
| --- | --- |
| Track | Popularity score, ISRC, duration, track and disc number, explicit flag, the artist's genres, and audio features where Spotify provides them |
| Artist | Followers, popularity and genre tags |
| Album | Record label, release date, UPC, copyright line, track count and popularity |

The card sits in the top-right corner and goes away when you leave the page.

## Install

Add it from the [Chrome Web Store](https://chromewebstore.google.com/detail/dynamoi/abagmakkbloofbpnbldkaolinegeklhf),
then open any track, artist or album on open.spotify.com.

## Privacy

- No sign-in and no tracking. The extension does not collect or sell data.
- It runs only on `open.spotify.com`. It reads the Spotify ID of the page you
  are on and asks `dynamoi.com` for that item's public metadata.
- The only permission is `activeTab`.

## Grow the music you research

Dynamoi is a music promotion platform that works with any distributor. The
Dynamoi team runs Instagram and Facebook ads optimized for Spotify listeners
and YouTube campaigns on Google, and Smart Links and analytics are free. See
[dynamoi.com](https://dynamoi.com).

## Source

This repository mirrors the extension's source from the Dynamoi monorepo,
where it is built with WXT and React. Read the code, and report bugs in
[issues](https://github.com/getDynamoi/browser-extension/issues).

MIT licensed. See [LICENSE](./LICENSE).

---

**Part of Dynamoi** · [MCP server](https://github.com/getDynamoi/dynamoi) · [CLI](https://github.com/getDynamoi/dynamoi/tree/main/cli) · [Agent plugins](https://github.com/getDynamoi/agent-plugins) · [Homebrew tap](https://github.com/getDynamoi/homebrew-tap) · [Chrome extension](https://github.com/getDynamoi/browser-extension) · [dynamoi.com](https://dynamoi.com) · [Docs](https://dynamoi.com/docs) · [Support](https://dynamoi.com/support)
