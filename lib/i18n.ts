/** Localized UI string from public/_locales; English is the default locale. */
export function t(key: string, substitutions?: string | string[]): string {
	return chrome.i18n.getMessage(key, substitutions) || key;
}

export function formatReleaseDate(value: string | null): string | null {
	if (!value) return null;
	const [year, month, day] = value.split("-").map(Number);
	if (!year) return value;
	if (!(month && day)) return String(year);
	return new Intl.DateTimeFormat(chrome.i18n.getUILanguage(), {
		day: "numeric",
		month: "long",
		timeZone: "UTC",
		year: "numeric",
	}).format(new Date(Date.UTC(year, month - 1, day)));
}
