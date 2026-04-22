# NewHair Admin

Administrační rozhraní pro aplikaci **NewHair PWA** (průvodce pacienta před / během / po
transplantaci vlasů).

Tento repo je **funkční maketa napojitelná na backend** — celé UI běží proti
in-memory mock datům. Pro přechod na živé API stačí přepnout jednu env proměnnou
a mít hotové endpointy z `docs/API.md`.

> **🌍 Produkce:** https://newhair-admin.vercel.app
> **📦 Repo:** https://github.com/grevo-cz/newhair-admin

---

## Rychlý start

```bash
cp .env.example .env.local     # (optional — defaulty stačí pro mock režim)
npm install
npm run dev                    # http://localhost:3100
```

**Mock login:** cokoli do username + heslo `admin` → přihlášení jako Anna Nováková (Admin CZ).
V mock režimu se navíc uplatňuje auto-login (viz `router/index.ts → MOCK_AUTO_LOGIN`).

---

## Tech stack

- **Vue 3.5** + TypeScript (strict) + Vite 5
- **Pinia** pro state
- **Vue Router 4** s auth guardem
- **Tailwind CSS 4** + `@tailwindcss/vite`
- **axios** pro HTTP (JWT + auto-refresh, stejný flow jako PWA)
- **Lucide Icons**
- **Fonts:** Inter (Google Fonts)

Stejný stack jako pacientská PWA (`../pwa`) → sdílitelný mental model pro dev tým.

---

## Dokumentace pro vývojáře

| Soubor | Obsah |
|---|---|
| [docs/INTEGRATION.md](./docs/INTEGRATION.md) | **START HERE** — handoff doc, jak napojit backend |
| [docs/API.md](./docs/API.md) | Seznam endpointů + request/response smluv |
| [docs/BACKEND.md](./docs/BACKEND.md) | Návrh Doctrine entit + API Platform resources |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Projektová mapa, swap points tabulka, konvence |

Všechny dokumenty jsou Czech, aby pasovaly do týmu.

---

## Scripts

| Příkaz | Co dělá |
|---|---|
| `npm run dev` | Vite dev server na `:3100` |
| `npm run build` | Type-check + produkční build do `dist/` |
| `npm run preview` | Lokální náhled produkčního buildu |
| `npm run type-check` | Pouze `vue-tsc --noEmit` |
| `npm run format` | Prettier — zformátuje `src/**` a `docs/**` |
| `npm run format:check` | Prettier v read-only módu pro CI |
| `npm run todo` | Vypíše všechny `TODO [backend]` markery v kódu |

---

## Mock vs. Live backend

Řídí se env proměnnou **`VITE_USE_MOCK_API`**:

- `true` (default) → services v `src/services/*` vrací in-memory data z `src/data/`.
  Ideální stav pro UI práci a demo pro stakeholdery.
- `false` → services volají `VITE_API_URL` přes axios s JWT.
  Nutný běžící backend s endpointy podle `docs/API.md`.

**Přepnutí:** `.env.local` → `VITE_USE_MOCK_API=false` → `npm run dev`.

---

## Co je hotové

- ✅ 6 sekcí adminu: Dashboard, Pacienti, Plány, Videa, Zprávy, Nastavení
- ✅ Přidání pacienta (3-step formulář s validací 3 datumů)
- ✅ Editor plánu: Fáze → Karty dnů → Komponenty (5 typů: info / instrukce / varování / nebezpečí / úspěch)
- ✅ **Opakující se akce** — knihovna mastrů (Figma-style komponenty); úprava masteru
  se propíše do všech instancí
- ✅ WhatsApp-style inbox s quick replies
- ✅ Patient preview drawer — renderuje mock PWA dashboardu pro libovolný den
- ✅ Auth flow kompatibilní s PWA (JWT + refresh, localStorage klíče `user_token`/`refresh_token`)
- ✅ Sidebar s logout, topbar s notifikačním dropdownem
- ✅ Toasts, confirm dialogy, dark sidebar + světlý main

## Co zbývá pro developery

1. **Backend entity** — viz `docs/BACKEND.md` (Patient, PlanTemplate s nested, Video, Photo, DocumentFile, Message, Settings)
2. **Endpointy** — viz `docs/API.md` (~30 endpointů)
3. **Refactor Pinia akcí na async** — dnes mutují jen paměť, stačí `await service.*` a vložit response
4. **Volitelně: Mercure subscribe** pro realtime zprávy + fotky
5. **Volitelně: unit testy** — zejména `useDayMath` je kritický výpočet

Pro orientaci vývojáře po repo stačí: `npm run todo` → list všech swap pointů.

---

## Deploy

Napojeno na Vercel (projekt `grevo-czs-projects/newhair-admin`).
Každý push do `main` automaticky spustí production deploy.

```
main push → Vercel build → https://newhair-admin.vercel.app
```

---

## Kontakt

Design: Jan Vodvárka — [j.vodvarkahk@gmail.com](mailto:j.vodvarkahk@gmail.com)
