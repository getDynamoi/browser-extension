import { createRoot } from "react-dom/client";
import { createShadowRootUi } from "wxt/client";
import { defineContentScript } from "wxt/sandbox";
import type { RequestMessage, ResponseMessage } from "../../lib/messages";
import { parseSpotifyUrl } from "../../lib/spotify-url";
import App from "./components/App";
import "./style.css";

export default defineContentScript({
	matches: ["https://open.spotify.com/*"],
	cssInjectionMode: "ui",

	async main(ctx) {
		const logoUrl = chrome.runtime.getURL("dynamoi-wordmark.png");

		let currentData: ResponseMessage | null = null;
		let isHidden = false;
		let root: ReturnType<typeof createRoot> | null = null;
		let mountedUi: Awaited<ReturnType<typeof createShadowRootUi>> | null =
			null;

		function renderApp() {
			if (!root) return;
			root.render(
				<App
					data={currentData}
					logoUrl={logoUrl}
					onClose={() => {
						isHidden = true;
						mountedUi?.remove();
					}}
				/>,
			);
		}

		async function mountOverlay() {
			if (mountedUi) return;

			const ui = await createShadowRootUi(ctx, {
				name: "music-data-lens",
				position: "overlay",
				onMount(container) {
					const wrapper = document.createElement("div");
					container.append(wrapper);
					root = createRoot(wrapper);
					renderApp();
					return root;
				},
				onRemove(r) {
					r?.unmount();
					root = null;
				},
			});

			ui.mount();
			mountedUi = ui;
		}

		function requestData() {
			const info = parseSpotifyUrl(window.location.pathname);
			if (!info) {
				// Not on a supported page — remove overlay
				mountedUi?.remove();
				mountedUi = null;
				currentData = null;
				isHidden = false;
				return;
			}

			if (isHidden) return;

			const message: RequestMessage = {
				type: "GET_SPOTIFY_DATA",
				itemType: info.type,
				id: info.id,
			};
			chrome.runtime.sendMessage(message);
		}

		// Listen for data from background
		function onMessage(message: ResponseMessage) {
			if (
				message.type !== "SPOTIFY_DATA_RESULT" &&
				message.type !== "SPOTIFY_DATA_ERROR"
			) {
				return;
			}
			currentData = message;
			if (!isHidden) {
				void mountOverlay().then(renderApp);
			}
		}

		chrome.runtime.onMessage.addListener(onMessage);
		ctx.onInvalidated(() => {
			chrome.runtime.onMessage.removeListener(onMessage);
		});

		// Detect SPA navigation via History API interception + title MutationObserver
		let lastPath = window.location.pathname;

		function checkNavigation() {
			const currentPath = window.location.pathname;
			if (currentPath !== lastPath) {
				lastPath = currentPath;
				isHidden = false;
				mountedUi?.remove();
				mountedUi = null;
				currentData = null;
				requestData();
			}
		}

		// Intercept History API
		const originalPushState = history.pushState.bind(history);
		const originalReplaceState = history.replaceState.bind(history);

		history.pushState = (...args) => {
			originalPushState(...args);
			checkNavigation();
		};

		history.replaceState = (...args) => {
			originalReplaceState(...args);
			checkNavigation();
		};

		window.addEventListener("popstate", checkNavigation);

		// Also observe title changes as a fallback
		const titleObserver = new MutationObserver(checkNavigation);
		const titleEl = document.querySelector("title");
		if (titleEl) {
			titleObserver.observe(titleEl, {
				childList: true,
				characterData: true,
				subtree: true,
			});
		}

		ctx.onInvalidated(() => {
			history.pushState = originalPushState;
			history.replaceState = originalReplaceState;
			window.removeEventListener("popstate", checkNavigation);
			titleObserver.disconnect();
		});

		// Initial check
		requestData();
	},
});
