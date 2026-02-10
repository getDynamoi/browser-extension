import type { AlbumData } from "../../../lib/types";
import PopularityMeter from "./PopularityMeter";

type AlbumOverlayProps = {
	data: AlbumData;
};

export default function AlbumOverlay({ data }: AlbumOverlayProps) {
	return (
		<div className="space-y-3">
			{data.label && (
				<div>
					<p className="text-[14px] font-semibold text-text-primary leading-snug">
						{data.label}
					</p>
					{data.artistNames.length > 0 && (
						<p className="text-[12px] text-text-secondary mt-0.5">
							{data.artistNames.join(", ")}
						</p>
					)}
					<div className="flex items-center gap-3 mt-1">
						{data.albumType && (
							<span className="text-[11px] text-text-secondary capitalize">
								{data.albumType}
							</span>
						)}
						{data.totalTracks !== null && (
							<span className="text-[11px] text-text-secondary">
								{data.totalTracks} tracks
							</span>
						)}
						{data.releaseDate && (
							<span className="text-[11px] text-text-secondary">
								{data.releaseDate}
							</span>
						)}
					</div>
				</div>
			)}

			{data.popularity !== null && <PopularityMeter value={data.popularity} />}

			{data.externalIds?.upc && (
				<div className="section-card flex items-center justify-between">
					<span className="text-[11px] text-text-secondary">UPC</span>
					<span className="text-[12px] font-mono text-text-primary tracking-wide select-all">
						{data.externalIds.upc}
					</span>
				</div>
			)}

			{data.copyrights.length > 0 && (
				<p className="text-[10px] text-text-muted leading-relaxed">
					{data.copyrights[0]?.text}
				</p>
			)}
		</div>
	);
}
