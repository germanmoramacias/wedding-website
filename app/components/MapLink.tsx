import type { ReactNode } from "react";

const href = "https://maps.app.goo.gl/Cpi3zcV8CW55NtAt7";

type Props = {
  children?: ReactNode;
  className?: string;
  "aria-label"?: string;
};

export function MapLink({ children, className = "button button--small", "aria-label": ariaLabel }: Props = {}) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel}
    >
      {children ?? <>Abrir en mapas <span aria-hidden="true">↗</span></>}
    </a>
  );
}
