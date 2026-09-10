import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  buildConfirmationEmail,
  buildNotificationEmail,
  type RsvpEmailGuest,
  type RsvpEmailSubmission,
} from "@/lib/rsvp-emails";
import type { Song } from "@/lib/songs";

export const runtime = "nodejs";

const FROM_ADDRESS = "confirmacion@mail.ceremoniainmaypascual.com";
const MAX_BODY_SIZE = 32_000;
const COURSES = new Set(["Carne", "Pescado", "Vegano"]);

type RsvpSubmission = RsvpEmailSubmission & {
  submissionId: string;
};

function json(data: object, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function singleLine(value: unknown, maxLength: number) {
  if (typeof value !== "string" || value.length > maxLength) return null;
  return value.trim().replace(/\s+/g, " ");
}

function multiline(value: unknown, maxLength: number) {
  if (typeof value !== "string" || value.length > maxLength) return null;
  return value.trim().replace(/\r\n?/g, "\n");
}

function parseGuest(value: unknown): RsvpEmailGuest | null {
  if (!isRecord(value)) return null;
  const name = singleLine(value.name, 80);
  const specialNeeds = multiline(value.specialNeeds, 300);
  if (!name || name.length < 2 || !COURSES.has(String(value.mainCourse)) || specialNeeds === null) {
    return null;
  }
  return { name, mainCourse: String(value.mainCourse), specialNeeds };
}

function parseSong(value: unknown): Song | null {
  if (!isRecord(value) || !Number.isSafeInteger(value.id)) return null;
  const title = singleLine(value.title, 200);
  const artist = singleLine(value.artist, 200);
  const album = singleLine(value.album, 200);
  if (!title || !artist || album === null) return null;
  return { id: Number(value.id), title, artist, album };
}

function parseSubmission(value: unknown): RsvpSubmission | null {
  if (!isRecord(value)) return null;

  const submissionId = singleLine(value.submissionId, 80);
  const name = singleLine(value.name, 80);
  const email = singleLine(value.email, 120);
  const specialNeeds = multiline(value.specialNeeds, 300);
  const message = multiline(value.message, 600);
  const guests = Array.isArray(value.guests) && value.guests.length <= 20
    ? value.guests.map(parseGuest)
    : null;
  const songs = Array.isArray(value.songs) && value.songs.length <= 20
    ? value.songs.map(parseSong)
    : null;

  if (
    !submissionId || !/^[a-z0-9-]{8,80}$/i.test(submissionId) ||
    !name || name.length < 2 ||
    !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof value.attending !== "boolean" ||
    specialNeeds === null || message === null ||
    !guests || guests.some((guest) => guest === null) ||
    !songs || songs.some((song) => song === null)
  ) {
    return null;
  }

  const mainCourse = value.attending && COURSES.has(String(value.mainCourse))
    ? String(value.mainCourse)
    : null;
  if (value.attending && !mainCourse) return null;

  return {
    submissionId,
    name,
    email,
    attending: value.attending,
    mainCourse,
    specialNeeds: value.attending ? specialNeeds : "",
    guests: value.attending ? guests as RsvpEmailGuest[] : [],
    songs: songs as Song[],
    message,
  };
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return json({ error: "Solicitud no permitida." }, 403);
  }

  const contentType = request.headers.get("content-type") ?? "";
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return json({ error: "Formato de solicitud incorrecto." }, 415);
  }
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_SIZE) {
    return json({ error: "La confirmación contiene demasiados datos." }, 413);
  }

  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_SIZE) {
      return json({ error: "La confirmación contiene demasiados datos." }, 413);
    }

    let value: unknown;
    try {
      value = JSON.parse(rawBody);
    } catch {
      return json({ error: "El contenido de la solicitud no es válido." }, 400);
    }
    if (isRecord(value) && typeof value.website === "string" && value.website.trim()) {
      return json({ success: true });
    }

    const submission = parseSubmission(value);
    if (!submission) {
      return json({ error: "Revisa los datos del formulario e inténtalo de nuevo." }, 400);
    }

    const apiKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.RSVP_NOTIFY_EMAIL?.trim();
    if (!apiKey || !notifyEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyEmail)) {
      console.error("[rsvp] Missing or invalid email configuration.");
      return json({ error: "El envío no está disponible ahora. Inténtalo más tarde." }, 503);
    }

    const confirmationEmail = buildConfirmationEmail(submission);
    const notificationEmail = buildNotificationEmail(submission);

    const resend = new Resend(apiKey);
    const { error } = await resend.batch.send(
      [
        {
          from: `Inma y Pascual <${FROM_ADDRESS}>`,
          to: submission.email,
          replyTo: notifyEmail,
          subject: "Confirmación recibida — Inma y Pascual",
          html: confirmationEmail.html,
          text: confirmationEmail.text,
          tags: [{ name: "category", value: "rsvp-confirmation" }],
        },
        {
          from: `Web de la boda <${FROM_ADDRESS}>`,
          to: notifyEmail,
          replyTo: submission.email,
          subject: `Nueva confirmación: ${submission.name} · ${submission.attending ? "Asiste" : "No asiste"}`,
          html: notificationEmail.html,
          text: notificationEmail.text,
          tags: [
            { name: "category", value: "rsvp-notification" },
            { name: "attending", value: submission.attending ? "yes" : "no" },
          ],
        },
      ],
      { idempotencyKey: `rsvp/${submission.submissionId}` },
    );

    if (error) {
      console.error("[rsvp] Resend rejected the batch:", error);
      return json({ error: "No hemos podido enviar la confirmación. Inténtalo de nuevo." }, 502);
    }

    console.info("[rsvp] Confirmation queued.", {
      submissionId: submission.submissionId,
      attending: submission.attending,
      attendeeCount: submission.attending ? submission.guests.length + 1 : 0,
      songCount: submission.songs.length,
    });
    return json({ success: true });
  } catch (error) {
    console.error("[rsvp] Unexpected error:", error);
    return json({ error: "No hemos podido enviar la confirmación. Inténtalo de nuevo." }, 500);
  }
}
