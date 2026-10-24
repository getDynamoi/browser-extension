const SERVICE_NAMES: Record<string, string> = {
	amazonmusic: "Amazon Music",
	amazonstore: "Amazon",
	anghami: "Anghami",
	applemusic: "Apple Music",
	audiomack: "Audiomack",
	bandcamp: "Bandcamp",
	boomplay: "Boomplay",
	deezer: "Deezer",
	napster: "Napster",
	pandora: "Pandora",
	soundcloud: "SoundCloud",
	spotify: "Spotify",
	tidal: "TIDAL",
	youtube: "YouTube",
	youtubemusic: "YouTube Music",
};

export function serviceName(service: string): string {
	return SERVICE_NAMES[service] ?? service;
}
