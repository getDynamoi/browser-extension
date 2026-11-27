import type { ArtistResult, LookupResult, Release, Sound } from "../lib/api";
import {
	attributes,
	button,
	element,
	externalLink,
	lifetime,
	type DomChild,
	type View,
} from "../lib/dom";
import { formatReleaseDate, t } from "../lib/i18n";
import {
	camelot,
	countryFlag,
	countryName,
	formatCompact,
	formatDuration,
	formatShortDate,
	keyName,
} from "../lib/music";
import { serviceName } from "../lib/services";
import { releaseSheet } from "../lib/sheet";
import { targetKey, type LookupTarget } from "../lib/target";
import { CheckIcon, ChevronIcon, CopyIcon, ExternalIcon } from "./icons";

export type CardState = { status: "loading" } | LookupResult;
export type ArtistState = { status: "loading" } | ArtistResult;

type ReleaseCardProps = {
	artist?: ArtistState;
	onDismissRating?: () => void;
	onRate?: () => void;
	onRetry?: () => void;
	showRating?: boolean;
	state: CardState;
	target: LookupTarget;
};
type Scope = ReturnType<typeof lifetime>;
type Announce = (message: string) => void;
const NONE_ARTIST: ArtistState = { status: "none" };

function promoteUrl(itemType: string): string {
	const params = new URLSearchParams({
		utm_campaign: "release-card",
		utm_content: itemType,
		utm_medium: "extension",
		utm_source: "chrome-extension",
	});
	return "https://dynamoi.com/smart-campaigns?" + params;
}

function copyButton(
	scope: Scope,
	announce: Announce,
	label: string,
	text: string,
	className: string,
	caption?: string,
): HTMLButtonElement {
	let confirmation = 0;
	const node = button(
		"kbd-focus inline-flex cursor-pointer items-center gap-1.5 transition-colors duration-150 " +
			className,
		null,
		() => {
			void (async () => {
				try {
					await navigator.clipboard.writeText(text);
					if (scope.signal.aborted) return;
					const version = ++confirmation;
					render(true);
					announce(t("copiedField", label));
					scope.after(1600, () => {
						if (version === confirmation) render(false);
					});
				} catch {
					if (!scope.signal.aborted) announce(t("copyFailed"));
				}
			})();
		},
	);
	if (!caption) node.setAttribute("aria-label", t("copyField", label));
	function render(copied: boolean) {
		node.replaceChildren(
			copied
				? CheckIcon("size-4 shrink-0 text-success")
				: CopyIcon("size-4 shrink-0"),
		);
		if (caption)
			node.append(element("span", "", copied ? t("sheetCopied") : caption));
	}
	render(false);
	return node;
}

function factRow(
	scope: Scope,
	label: string,
	value: string,
	announce?: Announce,
	note?: string | null,
): HTMLElement {
	return element(
		"div",
		"group flex min-h-9 items-center gap-3 py-0.5",
		element("dt", "w-20 shrink-0 text-label text-quiet", label),
		element(
			"dd",
			"min-w-0 flex-1 text-body text-text",
			value,
			note ? element("span", "block text-label text-muted", note) : null,
		),
		announce
			? copyButton(
					scope,
					announce,
					label,
					value,
					"size-8 justify-center rounded-sm text-quiet hover:bg-hover hover:text-text",
				)
			: attributes(element("span", "size-8 shrink-0"), { "aria-hidden": true }),
	);
}

function sectionHeading(id: string, title: string, aside?: string | null) {
	return element(
		"div",
		"flex items-baseline justify-between gap-3",
		attributes(element("h3", "text-label font-semibold text-quiet", title), {
			id,
		}),
		aside ? element("span", "text-label text-muted", aside) : null,
	);
}

