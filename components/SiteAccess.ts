import { browser } from "../lib/browser";
import { button, element, type View } from "../lib/dom";
import { t } from "../lib/i18n";

const origins = ["https://open.spotify.com/*", "https://dynamoi.com/*"];

/** Firefox hosts can be withheld at install or revoked later. */
export default function SiteAccess(): View {
	const node = element("section", "mt-5");
	node.setAttribute("aria-label", t("firefoxAccessTitle"));
	node.hidden = true;
	let disposed = false;
	const description = element(
		"p",
		"text-body text-muted",
		t("firefoxAccessBody"),
	);
	const request = button(
		"kbd-focus mt-3 min-h-11 cursor-pointer rounded-sm bg-ember px-4 text-body font-semibold text-ink hover:bg-ember-hi",
		t("firefoxAccessTitle"),
		() => {
			void browser.permissions
				.request({ origins })
				.then(setGranted, () => setGranted(false));
		},
	);
	function setGranted(granted: boolean) {
		if (disposed) return;
		node.hidden = granted;
		if (granted) node.replaceChildren();
		else node.replaceChildren(description, request);
	}
	const refresh = () =>
		void browser.permissions.contains({ origins }).then(setGranted);
	refresh();
	browser.permissions.onAdded.addListener(refresh);
	browser.permissions.onRemoved.addListener(refresh);
	return {
		element: node,
		dispose() {
			disposed = true;
			browser.permissions.onAdded.removeListener(refresh);
			browser.permissions.onRemoved.removeListener(refresh);
		},
	};
}
