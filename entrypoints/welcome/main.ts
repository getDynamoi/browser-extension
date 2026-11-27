import { uiLanguage } from "../../lib/i18n";
import Welcome from "./Welcome";

document.documentElement.lang = uiLanguage();
const container = document.getElementById("app");
if (container) {
	const view = Welcome();
	container.append(view.element);
	window.addEventListener("pagehide", () => view.dispose(), { once: true });
}
