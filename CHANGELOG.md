# Changelog

All notable changes to the Dynamoi Chrome extension will be documented in this file.

## [Unreleased]

## [2.0.0] - 2026-10-24

### Changed

- Rebuilt as a release lookup: UPC or ISRC, label, release date, credited
  artists and links to other stores for any Spotify album or track, served from
  Dynamoi's release data.
- The card reads only the Spotify ID from the page address; it no longer reads
  the Spotify page.
- New Dynamoi design, in 16 languages.

### Added

- Per-field copy buttons and a "Copy release sheet" button.
- Popup lookup for any Spotify link, UPC or ISRC, with your last 20 lookups
  stored on your device.
- `Alt+Shift+D` shortcut to show or hide the card, and a toolbar badge when a
  release is detected.
- Welcome page on install.

### Removed

- Popularity, followers, genres, audio features and the artist card.
- The `activeTab` permission.

## [1.0.0] - 2026-02-10

### Added

- See popularity scores, audio features, genres, labels, and ISRC codes on any Spotify track page.
- See label, release date, UPC, and copyright info on any Spotify album page.
- See follower counts, popularity, and genre tags on any Spotify artist page.
- Overlays appear automatically as you browse — no clicks needed.
- One-click copy for ISRC and UPC codes.
- Extension popup showing connection status.
