# NewHair Admin — funkční maketa

Administrace pro aplikaci NewHair PWA (průvodce pro pacienty před / během / po transplantaci vlasů).

Jedná se o **klikatelný mockup** bez reálného backendu — všechna data jsou in-memory v Pinia store se seed daty.

## Tech stack

- **Vue 3.5** + TypeScript + Vite 5
- **Pinia** (state management)
- **Vue Router** 4
- **Tailwind CSS v4** + `@tailwindcss/vite`
- **Lucide Icons**
- Stejný stack jako pacientská PWA (konzistentní design language)

## Struktura

- `src/types/` — TypeScript typy domény (Patient, PlanTemplate, DayCard, Component, ...)
- `src/data/` — seed data
- `src/stores/` — Pinia stores (patients, plans, videos, photos, documents, messages, settings, ui)
- `src/composables/` — useDayMath (3 referenční body odlet/zákrok/návrat), useTable, useConfirm, useIcon
- `src/components/` — shared primitives + feature components
- `src/views/` — routy

## Sekce

1. **Dashboard** — 6 widgetů: Kritická fáze, Nepřečtené zprávy, Notifikace dnes, Nové fotky, Noví pacienti, Nadcházející operace
2. **Pacienti** — list + filtry + detail (7 tabů) + 3-step add flow
3. **Plány péče** — hierarchický editor Plán → Fáze → Karty dnů → Komponenty
4. **Videa** — card grid s YouTube auto-thumbnail
5. **Zprávy** — WhatsApp-style inbox
6. **Nastavení** — WhatsApp API, matice oprávnění (4 role), body/gamifikace

## Spuštění lokálně

```bash
npm install
npm run dev     # http://localhost:3100
```

## Build

```bash
npm run build
npm run preview
```

## Deploy

Deploy přes Vercel — pre-production z každého pushe na main.
