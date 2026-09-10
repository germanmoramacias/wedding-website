import type { Song } from "./songs";

export type RsvpEmailGuest = {
  name: string;
  mainCourse: string;
  specialNeeds: string;
};

export type RsvpEmailSubmission = {
  name: string;
  email: string;
  attending: boolean;
  mainCourse: string | null;
  specialNeeds: string;
  guests: RsvpEmailGuest[];
  songs: Song[];
  message: string;
};

type EmailDocument = {
  html: string;
  text: string;
};

const COLORS = {
  ivory: "#f7f3eb",
  ivoryDeep: "#eee7da",
  paper: "#fffdf8",
  ink: "#26342c",
  olive: "#30483b",
  oliveLight: "#75806d",
  gold: "#b4955f",
  goldSoft: "#d9c8a8",
  taupe: "#756e64",
  line: "#d9d2c5",
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function withLineBreaks(value: string) {
  return escapeHtml(value).replaceAll("\n", "<br>");
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

function attendanceText(submission: RsvpEmailSubmission) {
  if (!submission.attending) {
    return ["Asistencia: No podrá asistir", "Número de asistentes: 0"];
  }

  return [
    "Asistencia: Sí, asistirá",
    `Número de asistentes: ${submission.guests.length + 1}`,
    `Plato principal de ${submission.name}: ${submission.mainCourse}`,
    `Necesidades especiales de ${submission.name}: ${submission.specialNeeds || "Ninguna"}`,
    ...submission.guests.flatMap((guest, index) => [
      `Acompañante ${index + 1}: ${guest.name}`,
      `Plato principal: ${guest.mainCourse}`,
      `Necesidades especiales: ${guest.specialNeeds || "Ninguna"}`,
    ]),
  ];
}

function songText(songs: Song[]) {
  return songs.length
    ? ["Canciones recomendadas:", ...songs.map((song, index) =>
        `${index + 1}. ${song.title} — ${song.artist}${song.album ? ` (${song.album})` : ""}`,
      )]
    : ["Canciones recomendadas: Ninguna"];
}

function eventDetails() {
  return `<tr>
    <td class="email-padding" style="padding:28px 48px;background:${COLORS.ivory};border-bottom:1px solid ${COLORS.line};">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td class="event-cell" width="31%" valign="top" style="width:31%;padding-right:18px;">
            <p style="margin:0 0 5px;color:${COLORS.gold};font-size:10px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;">Fecha</p>
            <p style="margin:0;color:${COLORS.ink};font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.45;">21 de noviembre</p>
          </td>
          <td class="event-cell" width="19%" valign="top" style="width:19%;padding-right:18px;">
            <p style="margin:0 0 5px;color:${COLORS.gold};font-size:10px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;">Hora</p>
            <p style="margin:0;color:${COLORS.ink};font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.45;">12:00 h</p>
          </td>
          <td class="event-cell" width="50%" valign="top" style="width:50%;">
            <p style="margin:0 0 5px;color:${COLORS.gold};font-size:10px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;">Lugar</p>
            <p style="margin:0;color:${COLORS.ink};font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.45;">Restaurante Molina Real</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function emailShell({
  preheader,
  title,
  intro,
  status,
  body,
  footer,
  showEventDetails = true,
}: {
  preheader: string;
  title: string;
  intro: string;
  status: string;
  body: string;
  footer: string;
  showEventDetails?: boolean;
}) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>${escapeHtml(title)}</title>
    <style>
      @media only screen and (max-width: 640px) {
        .email-shell { width: 100% !important; }
        .email-padding { padding-left: 24px !important; padding-right: 24px !important; }
        .event-cell { display: block !important; width: 100% !important; padding: 0 0 18px !important; }
        .event-cell:last-child { padding-bottom: 0 !important; }
        .person-details { display: block !important; width: 100% !important; padding: 8px 0 0 !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:${COLORS.ivoryDeep};color:${COLORS.ink};font-family:Avenir,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:${COLORS.ivoryDeep};">
      <tr>
        <td align="center" style="padding:32px 12px;">
          <table role="presentation" class="email-shell" width="640" cellspacing="0" cellpadding="0" border="0" style="width:640px;max-width:640px;background:${COLORS.paper};border:1px solid ${COLORS.line};">
            <tr>
              <td class="email-padding" style="padding:40px 48px 38px;background:${COLORS.olive};color:${COLORS.paper};">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="font-family:Georgia,'Times New Roman',serif;font-size:29px;line-height:1;color:${COLORS.paper};">I <span style="color:${COLORS.goldSoft};font-style:italic;">&amp;</span> P</td>
                    <td align="right" style="color:${COLORS.goldSoft};font-size:11px;line-height:1.3;font-weight:600;letter-spacing:2.2px;text-transform:uppercase;">21 · 11 · 2026</td>
                  </tr>
                </table>
                <div style="height:1px;margin:28px 0 30px;background:rgba(217,200,168,.45);font-size:0;line-height:0;">&nbsp;</div>
                <h1 style="margin:0;color:${COLORS.paper};font-family:Georgia,'Times New Roman',serif;font-size:39px;line-height:1.12;font-weight:400;letter-spacing:-.5px;">${escapeHtml(title)}</h1>
                <p style="margin:17px 0 0;max-width:500px;color:#eef0eb;font-size:16px;line-height:1.7;">${escapeHtml(intro)}</p>
                <p style="display:inline-block;margin:24px 0 0;padding:8px 13px;border:1px solid rgba(217,200,168,.55);color:${COLORS.goldSoft};font-size:10px;line-height:1.3;font-weight:700;letter-spacing:1.7px;text-transform:uppercase;">${escapeHtml(status)}</p>
              </td>
            </tr>
            ${showEventDetails ? eventDetails() : ""}
            <tr>
              <td class="email-padding" style="padding:38px 48px 46px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td class="email-padding" align="center" style="padding:30px 48px;background:${COLORS.ivory};border-top:1px solid ${COLORS.line};">
                <p style="margin:0;color:${COLORS.olive};font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.3;font-style:italic;">Inma &amp; Pascual</p>
                <p style="margin:9px 0 0;color:${COLORS.taupe};font-size:10px;line-height:1.5;font-weight:600;letter-spacing:1.8px;text-transform:uppercase;">${escapeHtml(footer)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function sectionTitle(title: string) {
  return `<h2 style="margin:0 0 15px;color:${COLORS.olive};font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;font-weight:400;">${escapeHtml(title)}</h2>`;
}

function personBlock(label: string, name: string, course: string | null, specialNeeds: string) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:0 0 10px;background:${COLORS.ivory};border:1px solid ${COLORS.line};">
    <tr>
      <td valign="top" style="padding:19px 20px;">
        <p style="margin:0 0 4px;color:${COLORS.gold};font-size:9px;line-height:1.4;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">${escapeHtml(label)}</p>
        <p style="margin:0;color:${COLORS.ink};font-size:16px;line-height:1.45;font-weight:600;">${escapeHtml(name)}</p>
      </td>
      <td class="person-details" width="48%" valign="top" style="width:48%;padding:19px 20px 19px 0;">
        <p style="margin:0 0 4px;color:${COLORS.taupe};font-size:10px;line-height:1.4;letter-spacing:.8px;text-transform:uppercase;">Plato principal</p>
        <p style="margin:0 0 10px;color:${COLORS.ink};font-size:14px;line-height:1.45;">${escapeHtml(course || "—")}</p>
        <p style="margin:0 0 4px;color:${COLORS.taupe};font-size:10px;line-height:1.4;letter-spacing:.8px;text-transform:uppercase;">Necesidades especiales</p>
        <p style="margin:0;color:${COLORS.ink};font-size:14px;line-height:1.5;">${escapeHtml(specialNeeds || "Ninguna")}</p>
      </td>
    </tr>
  </table>`;
}

function songsBlock(songs: Song[]) {
  if (!songs.length) {
    return `<p style="margin:0;color:${COLORS.taupe};font-size:14px;line-height:1.7;">No se han añadido canciones.</p>`;
  }

  return songs.map((song, index) => `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-bottom:1px solid ${COLORS.line};">
    <tr>
      <td width="34" valign="top" style="width:34px;padding:11px 0;color:${COLORS.gold};font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:1.4;">${String(index + 1).padStart(2, "0")}</td>
      <td valign="top" style="padding:11px 0;">
        <p style="margin:0;color:${COLORS.ink};font-size:14px;line-height:1.45;font-weight:600;">${escapeHtml(song.title)}</p>
        <p style="margin:3px 0 0;color:${COLORS.taupe};font-size:12px;line-height:1.45;">${escapeHtml(song.artist)}${song.album ? ` · ${escapeHtml(song.album)}` : ""}</p>
      </td>
    </tr>
  </table>`).join("");
}

function messageBlock(message: string) {
  return `<div style="padding:20px 22px;background:${COLORS.ivory};border:1px solid ${COLORS.line};">
    <p style="margin:0;color:${message ? COLORS.ink : COLORS.taupe};font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.75;font-style:${message ? "italic" : "normal"};">${message ? `“${withLineBreaks(message)}”` : "Sin mensaje adicional."}</p>
  </div>`;
}

function spacer(size = 32) {
  return `<div style="height:${size}px;font-size:0;line-height:0;">&nbsp;</div>`;
}

function attendeesBlock(submission: RsvpEmailSubmission) {
  if (!submission.attending) {
    return `<div style="padding:19px 20px;background:${COLORS.ivory};border:1px solid ${COLORS.line};">
      <p style="margin:0;color:${COLORS.taupe};font-size:14px;line-height:1.65;">${escapeHtml(submission.name)} ha indicado que no podrá acompañarnos.</p>
    </div>`;
  }

  return [
    personBlock("Persona que confirma", submission.name, submission.mainCourse, submission.specialNeeds),
    ...submission.guests.map((guest, index) =>
      personBlock(`Acompañante ${index + 1}`, guest.name, guest.mainCourse, guest.specialNeeds),
    ),
  ].join("");
}

export function buildConfirmationEmail(submission: RsvpEmailSubmission): EmailDocument {
  const attendeeCount = submission.attending ? submission.guests.length + 1 : 0;
  const body = `
    ${sectionTitle("Tu confirmación")}
    <p style="margin:0 0 18px;color:${COLORS.taupe};font-size:14px;line-height:1.7;">Hemos guardado estos datos. Si necesitas modificar algo, responde directamente a este correo.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin-bottom:22px;background:${COLORS.olive};color:${COLORS.paper};">
      <tr>
        <td style="padding:18px 20px;">
          <p style="margin:0 0 4px;color:${COLORS.goldSoft};font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Asistencia</p>
          <p style="margin:0;color:${COLORS.paper};font-size:15px;line-height:1.45;font-weight:600;">${submission.attending ? "Sí, allí estaré" : "No podré ir"}</p>
        </td>
        <td align="right" style="padding:18px 20px;">
          <p style="margin:0 0 4px;color:${COLORS.goldSoft};font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Asistentes</p>
          <p style="margin:0;color:${COLORS.paper};font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.2;">${attendeeCount}</p>
        </td>
      </tr>
    </table>
    ${attendeesBlock(submission)}
    ${spacer()}
    ${sectionTitle("Vuestras canciones")}
    ${songsBlock(submission.songs)}
    ${spacer()}
    ${sectionTitle("Tu mensaje")}
    ${messageBlock(submission.message)}`;

  const text = [
    `Hola ${firstName(submission.name)},`,
    "",
    "Hemos recibido correctamente tu confirmación para nuestra boda.",
    "",
    ...attendanceText(submission),
    "",
    ...songText(submission.songs),
    "",
    `Mensaje: ${submission.message || "Sin mensaje"}`,
    "",
    "Si necesitas modificar algo, responde a este correo.",
    "",
    "Muchas gracias por responder.",
    "Inma y Pascual",
  ].join("\n");

  return {
    html: emailShell({
      preheader: "Hemos recibido tu confirmación para la boda de Inma y Pascual.",
      title: "Confirmación recibida",
      intro: `Hola ${firstName(submission.name)}, ya tenemos tu respuesta. Gracias por dedicarnos un momento.`,
      status: submission.attending ? "Asistencia confirmada" : "Respuesta recibida",
      body,
      footer: "Nos vemos muy pronto",
    }),
    text,
  };
}

export function buildNotificationEmail(submission: RsvpEmailSubmission): EmailDocument {
  const attendeeCount = submission.attending ? submission.guests.length + 1 : 0;
  const body = `
    ${sectionTitle("Datos de contacto")}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:${COLORS.ivory};border:1px solid ${COLORS.line};">
      <tr>
        <td style="padding:18px 20px;border-bottom:1px solid ${COLORS.line};">
          <p style="margin:0 0 4px;color:${COLORS.gold};font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Nombre</p>
          <p style="margin:0;color:${COLORS.ink};font-size:15px;line-height:1.5;font-weight:600;">${escapeHtml(submission.name)}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 20px;">
          <p style="margin:0 0 4px;color:${COLORS.gold};font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Correo electrónico</p>
          <p style="margin:0;color:${COLORS.ink};font-size:15px;line-height:1.5;word-break:break-word;">${escapeHtml(submission.email)}</p>
        </td>
      </tr>
    </table>
    <p style="margin:13px 0 0;color:${COLORS.taupe};font-size:12px;line-height:1.6;">Podéis responder a este correo para escribir directamente a ${escapeHtml(firstName(submission.name))}.</p>
    ${spacer()}
    ${sectionTitle("Resumen de asistencia")}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin-bottom:22px;background:${COLORS.olive};color:${COLORS.paper};">
      <tr>
        <td style="padding:18px 20px;">
          <p style="margin:0 0 4px;color:${COLORS.goldSoft};font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Respuesta</p>
          <p style="margin:0;color:${COLORS.paper};font-size:15px;line-height:1.45;font-weight:600;">${submission.attending ? "Asistirá" : "No asistirá"}</p>
        </td>
        <td align="right" style="padding:18px 20px;">
          <p style="margin:0 0 4px;color:${COLORS.goldSoft};font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Total</p>
          <p style="margin:0;color:${COLORS.paper};font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.2;">${attendeeCount}</p>
        </td>
      </tr>
    </table>
    ${attendeesBlock(submission)}
    ${spacer()}
    ${sectionTitle("Canciones recomendadas")}
    ${songsBlock(submission.songs)}
    ${spacer()}
    ${sectionTitle("Mensaje para los novios")}
    ${messageBlock(submission.message)}`;

  const text = [
    "Nueva confirmación desde la web",
    "",
    `Nombre: ${submission.name}`,
    `Email: ${submission.email}`,
    ...attendanceText(submission),
    "",
    ...songText(submission.songs),
    "",
    `Mensaje: ${submission.message || "Sin mensaje"}`,
    "",
    `Responde a este correo para escribir a ${submission.email}.`,
  ].join("\n");

  return {
    html: emailShell({
      preheader: `${submission.name} ha enviado una nueva confirmación.`,
      title: "Nueva confirmación",
      intro: `${submission.name} acaba de responder desde la web de la boda.`,
      status: submission.attending ? "Asistirá" : "No asistirá",
      body,
      footer: "Panel de confirmaciones",
      showEventDetails: false,
    }),
    text,
  };
}
