/** Audio features returned by Spotify API */
export type AudioFeatures = {
	acousticness: number;
	danceability: number;
	energy: number;
	instrumentalness: number;
	liveness: number;
	speechiness: number;
	valence: number;
	tempo: number;
	key: number;
	mode: number;
	time_signature: number;
	loudness: number;
	duration_ms: number;
};

/** Track data from the Dynamoi extension API */
export type TrackData = {
	trackName: string | null;
	albumName: string | null;
	artistNames: string[];
	artistGenres: string[];
	popularity: number | null;
	audioFeatures: Partial<AudioFeatures>;
	durationMs: number | null;
	explicit: boolean;
	isrc: string | null;
	trackNumber: number | null;
	discNumber: number | null;
};

/** Album data from the Dynamoi extension API */
export type AlbumData = {
	albumType: string | null;
	label: string | null;
	releaseDate: string | null;
	totalTracks: number | null;
	popularity: number | null;
	copyrights: Array<{ text: string; type: string }>;
	externalIds: Record<string, string>;
	artistNames: string[];
};

/** Artist data from the Dynamoi extension API */
export type ArtistData = {
	name: string | null;
	followers: number | null;
	genres: string[];
	popularity: number | null;
	images: Array<{ url: string; width: number; height: number }>;
};

/** Spotify item types supported by the extension */
export type SpotifyItemType = "track" | "album" | "artist";

/** API success response */
export type ApiSuccessResponse<T> = {
	data: T;
};

/** API error response */
export type ApiErrorResponse = {
	error: string;
};

/** API response from the Dynamoi extension endpoint */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/** Parsed Spotify URL info */
export type SpotifyUrlInfo = {
	type: SpotifyItemType;
	id: string;
};
