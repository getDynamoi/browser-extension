import { useEffect, useState } from "react";
import { browser } from "../lib/browser";
import { t } from "../lib/i18n";

const origins = ["https://open.spotify.com/*", "https://dynamoi.com/*"];

/** Firefox hosts can be withheld at install or revoked later. */
export default function SiteAccess() {
	const [granted, setGranted] = useState(true);
	useEffect(() => {
		const refresh = () =>
			void browser.permissions.contains({ origins }).then(setGranted);
		refresh();
		browser.permissions.onAdded.addListener(refresh);
		browser.permissions.onRemoved.addListener(refresh);
		return () => {
			browser.permissions.onAdded.removeListener(refresh);
			browser.permissions.onRemoved.removeListener(refresh);
		};
	}, []);

	if (granted) return null;
	return (
		<section className="mt-5" aria-label={t("firefoxAccessTitle")}>
			<p className="text-body text-muted">{t("firefoxAccessBody")}</p>
			<button
				className="kbd-focus mt-3 min-h-11 cursor-pointer rounded-sm bg-ember px-4 text-body font-semibold text-ink hover:bg-ember-hi"
				type="button"
				onClick={() => {
					void browser.permissions
						.request({ origins })
						.then(setGranted, () => setGranted(false));
				}}
			>
				{t("firefoxAccessTitle")}
			</button>
		</section>
	);
}
