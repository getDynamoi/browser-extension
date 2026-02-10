import type {
	AlbumData,
	ArtistData,
	SpotifyItemType,
	TrackData,
} from "./types";

/** Messages sent from content script to background */
export type RequestMessage = {
	type: "GET_SPOTIFY_DATA";
	itemType: SpotifyItemType;
	id: string;
};

/** Messages sent from background to content script */
export type ResponseMessage =
	| {
			type: "SPOTIFY_DATA_RESULT";
			id: string;
			itemType: "track";
			data: TrackData;
	  }
	| {
			type: "SPOTIFY_DATA_RESULT";
			id: string;
			itemType: "album";
			data: AlbumData;
	  }
	| {
			type: "SPOTIFY_DATA_RESULT";
			id: string;
			itemType: "artist";
			data: ArtistData;
	  }
	| {
			type: "SPOTIFY_DATA_ERROR";
			id: string;
			itemType: SpotifyItemType;
			error: string;
	  };

export type ExtensionMessage = RequestMessage | ResponseMessage;
