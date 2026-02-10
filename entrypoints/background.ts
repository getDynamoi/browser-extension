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

			throttledCall(String(tabId), () => {
				void (async () => {
					let response: ResponseMessage;

					try {
						const result = await fetchSpotifyData<
							TrackData | AlbumData | ArtistData
						>(itemType, id);

						if ("error" in result) {
							response = {
								type: "SPOTIFY_DATA_ERROR",
								error: result.error,
								id,
								itemType,
							};
						} else {
							response = {
								type: "SPOTIFY_DATA_RESULT",
								data: result.data,
								id,
								itemType,
							} as ResponseMessage;
						}
					} catch (error) {
						response = {
							type: "SPOTIFY_DATA_ERROR",
							error:
								error instanceof Error
									? error.message
									: "Unexpected network error.",
							id,
							itemType,
						};
					}

					chrome.tabs.sendMessage(tabId, response).catch(() => {
						// Tab may have navigated away
					});
				})();
			});
		},
	);
});
