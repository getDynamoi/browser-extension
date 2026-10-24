import { type ReactNode, useEffect, useRef, useState } from "react";
import type { LookupResult, Release } from "../lib/api";
import { formatReleaseDate, t } from "../lib/i18n";
import { serviceName } from "../lib/services";
import { releaseSheet } from "../lib/sheet";
import type { LookupTarget } from "../lib/target";
import { CheckIcon, CopyIcon, ExternalIcon } from "./icons";

export type CardState = { status: "loading" } | LookupResult;

type ReleaseCardProps = {
	onDismissRating?: () => void;
	onRate?: () => void;
	onRetry?: () => void;
	showRating?: boolean;
	state: CardState;
	target: LookupTarget;
};

const PROMOTE_URL = "https://dynamoi.com/smart-campaigns";

function promoteUrl(itemType: string): string {
	const params = new URLSearchParams({
		utm_campaign: "release-card",
		utm_content: itemType,
		utm_medium: "extension",
		utm_source: "chrome-extension",
	});
	return `${PROMOTE_URL}?${params}`;
}

/** Announces copy confirmations to screen readers through one live region. */
function useAnnouncer() {
	const [message, setMessage] = useState("");
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	useEffect(() => () => {
		if (timer.current) clearTimeout(timer.current);
	}, []);
	return {
		announce(next: string) {
			setMessage(next);
			if (timer.current) clearTimeout(timer.current);
			timer.current = setTimeout(() => setMessage(""), 2000);
		},
		region: (
			<p aria-live="polite" className="sr-only" role="status">
				{message}
			</p>
		),
	};
}

function CopyButton({
	announce,
	label,
	text,
	children,
	className = "",
}: {
	announce: (message: string) => void;
	children?: ReactNode;
	className?: string;
	label: string;
	text: string;
}) {
	const [copied, setCopied] = useState(false);
	useEffect(() => {
		if (!copied) return;
		const id = setTimeout(() => setCopied(false), 1600);
		return () => clearTimeout(id);
	}, [copied]);
	return (
		<button
			aria-label={children ? undefined : t("copyField", label)}
			className={`kbd-focus inline-flex cursor-pointer items-center gap-1.5 transition-colors duration-150 ${className}`}
			onClick={async () => {
				try {
					await navigator.clipboard.writeText(text);
					setCopied(true);
					announce(t("copiedField", label));
				} catch {
					announce(t("copyFailed"));
				}
			}}
			type="button"
		>
			{copied ? (
				<CheckIcon className="size-4 shrink-0 text-success" />
			) : (
				<CopyIcon className="size-4 shrink-0" />
			)}
			{children ? (
				<span>{copied ? t("sheetCopied") : children}</span>
			) : null}
		</button>
	);
}

function FactRow({
	announce,
	label,
	value,
}: {
	announce: (message: string) => void;
	label: string;
	value: string;
}) {
	return (
		<div className="group flex min-h-9 items-center gap-3">
			<dt className="w-20 shrink-0 text-label text-quiet">{label}</dt>
			<dd className="min-w-0 flex-1 text-body text-text">{value}</dd>
			<CopyButton
				announce={announce}
				className="size-8 justify-center rounded-sm text-quiet hover:bg-hover hover:text-text"
				label={label}
				text={value}
			/>
		</div>
	);
}

function Loaded({
	announce,
	release,
	target,
}: {
	announce: (message: string) => void;
	release: Release;
	target: LookupTarget;
}) {
	const codeLabel = release.itemType === "album" ? t("fieldUpc") : t("fieldIsrc");
	const code = release.itemType === "album" ? release.upc : release.isrc;
	const released = formatReleaseDate(release.releaseDate);
	const kind = t(release.itemType === "album" ? "kindAlbum" : "kindTrack");
	const spotifyUrl =
		target.by === "spotify"
			? `https://open.spotify.com/${target.itemType}/${target.value}`
			: (release.links.find((link) => link.service === "spotify")?.url ?? null);
	const storeLinks = release.links.filter((link) => link.service !== "spotify");
	const artists = release.artists.join(", ");

	return (
		<div className="space-y-5">
			<div>
				<h2 className="line-clamp-2 text-section font-semibold text-balance text-text">
					{release.name ?? t("untitled")}
				</h2>
				<p className="mt-1 text-body text-muted">
					{artists ? `${kind} · ${artists}` : kind}
				</p>
			</div>

			<div className="flex items-center gap-3 rounded-md bg-sunken py-3 pr-2 pl-4">
				<div className="min-w-0 flex-1">
					<p className="text-label font-semibold text-quiet">{codeLabel}</p>
					{code ? (
						<p className="tabular mt-0.5 text-value font-medium tracking-wide break-all text-text select-all">
							{code}
						</p>
					) : (
						<p className="mt-0.5 text-body text-muted">{t("notAvailable")}</p>
					)}
				</div>
				{code ? (
					<CopyButton
						announce={announce}
						className="size-10 justify-center rounded-sm text-muted hover:bg-hover hover:text-text"
						label={codeLabel}
						text={code}
					/>
				) : null}
			</div>

			<dl>
				{release.label ? (
					<FactRow announce={announce} label={t("fieldLabel")} value={release.label} />
				) : null}
				{released ? (
					<FactRow announce={announce} label={t("fieldReleased")} value={released} />
				) : null}
				{artists ? (
					<FactRow announce={announce} label={t("fieldArtists")} value={artists} />
				) : null}
			</dl>

			{storeLinks.length > 0 ? (
				<section aria-labelledby="dynamoi-also-on">
					<h3 className="text-label font-semibold text-quiet" id="dynamoi-also-on">
						{t("alsoOn")}
					</h3>
					<ul className="mt-2 flex flex-wrap gap-1.5">
						{storeLinks.map((link) => (
							<li key={link.service}>
								<a
									className="kbd-focus inline-flex items-center gap-1 rounded-sm bg-raised px-2.5 py-1.5 text-body text-text transition-colors duration-150 hover:bg-hover"
									href={link.url}
									rel="noopener noreferrer"
									target="_blank"
								>
									{serviceName(link.service)}
									<ExternalIcon className="size-3 text-quiet" />
									<span className="sr-only">{t("opensInNewTab")}</span>
								</a>
							</li>
						))}
					</ul>
				</section>
			) : null}

			<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
				<CopyButton
					announce={announce}
					className="min-h-9 rounded-sm bg-raised px-3 text-body font-medium text-text hover:bg-hover"
					label={t("copySheet")}
					text={releaseSheet(release, spotifyUrl)}
				>
					{t("copySheet")}
				</CopyButton>
				<a
					className="kbd-focus inline-flex min-h-9 items-center gap-1 rounded-sm text-body text-ember underline-offset-4 hover:text-ember-hi hover:underline"
					href={promoteUrl(release.itemType)}
					rel="noopener noreferrer"
					target="_blank"
				>
					{t("promote")}
					<ExternalIcon className="size-3" />
					<span className="sr-only">{t("opensInNewTab")}</span>
				</a>
			</div>
		</div>
	);
}

