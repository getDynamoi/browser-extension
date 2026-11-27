import { uiLanguage } from "../../lib/i18n";
import Popup from "./Popup";

document.documentElement.lang = uiLanguage();
const container = document.getElementById("app");
if (container) {
	const view = Popup();
	container.append(view.element);
	window.addEventListener("pagehide", () => view.dispose(), { once: true });
}
