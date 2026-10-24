import type { LookupResult } from "./api";
import type { ItemType, LookupTarget } from "./target";

export type ToBackground =
	| { type: "LOOKUP"; target: LookupTarget }
	| { type: "PAGE"; itemType: ItemType | null };

export type ToContent = { type: "TOGGLE_CARD" };

const UNAVAILABLE: LookupResult = { status: "unavailable" };

export async function lookup(target: LookupTarget): Promise<LookupResult> {
	const message: ToBackground = { target, type: "LOOKUP" };
	try {
		const result: LookupResult | undefined = await chrome.runtime.sendMessage(message);
		return result ?? UNAVAILABLE;
	} catch {
		return UNAVAILABLE;
	}
}

/** The user's current card shortcut (they can rebind it in chrome://extensions). */
export async function readShortcut(): Promise<string> {
	const commands = await chrome.commands.getAll();
	return (
		commands.find((command) => command.name === "toggle-card")?.shortcut ||
		"Alt+Shift+D"
	);
}