function meter(label: string, value: number): DomChild[] {
	const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
	const fill = element("span", "block h-full rounded-full bg-muted");
	fill.style.width = String(pct) + "%";
	return [
		element("span", "text-body text-muted", label),
		attributes(
			element("span", "h-1 overflow-hidden rounded-full bg-raised", fill),
			{
				"aria-label": label,
				"aria-valuemax": 100,
				"aria-valuemin": 0,
				"aria-valuenow": pct,
				role: "meter",
			},
		),
		element("span", "tabular text-right text-body text-text", pct),
	];
}

function soundSection(sound: Sound) {
	const stats = [
		[String(Math.round(sound.bpm)), t("soundBpm")],
		[keyName(sound), t("soundKey")],
		[camelot(sound), t("soundCamelot")],
	] as const;
	return attributes(
		element(
			"section",
			"",
			sectionHeading("dynamoi-sound", t("soundTitle"), t("soundEstimated")),
			element(
				"dl",
				"mt-1.5 grid grid-cols-3 gap-x-4",
				...stats.map(([value, label]) =>
					element(
						"div",
						"flex flex-col-reverse",
						element("dt", "text-label text-muted", label),
						element(
							"dd",
							"tabular text-section font-semibold text-text",
							value,
						),
					),
				),
			),
			element(
				"div",
				"mt-2 grid grid-cols-[6.5rem_1fr_1.75rem] items-center gap-x-3 gap-y-1",
				...meter(t("soundEnergy"), sound.energy),
				...meter(t("soundDanceability"), sound.danceability),
				...meter(t("soundPositivity"), sound.valence),
			),
		),
		{ "aria-labelledby": "dynamoi-sound" },
	);
}

function artistSection(name: string, state: ArtistState): HTMLElement | null {
	if (state.status === "none") return null;
	const artist = state.status === "found" ? state.artist : null;
	const summary = artist
		? [
				artist.monthlyListeners !== null
					? t("artistListeners", formatCompact(artist.monthlyListeners))
					: null,
				artist.country
					? countryFlag(artist.country) + " " + countryName(artist.country)
					: null,
			]
				.filter(Boolean)
				.join(" · ")
		: null;
	const canOpen = Boolean(
		artist && (artist.genres.length > 0 || artist.topCities.length > 0),
	);
	const section = attributes(element("section", ""), {
		"aria-busy": !artist,
		"aria-label": t("artistTitle"),
	});
	const chevron = canOpen
		? ChevronIcon(
				"size-4 shrink-0 text-quiet motion-safe:transition-transform motion-safe:duration-200",
			)
		: null;
	let open = false;
	const details = element("div", "mt-2 space-y-3");
	details.id = "dynamoi-artist-detail";
	if (artist?.genres.length)
		details.append(
			element("p", "text-body text-text", artist.genres.join(", ")),
		);
	if (artist?.topCities.length) {
		details.append(
			element(
				"div",
				"",
				sectionHeading(
					"dynamoi-cities",
					t("artistTopCities"),
					artist.listenersAsOf
						? t("asOf", formatShortDate(artist.listenersAsOf))
						: null,
				),
				attributes(
					element(
						"ol",
						"mt-1.5 space-y-1",
						...artist.topCities.map((city) =>
							element(
								"li",
								"grid grid-cols-[1fr_auto] items-baseline gap-x-3",
								element(
									"span",
									"truncate text-body text-text",
									attributes(
										element("span", "", countryFlag(city.country) + " "),
										{ "aria-hidden": true },
									),
									city.city,
								),
								element(
									"span",
									"tabular text-body text-muted",
									formatCompact(city.listeners),
								),
							),
						),
					),
					{ "aria-labelledby": "dynamoi-cities" },
				),
			),
		);
	}
	const toggle = button(
		"kbd-focus -mx-2 -my-1.5 flex w-[calc(100%+1rem)] cursor-pointer items-center gap-3 rounded-sm px-2 py-1.5 text-left transition-colors duration-150 enabled:hover:bg-hover disabled:cursor-default",
		null,
		() => {
			open = !open;
			toggle.setAttribute("aria-expanded", String(open));
			chevron?.classList.toggle("rotate-180", open);
			if (open) section.append(details);
			else details.remove();
		},
	);
	attributes(toggle, {
		"aria-controls": "dynamoi-artist-detail",
		"aria-expanded": false,
	});
	toggle.disabled = !canOpen;
	toggle.append(
		element(
			"span",
			"min-w-0 flex-1",
			element(
				"span",
				"block truncate text-body font-medium text-text",
				artist?.name ?? name,
			),
			artist
				? summary
					? element(
							"span",
							"tabular mt-0.5 block truncate text-label text-muted",
							summary,
						)
					: null
				: attributes(element("span", "skeleton mt-1.5 block h-3 w-44"), {
						"aria-hidden": true,
					}),
		),
	);
	if (chevron) toggle.append(chevron);
	section.append(toggle);
	return section;
}

