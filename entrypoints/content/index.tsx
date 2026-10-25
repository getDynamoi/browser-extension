import { createRoot, type Root } from "react-dom/client";
import { createShadowRootUi } from "wxt/utils/content-script-ui/shadow-root";
import { defineContentScript } from "wxt/utils/define-content-script";
import { lookup, lookupArtist, type ToBackground, type ToContent } from "../../lib/messages";
import { finishRatingPrompt, RATING_AFTER_LOOKUPS, readRating, STORE_REVIEW_URL } from "../../lib/storage";
import { type LookupTarget, targetFromSpotifyPath, targetKey } from "../../lib/target";
import { Card, type CardModel } from "./Card";
import "./style.css";

const FONT_STYLE_ID = "dynamoi-extension-font";

/** Shadow roots cannot load @font-face, so the face is declared once on the page. */
function ensureFont() {
	if (document.getElementById(FONT_STYLE_ID)) return;
	const style = document.createElement("style");
	style.id = FONT_STYLE_ID;
	style.textContent = `@font-face{font-family:"Dynamoi Inter";font-style:normal;font-weight:100 900;font-display:swap;src:url("${chrome.runtime.getURL("/fonts/inter-variable-latin.woff2")}") format("woff2");}`;
	document.head.append(style);
}

async function reportPage(page: ToBackground) {
	try {
		await chrome.runtime.sendMessage(page);
	} catch {
		// The worker may be restarting; the badge is cosmetic and the next navigation retries.
	}
}

export default defineContentScript({
	matches: ["https://open.spotify.com/*"],
	cssInjectionMode: "ui",

	async main(ctx) {
		ensureFont();
		const wordmarkUrl = chrome.runtime.getURL("/dynamoi-wordmark.svg");
		let target: LookupTarget | null = null;
		let model: CardModel | null = null;
		let hidden = false;
		let focusOnRender = false;
		let root: Root | null = null;
		let ui: Awaited<ReturnType<typeof createShadowRootUi<Root>>> | null = null;

		function render() {
			if (!(root && model && target)) return;
			const autoFocus = focusOnRender;
			focusOnRender = false;
			root.render(
				<Card
					autoFocus={autoFocus}
					model={model}
					onClose={hide}
					onDismissRating={() => {
						void finishRatingPrompt();
						if (model) model = { ...model, showRating: false };
						render();
					}}
					onRate={() => {
						void finishRatingPrompt();
						window.open(STORE_REVIEW_URL, "_blank", "noopener");
						if (model) model = { ...model, showRating: false };
						render();
					}}
					onRetry={() => target && void load(target)}
					target={target}
					wordmarkUrl={wordmarkUrl}
				/>,
			);
		}

		async function show() {
			if (!ui) {
				ui = await createShadowRootUi(ctx, {
					name: "dynamoi-release-card",
					position: "overlay",
					onMount(container) {
						const wrapper = document.createElement("div");
						container.append(wrapper);
						root = createRoot(wrapper);
						return root;
					},
					onRemove(mounted) {
						mounted?.unmount();
						root = null;
					},
				});
				ui.mount();
			}
			render();
		}

		function hide() {
			hidden = true;
			ui?.remove();
			ui = null;
		}

		async function load(next: LookupTarget) {
			const key = targetKey(next);
			model = { artist: { status: "none" }, showRating: false, state: { status: "loading" } };
			if (!hidden) await show();
			const [state, rating] = await Promise.all([lookup(next), readRating()]);
			if (!target || targetKey(target) !== key) return;
			const artistKey = state.status === "found" ? state.release.artistKey : null;
			model = {
				artist: artistKey ? { status: "loading" } : { status: "none" },
				showRating: !rating.done && rating.lookups >= RATING_AFTER_LOOKUPS,
				state,
			};
			if (!hidden) render();
			if (!artistKey) return;
			const artist = await lookupArtist(artistKey);
			if (!(target && targetKey(target) === key && model)) return;
			model = { ...model, artist };
			if (!hidden) render();
		}

		function sync() {
			const next = targetFromSpotifyPath(window.location.pathname);
			if (next && target && targetKey(next) === targetKey(target)) return;
			target = next;
			hidden = false;
			const page: ToBackground = { itemType: next?.itemType ?? null, type: "PAGE" };
			void reportPage(page);
			if (!next) {
				model = null;
				ui?.remove();
				ui = null;
				return;
			}
			void load(next);
		}

		function onMessage(message: ToContent) {
			if (message.type !== "TOGGLE_CARD" || !target) return;
			if (hidden || !ui) {
				hidden = false;
				focusOnRender = true;
				void show();
			} else {
				hide();
			}
		}
		chrome.runtime.onMessage.addListener(onMessage);

		// Spotify is a single-page app. Content scripts run in an isolated world,
		// so watch navigation events and the document title instead of patching
		// the page's History API.
		const navigation = (window as Window & { navigation?: EventTarget })
			.navigation;
		navigation?.addEventListener("currententrychange", sync);
		window.addEventListener("popstate", sync);
		const titleObserver = new MutationObserver(sync);
		const title = document.querySelector("title");
		if (title) {
			titleObserver.observe(title, { characterData: true, childList: true, subtree: true });
		}

		ctx.onInvalidated(() => {
			chrome.runtime.onMessage.removeListener(onMessage);
			navigation?.removeEventListener("currententrychange", sync);
			window.removeEventListener("popstate", sync);
			titleObserver.disconnect();
		});

		sync();
	},
});
