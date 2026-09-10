# Web de la boda de Inma y Pascual

Aplicación Next.js desplegada en Vercel para consultar los detalles de la boda y confirmar la asistencia.

## Requisitos

- Node.js `>=22.13.0`

## Desarrollo local

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

## Envío de confirmaciones con Resend

Configura estas variables tanto en `.env.local` como en **Vercel → Project Settings → Environment Variables**:

- `RESEND_API_KEY`: clave privada creada en Resend.
- `RSVP_NOTIFY_EMAIL`: correo que recibirá cada nueva confirmación.

El dominio `mail.ceremoniainmaypascual.com` debe estar verificado en Resend para poder usar el remitente `confirmacion@mail.ceremoniainmaypascual.com`.

Después de añadir o modificar variables en Vercel, realiza un nuevo despliegue para que la función `/api/rsvp` pueda utilizarlas.

Para limitar abusos de forma persistente, crea en **Vercel → Firewall** una regla para la ruta `/api/rsvp`. Conviene observarla primero en modo `Log` y después aplicar un límite por IP, por ejemplo 10 solicitudes cada 10 minutos con respuesta `429`.

## Métricas de rendimiento

La aplicación incluye Vercel Speed Insights. Actívalo en **Vercel → Speed Insights**, despliega la web y visítala para empezar a recopilar Core Web Vitals.

## Comandos

```bash
pnpm dev
pnpm lint
pnpm build
```
