import { BloomMark, CloseIcon } from "../../components/icons";
import {
	type ArtistState,
	type CardState,
	ReleaseCard,
} from "../../components/ReleaseCard";
import {
	attributes,
	button,
	element,
	externalLink,
	type View,
} from "../../lib/dom";
import { t, uiLanguage } from "../../lib/i18n";
import type { LookupTarget } from "../../lib/target";

export type CardModel = {
	artist: ArtistState;
	showRating: boolean;
	state: CardState;
};
type CardProps = {
	autoFocus: boolean;
	model: CardModel;
	onClose: () => void;
	onDismissRating: () => void;
	onRate: () => void;
	onRetry: () => void;
	target: LookupTarget;
	wordmarkUrl: string;
};
export type CardView = View & { update: (props: CardProps) => void };

/** Floating release card on open.spotify.com, inside WXT's isolated shadow root. */
export function Card(initial: CardProps): CardView {
	let props = initial;
	let disposed = false;
	const root = attributes(
		element(
			"aside",
			"card-root animate-card-in kbd-focus fixed top-18 right-4 z-[2147483000] max-h-[calc(100svh-6rem)] w-[22.5rem] overflow-y-auto overscroll-contain rounded-card bg-surface p-5 shadow-pop",
		),
		{ "aria-label": t("cardLabel"), lang: uiLanguage(), tabindex: -1 },
	);
	root.addEventListener("keydown", (event) => {
		if (event.key === "Escape") props.onClose();
	});
	const image = element("img", "h-3.5 w-auto");
	image.alt = "Dynamoi";
	image.src = props.wordmarkUrl;
	const close = button(
		"kbd-focus -mr-1.5 inline-flex size-8 cursor-pointer items-center justify-center rounded-sm text-quiet transition-colors duration-150 hover:bg-hover hover:text-text",
		CloseIcon("size-4"),
		() => props.onClose(),
	);
	close.setAttribute("aria-label", t("close"));
	root.append(
		element(
			"div",
			"mb-4 flex items-center justify-between",
			externalLink(
				"kbd-focus -m-1 inline-flex items-center gap-2 rounded-sm p-1",
				"https://dynamoi.com/?utm_source=chrome-extension&utm_medium=extension&utm_campaign=card-logo",
				BloomMark("size-5"),
				image,
			),
			close,
		),
	);
	function releaseProps() {
		return {
			artist: props.model.artist,
			onDismissRating: () => props.onDismissRating(),
			onRate: () => props.onRate(),
			onRetry: () => props.onRetry(),
			showRating: props.model.showRating,
			state: props.model.state,
			target: props.target,
		};
	}
	const release = ReleaseCard(releaseProps());
	root.append(release.element);
	function update(next: CardProps) {
		props = next;
		release.update(releaseProps());
		if (props.autoFocus)
			queueMicrotask(() => {
				if (!disposed && root.isConnected) root.focus();
			});
	}
	update(initial);
	return {
		element: root,
		update,
		dispose() {
			disposed = true;
			release.dispose();
		},
	};
}