function loaded(
	scope: Scope,
	announce: Announce,
	release: Release,
	target: LookupTarget,
	initialArtist: ArtistState,
) {
	const isAlbum = release.itemType === "album";
	const codeLabel = isAlbum ? t("fieldUpc") : t("fieldIsrc");
	const code = isAlbum ? release.upc : release.isrc;
	const released = formatReleaseDate(release.releaseDate);
	const kind = t(isAlbum ? "kindAlbum" : "kindTrack");
	const spotifyUrl =
		target.by === "spotify"
			? "https://open.spotify.com/" + target.itemType + "/" + target.value
			: (release.links.find((link) => link.service === "spotify")?.url ?? null);
	const storeLinks = release.links.filter((link) => link.service !== "spotify");
	const artists = release.artists.join(", ");
	const meta = [
		isAlbum && release.totalTracks
			? t("albumTracks", String(release.totalTracks))
			: null,
		isAlbum ? released : null,
		!isAlbum && release.durationSec
			? formatDuration(release.durationSec)
			: null,
	].filter((value): value is string => Boolean(value));
	const heading = element(
		"div",
		"",
		element(
			"h2",
			"line-clamp-2 text-section font-semibold text-balance text-text",
			release.name ?? t("untitled"),
		),
		element(
			"p",
			"mt-1 text-body text-muted",
			artists ? kind + " · " + artists : kind,
		),
	);
	if (release.explicit || meta.length > 0) {
		heading.append(
			element(
				"p",
				"tabular mt-0.5 flex items-center gap-2 text-body text-muted",
				release.explicit
					? element("span", "font-semibold text-text", t("explicit"))
					: null,
				release.explicit && meta.length > 0
					? attributes(element("span", "", "·"), { "aria-hidden": true })
					: null,
				meta.join(" · "),
			),
		);
	}
	const node = element(
		"div",
		"space-y-4",
		heading,
		element(
			"div",
			"flex items-center gap-3 rounded-md bg-sunken py-3 pr-2 pl-4",
			element(
				"div",
				"min-w-0 flex-1",
				element("p", "text-label font-semibold text-quiet", codeLabel),
				code
					? element(
							"p",
							"tabular mt-0.5 text-value font-medium tracking-wide break-all text-text select-all",
							code,
						)
					: element("p", "mt-0.5 text-body text-muted", t("notAvailable")),
			),
			code
				? copyButton(
						scope,
						announce,
						codeLabel,
						code,
						"size-10 justify-center rounded-sm text-muted hover:bg-hover hover:text-text",
					)
				: null,
		),
	);
	if (release.sound) node.append(soundSection(release.sound));
	const facts = element("dl", "");
	if (release.label)
		facts.append(factRow(scope, t("fieldLabel"), release.label, announce));
	if (release.distributor)
		facts.append(
			factRow(
				scope,
				t("fieldDistributor"),
				release.distributor,
				announce,
				t("distributorNote"),
			),
		);
	if (release.pLine)
		facts.append(factRow(scope, t("fieldPLine"), release.pLine, announce));
	if (released && !isAlbum)
		facts.append(factRow(scope, t("fieldReleased"), released, announce));
	const producers = release.producers?.join(", ");
	if (producers)
		facts.append(factRow(scope, t("fieldProducers"), producers, announce));
	if (release.playlists)
		facts.append(
			factRow(
				scope,
				t("fieldPlaylists"),
				t("playlistSummary", [
					formatCompact(release.playlists.count),
					String(release.playlists.editorial),
				]),
			),
		);
	node.append(facts);
	const artistAnchor = document.createTextNode("");
	node.append(artistAnchor);
	let artistNode: HTMLElement | null = null;
	let artistState: ArtistState | null = null;
	function updateArtist(state: ArtistState) {
		if (state === artistState) return;
		artistState = state;
		const name = release.artists[0];
		const next = name ? artistSection(name, state) : null;
		artistNode?.remove();
		artistNode = next;
		if (next) artistAnchor.before(next);
	}
	updateArtist(initialArtist);
	if (storeLinks.length > 0) {
		node.append(
			attributes(
				element(
					"section",
					"",
					attributes(
						element("h3", "text-label font-semibold text-quiet", t("alsoOn")),
						{ id: "dynamoi-also-on" },
					),
					element(
						"ul",
						"mt-2 flex flex-wrap gap-1.5",
						...storeLinks.map((link) =>
							element(
								"li",
								"",
								externalLink(
									"kbd-focus inline-flex items-center gap-1 rounded-sm bg-raised px-2.5 py-1.5 text-body text-text transition-colors duration-150 hover:bg-hover",
									link.url,
									serviceName(link.service),
									ExternalIcon("size-3 text-quiet"),
									element("span", "sr-only", t("opensInNewTab")),
								),
							),
						),
					),
				),
				{ "aria-labelledby": "dynamoi-also-on" },
			),
		);
	}
	node.append(
		element(
			"div",
			"flex flex-wrap items-center justify-between gap-x-4 gap-y-2",
			copyButton(
				scope,
				announce,
				t("copySheet"),
				releaseSheet(release, spotifyUrl),
				"min-h-9 rounded-sm bg-raised px-3 text-body font-medium text-text hover:bg-hover",
				t("copySheet"),
			),
			attributes(
				externalLink(
					"kbd-focus inline-flex min-h-9 items-center gap-1 rounded-sm text-body text-ember underline-offset-4 hover:text-ember-hi hover:underline",
					promoteUrl(release.itemType),
					t("promoteShort"),
					ExternalIcon("size-3"),
					element("span", "sr-only", t("opensInNewTab")),
				),
				{ "aria-label": t("promote") + " " + t("opensInNewTab") },
			),
		),
	);
	return { element: node, updateArtist };
}

