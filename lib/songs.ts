export type Song = {
  id: number;
  title: string;
  artist: string;
  album: string;
};

export function songKey(song: Song) {
  return `${song.artist.trim().toLowerCase()}::${song.title.trim().toLowerCase()}`;
}

export function formatSongRecommendations(songs: Song[]) {
  return songs.length
    ? ["Canciones recomendadas:", ...songs.map((song, index) =>
        `${index + 1}. ${song.title} — ${song.artist}${song.album ? ` (${song.album})` : ""}`,
      )]
    : [];
}
