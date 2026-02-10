import type { ResponseMessage } from "../../../lib/messages";
import AlbumOverlay from "./AlbumOverlay";
import ArtistOverlay from "./ArtistOverlay";
import OverlayHeader from "./OverlayHeader";
import PoweredBy from "./PoweredBy";
import TrackOverlay from "./TrackOverlay";

type AppProps = {
	data: ResponseMessage | null;
	logoUrl: string;
	onClose: () => void;
};

export default function App({ data, logoUrl, onClose }: AppProps) {
	if (!data) return null;

	if (data.type === "SPOTIFY_DATA_ERROR") {
		return (
			<div className="fixed top-5 right-5 z-[10000] w-[360px] glass-card animate-fade-in p-5">
				<OverlayHeader logoUrl={logoUrl} onClose={onClose} />
				<p className="text-brand-red text-[12px]">{data.error}</p>
				<PoweredBy />
			</div>
		);
	}

	return (
		<div className="fixed top-5 right-5 z-[10000] w-[360px] glass-card animate-fade-in p-5">
			<OverlayHeader logoUrl={logoUrl} onClose={onClose} />
			{data.itemType === "track" && <TrackOverlay data={data.data} />}
			{data.itemType === "album" && <AlbumOverlay data={data.data} />}
			{data.itemType === "artist" && <ArtistOverlay data={data.data} />}
			<PoweredBy />
		</div>
	);
}
