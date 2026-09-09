"use client";

import { Check, Plus, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { songKey, type Song } from "@/lib/songs";

type Props = {
  songs: Song[];
  onChange: (songs: Song[]) => void;
};

export function SongRecommendations({ songs, onChange }: Props) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const requestRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedKeys = new Set(songs.map(songKey));

  useEffect(() => () => requestRef.current?.abort(), []);

  function changeQuery(value: string) {
    requestRef.current?.abort();
    requestRef.current = null;
    setQuery(value);
    setResults([]);
    setState("idle");
  }

  async function search() {
    if (query.trim().length < 2 || state === "loading") return;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setState("loading");
    setResults([]);
    setNotice("");
    try {
      const response = await fetch(`/api/songs?q=${encodeURIComponent(query.trim())}`, {
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se ha podido completar la búsqueda.");
      if (requestRef.current !== controller) return;
      setResults(data.songs);
      setState("done");
    } catch (cause) {
      if (controller.signal.aborted || requestRef.current !== controller) return;
      setError(cause instanceof Error ? cause.message : "No se ha podido buscar. Inténtalo de nuevo.");
      setState("error");
    }
  }

  function add(song: Song) {
    if (selectedKeys.has(songKey(song))) return;
    onChange([...songs, song]);
    setNotice(`Añadida: ${song.title}, de ${song.artist}.`);
  }

  function remove(song: Song) {
    onChange(songs.filter((item) => songKey(item) !== songKey(song)));
    setNotice(`Eliminada: ${song.title}, de ${song.artist}.`);
    inputRef.current?.focus({ preventScroll: true });
  }

  return (
    <section className="song-picker" aria-labelledby={`${id}-title`}>
      <div className="song-picker__heading">
        <h3 className="form-section-title" id={`${id}-title`}>¿Qué canción te sacaría a bailar?</h3>
      </div>

      <label htmlFor={`${id}-search`} className="song-picker__label">Canción o artista</label>
      <div className="song-picker__search">
        <div className="song-picker__search-field">
          <Search aria-hidden="true" />
          <input
            id={`${id}-search`}
            ref={inputRef}
            type="search"
            value={query}
            placeholder="Ej. Vivir mi vida · Marc Anthony"
            maxLength={100}
            autoComplete="off"
            aria-describedby={`${id}-help`}
            aria-controls={`${id}-results`}
            onChange={(event) => changeQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                event.preventDefault();
                void search();
              }
            }}
          />
        </div>
        <button type="button" className="song-picker__search-button" onClick={search}
          disabled={query.trim().length < 2 || state === "loading"}>
          {state === "loading" ? "Buscando…" : "Buscar"}
        </button>
      </div>
      <span id={`${id}-help`} className="sr-only">Escribe al menos 2 caracteres para buscar.</span>

      <div id={`${id}-results`} aria-busy={state === "loading"}>
        <p className={state === "error" || (state === "done" && results.length === 0)
          ? "song-picker__feedback" : "sr-only"} role="status">
          {state === "loading" ? "Buscando canciones…"
            : state === "error" ? error
              : state === "done" ? results.length
                ? `${results.length} canciones encontradas.`
                : "No encontramos canciones. Prueba con otro título o artista."
                : ""}
        </p>
        {results.length > 0 && (
          <ul className="song-picker__list song-picker__results" aria-label="Resultados de canciones">
            {results.map((song) => {
              const added = selectedKeys.has(songKey(song));
              return (
                <li key={song.id} className="song-picker__track">
                  <div className="song-picker__track-info">
                    <strong>{song.title}</strong>
                    <span>{song.artist}</span>
                    {song.album && <small>{song.album}</small>}
                  </div>
                  <button type="button" className="song-picker__action" disabled={added}
                    onClick={() => add(song)} aria-label={`${added ? "Añadida" : "Añadir"}: ${song.title}, de ${song.artist}`}>
                    {added ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
                    <span>{added ? "Añadida" : "Añadir"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {songs.length > 0 && (
        <div className="song-picker__selection">
          <h4>Tu lista <span>({songs.length})</span></h4>
          <ul className="song-picker__list" aria-label="Canciones seleccionadas">
            {songs.map((song) => (
              <li key={song.id} className="song-picker__track">
                <div className="song-picker__track-info">
                  <strong>{song.title}</strong>
                  <span>{song.artist}</span>
                </div>
                <button type="button" className="song-picker__action" onClick={() => remove(song)}
                  aria-label={`Eliminar: ${song.title}, de ${song.artist}`}>
                  <X aria-hidden="true" /><span>Eliminar</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <span className="sr-only" role="status">{notice}</span>
    </section>
  );
}
