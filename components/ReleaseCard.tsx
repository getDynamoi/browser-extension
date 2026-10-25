import { type ReactNode, useEffect, useRef, useState } from "react";
import type { ArtistResult, LookupResult, Release, Sound } from "../lib/api";
import { formatReleaseDate, t } from "../lib/i18n";
import { serviceName } from "../lib/services";
import { releaseSheet } from "../lib/sheet";
import type { LookupTarget } from "../lib/target";
import { CheckIcon, ChevronIcon, CopyIcon, ExternalIcon } from "./icons";
import { camelot, countryFlag, countryName, formatCompact, formatDuration, formatShortDate, keyName } from "../lib/music";

export type CardState = { status: "loading" } | LookupResult;

type ReleaseCardProps = {
	artist?: ArtistState;
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
	note,
	value,
}: {
	announce?: (message: string) => void;
	label: string;
	note?: string | null | undefined;
	value: string;
}) {
	return (
		<div className="group flex min-h-9 items-center gap-3 py-0.5">
			<dt className="w-20 shrink-0 text-label text-quiet">{label}</dt>
			<dd className="min-w-0 flex-1 text-body text-text">
				{value}
				{note ? <span className="block text-label text-muted">{note}</span> : null}
			</dd>
			{announce ? (
				<CopyButton
					announce={announce}
					className="size-8 justify-center rounded-sm text-quiet hover:bg-hover hover:text-text"
					label={label}
					text={value}
				/>
			) : (
				<span aria-hidden="true" className="size-8 shrink-0" />
			)}
		</div>
	);
}

function SectionHeading({ id, children, aside }: { aside?: ReactNode; children: ReactNode; id: string }) {
	return (
		<div className="flex items-baseline justify-between gap-3">
			<h3 className="text-label font-semibold text-quiet" id={id}>
				{children}
			</h3>
			{aside ? <span className="text-label text-muted">{aside}</span> : null}
		</div>
	);
}

function Meter({ label, value }: { label: string; value: number }) {
	const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
	return (
		<>
			<span className="text-body text-muted">{label}</span>
			<span
				aria-label={label}
				aria-valuemax={100}
				aria-valuemin={0}
				aria-valuenow={pct}
				className="h-1 overflow-hidden rounded-full bg-raised"
				role="meter"
			>
				<span className="block h-full rounded-full bg-muted" style={{ width: `${pct}%` }} />
			</span>
			<span className="tabular text-right text-body text-text">{pct}</span>
		</>
	);
}

function SoundSection({ sound }: { sound: Sound }) {
	const stats = [
		[String(Math.round(sound.bpm)), t("soundBpm")],
		[keyName(sound), t("soundKey")],
		[camelot(sound), t("soundCamelot")],
	] as const;
	return (
		<section aria-labelledby="dynamoi-sound">
			<SectionHeading aside={t("soundEstimated")} id="dynamoi-sound">
				{t("soundTitle")}
			</SectionHeading>
			<dl className="mt-1.5 grid grid-cols-3 gap-x-4">
				{stats.map(([value, label]) => (
					<div className="flex flex-col-reverse" key={label}>
						<dt className="text-label text-muted">{label}</dt>
						<dd className="tabular text-section font-semibold text-text">{value}</dd>
					</div>
				))}
			</dl>
			<div className="mt-2 grid grid-cols-[6.5rem_1fr_1.75rem] items-center gap-x-3 gap-y-1">
				<Meter label={t("soundEnergy")} value={sound.energy} />
				<Meter label={t("soundDanceability")} value={sound.danceability} />
				<Meter label={t("soundPositivity")} value={sound.valence} />
			</div>
		</section>
	);
}

export type ArtistState = { status: "loading" } | ArtistResult;

