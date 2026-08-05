"use client";

import { useEffect, useState } from "react";

const address = "Molina Real Celebraciones, Calle Amsterdam 2, 30509 Molina de Segura, Murcia";
const encodedAddress = encodeURIComponent(address);

export function MapLink({ compact = false }: { compact?: boolean }) {
  const [appleDevice, setAppleDevice] = useState(false);

  useEffect(() => {
    const platform = navigator.userAgent || navigator.platform;
    setAppleDevice(/iPad|iPhone|iPod|Macintosh/i.test(platform));
  }, []);

  const href = appleDevice
    ? `https://maps.apple.com/?q=${encodedAddress}`
    : `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  return (
    <a
      className={compact ? "button button--small" : "button button--light"}
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {appleDevice ? "Abrir en Mapas" : compact ? "Google Maps" : "Abrir en Google Maps"}
      <span aria-hidden="true">↗</span>
    </a>
  );
}
