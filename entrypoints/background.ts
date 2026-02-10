import { defineBackground } from "wxt/sandbox";
import { fetchSpotifyData } from "../lib/api-client";
import type { RequestMessage, ResponseMessage } from "../lib/messages";
import { throttledCall } from "../lib/rate-limiter";
import type { AlbumData, ArtistData, TrackData } from "../lib/types";

export default defineBackground(() => {
	// Handle data requests from content script
	chrome.runtime.onMessage.addListener(
		(message: RequestMessage, sender, _sendResponse) => {
			if (message.type !== "GET_SPOTIFY_DATA") return;

			const tabId = sender.tab?.id;
			if (!tabId) return;

			const { id, itemType } = message;

			throttledCall(async () => {
				const result = await fetchSpotifyData<
					TrackData | AlbumData | ArtistData
				>(itemType, id);

				let response: ResponseMessage;

				if ("error" in result) {
					response = { type: "SPOTIFY_DATA_ERROR", error: result.error };
				} else {
					response = {
						type: "SPOTIFY_DATA_RESULT",
						itemType,
						data: result.data,
					} as ResponseMessage;
				}

				chrome.tabs.sendMessage(tabId, response).catch(() => {
					// Tab may have navigated away
				});
			});
		},
	);
});