function skeleton() {
	return attributes(
		element(
			"div",
			"space-y-5",
			attributes(element("p", "sr-only", t("loading")), { role: "status" }),
			attributes(
				element(
					"div",
					"",
					element("div", "skeleton h-5 w-3/4"),
					element("div", "skeleton mt-2 h-4 w-1/2"),
				),
				{ "aria-hidden": true },
			),
			attributes(
				element(
					"div",
					"rounded-md bg-sunken px-4 py-3",
					element("div", "skeleton h-3.5 w-10"),
					element("div", "skeleton mt-2 h-6 w-48"),
				),
				{ "aria-hidden": true },
			),
			attributes(
				element(
					"div",
					"space-y-3",
					element("div", "skeleton h-4 w-2/3"),
					element("div", "skeleton h-4 w-1/2"),
				),
				{ "aria-hidden": true },
			),
			attributes(
				element(
					"div",
					"flex gap-1.5",
					element("div", "skeleton h-8 w-24"),
					element("div", "skeleton h-8 w-28"),
					element("div", "skeleton h-8 w-16"),
				),
				{ "aria-hidden": true },
			),
		),
		{ "aria-busy": true },
	);
}

const MESSAGE_KEYS = {
	limited: ["limitedTitle", "limitedBody"],
	not_found: ["notFoundTitle", "notFoundBody"],
	offline: ["offlineTitle", "offlineBody"],
	unavailable: ["unavailableTitle", "unavailableBody"],
} as const;

