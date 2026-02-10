import { defineConfig } from "wxt";

export default defineConfig({
	modules: ["@wxt-dev/module-react"],
	manifest: ({ mode }) => ({
		name: "Dynamoi",
		description:
			"See hidden Spotify metadata — popularity, audio features, genres, labels, and more — right on the page.",
		permissions: ["activeTab"],
		host_permissions: [
			"https://open.spotify.com/*",
			"https://dynamoi.com/*",
			...(mode === "development" ? ["http://localhost/*"] : []),
		],
		web_accessible_resources: [
			{
				resources: ["dynamoi-wordmark.png"],
				matches: ["https://open.spotify.com/*"],
			},
		],
	}),
	imports: false,
});
