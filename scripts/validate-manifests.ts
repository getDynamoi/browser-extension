import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

for (const browser of ["chrome", "firefox"]) {
	const manifest = JSON.parse(
		await readFile(
			new URL(`../.output/${browser}-mv3/manifest.json`, import.meta.url),
			"utf8",
		),
	);
	assert.equal(manifest.manifest_version, 3);
	if (browser === "firefox") {
		assert.deepEqual(manifest.browser_specific_settings, {
			gecko_android: { strict_min_version: "142.0" },
			gecko: {
				id: "browser-extension@dynamoi.com",
				strict_min_version: "140.0",
				data_collection_permissions: {
					required: ["browsingActivity", "searchTerms"],
				},
			},
		});
		assert.deepEqual(manifest.background, { scripts: ["background.js"] });
	} else {
		assert.equal(manifest.browser_specific_settings, undefined);
		assert.deepEqual(manifest.background, { service_worker: "background.js" });
	}
}
console.log(
	"Chrome/Firefox MV3 identity, consent and background manifests: PASS",
);
