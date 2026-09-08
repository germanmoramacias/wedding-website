"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const IBAN = "ES2100730100540215177121";
const IBAN_GROUPS = IBAN.match(/.{1,4}/g) ?? [];

export function CopyIban() {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (status !== "copied") return;
    const timer = window.setTimeout(() => setStatus("idle"), 3000);
    return () => window.clearTimeout(timer);
  }, [status]);

  async function copyIban() {
    try {
      await navigator.clipboard.writeText(IBAN);
      setStatus("copied");
    } catch {
      if (numberRef.current) {
        const range = document.createRange();
        range.selectNodeContents(numberRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      setStatus("error");
    }
  }

  return (
    <div className="gift-account">
      <div className="gift-account__row">
        <div className="gift-account__details">
          <span className="gift-account__label">IBAN</span>
          <span className="gift-account__number" ref={numberRef}>
            {IBAN_GROUPS.map((group, index) => (
              <span key={index}>{group}{index < IBAN_GROUPS.length - 1 ? " " : ""}</span>
            ))}
          </span>
        </div>
        <button
          className="gift-account__copy"
          type="button"
          onClick={copyIban}
          aria-label={status === "copied" ? "IBAN copiado" : "Copiar IBAN"}
          title={status === "copied" ? "IBAN copiado" : "Copiar IBAN"}
        >
          {status === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        </button>
      </div>
      <p className="gift-account__status" role="status" aria-live="polite">
        {status === "copied"
          ? "IBAN copiado al portapapeles."
          : status === "error"
            ? "No se ha podido copiar. El número está seleccionado para que puedas copiarlo manualmente."
            : ""}
      </p>
    </div>
  );
}