function Skeleton() {
	return (
		<div aria-busy="true" className="space-y-5">
			<p className="sr-only" role="status">
				{t("loading")}
			</p>
			<div aria-hidden="true">
				<div className="skeleton h-5 w-3/4" />
				<div className="skeleton mt-2 h-4 w-1/2" />
			</div>
			<div aria-hidden="true" className="rounded-md bg-sunken px-4 py-3">
				<div className="skeleton h-3.5 w-10" />
				<div className="skeleton mt-2 h-6 w-48" />
			</div>
			<div aria-hidden="true" className="space-y-3">
				<div className="skeleton h-4 w-2/3" />
				<div className="skeleton h-4 w-1/2" />
			</div>
			<div aria-hidden="true" className="flex gap-1.5">
				<div className="skeleton h-8 w-24" />
				<div className="skeleton h-8 w-28" />
				<div className="skeleton h-8 w-16" />
			</div>
		</div>
	);
}

const MESSAGE_KEYS = {
	limited: ["limitedTitle", "limitedBody"],
	not_found: ["notFoundTitle", "notFoundBody"],
	offline: ["offlineTitle", "offlineBody"],
	unavailable: ["unavailableTitle", "unavailableBody"],
} as const;

function Message({
	onRetry,
	status,
}: {
	onRetry?: (() => void) | undefined;
	status: keyof typeof MESSAGE_KEYS;
}) {
	const [title, body] = MESSAGE_KEYS[status];
	return (
		<div role="status">
			<h2 className="text-section font-semibold text-text">{t(title)}</h2>
			<p className="mt-1 max-w-[34ch] text-body text-muted">{t(body)}</p>
			{onRetry && status !== "not_found" ? (
				<button
					className="kbd-focus mt-4 min-h-9 cursor-pointer rounded-sm bg-raised px-3 text-body font-medium text-text transition-colors duration-150 hover:bg-hover"
					onClick={onRetry}
					type="button"
				>
					{t("retry")}
				</button>
			) : null}
		</div>
	);
}

function RatingPrompt({
	onDismiss,
	onRate,
}: {
	onDismiss: () => void;
	onRate: () => void;
}) {
	return (
		<div className="mt-5 rounded-md bg-sunken px-4 py-3">
			<p className="text-body text-muted">{t("ratePrompt")}</p>
			<div className="mt-2 flex gap-2">
				<button
					className="kbd-focus min-h-9 cursor-pointer rounded-sm px-2 text-body font-medium text-ember hover:text-ember-hi"
					onClick={onRate}
					type="button"
				>
					{t("rateAction")}
				</button>
				<button
					className="kbd-focus min-h-9 cursor-pointer rounded-sm px-2 text-body text-muted hover:text-text"
					onClick={onDismiss}
					type="button"
				>
					{t("rateDismiss")}
				</button>
			</div>
		</div>
	);
}

export function ReleaseCard({
	onDismissRating,
	onRate,
	onRetry,
	showRating = false,
	state,
	target,
}: ReleaseCardProps) {
	const { announce, region } = useAnnouncer();
	return (
		<div>
			{region}
			{state.status === "loading" ? <Skeleton /> : null}
			{state.status === "found" ? (
				<Loaded announce={announce} release={state.release} target={target} />
			) : null}
			{state.status !== "loading" && state.status !== "found" ? (
				<Message onRetry={onRetry} status={state.status} />
			) : null}
			{showRating && state.status === "found" && onRate && onDismissRating ? (
				<RatingPrompt onDismiss={onDismissRating} onRate={onRate} />
			) : null}
		</div>
	);
}
