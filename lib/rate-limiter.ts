const THROTTLE_MS = 2000;

type ThrottleState = {
	lastRequestTime: number;
	throttleTimeout: ReturnType<typeof setTimeout> | null;
	pendingCallback: (() => void) | null;
};

const throttleStates = new Map<string, ThrottleState>();

function getState(key: string): ThrottleState {
	const existing = throttleStates.get(key);
	if (existing) return existing;

	const next: ThrottleState = {
		lastRequestTime: 0,
		pendingCallback: null,
		throttleTimeout: null,
	};
	throttleStates.set(key, next);
	return next;
}

/**
 * Throttle function calls per key to at most once every THROTTLE_MS.
 * If called during cooldown, the latest call replaces any pending call for that key.
 */
export function throttledCall(key: string, callback: () => void): void {
	const state = getState(key);

	const now = Date.now();
	const timeSinceLast = now - state.lastRequestTime;

	if (timeSinceLast >= THROTTLE_MS) {
		state.lastRequestTime = now;
		callback();
		return;
	}

	state.pendingCallback = callback;

	if (state.throttleTimeout) return;

	const delay = THROTTLE_MS - timeSinceLast;
	state.throttleTimeout = setTimeout(() => {
		state.throttleTimeout = null;
		const pending = state.pendingCallback;
		state.pendingCallback = null;
		if (pending) {
			state.lastRequestTime = Date.now();
			pending();
		}
	}, delay);
}
