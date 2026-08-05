import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("https://inma-y-pascual.example/", {
      headers: {
        accept: "text/html",
        "x-forwarded-host": "inma-y-pascual.example",
        "x-forwarded-proto": "https",
      },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renderiza la invitación y sus metadatos sociales", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Inma &amp; Pascual · 14 de noviembre de 2026<\/title>/i);
  assert.match(html, /Inma/);
  assert.match(html, /Pascual/);
  assert.match(html, /Molina Real/);
  assert.match(html, /manifest\.webmanifest/);
  assert.match(html, /opengraph-image/i);
  assert.match(html, /twitter-image/i);
  assert.match(html, /summary_large_image/i);
  assert.match(html, /application\/ld\+json/i);
  assert.match(html, /https:\/\/inma-y-pascual\.example\/opengraph-image\.jpg/i);
  assert.match(html, /https:\/\/inma-y-pascual\.example\//i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("incluye los recursos instalables de la PWA", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
  );

  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.lang, "es-ES");
  assert.equal(manifest.icons.length, 2);
  await Promise.all([
    access(new URL("../public/sw.js", import.meta.url)),
    access(new URL("../public/icon-192.png", import.meta.url)),
    access(new URL("../public/icon-512.png", import.meta.url)),
    access(new URL("../app/opengraph-image.jpg", import.meta.url)),
  ]);
});
