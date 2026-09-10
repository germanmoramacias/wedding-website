import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ServiceWorkerRegister } from "./components/ServiceWorkerRegister";
import "./globals.css";

const title = "Inma & Pascual · 21 de noviembre de 2026";
const description =
  "Nos casamos. Acompáñanos el 21 de noviembre de 2026 en Molina Real, Molina de Segura.";

const baseMetadata: Metadata = {
  title,
  description,
  applicationName: "Boda de Inma y Pascual",
  category: "Boda",
  keywords: [
    "Inma y Pascual",
    "boda",
    "21 de noviembre de 2026",
    "Molina Real",
    "Molina de Segura",
  ],
  creator: "Inma y Pascual",
  publisher: "Inma y Pascual",
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_ES",
    title,
    description:
      "Nos casamos en Molina Real. Consulta el horario, cómo llegar y confirma tu asistencia.",
    siteName: "Boda de Inma y Pascual",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: "Nos casamos en Molina Real. Consulta todos los detalles de la celebración.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Inma & Pascual",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const rawHost = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
  const host = /^[a-z0-9.-]+(?::\d+)?$/i.test(rawHost) ? rawHost : "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  return {
    ...baseMetadata,
    metadataBase: new URL(`${protocol}://${host}`),
  };
}

export const viewport: Viewport = {
  themeColor: "#2f493c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        {children}
        <SpeedInsights />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
