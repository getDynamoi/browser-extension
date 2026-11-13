import type messages from "../public/_locales/en/messages.json";
import { browser } from "./browser";
/** Localized UI string from public/_locales; English is the default locale. */
export function t(
	key: keyof typeof messages,
	substitutions?: string | string[],
): string {
	return browser.i18n.getMessage(key, substitutions) || key;
}

export function formatReleaseDate(value: string | null): string | null {
	if (!value) return null;
	const [year, month, day] = value.split("-").map(Number);
	if (!year) return value;
	if (!(month && day)) return String(year);
	return new Intl.DateTimeFormat(browser.i18n.getUILanguage(), {
		day: "numeric",
		month: "long",
		timeZone: "UTC",
		year: "numeric",
	}).format(new Date(Date.UTC(year, month - 1, day)));
}
