import { createRoot } from "react-dom/client";
import Popup from "./Popup";

document.documentElement.lang = chrome.i18n.getUILanguage();
const container = document.getElementById("app");
if (container) {
	createRoot(container).render(<Popup />);
}
