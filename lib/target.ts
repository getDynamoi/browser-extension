export type ItemType = "album" | "track";

/** What the extension looks up: a Spotify page ID or a pasted UPC/ISRC. */
export type LookupTarget =
	| { by: "spotify"; itemType: ItemType; value: string }
	| { by: "code"; itemType: ItemType; value: string };

const SPOTIFY_PATH =
	/^(?:\/intl-[a-z]{2}(?:-[A-Za-z]{2,})*)?\/(track|album)\/([A-Za-z0-9]{22})\/?$/;
const UPC = /^\d{12,14}$/;
const ISRC = /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/;

/** Reads the release ID from an open.spotify.com path. Nothing else is read. */
export function targetFromSpotifyPath(path: string): LookupTarget | null {
	const match = SPOTIFY_PATH.exec(path);
	if (!(match?.[1] && match[2])) {
		return null;
	}
	return { by: "spotify", itemType: match[1] as ItemType, value: match[2] };
}

/** Accepts a Spotify album/track link or URI, a UPC, or an ISRC. */
export function targetFromInput(raw: string): LookupTarget | null {
	const input = raw.trim();
	const uri = /^spotify:(track|album):([A-Za-z0-9]{22})$/.exec(input);
	if (uri?.[1] && uri[2]) {
		return { by: "spotify", itemType: uri[1] as ItemType, value: uri[2] };
	}
	try {
		const url = new URL(input);
		if (url.hostname === "open.spotify.com") {
			return targetFromSpotifyPath(url.pathname);
		}
	} catch {
		// Not a URL; try a code below.
	}
	const code = input.replace(/[\s-]/g, "").toUpperCase();
	if (UPC.test(code)) {
		return { by: "code", itemType: "album", value: code };
	}
	if (ISRC.test(code)) {
		return { by: "code", itemType: "track", value: code };
	}
	return null;
}

export function targetKey(target: LookupTarget): string {
	return `${target.by}:${target.itemType}:${target.value}`;
}
