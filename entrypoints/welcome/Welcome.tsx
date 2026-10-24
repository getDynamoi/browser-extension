import { useEffect, useState } from "react";
import { BloomMark } from "../../components/icons";
import { t } from "../../lib/i18n";
import { readShortcut } from "../../lib/messages";

export default function Welcome() {
	const [shortcut, setShortcut] = useState("Alt+Shift+D");
	useEffect(() => {
		document.title = t("welcomeTitle");
		void readShortcut().then(setShortcut);
	}, []);

	const steps = [
		[t("welcomeOpenTitle"), t("welcomeOpenBody")],
		[t("welcomePinTitle"), t("welcomePinBody")],
		[t("welcomeShortcutTitle"), t("welcomeShortcutBody", shortcut)],
	] as const;

	return (
		<main className="mx-auto max-w-[40rem] px-6 pt-[12vh] pb-16">
			<div className="flex items-center gap-3">
				<BloomMark className="size-10" />
				<img alt="Dynamoi" className="h-6 w-auto" src="/dynamoi-wordmark.svg" />
			</div>
			<h1 className="mt-10 text-title font-semibold tracking-[-0.01em] text-balance">
				{t("welcomeTitle")}
			</h1>
			<p className="mt-3 max-w-[60ch] text-section text-muted">{t("welcomeBody")}</p>

			<ol className="mt-10 space-y-6">
				{steps.map(([title, body]) => (
					<li key={title}>
						<h2 className="text-section font-semibold">{title}</h2>
						<p className="mt-1 max-w-[60ch] text-body text-muted">{body}</p>
					</li>
				))}
			</ol>

			<div className="mt-10 rounded-md bg-surface px-5 py-4">
				<h2 className="text-body font-semibold">{t("welcomePrivacyTitle")}</h2>
				<p className="mt-1 max-w-[62ch] text-body text-muted">{t("welcomePrivacyBody")}</p>
			</div>

			<div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
				<a
					className="kbd-focus inline-flex min-h-11 items-center rounded-sm bg-ember px-5 text-body font-semibold text-ink transition-colors duration-150 hover:bg-ember-hi"
					href="https://open.spotify.com"
				>
					{t("welcomeCta")}
				</a>
				<a
					className="kbd-focus rounded-sm text-body text-muted underline-offset-4 hover:text-text hover:underline"
					href="https://dynamoi.com/?utm_source=chrome-extension&utm_medium=extension&utm_campaign=welcome"
					rel="noopener noreferrer"
					target="_blank"
				>
					{t("welcomeAbout")}
				</a>
			</div>
		</main>
	);
}
