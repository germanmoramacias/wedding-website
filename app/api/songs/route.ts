import { NextResponse } from "next/server";
import { songKey, type Song } from "@/lib/songs";

export async function GET(request: Request) {
  const term = new URL(request.url).searchParams.get("q")?.trim().replace(/\s+/g, " ") ?? "";
  if (term.length < 2 || term.length > 100) {
    return NextResponse.json({ error: "Escribe entre 2 y 100 caracteres para buscar." }, { status: 400 });
  }

  const url = new URL("https://itunes.apple.com/search");
  url.search = new URLSearchParams({
    term: term.toLowerCase(), country: "ES", media: "music", entity: "song", limit: "12",
  }).toString();

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Music search unavailable");
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || !("results" in data) || !Array.isArray(data.results)) {
      throw new Error("Invalid music search response");
    }

    const songs: Song[] = [];
    const seen = new Set<string>();
    for (const track of data.results) {
      if (!track || track.kind !== "song" || !Number.isSafeInteger(track.trackId)
        || typeof track.trackName !== "string" || typeof track.artistName !== "string") continue;
      const song: Song = {
        id: track.trackId,
        title: track.trackName,
        artist: track.artistName,
        album: typeof track.collectionName === "string" ? track.collectionName : "",
      };
      const key = songKey(song);
      if (!seen.has(key)) {
        songs.push(song);
        seen.add(key);
      }
    }
    return NextResponse.json({ songs }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json(
      { error: "El buscador no está disponible ahora. Prueba de nuevo en unos instantes." },
      { status: 503 },
    );
  }
}
