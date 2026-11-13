import { browser as nativeBrowser } from "wxt/browser";

// Preserve Chromium's API while using Firefox's native promise-returning namespace.
export const browser = import.meta.env.FIREFOX ? nativeBrowser : chrome;
