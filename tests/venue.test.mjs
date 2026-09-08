import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("hay una única acción externa de mapas, junto al mapa integrado", async () => {
  const page = await read("app/page.tsx");
  const venueSection = page.split('id="lugar"')[1].split("</section>")[0];
  const mapSection = page.split('id="mapa"')[1].split("</section>")[0];
  assert.equal((page.match(/<MapLink\b/g) ?? []).length, 1);
  assert.doesNotMatch(venueSection, /<MapLink/);
  assert.match(venueSection, /href="#mapa"/);
  assert.match(mapSection, /<MapLink/);
});

test("la dirección coincide en la web, los enlaces y el calendario", async () => {
  const address = "C. Amsterdam, 2, 30509 Molina de Segura, Murcia";
  const page = await read("app/page.tsx");
  const links = await read("app/components/MapLink.tsx");
  const calendar = await read("public/inma-pascual.ics");
  assert.ok(page.includes(address));
  assert.match(page, /streetAddress: "C\. Amsterdam, 2"/);
  assert.ok(links.includes(address));
  assert.match(links, /encodeURIComponent\(address\)/);
  assert.ok(calendar.includes(`LOCATION:${address.replaceAll(",", "\\,")}`));
  assert.doesNotMatch(page + links + calendar, /Los Conejos/);
});
