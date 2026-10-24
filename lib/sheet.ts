import type { Release } from "./api";
import { formatReleaseDate, t } from "./i18n";
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
