import SiteAccess from "../../components/SiteAccess";
import { BloomMark } from "../../components/icons";
import { element, externalLink, type View } from "../../lib/dom";
import { t } from "../../lib/i18n";
import { readShortcut } from "../../lib/messages";

export default function Welcome(): View {
	const main = element("main", "mx-auto max-w-[40rem] px-6 pt-[12svh] pb-16");
	const image = element("img", "h-6 w-auto");
	image.alt = "Dynamoi";
	image.src = "/dynamoi-wordmark.svg";
	main.append(
		element("div", "flex items-center gap-3", BloomMark("size-10"), image),
		element(
			"h1",
			"mt-10 text-title font-semibold tracking-[-0.01em] text-balance",
			t("welcomeTitle"),
		),
		element("p", "mt-3 max-w-[60ch] text-section text-muted", t("welcomeBody")),
	);
	document.title = t("welcomeTitle");
	const access = import.meta.env.FIREFOX ? SiteAccess() : null;
	if (access) main.append(access.element);
	const shortcutBody = element(
		"p",
		"mt-1 max-w-[60ch] text-body text-muted",
		t("welcomeShortcutBody", "Alt+Shift+D"),
	);
	const steps = [
		[
			t("welcomeOpenTitle"),
			element(
				"p",
				"mt-1 max-w-[60ch] text-body text-muted",
				t("welcomeOpenBody"),
			),
		],
		[
			t("welcomePinTitle"),
			element(
				"p",
				"mt-1 max-w-[60ch] text-body text-muted",
				t(import.meta.env.FIREFOX ? "firefoxPinBody" : "welcomePinBody"),
			),
		],
		[t("welcomeShortcutTitle"), shortcutBody],
	] as const;
	main.append(
		element(
			"ol",
			"mt-10 space-y-6",
			...steps.map(([title, body]) =>
				element(
					"li",
					"",
					element("h2", "text-section font-semibold", title),
					body,
				),
			),
		),
		element(
			"div",
			"mt-10 rounded-md bg-surface px-5 py-4",
			element("h2", "text-body font-semibold", t("welcomePrivacyTitle")),
			element(
				"p",
				"mt-1 max-w-[62ch] text-body text-muted",
				t("welcomePrivacyBody"),
			),
		),
	);
	const spotify = element(
		"a",
		"kbd-focus inline-flex min-h-11 items-center rounded-sm bg-ember px-5 text-body font-semibold text-ink transition-colors duration-150 hover:bg-ember-hi",
		t("welcomeCta"),
	);
	spotify.href = "https://open.spotify.com";
	main.append(
		element(
			"div",
			"mt-10 flex flex-wrap items-center gap-x-6 gap-y-3",
			spotify,
			externalLink(
				"kbd-focus rounded-sm text-body text-muted underline-offset-4 hover:text-text hover:underline",
				"https://dynamoi.com/?utm_source=chrome-extension&utm_medium=extension&utm_campaign=welcome",
				t("welcomeAbout"),
			),
		),
	);
	let disposed = false;
	void (async () => {
		const shortcut = await readShortcut();
		if (!disposed)
			shortcutBody.textContent = t("welcomeShortcutBody", shortcut);
	})();
	return {
		element: main,
		dispose() {
			disposed = true;
			access?.dispose();
		},
	};
}
