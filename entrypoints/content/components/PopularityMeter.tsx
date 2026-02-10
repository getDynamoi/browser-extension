type PopularityMeterProps = {
	value: number;
	label?: string;
};

/**
 * Blue → Teal → Emerald gradient. No red — low popularity isn't "bad",
 * it's just less well-known.
 */
function getPopularityColor(value: number): string {
	if (value >= 65) return "bg-brand-emerald";
	if (value >= 35) return "bg-brand-teal";
	return "bg-brand-blue";
}

function getPopularityGlow(value: number): string {
	if (value >= 65)
		return "shadow-[0_0_8px_oklch(66.661%_0.17569_151.098/0.4)]";
	if (value >= 35) return "shadow-[0_0_6px_oklch(0.68_0.16_195/0.3)]";
	return "shadow-[0_0_6px_oklch(0.65_0.18_250/0.25)]";
}

export default function PopularityMeter({
	value,
	label = "Popularity",
}: PopularityMeterProps) {
	return (
		<div className="section-card space-y-2">
			<div className="flex items-center justify-between">
				<span className="text-[11px] text-text-secondary">{label}</span>
				<span className="text-[13px] font-semibold text-text-primary tabular-nums">
					{value}
				</span>
			</div>
			<div className="h-2.5 rounded-full bg-surface-muted/80 overflow-hidden">
				<div
					className={`h-full rounded-full transition-all ${getPopularityColor(value)} ${getPopularityGlow(value)}`}
					style={{ width: `${value}%` }}
				/>
			</div>
		</div>
	);
}
