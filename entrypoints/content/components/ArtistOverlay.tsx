import type { ArtistData } from "../../../lib/types";
import GenreTags from "./GenreTags";
import PopularityMeter from "./PopularityMeter";

type ArtistOverlayProps = {
	data: ArtistData;
};

function formatFollowers(count: number): string {
	if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
	if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
	return count.toLocaleString();
}

export default function ArtistOverlay({ data }: ArtistOverlayProps) {
	return (
		<div className="space-y-3">
			{data.name && (
				<div>
					<p className="text-[14px] font-semibold text-text-primary leading-snug">
						{data.name}
					</p>
					{data.followers !== null && (
						<p className="text-[12px] text-text-secondary mt-0.5">
							<span className="text-brand-emerald font-semibold">
								{formatFollowers(data.followers)}
							</span>{" "}
							followers
						</p>
					)}
				</div>
			)}

			{data.popularity !== null && <PopularityMeter value={data.popularity} />}

			<GenreTags genres={data.genres} />
		</div>
	);
}
