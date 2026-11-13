import { defineConfig } from "wxt";

export default defineConfig({
	manifestVersion: 3,
	modules: ["@wxt-dev/module-react"],
	manifest: ({ mode, browser }) => ({
		...(browser === "firefox"
			? {
					browser_specific_settings: {
						gecko_android: { strict_min_version: "142.0" },
						gecko: {
							id: "browser-extension@dynamoi.com",
							strict_min_version: "140.0",
							data_collection_permissions: {
								required: ["browsingActivity", "searchTerms"],
							},
						},
					},
				}
			: {}),
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
	zip: {
		// Retain the exact catalog/lock and workspace shells without unrelated source.
		sourcesRoot: "../..",
		dotSources: true,
		includeSources: [
			"package.json",
			"bun.lock",
			"bunfig.toml",
			".gitignore",
			"apps/chrome-extension/.gitignore",
			"patches/*.patch",
			"{apps,packages,infra}/*/package.json",
			"scripts/package.json",
			"apps/chrome-extension/{AGENTS.md,README.md,LICENSE,*.json,*.ts,*.mjs}",
			"apps/chrome-extension/{entrypoints,components,lib,styles,public,scripts}/**",
		],
	},
	imports: false,
});
