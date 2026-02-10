type OverlayHeaderProps = {
	logoUrl: string;
	onClose: () => void;
};

export default function OverlayHeader({ logoUrl, onClose }: OverlayHeaderProps) {
	return (
		<div className="flex items-center justify-between mb-3.5">
			<a
				href="https://dynamoi.com"
				target="_blank"
				rel="noopener noreferrer"
				className="opacity-90 hover:opacity-100 transition-opacity"
			>
				{/* oxlint-disable-next-line nextjs/no-img-element -- Chrome extension, not Next.js */}
				<img src={logoUrl} alt="Dynamoi" className="h-[16px] w-auto" />
			</a>
			<button
				type="button"
				onClick={onClose}
				className="w-5 h-5 rounded-md bg-surface-muted/60 text-text-muted hover:bg-surface-border hover:text-text-primary flex items-center justify-center text-[12px] leading-none transition-colors cursor-pointer"
			>
				&times;
			</button>
		</div>
	);
}
