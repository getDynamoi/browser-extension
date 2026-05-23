/// <reference types="bun" />

import { describe, expect, test } from "bun:test";
import { parseSpotifyUrl } from "../lib/spotify-url";

describe("parseSpotifyUrl", () => {
	test("parses supported Spotify item paths", () => {
		expect(parseSpotifyUrl("/track/4uLU6hMCjMI75M1A2tKUQC")).toEqual({
			id: "4uLU6hMCjMI75M1A2tKUQC",
			type: "track",
		});
		expect(parseSpotifyUrl("/intl-de/album/1ATL5GLyefJaxhQzSPVrLX")).toEqual({
			id: "1ATL5GLyefJaxhQzSPVrLX",
			type: "album",
		});
		expect(
			parseSpotifyUrl("/intl-pt-BR/artist/06HL4z0CvFAxyc27GXpf02"),
		).toEqual({
			id: "06HL4z0CvFAxyc27GXpf02",
			type: "artist",
		});
	});

	test("rejects unsupported or malformed Spotify paths", () => {
		expect(parseSpotifyUrl("/playlist/37i9dQZF1DXcBWIGoYBM5M")).toBeNull();
		expect(parseSpotifyUrl("/track/not-a-real-id")).toBeNull();
		expect(parseSpotifyUrl("/track/4uLU6hMCjMI75M1A2tKUQC/extra")).toBeNull();
		expect(parseSpotifyUrl("/intl-/track/4uLU6hMCjMI75M1A2tKUQC")).toBeNull();
	});
});
