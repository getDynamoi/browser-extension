import type { ItemType, LookupTarget } from "./target";

export type Release = {
	artists: string[];
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
