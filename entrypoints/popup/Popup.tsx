import { useCallback, useEffect, useId, useState } from "react";
import { BloomMark } from "../../components/icons";
import { type CardState, ReleaseCard } from "../../components/ReleaseCard";
import { t } from "../../lib/i18n";
import { lookup, readShortcut } from "../../lib/messages";
import { clearHistory, type HistoryEntry, readHistory } from "../../lib/storage";
import { type LookupTarget, targetFromInput, targetFromSpotifyPath } from "../../lib/target";

export default function Popup() {
	const inputId = useId();
	const errorId = useId();
	const [input, setInput] = useState("");
	const [invalid, setInvalid] = useState(false);
	const [current, setCurrent] = useState<{ state: CardState; target: LookupTarget } | null>(null);
	const [history, setHistory] = useState<HistoryEntry[]>([]);
	const [shortcut, setShortcut] = useState("Alt+Shift+D");

	const run = useCallback(async (target: LookupTarget) => {
		setCurrent({ state: { status: "loading" }, target });
		const state = await lookup(target);
		setCurrent({ state, target });
		setHistory(await readHistory());
	}, []);

	useEffect(() => {
		void readHistory().then(setHistory);
		void readShortcut().then(setShortcut);
		// Host access to open.spotify.com exposes that tab's URL; nothing else is read.
		void (async () => {
			const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
			if (!tab?.url) return;
			const url = new URL(tab.url);
			const target = url.hostname === "open.spotify.com" ? targetFromSpotifyPath(url.pathname) : null;
			if (target) await run(target);
		})();
	}, [run]);

	return (
		<main className="w-[25rem] p-5">
			<header className="flex items-center justify-between">
				<a
					className="kbd-focus -m-1 inline-flex items-center gap-2 rounded-sm p-1"
					href="https://dynamoi.com/?utm_source=chrome-extension&utm_medium=extension&utm_campaign=popup"
					rel="noopener noreferrer"
					target="_blank"
				>
					<BloomMark className="size-5" />
					<img alt="Dynamoi" className="h-3.5 w-auto" src="/dynamoi-wordmark.svg" />
				</a>
			</header>

			<form
				className="mt-5"
				noValidate
				onSubmit={(event) => {
					event.preventDefault();
					const target = targetFromInput(input);
					setInvalid(!target);
					if (target) void run(target);
				}}
			>
				<label className="text-label font-semibold text-quiet" htmlFor={inputId}>
					{t("popupInputLabel")}
				</label>
				<div className="mt-1.5 flex gap-2">
					<input
						aria-describedby={invalid ? errorId : undefined}
						aria-invalid={invalid}
						autoComplete="off"
						className="kbd-focus min-h-10 min-w-0 flex-1 rounded-sm bg-field px-3 text-body text-text caret-ember placeholder:text-faint aria-invalid:shadow-[0_0_0_2px_var(--color-danger)]"
						id={inputId}
						onChange={(event) => {
							setInput(event.target.value);
							setInvalid(false);
						}}
						placeholder={t("popupPlaceholder")}
						spellCheck={false}
						value={input}
					/>
					<button
						className="kbd-focus min-h-10 cursor-pointer rounded-sm bg-ember px-4 text-body font-semibold text-ink transition-colors duration-150 hover:bg-ember-hi"
						type="submit"
					>
						{t("popupSubmit")}
					</button>
				</div>
				{invalid ? (
					<p className="mt-2 text-label text-danger" id={errorId}>
						{t("popupInvalid")}
					</p>
				) : null}
			</form>

			{current ? (
				<div className="mt-5 rounded-md bg-surface p-4">
					<ReleaseCard
						onRetry={() => void run(current.target)}
						state={current.state}
						target={current.target}
					/>
				</div>
			) : null}

			<section aria-labelledby="recent-heading" className="mt-6">
				<div className="flex items-center justify-between">
					<h2 className="text-label font-semibold text-quiet" id="recent-heading">
						{t("popupRecent")}
					</h2>
					{history.length > 0 ? (
						<button
							className="kbd-focus cursor-pointer rounded-sm px-1 text-label text-quiet hover:text-text"
							onClick={() => {
								void clearHistory().then(() => setHistory([]));
							}}
							type="button"
						>
							{t("popupClearHistory")}
						</button>
					) : null}
				</div>
				{history.length > 0 ? (
					<ul className="-mx-2 mt-1.5 max-h-56 overflow-y-auto">
						{history.map((entry) => (
							<li key={`${entry.target.by}:${entry.target.value}`}>
								<button
									className="kbd-focus flex w-full cursor-pointer items-baseline gap-3 rounded-sm px-2 py-2 text-left transition-colors duration-150 hover:bg-hover"
									onClick={() => void run(entry.target)}
									type="button"
								>
									<span className="min-w-0 flex-1">
										<span className="block truncate text-body text-text">{entry.name ?? t("untitled")}</span>
										<span className="block truncate text-label text-muted">{entry.artists.join(", ")}</span>
									</span>
									{entry.code ? (
										<span className="tabular shrink-0 text-label text-quiet">{entry.code}</span>
									) : null}
								</button>
							</li>
						))}
					</ul>
				) : (
					<p className="mt-1.5 text-body text-muted">{t("popupEmptyHistory")}</p>
				)}
			</section>

			<footer className="mt-6 flex items-center justify-between gap-3 text-label text-quiet">
				<span>{t("shortcutHint", shortcut)}</span>
				<a
					className="kbd-focus shrink-0 rounded-sm underline-offset-4 hover:text-text hover:underline"
					href="https://dynamoi.com/?utm_source=chrome-extension&utm_medium=extension&utm_campaign=popup"
					rel="noopener noreferrer"
					target="_blank"
				>
					dynamoi.com
				</a>
			</footer>
		</main>
	);
}
