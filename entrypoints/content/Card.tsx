import { useEffect, useRef } from "react";
import { BloomMark, CloseIcon } from "../../components/icons";
import { type ArtistState, type CardState, ReleaseCard } from "../../components/ReleaseCard";
import { t } from "../../lib/i18n";
import type { LookupTarget } from "../../lib/target";

export type CardModel = { artist: ArtistState; showRating: boolean; state: CardState };

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

/** Floating release card on open.spotify.com (rendered in a shadow root). */
export function Card({
	autoFocus,
	model,
	onClose,
	onDismissRating,
	onRate,
	onRetry,
	target,
	wordmarkUrl,
}: CardProps) {
	const regionRef = useRef<HTMLElement>(null);
	useEffect(() => {
		if (autoFocus) regionRef.current?.focus();
	}, [autoFocus]);

	return (
		<aside
			aria-label={t("cardLabel")}
			className="card-root animate-card-in kbd-focus fixed top-18 right-4 z-[2147483000] max-h-[calc(100vh-6rem)] w-[22.5rem] overflow-y-auto rounded-card bg-surface p-5 shadow-pop"
			onKeyDown={(event) => {
				if (event.key === "Escape") onClose();
			}}
			ref={regionRef}
			tabIndex={-1}
		>
			<div className="mb-4 flex items-center justify-between">
				<a
					className="kbd-focus -m-1 inline-flex items-center gap-2 rounded-sm p-1"
					href="https://dynamoi.com/?utm_source=chrome-extension&utm_medium=extension&utm_campaign=card-logo"
					rel="noopener noreferrer"
					target="_blank"
				>
					<BloomMark className="size-5" />
					<img alt="Dynamoi" className="h-3.5 w-auto" src={wordmarkUrl} />
				</a>
				<button
					aria-label={t("close")}
					className="kbd-focus -mr-1.5 inline-flex size-8 cursor-pointer items-center justify-center rounded-sm text-quiet transition-colors duration-150 hover:bg-hover hover:text-text"
					onClick={onClose}
					type="button"
				>
					<CloseIcon className="size-4" />
				</button>
			</div>
			<ReleaseCard
				artist={model.artist}
				onDismissRating={onDismissRating}
				onRate={onRate}
				onRetry={onRetry}
				showRating={model.showRating}
				state={model.state}
				target={target}
			/>
		</aside>
	);
}
