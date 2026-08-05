"use client";

import { useEffect, useState } from "react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallButton() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setInstalled(standalone);

    const savePrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    const markInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", savePrompt);
    window.addEventListener("appinstalled", markInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", savePrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  const install = async () => {
    if (!prompt) {
      setShowHelp(true);
      return;
    }
    await prompt.prompt();
    const result = await prompt.userChoice;
    if (result.outcome === "accepted") setPrompt(null);
  };

  if (installed) return <span className="installed-label">Invitación guardada</span>;

  return (
    <>
      <button className="install-button" type="button" onClick={install}>
        Guardar invitación
      </button>
      {showHelp && (
        <div className="install-help" role="dialog" aria-modal="true" aria-labelledby="install-title">
          <button
            className="install-help__backdrop"
            type="button"
            aria-label="Cerrar instrucciones"
            onClick={() => setShowHelp(false)}
          />
          <div className="install-help__card">
            <p className="eyebrow">Siempre a mano</p>
            <h2 id="install-title">Guarda la invitación</h2>
            <p>
              En iPhone o iPad, pulsa <strong>Compartir</strong> y después
              <strong> “Añadir a pantalla de inicio”</strong>. En Android, abre el menú del navegador
              y elige <strong>“Instalar aplicación”</strong>.
            </p>
            <button className="button" type="button" onClick={() => setShowHelp(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
