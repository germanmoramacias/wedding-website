"use client";

import { useRef, useState, type FormEvent } from "react";
import { SongRecommendations } from "./SongRecommendations";
import { formatSongRecommendations, type Song } from "@/lib/songs";

const RSVP_EMAIL = "inmaypascual.boda@gmail.com";

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
  const [attending, setAttending] = useState(true);
  const [mainCourse, setMainCourse] = useState<MainCourse>("Carne");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [status, setStatus] = useState("");
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

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const attendeeDetails = attending
      ? [
          `Plato principal de ${name}: ${mainCourse}`,
          `Alergias, intolerancias u otras necesidades especiales de ${name}: ${String(data.get("specialNeeds") || "").trim() || "Ninguna"}`,
          `Acompañantes: ${guests.length}`,
          ...guests.flatMap((guest, index) => [
            `${index + 1}. ${guest.name.trim()} — Plato principal: ${guest.mainCourse}`,
            `   Alergias, intolerancias u otras necesidades especiales: ${guest.specialNeeds.trim() || "Ninguna"}`,
          ]),
        ]
      : [];

    const body = [
      `Nombre: ${name}`,
      `Correo: ${email}`,
      `Asistencia: ${attending ? "Sí, allí estaré" : "No podré ir"}`,
      ...attendeeDetails,
      "",
      ...formatSongRecommendations(songs),
      "",
      `Mensaje: ${data.get("message") || "-"}`,
    ].join("\n");

    window.location.href = `mailto:${RSVP_EMAIL}?subject=${encodeURIComponent(
      `Confirmación de asistencia · ${name}`,
    )}&body=${encodeURIComponent(body)}`;
    setStatus("Hemos preparado tu confirmación. Solo falta enviarla desde tu correo.");
  };

  return (
    <form className="rsvp-form" onSubmit={submit}>
      <div className="form-grid">
        <label>
          <span>Nombre y apellidos</span>
          <input name="name" type="text" autoComplete="name" minLength={2} maxLength={80} required />
        </label>
        <label>
          <span>Correo electrónico</span>
          <input name="email" type="email" autoComplete="email" maxLength={120} required />
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

          <label>
            <span>Alergias, intolerancias u otras necesidades especiales</span>
            <input name="specialNeeds" type="text" maxLength={300} />
          </label>
        </div>
      )}

      <SongRecommendations songs={songs} onChange={setSongs} />

      <label>
        <span>Un mensaje para los novios</span>
        <textarea name="message" rows={3} maxLength={600} />
      </label>

      <div className="form-submit">
        <button className="button" type="submit">
          Enviar confirmación <span aria-hidden="true">→</span>
        </button>
        {status && <p role="status">{status}</p>}
      </div>
    </form>
  );
}
