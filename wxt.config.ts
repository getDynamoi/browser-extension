import { defineConfig } from "wxt";

export default defineConfig({
	modules: ["@wxt-dev/module-react"],
	manifest: ({ mode }) => ({
		name: "__MSG_extName__",
		short_name: "Dynamoi",
		description: "__MSG_extDescription__",
		default_locale: "en",
		permissions: ["storage"],
		host_permissions: [
			"https://open.spotify.com/*",
			"https://dynamoi.com/*",
			...(mode === "development" ? ["http://localhost/*"] : []),
		],
		action: { default_title: "__MSG_extName__" },
		commands: {
			"toggle-card": {
				description: "__MSG_commandToggle__",
				suggested_key: { default: "Alt+Shift+D" },
			},
		},
		web_accessible_resources: [
			{
				resources: ["dynamoi-wordmark.svg", "fonts/inter-variable-latin.woff2"],
				matches: ["https://open.spotify.com/*"],
			},
		],
	}),
	imports: false,
});
