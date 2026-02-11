import { useEffect, useState } from "react";

type TabState = "spotify" | "other" | "loading";

function SpotifyLogo({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 256 256"
			xmlns="http://www.w3.org/2000/svg"
			preserveAspectRatio="xMidYMid"
			className={className}
		>
			<path
				d="M128 0C57.308 0 0 57.309 0 128c0 70.696 57.309 128 128 128 70.697 0 128-57.304 128-128C256 57.314 198.697.007 127.998.007l.001-.006Zm58.699 184.614c-2.293 3.76-7.215 4.952-10.975 2.644-30.053-18.357-67.885-22.515-112.44-12.335a7.981 7.981 0 0 1-9.552-6.007 7.968 7.968 0 0 1 6-9.553c48.76-11.14 90.583-6.344 124.323 14.276 3.76 2.308 4.952 7.215 2.644 10.975Zm15.667-34.853c-2.89 4.695-9.034 6.178-13.726 3.289-34.406-21.148-86.853-27.273-127.548-14.92-5.278 1.594-10.852-1.38-12.454-6.649-1.59-5.278 1.386-10.842 6.655-12.446 46.485-14.106 104.275-7.273 143.787 17.007 4.692 2.89 6.175 9.034 3.286 13.72v-.001Zm1.345-36.293C162.457 88.964 94.394 86.71 55.007 98.666c-6.325 1.918-13.014-1.653-14.93-7.978-1.917-6.328 1.65-13.012 7.98-14.935C93.27 62.027 168.434 64.68 215.929 92.876c5.702 3.376 7.566 10.724 4.188 16.405-3.362 5.69-10.73 7.565-16.4 4.187h-.006Z"
				fill="#1ED760"
			/>
		</svg>
	);
}

export default function Popup() {
	const [tabState, setTabState] = useState<TabState>("loading");
	const logoUrl = chrome.runtime.getURL("dynamoi-wordmark.png");

	useEffect(() => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const url = tabs[0]?.url;
			try {
				if (url && new URL(url).origin === "https://open.spotify.com") {
					setTabState("spotify");
				} else {
					setTabState("other");
				}
			} catch {
				setTabState("other");
			}
		});
	}, []);

	if (tabState === "loading") {
		return <div className="w-[280px] h-[100px] bg-surface-bg" />;
	}

	if (tabState === "spotify") {
		return (
			<div className="w-[280px] bg-surface-bg text-text-primary p-4 space-y-3">
				<div className="flex items-center justify-between">
					{/* oxlint-disable-next-line nextjs/no-img-element -- Chrome extension UI is not rendered by Next.js runtime. */}
					<img src={logoUrl} alt="Dynamoi" className="h-[14px] w-auto" />
					<div className="flex items-center gap-1.5">
						<div className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
						<span className="text-[11px] text-brand-emerald">Active</span>
					</div>
				</div>
				<div className="text-center">
					<a
						href="https://dynamoi.com"
						target="_blank"
						rel="noopener noreferrer"
						className="text-[10px] text-text-muted hover:text-brand-emerald transition-colors"
					>
						dynamoi.com
					</a>
				</div>
			</div>
		);
	}

	return (
		<div className="w-[280px] bg-surface-bg text-text-primary p-5 space-y-4">
			<div className="flex flex-col items-center text-center gap-3">
				<SpotifyLogo className="w-10 h-10" />
				<div>
					{/* oxlint-disable-next-line nextjs/no-img-element -- Chrome extension UI is not rendered by Next.js runtime. */}
					<img
						src={logoUrl}
						alt="Dynamoi"
						className="h-[16px] w-auto mx-auto"
					/>
					<p className="text-[12px] text-text-secondary mt-2">
						Only works on{" "}
						<a
							href="https://open.spotify.com"
							target="_blank"
							rel="noopener noreferrer"
							className="text-brand-emerald hover:underline"
						>
							open.spotify.com
						</a>
					</p>
				</div>
			</div>
			<div className="text-center">
				<a
					href="https://dynamoi.com"
					target="_blank"
					rel="noopener noreferrer"
					className="text-[10px] text-text-muted hover:text-brand-emerald transition-colors"
				>
					dynamoi.com
				</a>
			</div>
		</div>
	);
}
