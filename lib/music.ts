import type { Sound } from "./api";
import { t } from "./i18n";

/** Camelot wheel numbers by pitch class; A is minor, B is major. */
const CAMELOT_MAJOR = [8, 3, 10, 5, 12, 7, 2, 9, 4, 11, 6, 1];
const CAMELOT_MINOR = [5, 12, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10];

/** Note names follow the reader's convention (German H, French Do and so on). */
export function keyName(sound: Sound): string {
	const major = sound.mode === 1;
	const root = t(major ? "notesMajor" : "notesMinor").split(" ")[sound.key] ?? "?";
	return t(major ? "keyMajor" : "keyMinor", root);
}

export function camelot(sound: Sound): string {
	const major = sound.mode === 1;
	return `${(major ? CAMELOT_MAJOR : CAMELOT_MINOR)[sound.key]}${major ? "B" : "A"}`;
}

export function formatDuration(seconds: number): string {
	const s = Math.round(seconds);
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const rest = String(s % 60).padStart(2, "0");
	return h ? `${h}:${String(m).padStart(2, "0")}:${rest}` : `${m}:${rest}`;
}

export function formatCompact(value: number): string {
	return new Intl.NumberFormat(chrome.i18n.getUILanguage(), {
		maximumFractionDigits: 1,
		notation: "compact",
	}).format(value);
}

export function formatShortDate(value: string): string {
	return new Intl.DateTimeFormat(chrome.i18n.getUILanguage(), {
		day: "numeric",
		month: "short",
		timeZone: "UTC",
	}).format(new Date(value));
}

export function countryName(code: string): string {
	try {
		return (
			new Intl.DisplayNames([chrome.i18n.getUILanguage()], { type: "region" }).of(code) ??
			code
		);
	} catch {
		return code;
	}
}

export function countryFlag(code: string): string {
	return String.fromCodePoint(
		...[...code.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)),
	);
}
