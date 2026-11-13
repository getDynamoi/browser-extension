import { browser } from "../lib/browser";
import { defineBackground } from "wxt/utils/define-background";
import {
	type ArtistResult,
	fetchArtist,
	fetchRelease,
	type LookupResult,
} from "../lib/api";
import { t } from "../lib/i18n";
import type { ToBackground, ToContent } from "../lib/messages";
import { rememberLookup } from "../lib/storage";
import { type LookupTarget, targetKey } from "../lib/target";

const UNINSTALL_URL =
	"https://dynamoi.com/support?utm_source=chrome-extension&utm_medium=extension&utm_campaign=uninstall";
const SESSION_CACHE_MS = 60 * 60 * 1000;
const BADGE_COLOR = "#e2733f";
const BADGE_TEXT_COLOR = "#0c0b0a";

const inFlight = new Map<string, Promise<LookupResult>>();

async function cachedLookup(target: LookupTarget): Promise<LookupResult> {
	const key = `lookup:${targetKey(target)}`;
	const stored = (await browser.storage.session.get(key))[key] as
		{ at: number; result: LookupResult } | undefined;
	if (stored && Date.now() - stored.at < SESSION_CACHE_MS) {
		return stored.result;
	}
	const pending = inFlight.get(key) ?? fetchRelease(target);
	inFlight.set(key, pending);
	try {
		const result = await pending;
		if (result.status === "found" || result.status === "not_found") {
			await browser.storage.session.set({ [key]: { at: Date.now(), result } });
		}
		if (result.status === "found") {
			await rememberLookup(target, result.release);
		}
		return result;
	} finally {
		inFlight.delete(key);
	}
}

export default defineBackground(() => {
	void browser.runtime.setUninstallURL(UNINSTALL_URL);

	browser.runtime.onInstalled.addListener(({ reason }) => {
		if (reason === "install") {
			void browser.tabs.create({
				url: browser.runtime.getURL("/welcome.html"),
			});
		}
	});

	browser.runtime.onMessage.addListener(
		(message: ToBackground, sender, sendResponse) => {
			if (message.type === "ARTIST") {
				void fetchArtist(message.artistKey).then(sendResponse, () =>
					sendResponse({ status: "none" } satisfies ArtistResult),
				);
				return true;
			}
			if (message.type === "LOOKUP") {
				void cachedLookup(message.target).then(sendResponse, () =>
					sendResponse({ status: "unavailable" } satisfies LookupResult),
				);
				return true;
			}
			const tabId = sender.tab?.id;
			if (message.type === "PAGE" && tabId !== undefined) {
				const text = message.itemType
					? t(message.itemType === "album" ? "fieldUpc" : "fieldIsrc")
					: "";
				void browser.action.setBadgeText({ tabId, text });
				void browser.action.setBadgeBackgroundColor({
					color: BADGE_COLOR,
					tabId,
				});
				void browser.action.setBadgeTextColor({
					color: BADGE_TEXT_COLOR,
					tabId,
				});
				void browser.action.setTitle({
					tabId,
					title: message.itemType ? t("badgeDetected") : t("extName"),
				});
			}
			return false;
		},
	);

	browser.commands.onCommand.addListener((command, tab) => {
		if (command !== "toggle-card" || tab?.id === undefined) return;
		const message: ToContent = { type: "TOGGLE_CARD" };
		browser.tabs.sendMessage(tab.id, message).catch(() => {
			// Not a Spotify tab; nothing to toggle.
		});
	});
});
