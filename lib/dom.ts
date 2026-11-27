export type DomChild = Node | string | number | null | undefined | false;

export function element<K extends keyof HTMLElementTagNameMap>(
	tag: K,
	className: string,
	...children: DomChild[]
): HTMLElementTagNameMap[K] {
	const node = document.createElement(tag);
	if (className) node.className = className;
	for (const child of children) {
		if (child !== null && child !== undefined && child !== false) {
			node.append(child instanceof Node ? child : String(child));
		}
	}
	return node;
}

export function attributes<T extends Element>(
	node: T,
	values: Record<string, string | number | boolean>,
): T {
	for (const [name, value] of Object.entries(values)) {
		node.setAttribute(name, String(value));
	}
	return node;
}

export function button(
	className: string,
	content: DomChild,
	onClick: () => void,
): HTMLButtonElement {
	const node = element("button", className, content);
	node.type = "button";
	node.addEventListener("click", onClick);
	return node;
}

export function externalLink(
	className: string,
	href: string,
	...children: DomChild[]
): HTMLAnchorElement {
	const node = element("a", className, ...children);
	node.href = href;
	node.target = "_blank";
	node.rel = "noopener noreferrer";
	return node;
}

export type View = { element: HTMLElement; dispose: () => void };

/** Timers and pending clipboard completions belong to the mounted view. */
export function lifetime() {
	const controller = new AbortController();
	const timers = new Set<ReturnType<typeof setTimeout>>();
	return {
		signal: controller.signal,
		after(milliseconds: number, action: () => void) {
			const timer = setTimeout(() => {
				timers.delete(timer);
				if (!controller.signal.aborted) action();
			}, milliseconds);
			timers.add(timer);
		},
		dispose() {
			controller.abort();
			for (const timer of timers) clearTimeout(timer);
			timers.clear();
		},
	};
}
