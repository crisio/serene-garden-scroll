# Contact Email via Gmail in Strapi

This frontend now sends contact submissions to `POST /api/contact-email`.
Use this guide in the Strapi backend repo (`/var/www/funerales/api`) to complete the integration.

## 1. Install email plugin

```bash
cd /var/www/funerales/api
npm install @strapi/plugin-email
```

## 2. Configure Gmail SMTP

Create or update `config/plugins.ts`:

```ts
export default ({ env }) => ({
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: env("GMAIL_USER"),
          pass: env("GMAIL_APP_PASSWORD"),
        },
      },
      settings: {
        defaultFrom: env("GMAIL_USER"),
        defaultReplyTo: env("GMAIL_USER"),
      },
    },
  },
});
```

Required backend environment variables:

```env
GMAIL_USER=tu_cuenta@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_TO_CONTACT=destino@dominio.com
```

## 3. Create route

Create `src/api/contact-email/routes/contact-email.ts`:

```ts
export default {
  routes: [
    {
      method: "POST",
      path: "/contact-email",
      handler: "contact-email.create",
      config: {
        auth: false,
      },
    },
  ],
};
```

## 4. Create controller

Create `src/api/contact-email/controllers/contact-email.ts`:

```ts
type ContactRequestBody = {
  nombre_completo?: string;
  telefono?: string;
  email?: string;
  servicio_interes?: string;
  mensaje?: string;
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;
const ipState = new Map<string, { count: number; resetAt: number }>();

const clean = (value: unknown, max = 500) => String(value ?? "").trim().slice(0, max);
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const state = ipState.get(ip);

  if (!state || now > state.resetAt) {
    ipState.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (state.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  state.count += 1;
  return false;
};

export default {
  async create(ctx: any) {
    const ipHeader = ctx.request.header["x-forwarded-for"];
    const ip = clean(Array.isArray(ipHeader) ? ipHeader[0] : ipHeader || ctx.request.ip || "unknown", 100);

    if (isRateLimited(ip)) {
      return ctx.tooManyRequests("Too many requests. Please try again in one minute.");
    }

    const body = (ctx.request.body || {}) as ContactRequestBody;

    const nombre = clean(body.nombre_completo, 160);
    const telefono = clean(body.telefono, 60);
    const email = clean(body.email, 180).toLowerCase();
    const servicio = clean(body.servicio_interes, 80);
    const mensaje = clean(body.mensaje, 4000);

    if (!nombre || !telefono || !email) {
      return ctx.badRequest("nombre_completo, telefono and email are required.");
    }

    if (!emailRegex.test(email)) {
      return ctx.badRequest("Invalid email format.");
    }

    const to = process.env.EMAIL_TO_CONTACT;
    if (!to) {
      strapi.log.error("EMAIL_TO_CONTACT is missing.");
      return ctx.internalServerError("Email service is not configured.");
    }

    await strapi.plugin("email").service("email").send({
      to,
      from: process.env.GMAIL_USER,
      replyTo: email,
      subject: `Nuevo contacto web: ${nombre}`,
      text: [
        `Nombre: ${nombre}`,
        `Telefono: ${telefono}`,
        `Email: ${email}`,
        `Servicio: ${servicio || "No especificado"}`,
        "",
        "Mensaje:",
        mensaje || "(Sin mensaje)",
      ].join("\n"),
    });

    return ctx.send({ success: true, message: "Correo enviado" });
  },
};
```

## 5. Build, restart, verify

```bash
cd /var/www/funerales/api
npm run build
pm2 restart funerales-api
pm2 logs funerales-api --lines 50
```

Test request:

```bash
curl -X POST "https://funeralesapi.ciudadanosb.com/api/contact-email" \
  -H "Content-Type: application/json" \
  -d '{"nombre_completo":"Prueba","telefono":"9999-9999","email":"test@example.com","mensaje":"hola"}'
```

Expected response:

```json
{"success":true,"message":"Correo enviado"}
```

## Notes

- Gmail personal requires 2FA and an App Password.
- Do not store `GMAIL_APP_PASSWORD` in frontend `.env`.
- If you keep endpoint `auth: false`, rely on server-side validation and rate limiting.
