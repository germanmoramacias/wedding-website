import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const require = createRequire(import.meta.url);

test("hay una única acción externa de mapas, junto al mapa integrado", async () => {
  const page = await read("app/page.tsx");
  const venueSection = page.split('id="lugar"')[1].split("</section>")[0];
  const mapSection = page.split('id="mapa"')[1].split("</section>")[0];
  assert.equal((page.match(/<MapLink\b/g) ?? []).length, 1);
  assert.doesNotMatch(venueSection, /<MapLink/);
  assert.match(venueSection, /href="#mapa"/);
  assert.match(mapSection, /<MapLink/);
});

test("la dirección coincide en la web y el calendario", async () => {
  const address = "C. Amsterdam, 2, 30509 Molina de Segura, Murcia";
  const page = await read("app/page.tsx");
  const calendar = await read("public/inma-pascual.ics");
  assert.ok(page.includes(address));
  assert.match(page, /streetAddress: "C\. Amsterdam, 2"/);
  assert.ok(calendar.includes(`LOCATION:${address.replaceAll(",", "\\,")}`));
  assert.doesNotMatch(page + calendar, /Los Conejos/);
});

test("el enlace directo del restaurante es idéntico en servidor, móvil y tablet", async () => {
  const source = await read("app/components/MapLink.tsx");
  assert.doesNotMatch(source, /use client|useEffect|useState|maps\.apple\.com/);
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });

  let expectedHtml;
  for (const userAgent of [undefined, "iPhone", "iPad", "Android", "Macintosh"]) {
    const exports = {};
    const context = { exports, require };
    if (userAgent) context.navigator = { userAgent, platform: userAgent };
    vm.runInNewContext(outputText, context);
    const html = renderToStaticMarkup(exports.MapLink());
    expectedHtml ??= html;
    assert.equal(html, expectedHtml);

    const href = html.match(/href="([^"]+)"/)[1].replaceAll("&amp;", "&");
    assert.equal(href, "https://maps.app.goo.gl/Cpi3zcV8CW55NtAt7");
    assert.match(html, /target="_blank"/);
    assert.match(html, /rel="noreferrer"/);

    const markerHtml = renderToStaticMarkup(exports.MapLink({
      className: "venue-map__marker",
      "aria-label": "Abrir Molina Real en mapas",
      children: "Molina Real",
    }));
    assert.match(markerHtml, /^<a /);
    assert.match(markerHtml, /class="venue-map__marker"/);
    assert.match(markerHtml, /aria-label="Abrir Molina Real en mapas"/);
    assert.match(markerHtml, /target="_blank"/);
    assert.match(markerHtml, /rel="noreferrer"/);
    assert.equal(markerHtml.match(/href="([^"]+)"/)[1], href);
  }
});

test("el pin y su etiqueta usan el enlace compartido, con foco visible", async () => {
  const map = await read("app/components/VenueMap.tsx");
  const css = await read("app/globals.css");
  assert.match(map, /import \{ MapLink \} from "\.\/MapLink"/);
  assert.match(map, /<MapLink className="venue-map__marker"[\s\S]*?<MapPin[\s\S]*?<MarkerLabel[\s\S]*?<\/MapLink>/);
  assert.match(css, /\.venue-map__marker:focus-visible\s*\{[^}]*outline: 2px/);
});
