type GenreTagsProps = {
	genres: string[];
};

export default function GenreTags({ genres }: GenreTagsProps) {
	if (genres.length === 0) return null;

	return (
		<div className="space-y-2">
			<span className="text-[11px] text-text-secondary">Genres</span>
			<div className="flex flex-wrap gap-1.5">
				{genres.map((genre) => (
					<span
						key={genre}
						className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-brand-violet/12 text-brand-violet border border-brand-violet/15"
					>
						{genre}
					</span>
				))}
			</div>
		</div>
	);
}
