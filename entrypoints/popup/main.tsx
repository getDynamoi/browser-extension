import { uiLanguage } from "../../lib/i18n";
import { createRoot } from "react-dom/client";
import Popup from "./Popup";

document.documentElement.lang = uiLanguage();
const container = document.getElementById("app");
if (container) {
	createRoot(container).render(<Popup />);
}
