# Event Weaver

Web deskoherního klubu **Kostka Prokletá** (Strakonice) – prezentace klubu,
editovatelný kalendář akcí a rezervace herny přes e-mail.

Postaveno na TanStack Start (React 19 + Vite + Tailwind) se Supabase jako backendem.

## Vývoj

Potřebuješ Node.js a npm.

```sh
git clone https://github.com/patrikpicha-art/event-weaver
cd event-weaver
npm i
npm run dev
```

## Skripty

- `npm run dev` – vývojový server
- `npm run build` – produkční build
- `npm run lint` – ESLint
- `npm run format` – Prettier

## Proměnné prostředí

Veřejné hodnoty (`VITE_SUPABASE_*`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`)
jsou v `.env`. Pro serverové operace nad rámec veřejného čtení je potřeba navíc
nastavit v prostředí hostingu:

- `SUPABASE_SERVICE_ROLE_KEY` – potvrzování rezervací
- `RESEND_API_KEY` + `EMAIL_FROM` – odesílání e-mailů o rezervacích
- `SITE_URL` – veřejná adresa webu (odkazy v e-mailech)

## Nasazení

Projekt se buildí Nitrem, které si cíl detekuje samo (Vercel, Netlify,
Cloudflare). Na Vercelu stačí `npm run build`, výstup se vytvoří
v `.vercel/output`.

Design: Patrik Pícha – [feroxa.cz](https://feroxa.cz)
