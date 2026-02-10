import type { SpotifyItemType, SpotifyUrlInfo } from "./types";

const SPOTIFY_PATH_REGEX = /^\/(track|album|artist)\/([A-Za-z0-9]+)/;

const VALID_TYPES = new Set<SpotifyItemType>(["track", "album", "artist"]);

/**
 * Parse a Spotify URL path into item type and ID.
 * Returns null if the path doesn't match a supported page.
 */
export function parseSpotifyUrl(path: string): SpotifyUrlInfo | null {
	const match = path.match(SPOTIFY_PATH_REGEX);
	if (!match) return null;

	const type = match[1] as string;
	const id = match[2] as string;

	if (!VALID_TYPES.has(type as SpotifyItemType)) return null;

	return { type: type as SpotifyItemType, id };
}
