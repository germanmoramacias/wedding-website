import { Countdown } from "./components/Countdown";
import { CopyIban } from "./components/CopyIban";
import { InstallButton } from "./components/InstallButton";
import { MapLink } from "./components/MapLink";
import { Reveal } from "./components/Reveal";
import { RsvpForm } from "./components/RsvpForm";
import { ShareButton } from "./components/ShareButton";
import { VenueMap } from "./components/VenueMap";

const WEDDING_DATE = "2026-11-21T12:00:00+01:00";

const weddingStructuredData = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Boda de Inma y Pascual",
  description: "Celebración de la boda de Inma y Pascual en Molina Real.",
  startDate: WEDDING_DATE,
  endDate: "2026-11-22T02:00:00+01:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: "Molina Real Celebraciones",
    address: {
      "@type": "PostalAddress",
      streetAddress: "C. Amsterdam, 2",
      postalCode: "30509",
      addressLocality: "Molina de Segura",
      addressRegion: "Murcia",
      addressCountry: "ES",
    },
  },
};

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
          <p className="eyebrow hero__eyebrow">Bienvenidos a nuestra boda</p>
          <h1 id="wedding-title">
            <span>Inma</span>
            <i>&amp;</i>
            <span>Pascual</span>
          </h1>
          <div className="gold-rule" aria-hidden="true" />
          <p className="hero__date">21·11·2026</p>
          <p className="hero__place">Molina de Segura · Murcia</p>
          <ShareButton variant="hero" />
        </div>

        <a className="scroll-cue" href="#bienvenida">
          <span>Descubre el día</span>
          <b aria-hidden="true">↓</b>
        </a>
      </section>

      <section className="section welcome" id="bienvenida">
        <Reveal className="section__inner welcome__intro">
          <p className="eyebrow">¡Nos casamos!</p>
          <blockquote>
            «El verdadero significado de nuestro viaje no reside en el destino, sino en compartir cada paso del camino que decidimos empezar juntos.»
          </blockquote>
        </Reveal>
        <Reveal className="section__inner welcome__layout">
          <div className="welcome__photo">
            <img
              src="/inma-pascual.jpg"
              alt="Inma y Pascual mirándose frente al mar"
              width={1366}
              height={768}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="welcome__text">
            <p className="body-copy">
              Dicen que la felicidad solo es real cuando se comparte.
            </p>
            <p className="body-copy">
              Por eso, nos hace mucha ilusión celebrarlo con la gente que da sentido a nuestra historia.
            </p>
            <p className="body-copy">
              Preparad las ganas de bailar, porque os esperamos para vivir una jornada llena de alegría, buena música y recuerdos compartidos.
            </p>
            <p className="welcome__closing">¡No podéis faltar!</p>
          </div>
        </Reveal>

        <Reveal className="countdown-wrap" delay={120}>
          <p className="countdown-label">Solo faltan</p>
          <Countdown target={WEDDING_DATE} />
        </Reveal>
      </section>

      <section className="section agenda" id="el-dia">
        <Reveal className="section__heading">
          <p className="eyebrow">El día</p>
          <h2>Sábado, 21 de noviembre</h2>
        </Reveal>


        <Reveal className="section__inner ceremony-copy">
          <p>
            La ceremonia civil se oficiará a las <strong>12:00</strong> en los jardines del <strong>Restaurante Molina Real</strong>, donde posteriormente tendrá lugar la celebración.
          </p>
          <p>
            Queremos que este día sea una oportunidad para que <strong>desconectéis y disfrutéis al máximo</strong>, y aunque adoramos a los más pequeños, en esta ocasión hemos optado por celebrar nuestro gran día en <strong>compañía exclusiva de invitados adultos</strong>.
          </p>
          <p>
            <strong>Vuestra presencia es el mejor regalo</strong> para dar inicio a este nuevo capítulo de nuestra vida. Si además queréis ayudarnos a impulsar nuestros próximos proyectos en común, vuestro granito de arena será más que bienvenido.
          </p>
          <CopyIban />
        </Reveal>

        <Reveal className="calendar-row">
          <a className="button button--outline" href="/inma-pascual.ics" download>
            Añadir al calendario
          </a>
        </Reveal>
      </section>

      <section className="venue" id="lugar">
        <div className="venue__photo" aria-hidden="true">
          <img src="/molinareal.jpg" alt="" loading="lazy" />
        </div>
        <Reveal className="venue__content">
          <p className="eyebrow eyebrow--light">Ceremonia y celebración</p>
          <h2>Molina Real</h2>
          <address>
            C. Amsterdam, 2, 30509 Molina de Segura, Murcia
          </address>
          <p>
            Todo sucede en el mismo lugar. La finca dispone de aparcamiento gratuito para todos
            los invitados.
          </p>
          <div className="venue__actions">
            <a className="text-link text-link--light" href="#mapa">
              Ver el mapa
            </a>
          </div>
        </Reveal>
      </section>

      <section className="section map-section" id="mapa">
        <Reveal className="map-card">
          <VenueMap />
          <div className="map-card__caption">
            <div>
              <p className="eyebrow">Cómo llegar</p>
              <strong>Molina Real · Molina de Segura</strong>
            </div>
            <MapLink />
          </div>
        </Reveal>
      </section>

      <section className="section rsvp" id="confirmacion">
        <Reveal className="section__heading section__heading--narrow">
          <p className="eyebrow">Confirmación</p>
          <h2>¿Nos acompañas?</h2>
          <p>
            Confírmanos tu asistencia y tus preferencias antes del <b>1 de noviembre de 2026.</b>
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
