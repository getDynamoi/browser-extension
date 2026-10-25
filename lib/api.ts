import type { ItemType, LookupTarget } from "./target";

/** Audio analysis of the page's own track version; values 0..1 except bpm. */
export type Sound = {
	bpm: number;
	danceability: number;
	energy: number;
	/** Pitch class 0 (C) to 11 (B). */
	key: number;
	/** 1 major, 0 minor. */
	mode: 0 | 1;
	valence: number;
};

export type PlaylistReach = {
	asOf: string;
	count: number;
	editorial: number;
};

/** Lead-artist block, fetched after the release so the core facts render first. */
export type ArtistProfile = {
	country: string | null;
	genres: string[];
	listenersAsOf: string | null;
	monthlyListeners: number | null;
	name: string;
	topCities: Array<{ city: string; country: string; listeners: number }>;
};

export type Release = {
	/** Opaque key for the artist block request; null when no artist is matched. */
	artistKey?: string | null;
	artists: string[];
	distributor?: string | null;
	durationSec?: number | null;
	explicit?: boolean | null;
	playlists?: PlaylistReach | null;
	pLine?: string | null;
	producers?: string[];
	sound?: Sound | null;
	totalTracks?: number | null;
	isrc: string | null;
	itemType: ItemType;
	label: string | null;
	links: Array<{ service: string; url: string }>;
	name: string | null;
	releaseDate: string | null;
	upc: string | null;
};

export type LookupResult =
	| { status: "found"; release: Release }
	| { status: "not_found" | "limited" | "unavailable" | "offline" };

const API_URL =
	import.meta.env.MODE === "development"
		? "http://localhost:3000/api/dynamoi-extension"
		: "https://dynamoi.com/api/dynamoi-extension";

const LOOKUP_TIMEOUT_MS = 12_000;

export type ArtistResult = { status: "found"; artist: ArtistProfile } | { status: "none" };

export async function fetchArtist(artistKey: string): Promise<ArtistResult> {
	try {
		const response = await fetch(
			`${API_URL}?section=artist&artist=${encodeURIComponent(artistKey)}`,
			{ signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS) },
		);
		if (!response.ok) return { status: "none" };
		const body: { data?: ArtistProfile } | null = await response.json();
		return body?.data ? { artist: body.data, status: "found" } : { status: "none" };
	} catch {
		return { status: "none" };
	}
}

export async function fetchRelease(target: LookupTarget): Promise<LookupResult> {
	const query =
		target.by === "spotify"
			? `itemType=${target.itemType}&id=${encodeURIComponent(target.value)}`
			: `code=${encodeURIComponent(target.value)}`;
	let response: Response;
	try {
		response = await fetch(`${API_URL}?${query}`, {
			signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
		});
	} catch {
		return { status: navigator.onLine ? "unavailable" : "offline" };
	}
	if (response.status === 404) return { status: "not_found" };
	if (response.status === 429) return { status: "limited" };
	if (!response.ok) return { status: "unavailable" };
	let body: { data?: Release } | null;
	try {
		body = await response.json();
	} catch {
		// A malformed body is reported to the user as a temporary outage.
		return { status: "unavailable" };
	}
	return body?.data
		? { release: body.data, status: "found" }
		: { status: "unavailable" };
}
