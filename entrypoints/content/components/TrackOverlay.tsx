import type { TrackData } from "../../../lib/types";
import AudioFeatures from "./AudioFeatures";
import GenreTags from "./GenreTags";
import PopularityMeter from "./PopularityMeter";

type TrackOverlayProps = {
	data: TrackData;
};

function formatDuration(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function TrackOverlay({ data }: TrackOverlayProps) {
	return (
		<div className="space-y-3">
			{data.trackName && (
				<div>
					<div className="flex items-center gap-2">
						<p className="text-[14px] font-semibold text-text-primary leading-snug">
							{data.trackName}
						</p>
						{data.explicit && (
							<span className="text-[9px] font-bold text-text-muted bg-surface-muted/80 px-1.5 py-0.5 rounded uppercase tracking-wider">
								E
							</span>
						)}
					</div>
					{data.artistNames.length > 0 && (
						<p className="text-[12px] text-text-secondary mt-0.5">
							{data.artistNames.join(", ")}
						</p>
					)}
					{data.albumName && (
						<p className="text-[11px] text-text-muted mt-0.5">
							{data.albumName}
						</p>
					)}
				</div>
			)}

			{(data.durationMs !== null || data.trackNumber !== null) && (
				<div className="flex items-center gap-3">
					{data.durationMs !== null && (
						<span className="text-[11px] text-text-secondary">
							{formatDuration(data.durationMs)}
						</span>
					)}
					{data.trackNumber !== null && (
						<span className="text-[11px] text-text-secondary">
							Track {data.trackNumber}
							{data.discNumber !== null && data.discNumber > 1 && (
								<span className="text-text-muted"> · Disc {data.discNumber}</span>
							)}
						</span>
					)}
				</div>
			)}

			{data.popularity !== null && <PopularityMeter value={data.popularity} />}

			<GenreTags genres={data.artistGenres} />

			{data.isrc && (
				<div className="section-card flex items-center justify-between">
					<span className="text-[11px] text-text-secondary">ISRC</span>
					<span className="text-[12px] font-mono text-text-primary tracking-wide select-all">
						{data.isrc}
					</span>
				</div>
			)}

			<AudioFeatures features={data.audioFeatures} />
		</div>
	);
}
