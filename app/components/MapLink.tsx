const address = "C. Amsterdam, 2, 30509 Molina de Segura, Murcia";
const encodedAddress = encodeURIComponent(address);
const href = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

export function MapLink() {
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
