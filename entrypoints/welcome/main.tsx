import { uiLanguage } from "../../lib/i18n";
import { createRoot } from "react-dom/client";
import Welcome from "./Welcome";

document.documentElement.lang = uiLanguage();
const container = document.getElementById("app");
if (container) {
	createRoot(container).render(<Welcome />);
}
