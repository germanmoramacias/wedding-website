"use client";

import { useEffect, useMemo, useState } from "react";

const shareTitle = "Inma & Pascual · Nos casamos";
const shareText =
  "Inma y Pascual se casan el 21 de noviembre de 2026 en Molina Real. Consulta todos los detalles y confirma tu asistencia:";

export function ShareButton({ variant = "footer" }: { variant?: "hero" | "footer" }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCurrentUrl(window.location.href);
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const links = useMemo(() => {
    const completeMessage = `${shareText}\n${currentUrl}`;
    return {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(completeMessage)}`,
      sms: `sms:?&body=${encodeURIComponent(completeMessage)}`,
      email: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(
        completeMessage,
      )}`,
    };
  }, [currentUrl]);

  const nativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: shareTitle, text: shareText, url: currentUrl });
      setOpen(false);
    } catch {
      // El usuario puede cerrar la hoja nativa sin realizar ninguna acción.
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  };

  return (
    <>
      <button
        className={variant === "hero" ? "share-button share-button--hero" : "share-button"}
        type="button"
        onClick={() => setOpen(true)}
      >
        Compartir invitación
        <span aria-hidden="true">↗</span>
      </button>

      {open && (
        <div className="share-sheet" role="dialog" aria-modal="true" aria-labelledby="share-title">
          <button
            className="share-sheet__backdrop"
            type="button"
            aria-label="Cerrar opciones para compartir"
            onClick={() => setOpen(false)}
          />
          <div className="share-sheet__card">
            <button
              className="share-sheet__close"
              type="button"
              aria-label="Cerrar"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <p className="eyebrow">Hazles llegar la invitación</p>
            <h2 id="share-title">Compartir este día</h2>
            <p className="share-sheet__intro">
              Envía el enlace por mensaje. Al pegarlo aparecerán los nombres, la fecha y la imagen
              de la invitación.
            </p>

            <div className="share-options">
              {canNativeShare && (
                <button type="button" onClick={nativeShare}>
                  <span aria-hidden="true">↗</span>
                  <strong>Compartir</strong>
                  <small>Menú del dispositivo</small>
                </button>
              )}
              <a href={links.whatsapp} target="_blank" rel="noreferrer">
                <span aria-hidden="true">WA</span>
                <strong>WhatsApp</strong>
                <small>Enviar por chat</small>
              </a>
              <a href={links.sms}>
                <span aria-hidden="true">SMS</span>
                <strong>Mensaje</strong>
                <small>SMS o iMessage</small>
              </a>
              <a href={links.email}>
                <span aria-hidden="true">@</span>
                <strong>Correo</strong>
                <small>Enviar por email</small>
              </a>
              <button type="button" onClick={copyLink}>
                <span aria-hidden="true">⌁</span>
                <strong>{copied ? "Copiado" : "Copiar enlace"}</strong>
                <small>{copied ? "Listo para pegar" : "Guardar en el portapapeles"}</small>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
