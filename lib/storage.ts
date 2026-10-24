import type { Release } from "./api";
import { type LookupTarget, targetKey } from "./target";

/** On-device only (chrome.storage.local); never sent anywhere. */
export type HistoryEntry = {
	artists: string[];
	code: string | null;
	name: string | null;
	target: LookupTarget;
};

const HISTORY_KEY = "history";
const HISTORY_LIMIT = 20;
const RATING_KEY = "rating";
export const RATING_AFTER_LOOKUPS = 5;

export const STORE_REVIEW_URL =
	"https://chromewebstore.google.com/detail/dynamoi/abagmakkbloofbpnbldkaolinegeklhf/reviews";

export type RatingState = { done: boolean; lookups: number };

export async function readHistory(): Promise<HistoryEntry[]> {
	const stored = await chrome.storage.local.get(HISTORY_KEY);
	const value = stored[HISTORY_KEY];
	return Array.isArray(value) ? (value as HistoryEntry[]) : [];
}

export async function rememberLookup(
	target: LookupTarget,
	release: Release,
): Promise<void> {
	const entry: HistoryEntry = {
		artists: release.artists,
		code: release.upc ?? release.isrc,
		name: release.name,
		target,
	};
	const key = targetKey(target);
	const history = (await readHistory()).filter(
		(item) =>
			targetKey(item.target) !== key && !(entry.code && item.code === entry.code),
	);
	const rating = await readRating();
	await chrome.storage.local.set({
		[HISTORY_KEY]: [entry, ...history].slice(0, HISTORY_LIMIT),
		[RATING_KEY]: { ...rating, lookups: rating.lookups + 1 },
	});
}

export async function clearHistory(): Promise<void> {
	await chrome.storage.local.remove(HISTORY_KEY);
}

export async function readRating(): Promise<RatingState> {
	const stored = await chrome.storage.local.get(RATING_KEY);
	const value = stored[RATING_KEY] as Partial<RatingState> | undefined;
	return { done: value?.done === true, lookups: value?.lookups ?? 0 };
}

export async function finishRatingPrompt(): Promise<void> {
	const rating = await readRating();
	await chrome.storage.local.set({ [RATING_KEY]: { ...rating, done: true } });
}
