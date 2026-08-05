import { Countdown } from "./components/Countdown";
import { InstallButton } from "./components/InstallButton";
import { MapLink } from "./components/MapLink";
import { Reveal } from "./components/Reveal";
import { RsvpForm } from "./components/RsvpForm";
import { ShareButton } from "./components/ShareButton";

const WEDDING_DATE = "2026-11-14T17:30:00+01:00";

const weddingStructuredData = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Boda de Inma y Pascual",
  description: "Celebración de la boda de Inma y Pascual en Molina Real.",
  startDate: "2026-11-14T17:30:00+01:00",
  endDate: "2026-11-15T02:00:00+01:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: "Molina Real Celebraciones",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Calle Ámsterdam, 2 · Urbanización Los Conejos",
      postalCode: "30509",
      addressLocality: "Molina de Segura",
      addressRegion: "Murcia",
      addressCountry: "ES",
    },
  },
};

const agenda = [
  {
    time: "17:30",
    title: "Ceremonia",
    text: "En el olivar de la finca. Te esperamos un poquito antes para empezar puntuales.",
  },
  {
    time: "18:30",
    title: "Cóctel",
    text: "Brindis, aperitivos y ese primer abrazo después del sí quiero.",
  },
  {
    time: "20:30",
    title: "Banquete",
    text: "Cena bajo la pérgola del patio principal.",
  },
  {
    time: "23:30",
    title: "Baile",
    text: "Música y barra libre hasta que el cuerpo aguante.",
  },
];

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(weddingStructuredData) }}
      />
      <section className="hero" aria-labelledby="wedding-title">
        <img
          className="hero__image"
          src="/hero.jpg"
          alt="Olivar preparado para una ceremonia de boda al atardecer"
          fetchPriority="high"
        />
        <div className="hero__veil" aria-hidden="true" />

        <header className="site-header">
          <a className="monogram" href="#inicio" aria-label="Volver al inicio">
            I <span aria-hidden="true">&</span> P
          </a>
          <nav className="site-nav" aria-label="Navegación principal">
            <a href="#el-dia">El día</a>
            <a href="#lugar">Lugar</a>
            <a href="#confirmacion">Confirmación</a>
          </nav>
          <InstallButton />
        </header>

        <div className="hero__content" id="inicio">
          <p className="eyebrow hero__eyebrow">Nos casamos</p>
          <h1 id="wedding-title">
            <span>Inma</span>
            <i>&amp;</i>
            <span>Pascual</span>
          </h1>
          <div className="gold-rule" aria-hidden="true" />
          <p className="hero__date">14 · 11 · 2026</p>
          <p className="hero__place">Molina de Segura · Murcia</p>
          <ShareButton variant="hero" />
        </div>

        <a className="scroll-cue" href="#bienvenida">
          <span>Descubre el día</span>
          <b aria-hidden="true">↓</b>
        </a>
      </section>

      <section className="section welcome" id="bienvenida">
        <Reveal className="section__inner section__inner--narrow">
          <p className="eyebrow">Una historia, un día</p>
          <blockquote>
            «Después de tantos caminos compartidos, elegimos el mismo para siempre.»
          </blockquote>
          <p className="body-copy">
            Nos hace muchísima ilusión celebrarlo contigo. Hemos preparado este rincón para que
            tengas a mano todos los detalles y puedas acompañarnos en un día inolvidable.
          </p>
        </Reveal>

        <Reveal className="countdown-wrap" delay={120}>
          <p className="countdown-label">Solo faltan</p>
          <Countdown target={WEDDING_DATE} />
        </Reveal>
      </section>

      <section className="section agenda" id="el-dia">
        <Reveal className="section__heading">
          <p className="eyebrow">El día</p>
          <h2>Sábado, 14 de noviembre</h2>
          <p>Cuatro momentos y muchas ganas de compartirlos contigo.</p>
        </Reveal>

        <ol className="timeline">
          {agenda.map((item, index) => (
            <Reveal as="li" className="timeline__item" delay={index * 90} key={item.time}>
              <span className="timeline__number">0{index + 1}</span>
              <time>{item.time}</time>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal className="calendar-row">
          <a className="button button--outline" href="/inma-pascual.ics" download>
            Añadir al calendario
          </a>
        </Reveal>
      </section>

      <section className="venue" id="lugar">
        <div className="venue__photo" aria-hidden="true">
          <img src="/hero.jpg" alt="" loading="lazy" />
        </div>
        <Reveal className="venue__content">
          <p className="eyebrow eyebrow--light">Ceremonia y celebración</p>
          <h2>Molina Real</h2>
          <address>
            Urbanización Los Conejos · C/ Ámsterdam, 2
            <br />
            30509 Molina de Segura (Murcia)
          </address>
          <p>
            Todo sucede en el mismo lugar. La finca dispone de aparcamiento gratuito para todos
            los invitados.
          </p>
          <div className="venue__actions">
            <MapLink />
            <a className="text-link text-link--light" href="#mapa">
              Ver el mapa
            </a>
          </div>
        </Reveal>
      </section>

      <section className="section map-section" id="mapa">
        <Reveal className="map-card">
          <iframe
            title="Mapa de Molina Real Celebraciones"
            src="https://www.google.com/maps?q=Molina%20Real%20Celebraciones%2C%20Calle%20Amsterdam%202%2C%2030509%20Molina%20de%20Segura%2C%20Murcia&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="map-card__caption">
            <div>
              <p className="eyebrow">Cómo llegar</p>
              <strong>Molina Real · Molina de Segura</strong>
            </div>
            <MapLink compact />
          </div>
        </Reveal>
      </section>

      <section className="section rsvp" id="confirmacion">
        <Reveal className="section__heading section__heading--narrow">
          <p className="eyebrow">Confirmación</p>
          <h2>¿Nos acompañas?</h2>
          <p>
            Confírmanos tu asistencia y tus preferencias antes del 30 de septiembre de 2026.
          </p>
        </Reveal>
        <Reveal className="rsvp__form-wrap" delay={100}>
          <RsvpForm />
        </Reveal>
      </section>

      <footer className="footer">
        <p className="monogram monogram--footer">I <span>&amp;</span> P</p>
        <p className="footer__names">Inma &amp; Pascual</p>
        <p>Con todo nuestro cariño</p>
        <ShareButton />
      </footer>
    </main>
  );
}
