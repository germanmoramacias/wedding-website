import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("la cuenta atrás y los datos del evento coinciden con la ceremonia", async () => {
  const page = await read("app/page.tsx");
  assert.match(page, /const WEDDING_DATE = "2026-11-21T12:00:00\+01:00"/);
  assert.match(page, /startDate: WEDDING_DATE/);
  assert.match(page, /target=\{WEDDING_DATE\}/);
  assert.match(page, /endDate: "2026-11-22T02:00:00\+01:00"/);
  assert.match(page, /21·11·2026/);
  assert.match(page, /1 de noviembre de 2026/);
});

test("el calendario cambia de fecha conservando la identidad del evento", async () => {
  const calendar = await read("public/inma-pascual.ics");
  // El UID es un identificador estable, no la fecha actual del evento.
  assert.match(calendar, /UID:boda-inma-pascual-20261114@inmaypascual/);
  assert.match(calendar, /SEQUENCE:1/);
  assert.match(calendar, /DTSTART;TZID=Europe\/Madrid:20261121T120000/);
  assert.match(calendar, /DTEND;TZID=Europe\/Madrid:20261122T020000/);
});

test("los textos de la invitación y de compartir usan la nueva fecha", async () => {
  for (const path of [
    "app/layout.tsx",
    "app/components/ShareButton.tsx",
    "app/opengraph-image.alt.txt",
    "app/twitter-image.alt.txt",
  ]) {
    const source = await read(path);
    assert.match(source, /21 de noviembre de 2026/, path);
    assert.doesNotMatch(source, /14 de noviembre|2026-11-14/, path);
  }
});
