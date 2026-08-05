"use client";

import { useEffect, useState } from "react";

const units = [
  { key: "days", label: "Días" },
  { key: "hours", label: "Horas" },
  { key: "minutes", label: "Minutos" },
  { key: "seconds", label: "Segundos" },
] as const;

type TimeLeft = Record<(typeof units)[number]["key"], number>;

function getTimeLeft(target: string): TimeLeft {
  const total = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(total / 86_400_000),
    hours: Math.floor(total / 3_600_000) % 24,
    minutes: Math.floor(total / 60_000) % 60,
    seconds: Math.floor(total / 1_000) % 60,
  };
}

export function Countdown({ target }: { target: string }) {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const update = () => setTime(getTimeLeft(target));
    update();
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, [target]);

  return (
    <ul className="countdown" aria-label="Cuenta atrás para la boda" aria-live="off">
      {units.map((unit) => (
        <li key={unit.key}>
          <span>{time ? String(time[unit.key]).padStart(2, "0") : "––"}</span>
          <small>{unit.label}</small>
        </li>
      ))}
    </ul>
  );
}
