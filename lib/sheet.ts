import type { Release } from "./api";
import { formatReleaseDate, t } from "./i18n";
import { camelot, formatDuration, keyName } from "./music";
import { serviceName } from "./services";

/** Plain-text release sheet for distributor or support tickets. */
export function releaseSheet(release: Release, pageUrl: string | null): string {
	const lines = [
		[t("fieldTitle"), release.name],
		[t("fieldArtists"), release.artists.join(", ") || null],
		[t("fieldUpc"), release.upc],
		[t("fieldIsrc"), release.isrc],
		[t("fieldLabel"), release.label],
		[t("fieldReleased"), formatReleaseDate(release.releaseDate)],
		[t("fieldDistributor"), release.distributor ?? null],
		[t("fieldPLine"), release.pLine ?? null],
		[t("fieldDuration"), release.durationSec ? formatDuration(release.durationSec) : null],
		[t("soundBpm"), release.sound ? String(Math.round(release.sound.bpm)) : null],
		[t("soundKey"), release.sound ? `${keyName(release.sound)} (${camelot(release.sound)})` : null],
		[t("fieldProducers"), release.producers?.join(", ") || null],
		["Spotify", pageUrl],
	].flatMap(([label, value]) => (value ? [`${label}: ${value}`] : []));
	if (release.links.length > 0) {
		lines.push(
			"",
			`${t("alsoOn")}:`,
			...release.links.map((link) => `${serviceName(link.service)}: ${link.url}`),
		);
	}
	return lines.join("\n");
}
