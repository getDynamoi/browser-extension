const THROTTLE_MS = 2000;

let lastRequestTime = 0;
let throttleTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingCallback: (() => void) | null = null;

/**
 * Throttle function calls to at most once every THROTTLE_MS.
 * If called during cooldown, the latest call replaces any pending call.
 */
export function throttledCall(callback: () => void): void {
	const now = Date.now();
	const timeSinceLast = now - lastRequestTime;

	if (timeSinceLast >= THROTTLE_MS) {
		lastRequestTime = now;
		callback();
		return;
	}

	// Replace pending callback with latest
	pendingCallback = callback;

	if (!throttleTimeout) {
		const delay = THROTTLE_MS - timeSinceLast;
		throttleTimeout = setTimeout(() => {
			throttleTimeout = null;
			const pending = pendingCallback;
			pendingCallback = null;
			if (pending) {
				lastRequestTime = Date.now();
				pending();
			}
		}, delay);
	}
}