function ArtistSection({ name, state }: { name: string; state: ArtistState }) {
	const [open, setOpen] = useState(false);
	if (state.status === "none") return null;
	const artist = state.status === "found" ? state.artist : null;
	const summary = artist
		? [
				artist.monthlyListeners !== null
					? t("artistListeners", formatCompact(artist.monthlyListeners))
					: null,
				artist.country ? `${countryFlag(artist.country)} ${countryName(artist.country)}` : null,
			]
				.filter(Boolean)
				.join(" · ")
		: null;
	const canOpen = Boolean(artist && (artist.genres.length > 0 || artist.topCities.length > 0));
	return (
		<section aria-busy={!artist} aria-label={t("artistTitle")}>
			<button
				aria-controls="dynamoi-artist-detail"
				aria-expanded={open}
				className="kbd-focus -mx-2 -my-1.5 flex w-[calc(100%+1rem)] cursor-pointer items-center gap-3 rounded-sm px-2 py-1.5 text-left transition-colors duration-150 enabled:hover:bg-hover disabled:cursor-default"
				disabled={!canOpen}
				onClick={() => setOpen((value) => !value)}
				type="button"
			>
				<span className="min-w-0 flex-1">
					<span className="block truncate text-body font-medium text-text">{artist?.name ?? name}</span>
					{artist ? (
						summary ? (
							<span className="tabular mt-0.5 block truncate text-label text-muted">{summary}</span>
						) : null
					) : (
						<span aria-hidden="true" className="skeleton mt-1.5 block h-3 w-44" />
					)}
				</span>
				{canOpen ? (
					<ChevronIcon
						className={`size-4 shrink-0 text-quiet transition-transform duration-200 ${open ? "rotate-180" : ""}`}
					/>
				) : null}
			</button>
			{open && artist ? (
				<div className="mt-2 space-y-3" id="dynamoi-artist-detail">
					{artist.genres.length > 0 ? (
						<p className="text-body text-text">{artist.genres.join(", ")}</p>
					) : null}
					{artist.topCities.length > 0 ? (
						<div>
							<SectionHeading
								aside={artist.listenersAsOf ? t("asOf", formatShortDate(artist.listenersAsOf)) : null}
								id="dynamoi-cities"
							>
								{t("artistTopCities")}
							</SectionHeading>
							<ol aria-labelledby="dynamoi-cities" className="mt-1.5 space-y-1">
								{artist.topCities.map((city) => (
									<li className="grid grid-cols-[1fr_auto] items-baseline gap-x-3" key={`${city.city}-${city.country}`}>
										<span className="truncate text-body text-text">
											<span aria-hidden="true">{countryFlag(city.country)} </span>
											{city.city}
										</span>
										<span className="tabular text-body text-muted">{formatCompact(city.listeners)}</span>
</li>
								))}
							</ol>
						</div>
					) : null}
				</div>
			) : null}
		</section>
	);
}

function Loaded({
	announce,
	artist,
	release,
	target,
}: {
	announce: (message: string) => void;
	artist: ArtistState;
	release: Release;
	target: LookupTarget;
}) {
	const isAlbum = release.itemType === "album";
	const codeLabel = isAlbum ? t("fieldUpc") : t("fieldIsrc");
	const code = isAlbum ? release.upc : release.isrc;
	const released = formatReleaseDate(release.releaseDate);
	const kind = t(isAlbum ? "kindAlbum" : "kindTrack");
	const spotifyUrl =
		target.by === "spotify"
			? `https://open.spotify.com/${target.itemType}/${target.value}`
			: (release.links.find((link) => link.service === "spotify")?.url ?? null);
	const storeLinks = release.links.filter((link) => link.service !== "spotify");
	const artists = release.artists.join(", ");
	const meta = [
		isAlbum && release.totalTracks ? t("albumTracks", String(release.totalTracks)) : null,
		isAlbum ? released : null,
		!isAlbum && release.durationSec ? formatDuration(release.durationSec) : null,
	].filter((value): value is string => Boolean(value));
	const producers = release.producers?.join(", ");
	const playlists = release.playlists;

	return (
		<div className="space-y-4">
			<div>
				<h2 className="line-clamp-2 text-section font-semibold text-balance text-text">
					{release.name ?? t("untitled")}
				</h2>
				<p className="mt-1 text-body text-muted">
					{artists ? `${kind} · ${artists}` : kind}
				</p>
				{release.explicit || meta.length > 0 ? (
					<p className="tabular mt-0.5 flex items-center gap-2 text-body text-muted">
						{release.explicit ? (
							<span className="font-semibold text-text">{t("explicit")}</span>
						) : null}
						{release.explicit && meta.length > 0 ? <span aria-hidden="true">·</span> : null}
						{meta.join(" · ")}
					</p>
				) : null}
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

			{release.sound ? <SoundSection sound={release.sound} /> : null}

			<dl>
				{release.label ? (
					<FactRow announce={announce} label={t("fieldLabel")} value={release.label} />
				) : null}
				{release.distributor ? (
					<FactRow announce={announce} label={t("fieldDistributor")} note={t("distributorNote")} value={release.distributor} />
				) : null}
				{release.pLine ? (
					<FactRow announce={announce} label={t("fieldPLine")} value={release.pLine} />
				) : null}
				{released && !isAlbum ? (
					<FactRow announce={announce} label={t("fieldReleased")} value={released} />
				) : null}
				{producers ? (
					<FactRow announce={announce} label={t("fieldProducers")} value={producers} />
				) : null}
				{playlists ? (
					<FactRow
						label={t("fieldPlaylists")}
						value={t("playlistSummary", [formatCompact(playlists.count), String(playlists.editorial)])}
					/>
				) : null}
			</dl>

			{release.artists[0] ? (
				<ArtistSection key={release.artistKey ?? ""} name={release.artists[0]} state={artist} />
			) : null}

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
					aria-label={`${t("promote")} ${t("opensInNewTab")}`}
					className="kbd-focus inline-flex min-h-9 items-center gap-1 rounded-sm text-body text-ember underline-offset-4 hover:text-ember-hi hover:underline"
					href={promoteUrl(release.itemType)}
					rel="noopener noreferrer"
					target="_blank"
				>
					{t("promoteShort")}
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
	artist = { status: "none" },
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
				<Loaded announce={announce} artist={artist} release={state.release} target={target} />
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
