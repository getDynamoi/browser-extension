import { createRoot } from "react-dom/client";
import Welcome from "./Welcome";

document.documentElement.lang = chrome.i18n.getUILanguage();
const container = document.getElementById("app");
if (container) {
	createRoot(container).render(<Welcome />);
}
