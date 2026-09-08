"use client";

import { useEffect, useState } from "react";

const address = "C. Amsterdam, 2, 30509 Molina de Segura, Murcia";
const encodedAddress = encodeURIComponent(address);

export function MapLink() {
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
      className="button button--small"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      Abrir en mapas
      <span aria-hidden="true">↗</span>
    </a>
  );
}
