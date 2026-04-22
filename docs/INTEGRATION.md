# Integrační příručka — napojení backendu

> Tento dokument říká vývojářům, **kam sáhnout**, aby napojili reálný backend.
> Nevymýšlí backend ani DB; pouze popisuje smluvní body mezi admin UI a API.

## TL;DR — 5 kroků k live režimu

1. `cp .env.example .env.local` a nastav `VITE_API_URL` + `VITE_USE_MOCK_API=false`.
2. V backendu (Symfony + API Platform 4.1) vystav entity popsané v [BACKEND.md](./BACKEND.md).
3. Vývojář backendu spustí migrace a seedne dev data.
4. `npm run dev` — pokud vrátí 401, pokračuje se na `/login`.
5. Podle seznamu endpointů v [API.md](./API.md) ověř jednu sekci po druhé (typicky `fetchPatients()` první).

---

## Architektura vrstev

```
 Vue views / components     ◂ používají stores a services
        │
 Pinia stores (in-memory)   ◂ kešují entity, drží UI state (selection, confirm dialogy…)
        │
 src/services/ (HTTP)       ◂ jediné místo, kde se děje síťová komunikace
        │
 Axios instance (api.ts)    ◂ baseURL + JWT interceptor + auto-refresh 401
        │
 Symfony + API Platform 4.1 ◂ reálný backend (dnes jen User + RefreshToken; rozšířit)
```

**Klíčové pravidlo:** žádný `fetch` ani `axios` mimo `src/services/`. Když někde potřebuješ data,
volej odpovídající `*Service`.

---

## Mock vs. Live režim

Řídí se proměnnou `VITE_USE_MOCK_API` (viz `.env.example`).

| Proměnná | `true` (default) | `false` |
|---|---|---|
| `fetchPatients()` | vrátí z `buildSeedPatients()` + simulovaný delay | `GET /api/patients` |
| `login()` | jakékoli jméno + heslo `admin` | `POST /api/login` |
| `uploadDocument()` | vrací fake PDF objekt | `POST /api/patients/{id}/documents` (multipart) |
| Router guard | auto-login jako Anna Nováková (admin_cz) | redirect na `/login` |

Přechod na live je **otázka jedné env proměnné** — žádné code changes.

---

## Kde je backend „zapojený"

Všechna místa jsou centralizovaná v `src/services/*Service.ts`. Každá funkce má
na začátku komentář s očekávaným endpointem a request/response shape:

```ts
/**
 * GET /api/patients  → HydraCollection<Patient>
 */
export async function fetchPatients(): Promise<Patient[]> {
  if (USE_MOCK_API) return [...mock()];
  const { data } = await api.get<HydraCollection<Patient>>('/api/patients');
  return unwrapHydra(data);
}
```

**`TODO [backend]:` markery** — hledej grep `rg "TODO \[backend\]"` a dostaneš úplný
seznam endpointů/vlastností, které backend musí doplnit.

---

## Auth flow (JWT, kompatibilní s PWA)

Stejný jako v `pwa/src/services/api.ts`:

1. `POST /api/login { username, password }` → `{ token, refresh_token }`
2. Token uložen v `localStorage.user_token`, refresh v `localStorage.refresh_token`
3. Každý request nese `Authorization: Bearer <token>`
4. Na `401` response interceptor zavolá `POST /api/token/refresh { refresh_token }`
   a request retryuje s novým access tokenem
5. `/api/me` vrací aktuálního uživatele (nový endpoint — viz BACKEND.md)

Pro odhlášení: `clearTokens()` + redirect na `/login`.

---

## Entita → Service → Store → View

| Doména | Service | Store | Primární view |
|---|---|---|---|
| Patient | `patientsService` | `patientsStore` | `PatientListView`, `PatientDetailView`, `PatientNewView` |
| PlanTemplate (+ Phase/DayCard/Component/Library) | `plansService` | `plansStore` | `PlanListView`, `PlanEditorView` |
| Video | `videosService` | `videosStore` | `VideoListView`, `VideoFormView` |
| Photo | `photosService` | `photosStore` | `PatientDetailView` (tab „Fotodokumentace") |
| DocumentFile | `documentsService` | `documentsStore` | `PatientDetailView` (tab „Dokumenty") |
| Message (WA) | `messagesService` | `messagesStore` | `InboxView` |
| AppSettings | `settingsService` | `settingsStore` | `SettingsView` |
| Auth / Staff | `authService` | `authStore` | `LoginView`, sidebar |

---

## Napojení na reálný backend — postup per entity

Jako příklad Patient (ostatní entity analogicky):

### 1) Backend má endpoint

```
GET  /api/patients
     Accept: application/ld+json
     Authorization: Bearer <jwt>
→ 200
  {
    "hydra:member": [
      { "@id": "/api/patients/<id>", "@type": "Patient",
        "id": "...", "firstName": "...", ...
      }
    ],
    "hydra:totalItems": 3
  }
```

### 2) Frontend: nic neměnit

`patientsService.fetchPatients()` už umí oboje — `USE_MOCK_API` rozhoduje, zda
poběží mock nebo axios.

### 3) Store: volitelně vyměnit hydrataci

Dnes je `patientsStore.hydrate()` voláno z `loadSeeds()` v `data/seedIndex.ts`.
Pro live data přepiš v `main.ts` na:

```ts
import { patientsService } from '@/services';
import { usePatientsStore } from '@/stores/patientsStore';

// …po mount + await auth.restore()…
usePatientsStore().hydrate(await patientsService.fetchPatients());
```

Nebo ponech `loadSeeds()` jako fallback a přidej „refresh" tlačítka per sekce,
která volají service a překlopí store.

---

## Realtime (volitelné)

Backend má nastavený Mercure (symfony/mercure). Pro admin panel to dává smysl zejména
u **zpráv** a **nových fotek**:

```ts
// Možná implementace v src/services/mercure.ts (zatím není součástí):
const es = new EventSource(`${VITE_MERCURE_URL}?topic=messages/${patientId}`, {
  withCredentials: true,
});
es.onmessage = (ev) => messagesStore.pushFromServer(JSON.parse(ev.data));
```

Topic konvence: `messages/{patientId}`, `photos/{patientId}`, `notifications/admin`.

---

## Checklist „done"

- [ ] Backend má User, Patient, PlanTemplate (s Phase/DayCard/Component/LibraryComponent),
      Video, Photo, DocumentFile, Message, Settings entity
- [ ] API Platform resources s povolenými operacemi (viz BACKEND.md)
- [ ] `GET /api/me` endpoint pro aktuálního uživatele
- [ ] JWT autentizace funguje s `/api/login` a `/api/token/refresh`
- [ ] Admin role (admin_cz / coordinator_cz / staff_tr / doctor_tr) propsány do voters
- [ ] CORS povolen pro doménu adminu
- [ ] Webhook `/api/messages/webhook` pro WhatsApp Business API
- [ ] Upload endpoint pro dokumenty (multipart + validace typu)
- [ ] `VITE_USE_MOCK_API=false` + admin projde všechny klíčové flow

Jakmile každá položka projde, mockup je plně nahrazen živým backendem.
