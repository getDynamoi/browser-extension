import type { ApiResponse, SpotifyItemType } from "./types";

const API_BASE_URL =
	import.meta.env.MODE === "development"
		? "http://localhost:3000/api/dynamoi-extension"
		: "https://dynamoi.com/api/dynamoi-extension";

export async function fetchSpotifyData<T>(
	itemType: SpotifyItemType,
	id: string,
): Promise<ApiResponse<T>> {
	const url = `${API_BASE_URL}?itemType=${itemType}&id=${encodeURIComponent(id)}`;

	const response = await fetch(url);

	if (!response.ok) {
		const body = await response.json().catch(() => null);
		const message =
			body && typeof body === "object" && "error" in body
				? String(body.error)
				: `API request failed (${response.status})`;
		return { error: message };
	}

	return (await response.json()) as ApiResponse<T>;
}
