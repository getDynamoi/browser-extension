type AudioFeaturesProps = {
	features: Record<string, unknown>;
};

const DISPLAY_FEATURES = [
	{ key: "danceability", label: "Danceability", color: "bg-brand-violet" },
	{ key: "energy", label: "Energy", color: "bg-brand-orange" },
	{ key: "valence", label: "Valence", color: "bg-brand-yellow" },
	{ key: "acousticness", label: "Acoustic", color: "bg-brand-teal" },
	{ key: "instrumentalness", label: "Instrumental", color: "bg-brand-blue" },
	{ key: "speechiness", label: "Speech", color: "bg-brand-emerald" },
	{ key: "liveness", label: "Liveness", color: "bg-brand-red" },
] as const;

export default function AudioFeatures({ features }: AudioFeaturesProps) {
	const hasFeatures = DISPLAY_FEATURES.some(
		(f) => typeof features[f.key] === "number",
	);
	if (!hasFeatures) return null;

	return (
		<div className="section-card space-y-2.5">
			<span className="text-[11px] text-text-secondary">Audio Features</span>
			<div className="space-y-2">
				{DISPLAY_FEATURES.map((feature) => {
					const value = features[feature.key];
					if (typeof value !== "number") return null;
					const percent = Math.round(value * 100);

					return (
						<div key={feature.key} className="flex items-center gap-2.5">
							<span className="text-[10px] text-text-secondary w-[68px] shrink-0">
								{feature.label}
							</span>
							<div className="flex-1 h-1.5 rounded-full bg-surface-muted/80 overflow-hidden">
								<div
									className={`h-full rounded-full ${feature.color}`}
									style={{ width: `${percent}%` }}
								/>
							</div>
							<span className="text-[10px] text-text-muted w-[26px] text-right tabular-nums">
								{percent}%
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
