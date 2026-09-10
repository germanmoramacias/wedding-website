"use client";

import { useRef, useState, type FormEvent } from "react";
import { SongRecommendations } from "./SongRecommendations";
import type { Song } from "@/lib/songs";

type MainCourse = "Carne" | "Pescado" | "Vegano";
type Guest = {
  id: number;
  name: string;
  mainCourse: MainCourse;
  specialNeeds: string;
};

const COURSES = ["Carne", "Pescado", "Vegano"] as const;

function CourseSelector({
  value,
  onChange,
  label,
}: {
  value: MainCourse;
  onChange: (value: MainCourse) => void;
  label: string;
}) {
  return (
    <fieldset className="course-selector">
      <legend>{label}</legend>
      <div className="choice-row choice-row--compact">
        {COURSES.map((course) => (
          <button
            className={value === course ? "choice choice--active" : "choice"}
            type="button"
            aria-pressed={value === course}
            onClick={() => onChange(course)}
            key={course}
          >
            {course}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function RsvpForm() {
  const nextGuestId = useRef(1);
  const lastSubmission = useRef<{ fingerprint: string; id: string } | null>(null);
  const [attending, setAttending] = useState(true);
  const [mainCourse, setMainCourse] = useState<MainCourse>("Carne");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [status, setStatus] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [songs, setSongs] = useState<Song[]>([]);

  const addGuest = () => {
    const id = nextGuestId.current++;
    setGuests((current) => [
      ...current,
      { id, name: "", mainCourse: "Carne", specialNeeds: "" },
    ]);
  };

  const updateGuest = (id: number, update: Partial<Omit<Guest, "id">>) => {
    setGuests((current) =>
      current.map((guest) => (guest.id === id ? { ...guest, ...update } : guest)),
    );
  };

  const removeGuest = (id: number) => {
    setGuests((current) => current.filter((guest) => guest.id !== id));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const payload = {
      name,
      email,
      attending,
      mainCourse: attending ? mainCourse : null,
      specialNeeds: attending ? String(data.get("specialNeeds") || "").trim() : "",
      guests: attending
        ? guests.map(({ name: guestName, mainCourse: guestCourse, specialNeeds }) => ({
            name: guestName.trim(),
            mainCourse: guestCourse,
            specialNeeds: specialNeeds.trim(),
          }))
        : [],
      songs,
      message: String(data.get("message") || "").trim(),
      website: String(data.get("website") || ""),
    };
    const fingerprint = JSON.stringify(payload);
    if (!lastSubmission.current || lastSubmission.current.fingerprint !== fingerprint) {
      const id = typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      lastSubmission.current = { fingerprint, id };
    }

    setSubmitState("sending");
    setStatus("Enviando tu confirmación…");

    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15_000);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, submissionId: lastSubmission.current.id }),
        signal: controller.signal,
      });
      const result: unknown = await response.json();
      const errorMessage = result && typeof result === "object" && "error" in result &&
        typeof result.error === "string"
        ? result.error
        : "No hemos podido enviar la confirmación. Inténtalo de nuevo.";
      if (!response.ok) throw new Error(errorMessage);

      setSubmitState("success");
      setStatus("Confirmación enviada. Te hemos mandado una copia por correo.");
    } catch (error) {
      setSubmitState("error");
      setStatus(timedOut
        ? "El envío está tardando demasiado. Comprueba tu conexión y vuelve a intentarlo."
        : error instanceof Error
          ? error.message
          : "No hemos podido enviar la confirmación. Inténtalo de nuevo.");
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  return (
    <form className="rsvp-form" onSubmit={submit} aria-busy={submitState === "sending"}>
      <input
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        hidden
      />
      <div className="form-grid">
        <label>
          <span>Nombre y apellidos</span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Ej. María García López"
            minLength={2}
            maxLength={80}
            required
          />
        </label>
        <label>
          <span>Correo electrónico</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="maria@correo.com"
            maxLength={120}
            required
          />
        </label>
      </div>

      <fieldset>
        <legend>Asistencia</legend>
        <div className="choice-row">
          <button
            className={attending ? "choice choice--active" : "choice"}
            type="button"
            aria-pressed={attending}
            onClick={() => setAttending(true)}
          >
            Sí, allí estaré
          </button>
          <button
            className={!attending ? "choice choice--active" : "choice"}
            type="button"
            aria-pressed={!attending}
            onClick={() => setAttending(false)}
          >
            No podré ir
          </button>
        </div>
      </fieldset>

      {attending && (
        <div className="attendance-details">
          <CourseSelector
            label="Tu plato principal"
            value={mainCourse}
            onChange={setMainCourse}
          />

          <label>
            <span>Alergias, intolerancias u otras necesidades especiales</span>
            <input
              name="specialNeeds"
              type="text"
              placeholder="Ej. intolerancia a la lactosa"
              maxLength={300}
            />
          </label>

          <section className="guest-section" aria-labelledby="guest-title">
            <div className="guest-section__heading">
              <div>
                <h3 id="guest-title" className="form-section-title">Acompañantes</h3>
                <p>Añade a cada persona y elige su plato principal.</p>
              </div>
              <button className="add-guest-button" type="button" onClick={addGuest}>
                <span aria-hidden="true">+</span> Añadir persona
              </button>
            </div>

            {guests.length === 0 ? (
              <p className="guest-section__empty">Todavía no has añadido acompañantes.</p>
            ) : (
              <div className="guest-list">
                {guests.map((guest, index) => (
                  <div className="guest-card" key={guest.id}>
                    <div className="guest-card__topline">
                      <strong>Acompañante {index + 1}</strong>
                      <button
                        type="button"
                        onClick={() => removeGuest(guest.id)}
                        aria-label={`Eliminar acompañante ${index + 1}`}
                      >
                        Eliminar
                      </button>
                    </div>
                    <label>
                      <span>Nombre y apellidos</span>
                      <input
                        type="text"
                        value={guest.name}
                        placeholder="Ej. Álex García López"
                        minLength={2}
                        maxLength={80}
                        required
                        onChange={(event) => updateGuest(guest.id, { name: event.target.value })}
                      />
                    </label>
                    <CourseSelector
                      label="Plato principal"
                      value={guest.mainCourse}
                      onChange={(course) => updateGuest(guest.id, { mainCourse: course })}
                    />
                    <label>
                      <span>Alergias, intolerancias u otras necesidades especiales</span>
                      <input
                        type="text"
                        value={guest.specialNeeds}
                        placeholder="Ej. menú sin gluten"
                        maxLength={300}
                        onChange={(event) =>
                          updateGuest(guest.id, { specialNeeds: event.target.value })
                        }
                      />
                    </label>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      )}

      <SongRecommendations songs={songs} onChange={setSongs} />

      <label>
        <span>Un mensaje para los novios</span>
        <textarea
          name="message"
          rows={3}
          placeholder="Escribe aquí tu mensaje…"
          maxLength={600}
        />
      </label>

      <div className="form-submit">
        <button className="button" type="submit" disabled={submitState === "sending"}>
          {submitState === "sending" ? "Enviando…" : "Enviar confirmación"}
          {submitState !== "sending" && <span aria-hidden="true">→</span>}
        </button>
        {status && (
          <p
            className={`form-submit__status form-submit__status--${submitState}`}
            role={submitState === "error" ? "alert" : "status"}
          >
            {status}
          </p>
        )}
      </div>
    </form>
  );
}
