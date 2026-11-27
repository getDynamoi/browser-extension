import SiteAccess from "../../components/SiteAccess";
import { BloomMark } from "../../components/icons";
import {
	type ArtistState,
	type CardState,
	ReleaseCard,
	type ReleaseCardView,
} from "../../components/ReleaseCard";
import { browser } from "../../lib/browser";
import {
	attributes,
	button,
	element,
	externalLink,
	type View,
} from "../../lib/dom";
import { t } from "../../lib/i18n";
import { lookup, lookupArtist, readShortcut } from "../../lib/messages";
import {
	clearHistory,
	type HistoryEntry,
	readHistory,
} from "../../lib/storage";
import {
	type LookupTarget,
	targetFromInput,
	targetFromSpotifyPath,
} from "../../lib/target";

export default function Popup(): View {
	const inputId = "dynamoi-lookup-input";
	const errorId = "dynamoi-lookup-error";
	let disposed = false;
	let lookupRevision = 0;
	let historyRevision = 0;
	let current: {
		artist: ArtistState;
		state: CardState;
		target: LookupTarget;
	} | null = null;
	let releaseView: ReleaseCardView | null = null;
	const main = element("main", "w-[25rem] p-5");
	const image = element("img", "h-3.5 w-auto");
	image.alt = "Dynamoi";
	image.src = "/dynamoi-wordmark.svg";
	main.append(
		element(
			"header",
			"flex items-center justify-between",
			externalLink(
				"kbd-focus -m-1 inline-flex items-center gap-2 rounded-sm p-1",
				"https://dynamoi.com/?utm_source=chrome-extension&utm_medium=extension&utm_campaign=popup",
				BloomMark("size-5"),
				image,
			),
		),
	);
	const access = import.meta.env.FIREFOX ? SiteAccess() : null;
	if (access) main.append(access.element);
	const form = element("form", "mt-5");
	form.noValidate = true;
	const label = element(
		"label",
		"text-label font-semibold text-quiet",
		t("popupInputLabel"),
	);
	label.htmlFor = inputId;
	const input = attributes(
		element(
			"input",
			"kbd-focus min-h-10 min-w-0 flex-1 rounded-sm bg-field px-3 text-body text-text caret-ember placeholder:text-faint aria-invalid:shadow-[0_0_0_2px_var(--color-danger)]",
		),
		{ id: inputId, "aria-invalid": false, autocomplete: "off" },
	);
	input.placeholder = t("popupPlaceholder");
	input.spellcheck = false;
	const submit = element(
		"button",
		"kbd-focus min-h-10 cursor-pointer rounded-sm bg-ember px-4 text-body font-semibold text-ink transition-colors duration-150 hover:bg-ember-hi",
		t("popupSubmit"),
	);
	submit.type = "submit";
	const error = attributes(
		element("p", "mt-2 text-label text-danger", t("popupInvalid")),
		{ id: errorId },
	);
	function setInvalid(invalid: boolean) {
		input.setAttribute("aria-invalid", String(invalid));
		if (invalid) {
			input.setAttribute("aria-describedby", errorId);
			form.append(error);
		} else {
			input.removeAttribute("aria-describedby");
			error.remove();
		}
	}
	input.addEventListener("input", () => setInvalid(false));
	form.append(label, element("div", "mt-1.5 flex gap-2", input, submit));
	form.addEventListener("submit", (event) => {
		event.preventDefault();
		const target = targetFromInput(input.value);
		setInvalid(!target);
		if (target) void run(target);
		else
			requestAnimationFrame(() => {
				if (!disposed) input.focus();
			});
	});
	main.append(form);
	const resultAnchor = document.createTextNode("");
	main.append(resultAnchor);
	let result: HTMLElement | null = null;
	function renderCurrent() {
		if (!current) return;
		const props = {
			artist: current.artist,
			onRetry: () => {
				if (current) void run(current.target);
			},
			state: current.state,
			target: current.target,
		};
		if (releaseView) releaseView.update(props);
		else {
			releaseView = ReleaseCard(props);
			result = element(
				"div",
				"mt-5 rounded-md bg-surface p-4",
				releaseView.element,
			);
			resultAnchor.before(result);
		}
	}
	const recent = attributes(element("section", "mt-6"), {
		"aria-labelledby": "recent-heading",
	});
	function renderHistory(history: HistoryEntry[]) {
		const heading = element(
			"div",
			"flex items-center justify-between",
			attributes(
				element("h2", "text-label font-semibold text-quiet", t("popupRecent")),
				{ id: "recent-heading" },
			),
		);
		if (history.length) {
			heading.append(
				button(
					"kbd-focus cursor-pointer rounded-sm px-1 text-label text-quiet hover:text-text",
					t("popupClearHistory"),
					() => {
						const revision = ++historyRevision;
						void (async () => {
							await clearHistory();
							if (!disposed && revision === historyRevision) renderHistory([]);
						})();
					},
				),
			);
		}
		recent.replaceChildren(heading);
		recent.append(
			history.length > 0
				? element(
						"ul",
						"-mx-2 mt-1.5 max-h-56 overflow-y-auto overscroll-contain",
						...history.map((entry) => {
							const row = button(
								"kbd-focus flex w-full cursor-pointer items-baseline gap-3 rounded-sm px-2 py-2 text-left transition-colors duration-150 hover:bg-hover",
								element(
									"span",
									"min-w-0 flex-1",
									element(
										"span",
										"block truncate text-body text-text",
										entry.name ?? t("untitled"),
									),
									element(
										"span",
										"block truncate text-label text-muted",
										entry.artists.join(", "),
									),
								),
								() => void run(entry.target),
							);
							if (entry.code)
								row.append(
									element(
										"span",
										"tabular shrink-0 text-label text-quiet",
										entry.code,
									),
								);
							return element("li", "", row);
						}),
					)
				: element("p", "mt-1.5 text-body text-muted", t("popupEmptyHistory")),
		);
	}
	renderHistory([]);
	main.append(recent);
	const shortcut = element("span", "", t("shortcutHint", "Alt+Shift+D"));
	main.append(
		element(
			"footer",
			"mt-6 flex items-center justify-between gap-3 text-label text-quiet",
			shortcut,
			externalLink(
				"kbd-focus shrink-0 rounded-sm underline-offset-4 hover:text-text hover:underline",
				"https://dynamoi.com/?utm_source=chrome-extension&utm_medium=extension&utm_campaign=popup",
				"dynamoi.com",
			),
		),
	);
	async function refreshHistory() {
		const revision = ++historyRevision;
		const history = await readHistory();
		if (!disposed && revision === historyRevision) renderHistory(history);
	}
	async function run(target: LookupTarget) {
		const revision = ++lookupRevision;
		current = {
			artist: { status: "none" },
			state: { status: "loading" },
			target,
		};
		renderCurrent();
		const state = await lookup(target);
		if (disposed || revision !== lookupRevision) return;
		const artistKey = state.status === "found" ? state.release.artistKey : null;
		current = {
			artist: artistKey ? { status: "loading" } : { status: "none" },
			state,
			target,
		};
		renderCurrent();
		await refreshHistory();
		if (!artistKey || disposed || revision !== lookupRevision) return;
		const artist = await lookupArtist(artistKey);
		if (disposed || revision !== lookupRevision || !current) return;
		current = { ...current, artist };
		renderCurrent();
	}
	void refreshHistory();
	void (async () => {
		const value = await readShortcut();
		if (!disposed) shortcut.textContent = t("shortcutHint", value);
	})();
	// Host access exposes only the active Spotify tab's URL.
	void (async () => {
		const revision = lookupRevision;
		const [tab] = await browser.tabs.query({
			active: true,
			currentWindow: true,
		});
		if (disposed || revision !== lookupRevision || !tab?.url) return;
		const url = new URL(tab.url);
		const target =
			url.hostname === "open.spotify.com"
				? targetFromSpotifyPath(url.pathname)
				: null;
		if (target) await run(target);
	})();
	return {
		element: main,
		dispose() {
			disposed = true;
			lookupRevision++;
			historyRevision++;
			releaseView?.dispose();
			access?.dispose();
		},
	};
}