function message(status: keyof typeof MESSAGE_KEYS, onRetry?: () => void) {
	const [title, body] = MESSAGE_KEYS[status];
	const node = attributes(
		element(
			"div",
			"",
			element("h2", "text-section font-semibold text-text", t(title)),
			element("p", "mt-1 max-w-[34ch] text-body text-muted", t(body)),
		),
		{ role: "status" },
	);
	if (onRetry && status !== "not_found")
		node.append(
			button(
				"kbd-focus mt-4 min-h-9 cursor-pointer rounded-sm bg-raised px-3 text-body font-medium text-text transition-colors duration-150 hover:bg-hover",
				t("retry"),
				onRetry,
			),
		);
	return node;
}

function ratingPrompt(onDismiss: () => void, onRate: () => void) {
	return element(
		"div",
		"mt-5 rounded-md bg-sunken px-4 py-3",
		element("p", "text-body text-muted", t("ratePrompt")),
		element(
			"div",
			"mt-2 flex gap-2",
			button(
				"kbd-focus min-h-9 cursor-pointer rounded-sm px-2 text-body font-medium text-ember hover:text-ember-hi",
				t("rateAction"),
				onRate,
			),
			button(
				"kbd-focus min-h-9 cursor-pointer rounded-sm px-2 text-body text-muted hover:text-text",
				t("rateDismiss"),
				onDismiss,
			),
		),
	);
}

export type ReleaseCardView = View & {
	update: (props: ReleaseCardProps) => void;
};

/** Keep the mounted controls intact while artist data or the rating prompt changes. */
export function ReleaseCard(initial: ReleaseCardProps): ReleaseCardView {
	const root = element("div", "");
	const scope = lifetime();
	const region = attributes(element("p", "sr-only"), {
		"aria-live": "polite",
		role: "status",
	});
	root.append(region);
	let announcement = 0;
	const announce: Announce = (text) => {
		region.textContent = text;
		const version = ++announcement;
		scope.after(2000, () => {
			if (version === announcement) region.textContent = "";
		});
	};
	let props = initial;
	let renderedState: CardState | null = null;
	let renderedTarget = "";
	let content: HTMLElement | null = null;
	let contentScope = lifetime();
	let loadedView: ReturnType<typeof loaded> | null = null;
	let rating: HTMLElement | null = null;
	function update(next: ReleaseCardProps) {
		props = next;
		const key = targetKey(props.target);
		if (renderedState !== props.state || renderedTarget !== key) {
			renderedState = props.state;
			renderedTarget = key;
			contentScope.dispose();
			contentScope = lifetime();
			content?.remove();
			loadedView =
				props.state.status === "found"
					? loaded(
							contentScope,
							announce,
							props.state.release,
							props.target,
							props.artist ?? NONE_ARTIST,
						)
					: null;
			content =
				loadedView?.element ??
				(props.state.status === "loading"
					? skeleton()
					: props.state.status !== "found"
						? message(
								props.state.status,
								props.onRetry ? () => props.onRetry?.() : undefined,
							)
						: null);
			if (content) region.after(content);
		} else {
			loadedView?.updateArtist(props.artist ?? NONE_ARTIST);
		}
		const showRating =
			props.showRating &&
			props.state.status === "found" &&
			props.onRate &&
			props.onDismissRating;
		if (showRating && !rating) {
			rating = ratingPrompt(
				() => props.onDismissRating?.(),
				() => props.onRate?.(),
			);
			root.append(rating);
		} else if (!showRating) {
			rating?.remove();
			rating = null;
		}
	}
	update(initial);
	return {
		element: root,
		update,
		dispose() {
			scope.dispose();
			contentScope.dispose();
		},
	};
}
