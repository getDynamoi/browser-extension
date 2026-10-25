type IconProps = { className?: string };

const STROKE = {
	fill: "none",
	stroke: "currentColor",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	strokeWidth: 1.6,
} as const;

export function CopyIcon({ className }: IconProps) {
	return (
		<svg aria-hidden="true" className={className} viewBox="0 0 16 16" {...STROKE}>
			<rect height="9" rx="1.6" width="9" x="5.5" y="5.5" />
			<path d="M10.5 3.2V2.9a1.4 1.4 0 0 0-1.4-1.4H2.9a1.4 1.4 0 0 0-1.4 1.4v6.2a1.4 1.4 0 0 0 1.4 1.4h.3" />
		</svg>
	);
}

export function CheckIcon({ className }: IconProps) {
	return (
		<svg aria-hidden="true" className={className} viewBox="0 0 16 16" {...STROKE}>
			<path d="m3 8.5 3.2 3L13 4.5" />
		</svg>
	);
}

export function CloseIcon({ className }: IconProps) {
	return (
		<svg aria-hidden="true" className={className} viewBox="0 0 16 16" {...STROKE}>
			<path d="m4 4 8 8M12 4l-8 8" />
		</svg>
	);
}

export function ExternalIcon({ className }: IconProps) {
	return (
		<svg aria-hidden="true" className={className} viewBox="0 0 16 16" {...STROKE}>
			<path d="M6 3.5h6.5V10M12.2 3.8 3.5 12.5" />
		</svg>
	);
}

export function ChevronIcon({ className }: IconProps) {
	return (
		<svg aria-hidden="true" className={className} viewBox="0 0 16 16" {...STROKE}>
			<path d="m4 6 4 4 4-4" />
		</svg>
	);
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
export function BloomMark({ className }: IconProps) {
	return (
		<svg aria-hidden="true" className={className} viewBox="200 200 624 624">
			{PETALS.map((d) => (
				<path d={d} fill="#f4ece0" key={d} />
			))}
			<path d={LEAD_PETAL} fill="#d9622b" />
		</svg>
	);
}
