const SVG_NS = "http://www.w3.org/2000/svg";
function svg(className: string, viewBox = "0 0 16 16"): SVGSVGElement {
	const node = document.createElementNS(SVG_NS, "svg");
	node.setAttribute("aria-hidden", "true");
	node.setAttribute("class", className);
	node.setAttribute("viewBox", viewBox);
	return node;
}
function path(d: string, fill?: string): SVGPathElement {
	const node = document.createElementNS(SVG_NS, "path");
	node.setAttribute("d", d);
	if (fill) node.setAttribute("fill", fill);
	return node;
}
function strokeIcon(className: string, d: string): SVGSVGElement {
	const node = svg(className);
	for (const [name, value] of Object.entries({
		fill: "none",
		stroke: "currentColor",
		"stroke-linecap": "round",
		"stroke-linejoin": "round",
		"stroke-width": "1.6",
	}))
		node.setAttribute(name, value);
	node.append(path(d));
	return node;
}
export function CopyIcon(className: string): SVGSVGElement {
	const node = strokeIcon(
		className,
		"M10.5 3.2V2.9a1.4 1.4 0 0 0-1.4-1.4H2.9a1.4 1.4 0 0 0-1.4 1.4v6.2a1.4 1.4 0 0 0 1.4 1.4h.3",
	);
	const rect = document.createElementNS(SVG_NS, "rect");
	for (const [name, value] of Object.entries({
		height: "9",
		rx: "1.6",
		width: "9",
		x: "5.5",
		y: "5.5",
	}))
		rect.setAttribute(name, value);
	node.prepend(rect);
	return node;
}
export function CheckIcon(className: string) {
	return strokeIcon(className, "m3 8.5 3.2 3L13 4.5");
}
export function CloseIcon(className: string) {
	return strokeIcon(className, "m4 4 8 8M12 4l-8 8");
}
export function ExternalIcon(className: string) {
	return strokeIcon(className, "M6 3.5h6.5V10M12.2 3.8 3.5 12.5");
}
export function ChevronIcon(className: string) {
	return strokeIcon(className, "m4 6 4 4 4-4");
}
const PETALS = [
	"M558.67,460.61 C583.08,441.98 586.35,435.75 615.79,427.00 A44.14,44.14 0 1 0 562.68,367.20 C550.51,395.39 547.15,423.19 545.78,453.87 A8.03,8.03 0 0 0 558.67,460.61Z",
	"M599.62,481.22 C635.84,483.84 644.73,481.18 677.66,496.49 A49.83,49.83 0 1 0 678.39,405.80 C645.22,420.58 620.30,441.92 594.54,467.52 A8.03,8.03 0 0 0 599.62,481.22Z",
	"M613.91,527.72 C641.33,559.49 651.28,565.45 665.63,604.88 A55.51,55.51 0 1 0 738.52,534.39 C699.59,518.73 662.10,515.27 620.14,514.45 A8.03,8.03 0 0 0 613.91,527.72Z",
	"M586.79,571.43 C580.55,618.66 582.73,632.45 560.11,674.38 A61.20,61.20 0 1 0 671.83,683.47 C656.28,638.43 631.44,603.92 600.91,567.34 A8.03,8.03 0 0 0 586.79,571.43Z",
	"M532.96,577.64 C487.23,605.11 475.93,616.92 423.43,626.36 A66.88,66.88 0 1 0 491.36,728.62 C520.42,683.88 533.66,638.36 544.94,586.22 A8.03,8.03 0 0 0 532.96,577.64Z",
	"M494.70,535.51 C440.53,511.96 422.03,508.97 379.76,467.71 A72.57,72.57 0 1 0 331.64,592.17 C390.67,590.08 440.17,573.18 494.61,550.27 A8.03,8.03 0 0 0 494.70,535.51Z",
] as const;
const LEAD_PETAL =
	"M509.96,477.90 C499.78,413.91 491.65,394.38 504.86,330.95 A78.25,78.25 0 1 0 363.50,358.94 C399.89,412.55 444.37,448.54 497.42,485.73 A8.03,8.03 0 0 0 509.96,477.90Z";

/** Brand v2 bloom on dark, from scripts/brand/masters/mark-on-dark.svg. */
export function BloomMark(className: string): SVGSVGElement {
	const node = svg(className, "200 200 624 624");
	for (const d of PETALS) node.append(path(d, "#f4ece0"));
	node.append(path(LEAD_PETAL, "#d9622b"));
	return node;
}
